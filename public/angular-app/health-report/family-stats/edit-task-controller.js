/**
 * Created by konrad.sobon on 2018-01-05.
 */
angular.module('MissionControlApp').controller('EditFamilyTaskController', EditFamilyTaskController);

function EditFamilyTaskController($uibModalInstance, FamiliesFactory, family, task, action) {
    var vm = this;
    vm.family = family; // parent family
    vm.task = task; // actual task will be null on add task
    vm.title = action;


    // (Konrad) Resetting these values will clear the form for new task.
    if(action === 'Add Task'){
        vm.task = {
            assignedTo: "",
            message: "",
            completedOn: null,
            submittedBy: "webuser",
            completedBy: null,
            name: ""
        }
    }

    vm.submit = function () {
        vm.task.isSelected = false; // never submit a task with selection on
        vm.task.submittedOn = Date.now();
        if(action === 'Add Task'){
            FamiliesFactory
                .addTask(vm.family.collectionId, vm.family.name, vm.task).then(function (response) {
                    if (!response)return;

                    $uibModalInstance.close({
                        response: response,
                        familyName: vm.family.name
                    });
            }, function (err) {
                console.log("Unable to add task: " + err);
            });
        } else if (action === 'Edit Task'){
            FamiliesFactory
                .updateTask(vm.family, vm.task).then(function(response){
                    if(!response) return;

                    $uibModalInstance.close({
                        response: response,
                        familyName: vm.family.name
                    });
                }, function (err) {
                    console.log('Unable to update task: ' + err)
                });
        }
    };

    vm.reopen = function (){
        vm.task.isSelected = false;
        vm.task.submittedOn = Date.now();
        vm.task.completedBy = null;
        vm.task.completedOn = null;

        FamiliesFactory
            .updateTask(vm.family, vm.task).then(function(response){
            if(!response) return;

            $uibModalInstance.close({
                response: response,
                familyName: vm.family.name
            });
        }, function (err) {
            console.log('Unable to reopen task: ' + err)
        });
    };

    /**
     * Closes modal window.
     */
    vm.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
}