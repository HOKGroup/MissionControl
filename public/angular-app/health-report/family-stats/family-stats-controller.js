var app = angular.module('MissionControlApp').controller('FamilyStatsController', FamilyStatsController);

function FamilyStatsController($routeParams, FamiliesFactory, $uibModal) {
    var vm = this;
    vm.projectId = $routeParams.projectId;
    vm.FamilyData = this.processed;
    var data = this.full;

    vm.AllFamilies = data.families.filter(function (item) {
        return !item.isDeleted && item.isFailingChecks;
    });

    vm.evaluateFamily = function (f) {
        var score = 0;
        if (f.sizeValue > 1000000) score++;
        if (f.name.indexOf('_HOK_I') === -1 && f.name.indexOf('_HOK_M') === -1) score++;
        if (f.instances === 0) score++;
        return score;
    };

    vm.dataTableOpt = {
        "aLengthMenu": [[10, 50, 100, -1], [10, 50, 100, 'All']]
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
            // (Konrad) We clear the tasks array to update UI, without reloading the page
            $scope.family.tasks = $scope.family.tasks.filter(function (item){
                return !item.isSelected;
            });

            FamiliesFactory
                .deleteMultipleTasks(data._id, $scope.family.name, selectedIds);

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

        $scope.ok = function () {
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

        $scope.submit = function () {
            FamiliesFactory
                .addTask(data._id, family.name, $scope.task)
                .then(function (response) {
                    if (!response)return;

                    //(Konrad) We need to update the AllFamilies collection
                    // in order to update the DataTable display without reloading the whole page.
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
    }
}