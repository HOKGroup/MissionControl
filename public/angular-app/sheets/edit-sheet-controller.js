/**
 * Created by konrad.sobon on 2017-12-04.
 */
angular.module('MissionControlApp').controller('EditSheetController', EditSheetController);

function EditSheetController($uibModalInstance, SheetsFactory, ModelsFactory, UtilityService, sheet, action) {
    var vm = this;
    vm.sheet = sheet; // parent sheet.
    vm.title = action;
    vm.userNames = null;

    var path = UtilityService.getHttpSafeFilePath(vm.sheet.centralPath);
    getUserNames(path);

    /**
     * Retrieves all user names that ever opened the model.
     * @param centralPath
     */
    function getUserNames(centralPath) {
        ModelsFactory.getUserNamesByCentralPath(centralPath)
            .then(function (response) {
                if(!response || response.status !== 200) return;

                // (Konrad) We need all unique user names of people that ever opened the model.
                // These will be used to populate dropdowns when assigning tasks. It will allow
                // us to only assign tasks to people that actually work in the model.
                var userNamesSet = new Set(response.data[0].openTimes.filter(function (item) {
                    return item.user;
                }).map(function (item) {
                    return item.user;
                }));

                vm.userNames = Array.from(userNamesSet);
            })
            .catch(function (error) {
                console.log(error);
            })
    }

    // (Konrad) Resetting these values will clear the form for new task.
    if(action === 'Add Task'){
        // (Konrad) When task is being created, the sheet passed is always parent sheet.
        vm.sheet['sheetId'] = sheet._id;

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
            SheetsFactory.addSheetTask(vm.sheet.collectionId, vm.sheet)
                .then(function(sheetResponse){
                    if(!sheetResponse) return;

                    $uibModalInstance.close({response: sheetResponse});
                }, function (err) {
                    console.log('Unable to add Sheet Task: ' + err.message)
                });
        } else {
            SheetsFactory.updateTasks(vm.sheet.collectionId, vm.sheet)
                .then(function(sheetResponse){
                    if(!sheetResponse) return;

                    $uibModalInstance.close({response: sheetResponse});
                }, function (err) {
                    console.log('Unable to update Sheet Task: ' + err.message)
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

        SheetsFactory.updateTasks(vm.sheet.collectionId, vm.sheet)
            .then(function(sheetResponse){
                if(!sheetResponse) return;

                $uibModalInstance.close({response: sheetResponse});
            }, function (err) {
                console.log('Unable to re-open Sheet Task: ' + err.message)
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
            SheetsFactory.addSheetTask(vm.sheet.collectionId, vm.sheet)
                .then(function(sheetResponse){
                    if(!sheetResponse) return;

                    $uibModalInstance.close({response: sheetResponse});
                }, function (err) {
                    console.log('Unable to add Sheet Task: ' + err.message)
                });
        } else {
            SheetsFactory.updateTasks(vm.sheet.collectionId, vm.sheet)
                .then(function(sheetResponse){
                    if(!sheetResponse) return;

                    $uibModalInstance.close({response: sheetResponse});
                }, function (err) {
                    console.log('Unable to update Sheet Task: ' + err.message)
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