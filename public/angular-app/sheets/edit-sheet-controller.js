/**
 * Created by konrad.sobon on 2017-12-04.
 */
angular.module('MissionControlApp').controller('EditSheetController', EditSheetController);

function EditSheetController($uibModalInstance, SheetsFactory, sheet, action) {
    var vm = this;
    vm.sheet = sheet; // parent sheet.
    vm.title = action;

    // (Konrad) Task that doesn't have _id is new so we can add these props.
    if(action === 'Add Task'){
        vm.sheet['assignedTo'] = '';
        vm.sheet['message'] = '';
        vm.sheet['comments'] = '';
        vm.sheet['submittedOn'] = '';
        vm.sheet['completedOn'] = '';
        vm.sheet['submittedBy'] = 'webuser';
        vm.sheet['completedBy'] = '';
    }

    /**
     * Method called when Edit Sheet is submitted.
     */
    vm.submit = function () {
        vm.sheet.submittedOn = Date.now();
        vm.sheet.isSelected = false; // never submit the sheet with selection on
        if(action === 'Add Task'){
            SheetsFactory
                .addSheetTask(vm.sheet.collectionId, vm.sheet)
                .then(function(sheetResponse){
                    if(!sheetResponse) return;

                    $uibModalInstance.close({response: sheetResponse});
                }, function (err) {
                    console.log('Unable to add Single Sheet Task: ' + err.message)
                });
        } else {
            SheetsFactory
                .updateTasks(vm.sheet.collectionId, vm.sheet)
                .then(function(sheetResponse){
                    if(!sheetResponse) return;

                    $uibModalInstance.close({response: sheetResponse});
                }, function (err) {
                    console.log('Unable to update Single Sheet Task: ' + err.message)
                });
        }
    };

    /**
     * Re-opens task if it was marked as completed.
     */
    vm.reopen = function () {
        vm.sheet.completedBy = '';
        vm.sheet.completedOn = '';
        vm.sheet.submittedBy = 'webuser';
        vm.sheet.submittedOn = Date.now();
        vm.sheet.isSelected = false;

        SheetsFactory
            .updateTasks(vm.sheet.collectionId, vm.sheet)
            .then(function(sheetResponse){
                if(!sheetResponse) return;

                $uibModalInstance.close({response: sheetResponse});
            }, function (err) {
                console.log('Unable to re-open Single Sheet Task: ' + err.message)
            });
    };

    /**
     * Marks sheet to be deleted.
     */
    vm.delete = function () {
        vm.sheet.isDeleted = true;
        vm.sheet.submittedOn = Date.now();
        vm.sheet.isSelected = false; // never submit the sheet with selection on
        if(action === 'Add Task'){
            SheetsFactory
                .addSheetTask(vm.sheet.collectionId, vm.sheet)
                .then(function(sheetResponse){
                    if(!sheetResponse) return;

                    $uibModalInstance.close({response: sheetResponse});
                }, function (err) {
                    console.log('Unable to add Single Sheet Task: ' + err.message)
                });
        } else {
            SheetsFactory
                .updateTasks(vm.sheet.collectionId, vm.sheet)
                .then(function(sheetResponse){
                    if(!sheetResponse) return;

                    $uibModalInstance.close({response: sheetResponse});
                }, function (err) {
                    console.log('Unable to update Single Sheet Task: ' + err.message)
                });
        }
    };

    /**
     * Closes modal dialog.
     */
    vm.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
}