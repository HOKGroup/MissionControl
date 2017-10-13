var app = angular.module('MissionControlApp').controller('FamilyStatsController', FamilyStatsController);

function FamilyStatsController($routeParams, FamiliesFactory, $uibModal, Socket, DTColumnDefBuilder, DTInstances) {
    var vm = this;
    vm.projectId = $routeParams.projectId;
    vm.FamilyData = this.processed;
    var data = this.full;

    Socket.on('task_updated', function(data){
        console.log('task_updated');
    });

    vm.AllFamilies = data.families.filter(function (item) {
        return !item.isDeleted && item.isFailingChecks;
    });

    vm.pcoordinatesData = [];
    vm.AllFamilies.forEach(function(item){
        vm.pcoordinatesData.push({
            name: item.name,
            "Size": item.sizeValue,
            "Instances": item.instances,
            "Parameters": item.parametersCount,
            "Nested Families": item.nestedFamilyCount,
            "Voids": item.voidCount,
            "Ref. Planes": item.refPlaneCount,
            "Arrays": item.arrayCount
        })
    });

    vm.dtOptions = {
        paginationType: 'simple_numbers',
        lengthMenu: [[10, 25, 50, 100, -1], [10, 25, 50, 100, 'All']],
        stateSave: true
    };

    vm.dtColumnDefs = [
        DTColumnDefBuilder.newColumnDef(0), //index
        DTColumnDefBuilder.newColumnDef(1), //name
        DTColumnDefBuilder.newColumnDef(2), //instances
        DTColumnDefBuilder.newColumnDef(3).withOption('orderData', '4'), //size
        DTColumnDefBuilder.newColumnDef(4).notVisible() //sizeValue
    ];

    var dtInstance;
    DTInstances.getLast().then(function(inst) {
        dtInstance = inst;
    });

    vm.FilterTable = function () {
        if(dtInstance) {dtInstance.reloadData();}
    };

    vm.OnBrush = function(item){
        vm.AllFamilies = data.families.filter(function(x){
            var found = false;
            for (var i = 0; i < item.length; i++){
                if(item[i].name === x.name){
                    found = true;
                    break;
                }
            }
            return found;
        });
        if(dtInstance) {dtInstance.reloadData();}
    };

    vm.evaluateFamily = function (f) {
        if(f.tasks.length > 0){
            var override = f.tasks.find(function(item){
                return item.completedBy !== null;
            });
            if(override !== null) return 0;
        }

        var score = 0;
        if (f.sizeValue > 1000000) score++;
        if (f.name.indexOf('_HOK_I') === -1 && f.name.indexOf('_HOK_M') === -1) score++;
        if (f.instances === 0) score++;
        return score;
    };

    vm.evaluateName = function(f){
        if(f.tasks.length > 0){
            var override = f.tasks.find(function(item){
                return item.completedBy !== null;
            });
            if(override) return true;
        }

        return f.name.indexOf('_HOK_I') !== -1 || f.name.indexOf('_HOK_M') !== -1
    };

    vm.evaluateInstances = function(f){
        if(f.tasks.length > 0){
            var override = f.tasks.find(function(item){
                return item.completedBy !== null;
            });
            if(override) return true;
        }

        return f.instances > 0;
    };

    vm.evaluateSize = function(f){
        if(f.tasks.length > 0){
            var override = f.tasks.find(function(item){
                return item.completedBy !== null;
            });
            if(override) return true;
        }

        return f.sizeValue < 1000000;
    };

    vm.openAllTasksWindow = function (size, family) {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: 'editAllTasks',
            controller: modalAllTasksCtrl,
            size: size,
            resolve: {
                family: function () {
                    return family;
                }
            }
        });

        modalInstance.result.then(function () {}, function () {});
    };

    var modalAllTasksCtrl = function ($scope, $uibModalInstance, $uibModal, family) {
        $scope.family = family;
        $scope.check = false;

        $scope.selectAll = function(check){
            if (check) {
                $scope.family.tasks.forEach(function (item) {
                    item.isSelected = true;
                })
            } else {
                $scope.family.tasks.forEach(function (item) {
                    item.isSelected = false;
                })
            }
        };

        $scope.openEditModal = function (size, task) {

            $uibModalInstance.close();
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: 'editSingleTask',
                controller: modalSingleTaskCtrl,
                size: size,
                resolve: {
                    task: function () {
                        return task;
                    },
                    family: function(){
                        return $scope.family
                    }
                }
            });

            modalInstance.result.then(function () {}, function () {});
        };

        $scope.addTask = function (size) {
            $scope.family = family;
            $uibModalInstance.close();

            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: 'addTask',
                controller: addTaskCtrl,
                size: size,
                resolve: {
                    family: function(){
                        return $scope.family
                    }
                }
            });

            modalInstance.result.then(function () {}, function () {});
        };

        $scope.delete = function () {
            var counter = 0;
            var selectedIds = {};
            for (var i = 0; i < $scope.family.tasks.length; i++){
                if($scope.family.tasks[i].isSelected){
                    selectedIds[counter] = $scope.family.tasks[i]._id;
                    counter++;
                }
            }

            FamiliesFactory
                .deleteMultipleTasks(data._id, $scope.family.name, selectedIds)
                .then(function (response) {
                    if(!response) return;

                    // (Konrad) We clear the tasks array to update UI, without reloading the page
                    $scope.family.tasks = $scope.family.tasks.filter(function (item){
                        return !item.isSelected;
                    });
                }, function(err){
                    console.log('Unable to delete task: ' + err)
                });

            $uibModalInstance.close();
        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    };

    var modalSingleTaskCtrl = function($scope, $uibModalInstance, $uibModal, task, family){
        $scope.task = task;
        $scope.family = family;

        $scope.back = function (size, family) {
            $uibModalInstance.close();
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: 'editAllTasks',
                controller: modalAllTasksCtrl,
                size: size,
                resolve: {
                    family: function(){
                        return family
                    }
                }
            });

            modalInstance.result.then(function () {}, function () {});
        };

        $scope.updateTask = function () {
            updateTask($scope.family, $scope.task);

            $uibModalInstance.close();
        };

        $scope.reopenTask = function () {
            var task = $scope.task;
            task.completedBy = null;
            task.completedOn = null;

            updateTask($scope.family, task);

            $uibModalInstance.close();
        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    };

    vm.openAddWindow = function (size, family) {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: 'addTask',
            controller: addTaskCtrl,
            size: size,
            resolve: {
                family: function () {
                    return family;
                }
            }
        });

        modalInstance.result.then(function () {}, function () {});
    };

    var addTaskCtrl = function($scope, $uibModalInstance, family) {
        $scope.family = family;
        $scope.task = {
            assignedTo: "",
            message: "",
            submittedOn: Date.now(),
            completedOn: null,
            submittedBy: "web-user",
            completedBy: null,
            isSelected: false,
            name: ""
        };

        $scope.addTask = function () {
            FamiliesFactory
                .addTask(data._id, family.name, $scope.task)
                .then(function (response) {
                    if (!response)return;

                    //(Konrad) We need to update the AllFamilies collection
                    // in order to update the DataTable display without reloading the whole page
                    data = response.data;

                    var newTask = data.families.find(function(item){
                        return item.name === $scope.family.name;
                    }).tasks.find(function(task){
                        return task.name === $scope.task.name;
                    });

                    for(var i = 0; i < vm.AllFamilies.length; i++){
                        if(vm.AllFamilies[i].name === $scope.family.name){
                            vm.AllFamilies[i].tasks.push(newTask);
                            break;
                        }
                    }
                }, function (err) {
                    console.log("Unable to add task: " + err);
                });

            $uibModalInstance.dismiss('cancel');
        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    };

    var updateTask = function(family, task){
        FamiliesFactory
            .updateTask(data._id, family.name, task._id, task)
            .then(function(response){
                if(!response) return;

                // (Konrad) We clear the tasks array to update UI, without reloading the page
                family.tasks = family.tasks.filter(function (item){
                    return item._id !== task._id;
                });

                // (Konrad) We need to update the AllFamilies collection
                // in order to update the DataTable display without reloading the whole page.
                data = response.data;

                var newTask = data.families.find(function(item){
                    return item.name === family.name;
                }).tasks.find(function(item){
                    return item.name === task.name;
                });

                for(var i = 0; i < vm.AllFamilies.length; i++){
                    if(vm.AllFamilies[i].name === family.name){
                        vm.AllFamilies[i].tasks.push(newTask);
                        break;
                    }
                }
            }, function (err) {
                console.log('Unable to update task: ' + err)
            });
    };
}