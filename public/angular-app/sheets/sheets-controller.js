/**
 * Created by konrad.sobon on 2017-10-24.
 */
angular.module('MissionControlApp').controller('SheetsController', SheetsController);

function SheetsController($routeParams, SheetsFactory, ProjectFactory, HealthRecordsFactory, DTColumnDefBuilder, $uibModal, UtilityService){
    var vm = this;
    vm.projectId = $routeParams.projectId;
    vm.selectedProject = null;
    vm.selectAll = false; // select all checkbox
    vm.Data = [];
    vm.dtInstance = {};

    vm.dtSheetsOptions = {
        paginationType: 'simple_numbers',
        lengthMenu: [[10, 25, 50, 100, -1], [10, 25, 50, 100, 'All']],
        stateSave: true,
        deferRender: true,
        order: [[ 2, 'asc' ]],
        columnDefs: [{orderable: false, targets: [0]}]
    };

    vm.dtSheetsColumnDefs = [
        DTColumnDefBuilder.newColumnDef(0).notSortable(), //checkbox
        DTColumnDefBuilder.newColumnDef(1), //number
        DTColumnDefBuilder.newColumnDef(2), //name
        DTColumnDefBuilder.newColumnDef(3) //revisionNumber
    ];

    vm.selectedModel = "";
    vm.availableModels = [
        {
            name: "All",
            collectionId: ''
        }
    ];

    // (Konrad) Retrieves selected project from MongoDB.
    getSelectedProject(vm.projectId);

    /**
     * Sets current model filter based on file name.
     * @param file
     * @constructor
     */
    vm.SetCurrentModelFilter = function (file) {
        vm.selectedModel = file;
        vm.allSheets = [];
        vm.Data.forEach(function (item) {
            if (item.fileName.toLowerCase() === file.name.toLowerCase() || file.name === 'All'){
                vm.allSheets.push(item);
            }
        });

        //(Konrad) We need to re-render the table when Filter is updated.
        vm.dtInstance.reloadData();
        vm.dtInstance.rerender();
    };

    /**
     * Toggles all sheets isSelected to True.
     */
    vm.toggleAll = function () {
        vm.allSheets.forEach(function (item) {
            item.isSelected = vm.selectAll;
        })
    };

    /**
     * When user clicks on table row, this will reconsile which dialog should launch.
     * @param sheet
     */
    vm.launchSheetEditor = function(sheet){
        var selected = vm.allSheets.filter(function(item){
            return item.isSelected;
        });

        if(selected.length === 1){
            if(selected[0] === sheet){
                sheet.tasks.length > 0 ? vm.showAllTasks('lg', sheet) : vm.editSheetTask('lg', sheet, 'Add Task')
            } else {
                vm.showAllTasks('lg', sheet);
            }
        } else if (selected.length === 0){
            sheet.tasks.length > 0 ? vm.showAllTasks('lg', sheet) : vm.editSheetTask('lg', sheet, 'Add Task')
        } else {
            vm.showAllTasks('lg', sheet);
        }
    };

    /**
     * Shows all tasks created for this sheet.
     * @param size
     * @param sheet
     */
    vm.showAllTasks = function (size, sheet) {
        $uibModal.open({
            animation: true,
            templateUrl: 'angular-app/sheets/all-tasks.html',
            controller: 'AllTasksController as vm',
            size: size,
            resolve: {
                sheet: function (){
                    return sheet;
                }}
        }).result.then(function(request){
            if(!request) return;
            if(request.action === 'Delete New Sheet'){
                // (Konrad) If action performed was deleting a new Sheet
                // the response will be an _id of that sheet.
                var updatedSheetId = request.response.data;
                var index = vm.allSheets.findIndex(function (item) {
                    return item._id.toString() === updatedSheetId.toString();
                });

                if(index !== -1) vm.allSheets.splice(index, 1);
            } else if(request.action === 'Delete Sheet Task'){
                // (Konrad) If action performed was deleting a sheet task
                // the response will be a list of all sheets and list of deleted ids.
                request.deletedIds.forEach(function (id) {
                    var index = sheet.tasks.findIndex(function (x) {
                        return x._id.toString() === id.toString();
                    });
                    if(index !== -1) sheet.tasks.splice(index, 1);
                });
            }
        }).catch(function(){
            console.log("All Tasks Dialog dismissed...");
        });
    };

    /**
     * Launches help window for the Sheets.
     * @param size
     */
    vm.launchHelpWindow = function (size) {
        $uibModal.open({
            animation: true,
            templateUrl: 'angular-app/sheets/help.html',
            controller: 'SheetHelpController as vm',
            size: size
        }).result.then(function(request){
            if(!request) return;

        }).catch(function(){
            //if modal dismissed
        });
    };

    /**
     * Method called when single sheet is being edited.
     * @param size
     * @param sheet
     * @param action
     */
    vm.editSheetTask = function(size, sheet, action){
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
     * Method called when AddSheet model is submitted.
     * @param size
     */
    vm.addSheet = function (size) {
        $uibModal.open({
            animation: true,
            templateUrl: 'angular-app/sheets/add-sheet.html',
            controller: 'AddSheetController as vm',
            size: size,
            resolve: {
                models: function () {
                    return vm.availableModels;
            }}
        }).result.then(function(request){
            if(!request) return;
            SheetsFactory
                .addSheets(request.collectionId, request.sheets)
                .then(function (sheetResponse) {
                    if(!sheetResponse) return;

                    // (Konrad) Let's update the table with new sheets.
                    var data = sheetResponse.data.data;
                    var newSheetIds = sheetResponse.data.newSheetIds;
                    if(newSheetIds.length > 0){
                        newSheetIds.forEach(function (id) {
                            var newSheet = data.sheets.find(function (item) {
                                return item._id.toString() === id.toString();
                            });
                            if(newSheet) vm.allSheets.push(newSheet);
                        })
                    }
                }, function (err) {
                    console.log('Unable to create Multiple Sheets: ' + err.message);
                });

        }).catch(function(){
            //if modal dismissed
        });
    };

    /**
     * Assigns proper row class to table.
     * Red if sheet was marked for deletion.
     * Orange if it was edited.
     * Green if it was added.
     * @param sheet
     * @returns {string}
     * @constructor
     */
    vm.assignClass = function (sheet) {
        if(sheet.tasks.length > 0){
            var task = sheet.tasks[sheet.tasks.length - 1]; // latest task is the last one
            if(task.completedBy) return 'table-info'; // task was completed no formatting
            if(task.isNewSheet) return 'bg-success'; // new sheet (green)
            if(task.isDeleted){
                return 'bg-danger strike'; // sheet was deleted (red)
            } else {
                return 'bg-warning'; // sheet was changed (orange)
            }
        } else {
            return 'table-info'; // no changes
        }
    };

    /**
     * If row/sheet has tasks it will assign proper values to name/number/revision.
     * @param sheet
     * @param propName
     * @returns {*}
     * @constructor
     */
    vm.assignDisplayValue = function (sheet, propName) {
        if(sheet.tasks.length > 0){
            var task = sheet.tasks[sheet.tasks.length - 1]; // latest task is the last one
            if(!task.completedBy) return task[propName]; // only return task props when task is not completed
            else return sheet[propName];
        } else {
            return sheet[propName];
        }
    };

    /**
     * It's possible that change was approved and stored in DB, but user hasn't sycnhed
     * to central yet, so actual sheet data was not updated with changes causing a mismatch.
     * This will display an alert icon next to it to notify users of such occurrences.
     * @return {boolean}
     */
    vm.propertiesMatch = function (sheet) {
        if(sheet.tasks.length > 0){
            var task = sheet.tasks[sheet.tasks.length - 1];
            if(task.completedBy && task.isNewSheet && sheet.isNewSheet) return true;
            if(task.completedBy){
                var nameMatch = task.name === sheet.name;
                var numberMatch = task.number === sheet.number;
                var revMatch = task.revisionNumber === sheet.revisionNumber;
                var deleted = task.isDeleted === sheet.isDeleted;
                return !(nameMatch && numberMatch && revMatch && deleted);
            } else {
                return false;
            }
        } else {
            return false;
        }
    };

    /**
     * Used to retrieve the Project info.
     * Also, parses through sheets/sheetsChanges to populate DataTable.
     * @param projectId
     */
    function getSelectedProject(projectId) {
        ProjectFactory.getProjectById(projectId)
            .then(function(response){
                if(!response || response.status !== 200) return {status: 500};

                vm.selectedProject = response.data;
                if(response.data.sheets.length > 0){
                    return ProjectFactory.populateSheets(projectId);
                } else {
                    return {status: 500};
                }
            })
            .then(function (response) {
                if(!response || response.status !== 200) return;

                vm.selectedProject = response.data;
                vm.allSheets = [];
                vm.selectedProject.sheets.forEach(function (item) {
                    // (Konrad) Select all model names for filtering.
                    vm.availableModels.push({
                        name: UtilityService.fileNameFromPath(item.centralPath),
                        collectionId: item._id,
                        centralPath: item.centralPath
                    });
                    // (Konrad) Assign CollectionId to all sheets.
                    item.sheets.forEach(function (sheet) {
                        if(!sheet.isDeleted){
                            sheet['collectionId'] = item._id;
                            sheet['centralPath'] = item.centralPath;
                            vm.allSheets.push(sheet);
                            vm.Data.push(sheet);
                        }
                    })
                });
                if(vm.availableModels.length > 0) vm.selectedModel = vm.availableModels[0];
            })
            .catch(function (error) {
                console.log(error);
            });
    }
}