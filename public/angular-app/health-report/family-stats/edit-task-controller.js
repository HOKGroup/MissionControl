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
                    familyName: vm.family.name,
                    taskName: vm.task.name
                });
            }, function (err) {
                console.log("Unable to add task: " + err);
            });
        } else if (action === 'Edit Task'){
            console.log(vm.task);
            console.log(vm.family.collectionId);
            console.log(vm.task.name);
            console.log(vm.task._id);
            FamiliesFactory
                .updateTask(vm.family, vm.task).then(function(response){
                    if(!response) return;

                    // // (Konrad) We clear the tasks array to update UI, without reloading the page
                    // family.tasks = family.tasks.filter(function (item){
                    //     return item._id !== task._id;
                    // });
                    //
                    // // (Konrad) We need to update the AllFamilies collection
                    // // in order to update the DataTable display without reloading the whole page.
                    // data = response.data;
                    //
                    // var newTask = data.families.find(function(item){
                    //     return item.name === family.name;
                    // }).tasks.find(function(item){
                    //     return item.name === task.name;
                    // });
                    //
                    // for(var i = 0; i < vm.AllFamilies.length; i++){
                    //     if(vm.AllFamilies[i].name === family.name){
                    //         vm.AllFamilies[i].tasks.push(newTask);
                    //         break;
                    //     }
                    // }
                }, function (err) {
                    console.log('Unable to update task: ' + err)
                });
        }
    };

    /**
     * Closes modal window.
     */
    vm.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
}