var app = angular.module('MissionControlApp').controller('FamilyStatsController', FamilyStatsController);

function FamilyStatsController($routeParams, $uibModal, DTColumnDefBuilder, DTInstances, UtilityService) {
    var vm = this;
    vm.projectId = $routeParams.projectId;
    vm.FamilyData = this.processed;
    var data = this.full;

    // Socket.on('task_updated', function(data){
    //     console.log('task_updated');
    // });

    vm.AllFamilies = [];
    data.families.forEach(function (item) {
        if(!item.isDeleted && item.isFailingChecks){
            item['collectionId'] = data._id;
            vm.AllFamilies.push(item);
        }
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
        stateSave: true,
        deferRender: true
    };

    vm.dtColumnDefs = [
        DTColumnDefBuilder.newColumnDef(0), //index
        DTColumnDefBuilder.newColumnDef(1), //name
        DTColumnDefBuilder.newColumnDef(2).withOption('orderData', '3'), //tasks
        DTColumnDefBuilder.newColumnDef(3).notVisible(), //task count
        DTColumnDefBuilder.newColumnDef(4), //instances
        DTColumnDefBuilder.newColumnDef(5).withOption('orderData', '4'), //size
        DTColumnDefBuilder.newColumnDef(6).notVisible() //sizeValue
    ];

    var dtInstance;
    DTInstances.getLast().then(function(inst) {
        dtInstance = inst;
    });

    vm.FilterTable = function () {
        if(dtInstance) {dtInstance.reloadData(false);}
    };

    vm.OnBrush = function(item){
        vm.AllFamilies = data.families.filter(function(family){
            var found = false;
            for (var i = 0; i < item.length; i++){
                if(item[i].name === family.name){
                    found = true;
                    break;
                }
            }
            return found;
        });
    };

    vm.formatValue = function(item){
        return UtilityService.formatNumber(item);
    };

    vm.evaluateTasks = function (f) {
        if(f.tasks.length === 0) return;

        var open = f.tasks.find(function (item) {
            return !!item.completedBy;
        });
        return !!open ? {"color": "#5cb85c"} : {"color": "#D9534F"};
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

    /**
     * Launches appropriate modal window.
     * @param family
     */
    vm.launchEditor = function (family) {
        if(family.tasks.length > 0){
            openAllTasks('lg', family);
        } else {
            openEditTask('lg', family, null, 'Add Task')
        }
    };

    /**
     * Launches all tasks dialog.
     * @param size
     * @param family
     */
    var openAllTasks = function (size, family) {
        $uibModal.open({
            animation: true,
            templateUrl: 'angular-app/health-report/family-stats/all-tasks.html',
            controller: 'AllFamilyTasksController as vm',
            size: size,
            resolve: {
                family: function (){
                    return family;
                }}
        }).result.then(function(request){
            if(!request) return;
            if(request.action === 'Delete Family Task'){
                // (Konrad) We clear the tasks array to update UI, without reloading the page
                request.deletedIds.forEach(function (id) {
                    var index = family.tasks.findIndex(function (x) {
                        return x._id.toString() === id.toString();
                    });
                    if(index !== -1) family.tasks.splice(index, 1);
                });
            }
        }).catch(function(){
            console.log("All Tasks Dialog dismissed...");
        });
    };

    /**
     * Launches add task dialog.
     * @param size
     * @param family
     * @param task
     * @param action
     */
    var openEditTask = function (size, family, task, action) {
        $uibModal.open({
            animation: true,
            templateUrl: 'angular-app/health-report/family-stats/edit-task.html',
            controller: 'EditFamilyTaskController as vm',
            size: size,
            resolve: {
                family: function (){
                    return family;
                },
                task: function(){
                    return task;
                },
                action: function(){
                    return action;
                }}
        }).result.then(function(request){
            if(!request) return;

            // (Konrad) This can only return "Add Task".
            // Otherwise the all tasks menu would come up and
            // return value will be handled by that controller.
            if(action === 'Add Task'){
                var newTask = request.response.data;
                family.tasks.push(newTask);
            }
        }).catch(function(){
            console.log("All Tasks Dialog dismissed...");
        });
    };
}