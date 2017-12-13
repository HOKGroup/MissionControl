/**
 * Created by konrad.sobon on 2017-12-04.
 */
angular.module('MissionControlApp').controller('AllTasksController', AllTasksController);

function AllTasksController($uibModalInstance, $uibModal, SheetsFactory, sheet) {
    var vm = this;
    vm.sheet = sheet;
    vm.tasks = vm.sheet.tasks;
    vm.check = false;

    /**
     * Deletes all selected sheet tasks.
     */
    vm.delete = function(){
        var selected = vm.tasks.filter(function (item) {
            return item.isSelected;
        });
        if(selected.length > 0){
            SheetsFactory
                .deleteTasks(vm.sheet.collectionId, selected)
                .then(function(response){
                    if(!response) return;

                    $uibModalInstance.close({response: response});
                }, function (err) {
                    console.log('Unable to update Single Sheet: ' + err.message)
                });
        }
    };

    /**
     * Edit single sheet.
     * @param size
     * @param sheet
     * @param action
     */
    vm.editSheet = function(size, sheet, action){
        $uibModalInstance.dismiss('cancel');
        // sheet['collectionId'] = vm.sheet.collectionId;
        $uibModal.open({
            animation: true,
            templateUrl: 'angular-app/sheets/edit-sheet.html',
            controller: 'EditSheetController as vm',
            size: size,
            resolve: {
                action: function () {
                    return action;
                },
                sheet: function (){
                    return sheet;
                }}
        }).result.then(function(request){
            if(!request) return;

            $uibModalInstance.close({response: request});
        }).catch(function(){
            //if modal dismissed
        });
    };

    /**
     * Assigns proper styling to tasks list item.
     * @param task
     * @returns {*}
     */
    vm.assignClass = function (task) {
        if(task.isDeleted){
            return 'bg-danger strike';
        } else {
            return 'bg-warning';
        }
    };

    /**
     * Toggles all tasks to checked/unchecked.
     */
    vm.selectAll = function () {
        vm.tasks.forEach(function (item) {
            item.isSelected = vm.check;
        });
    };

    /**
     * Closes modal window.
     */
    vm.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
}