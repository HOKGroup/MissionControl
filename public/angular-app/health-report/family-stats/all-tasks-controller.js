/**
 * Created by konrad.sobon on 2018-01-05.
 */
angular.module('MissionControlApp').controller('AllFamilyTasksController', AllFamilyTasksController);

function AllFamilyTasksController($uibModalInstance, $uibModal, FamiliesFactory, family) {
    var vm = this;
    vm.family = family;
    vm.check = false;

    vm.editTask = function (size, family, task, action) {
        $uibModalInstance.dismiss('cancel');

        $uibModal.open({
            animation: true,
            templateUrl: 'angular-app/health-report/family-stats/edit-task.html',
            windowClass: 'zindex',
            controller: 'EditFamilyTaskController as vm',
            size: size,
            resolve: {
                task: function (){
                    return task;
                },
                family: function (){
                    return family;
                },
                action: function(){
                    return action;
                }}
        }).result.then(function(request){
            if(!request) return;

            var task = request.response.data;
            if(action === 'Add Task'){
                family.tasks.push(task);
            } else if(action === 'Update Task'){
                var index = family.tasks.findIndex(function(item){
                    return item._id.toString() === task._id.toString()
                });
                if(index !== -1) family.tasks[index] = task;
            }
        }).catch(function(){
            console.log("All Tasks Dialog dismissed...");
        });
    };

    // vm.openEditModal = function (size, task) {
    //     $uibModalInstance.close();
    //
    //     $uibModal.open({
    //         animation: true,
    //         templateUrl: 'angular-app/health-report/family-stats/edit-task.html',
    //         controller: 'EditFamilyTaskController as vm',
    //         size: size,
    //         resolve: {
    //             task: function (){
    //                 return task;
    //             }}
    //     }).result.then(function(request){
    //         if(!request) return;
    //
    //     }).catch(function(){
    //         console.log("All Tasks Dialog dismissed...");
    //     });
    //
    //     // var modalInstance = $uibModal.open({
    //     //     animation: true,
    //     //     templateUrl: 'editSingleTask',
    //     //     controller: modalSingleTaskCtrl,
    //     //     size: size,
    //     //     resolve: {
    //     //         task: function () {
    //     //             return task;
    //     //         },
    //     //         family: function(){
    //     //             return $scope.family
    //     //         }
    //     //     }
    //     // });
    //     //
    //     // modalInstance.result.then(function () {}, function () {});
    // };

    /**
     * Deletes selected tasks.
     */
    vm.delete = function () {
        var selectedIds = [];
        vm.family.tasks.forEach(function (item) {
            if (item.isSelected){
                selectedIds.push(item._id);
            }
        });
        FamiliesFactory
            .deleteMultipleTasks(vm.family.collectionId, vm.family.name, selectedIds).then(function (response) {
                if(!response) return;

                $uibModalInstance.close({'response': response, 'action': 'Delete Family Task', 'deletedIds': selectedIds});
        }, function(err){
            console.log('Unable to delete task: ' + err)
        });
    };

    /**
     * Selects all tasks.
     * @param check
     */
    vm.selectAll = function(check){
        if (check) {
            vm.family.tasks.forEach(function (item) {
                item.isSelected = true;
            })
        } else {
            vm.family.tasks.forEach(function (item) {
                item.isSelected = false;
            })
        }
    };

    /**
     * Closes modal window.
     */
    vm.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
}