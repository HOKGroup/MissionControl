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
        var selectedIds = [];
        vm.tasks.forEach(function (item) {
            if (item.isSelected){
                selectedIds.push(item._id);
            }
        });
        var data = {
            'centralPath': vm.sheet.centralPath,
            'sheetId': vm.sheet._id,
            'deletedIds': selectedIds
        };
        if(selectedIds.length > 0){
            // (Konrad) When user deletes all tasks for new sheet
            // it should also delete the "new sheet" itself.
            if(vm.sheet.isNewSheet && selectedIds.length === vm.tasks.length){
                SheetsFactory
                    .deleteNewSheet(vm.sheet.collectionId, data)
                    .then(function(response){
                        if(!response) return;

                        // (Konrad) Response is going to be deleted SheetId.
                        $uibModalInstance.close({'response': response, 'action': 'Delete New Sheet'});
                    }, function (err) {
                        console.log('Unable to delete New Sheet: ' + err.message)
                    });
            } else {
                SheetsFactory
                    .deleteSheetTasks(vm.sheet.collectionId, data)
                    .then(function(response){
                        if(!response) return;

                        // (Konrad) Response is going to be all sheets from the DB.
                        $uibModalInstance.close({'response': response, 'action': 'Delete Sheet Task', 'deletedIds': selectedIds});
                    }, function (err) {
                        console.log('Unable to update Single Sheet: ' + err.message)
                    });
            }
        }
    };

    /**
     * Edit single sheet.
     * @param size
     * @param sheet
     * @param action
     */
    vm.editSheetTask = function(size, sheet, action){
        // (Konrad) When we are updating existing task it will pass that along instead of the sheet.
        // In that case we need to tell it what parent Sheet it was stored in.
        if(action === 'Update Task'){
            sheet['sheetId'] = vm.sheet._id;
        }

        $uibModalInstance.dismiss('cancel');
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

            // (Konrad) The response here will be all updated sheets from DB.
            // We can just swap the tasks from sheet for response tasks to update UI.
            var updatedSheet = request.response.data.sheets.find(function(item){
                return item._id.toString() === sheet._id.toString();
            });
            if(updatedSheet) sheet.tasks = updatedSheet.tasks;
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
        } else if (task.isNewSheet){
            return 'bg-success';
        } else {
            return 'bg-warning'
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
     * Returns True if any task is selected.
     * @returns {boolean}
     */
    vm.isAnythingSelected = function () {
        return vm.sheet.tasks.some(function(item){
            return item.isSelected;
        });
    };

    /**
     * Closes modal window.
     */
    vm.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
}