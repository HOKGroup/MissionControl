/**
 * Created by konrad.sobon on 2017-10-24.
 */
angular.module('MissionControlApp').controller('SheetsController', SheetsController);

function SheetsController($routeParams, SheetsFactory, ProjectFactory, $scope, $compile, DTOptionsBuilder, DTColumnBuilder, $uibModal, UtilityService){
    var vm = this;
    var all = { name: "All", collectionId: '' };
    var titleHtml = '<input type="checkbox" ng-model="vm.selectAll" ng-click="vm.toggleAll(vm.selectAll, vm.selected)">';

    vm.projectId = $routeParams.projectId;
    vm.selectedProject = null;
    vm.Data = [];
    vm.selectedModel = all;
    vm.availableModels = [all];
    vm.selected = {};
    vm.selectAll = false;
    vm.headerCompiled = false;

    /**
     * Assigns proper row class to table.
     * Red if sheet was marked for deletion.
     * Orange if it was edited.
     * Green if it was added.
     * @param sheet
     * @returns {string}
     * @constructor
     */
    function assignClass(sheet) {
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
    }

    function createTable() {
        vm.dtInstance = {};
        vm.dtOptions = DTOptionsBuilder.fromFnPromise(function () {
            return getData()
        }).withPaginationType('simple_numbers')
            .withDisplayLength(10)
            .withOption('lengthMenu', [[10, 25, 50, 100, -1],[10, 25, 50, 100, 'All']])
            // .withOption('aaSorting', [[3, 'desc']]) //TODO: Sorting only works when stateSave is disabled
            .withOption('stateSave', true)
            .withDataProp('data')
            .withOption('createdRow', function(row, data, dataIndex) {
                // (Konrad) Recompiling so we can bind Angular directive to the DT
                $compile(angular.element(row).contents())($scope);
            })
            .withOption('rowCallback', function (row, data, index) {
                row.className = row.className + ' ' + assignClass(data);
            })
            .withOption('headerCallback', function(header) {
                if (!vm.headerCompiled) {
                    // (Konrad) Use this headerCompiled field to only compile header once
                    vm.headerCompiled = true;
                    $compile(angular.element(header).contents())($scope);
                }
            })
            .withOption('initComplete', function() {
                // (Konrad) For some reason the sorting icon appears on first load. We can remove it.
                $('#sheetsTable').find('> thead > tr > th:first').removeClass('sorting_asc');
            });

        vm.dtColumns = [
            DTColumnBuilder.newColumn(null)
                .withTitle(titleHtml)
                .notSortable()
                .withOption('width', '5%')
                .renderWith(function (data, type, full, meta) {
                    vm.selected[full._id] = false;
                    return '<input type="checkbox" ng-model="vm.selected[\'' + data._id + '\']" ng-click="vm.toggleOne(vm.selected)">';
                }),
            DTColumnBuilder.newColumn('number')
                .withTitle('Number')
                .withOption('width', '35%')
                .renderWith(function (data, type, full, meta) {
                    var number = getDisplayValue(full, 'number');
                    return '<div ng-click="vm.launchSheetEditor(\'' +
                        full._id + '\')">' + number + ' ' +
                        '<span class="fa fa-exclamation-circle" ng-if="vm.propertiesMatch(\'' +
                        full._id + '\')" uib-tooltip="Possible that user has not synched approved changes." tooltip-placement="top" style="color: #d9534f"></span></div>';
                }),
            DTColumnBuilder.newColumn('name')
                .withTitle('Name')
                .withOption('width', '50%')
                .renderWith(function (data, type, full, meta) {
                    var name = getDisplayValue(full, 'name');
                    return '<div ng-click="vm.launchSheetEditor(\'' + full._id + '\')">' + name +'</div>';
                }),
            DTColumnBuilder.newColumn('revisionNumber')
                .withTitle('Revision')
                .withClass('text-center')
                .withOption('width', '10%')
        ];
    }

    /**
     *
     * @returns {*}
     */
    function getData() {
        return new Promise(function(resolve, reject){
            var data = [];
            vm.Data.forEach(function (item) {
                if (item.fileName.toLowerCase() === vm.selectedModel.name.toLowerCase() ||
                    vm.selectedModel.name === 'All'){
                    data.push(item);
                }
            });

            if (!data) reject();
            else resolve(data);
        });
    }

    /**
     * If row/sheet has tasks it will assign proper values to name/number/revision.
     * @param sheet
     * @param propName
     * @returns {*}
     * @constructor
     */
    function getDisplayValue(sheet, propName) {
        if(sheet.tasks.length > 0){
            var task = sheet.tasks[sheet.tasks.length - 1]; // latest task is the last one
            if(!task.completedBy) return task[propName]; // only return task props when task is not completed
            else return sheet[propName];
        } else {
            return sheet[propName];
        }
    }

    // (Konrad) Retrieves selected project from MongoDB.
    getSelectedProject(vm.projectId);

    /**
     *
     * @param selectAll
     * @param selectedItems
     */
    vm.toggleAll = function (selectAll, selectedItems) {
        for (var id in selectedItems) {
            if (selectedItems.hasOwnProperty(id)) {
                selectedItems[id] = selectAll;
            }
        }
    };

    /**
     *
     * @param selectedItems
     */
    vm.toggleOne = function (selectedItems) {
        for (var id in selectedItems) {
            if (selectedItems.hasOwnProperty(id)) {
                if (!selectedItems[id]) {
                    vm.selectAll = false;
                    return;
                }
            }
        }
        vm.selectAll = true;
    };

    /**
     * Sets current model filter based on file name.
     * @param file
     * @constructor
     */
    vm.SetCurrentModelFilter = function (file) {
        vm.selectedModel = file;
        reloadTable();
    };

    /**
     * Method to recalculate data table contents and reload it.
     */
    function reloadTable() {
        if(vm.dtInstance){
            vm.dtInstance.reloadData();
            vm.dtInstance.rerender();
        }
    }

    /**
     * When user clicks on table row, this will reconsile which dialog should launch.
     * @param sheetId
     */
    vm.launchSheetEditor = function(sheetId){
        var sheet = vm.Data.find(function (item) {
            return item._id === sheetId;
        });

        if (sheet.tasks.length > 0){
            vm.showAllTasks('lg', sheet);
        } else {
            vm.editSheetTask('lg', sheet, 'Add Task');
        }
    };

    /**
     * It's possible that change was approved and stored in DB, but user hasn't sycnhed
     * to central yet, so actual sheet data was not updated with changes causing a mismatch.
     * This will display an alert icon next to it to notify users of such occurrences.
     * @return {boolean}
     */
    vm.propertiesMatch = function (sheetId) {
        var sheet = vm.Data.find(function (item) {
            return item._id === sheetId;
        });
        if (!sheet) return false;

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
                var index = vm.Data.findIndex(function (item) {
                    return item._id.toString() === updatedSheetId.toString();
                });

                if(index !== -1) vm.Data.splice(index, 1);
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
            reloadTable();
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
            reloadTable();
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
                            if(newSheet) vm.Data.push(newSheet);
                        })
                    }

                    reloadTable();
                }, function (err) {
                    console.log('Unable to create Multiple Sheets: ' + err.message);
                });

        }).catch(function(){
            //if modal dismissed
        });
    };

    //region Utilities

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
                            vm.Data.push(sheet);
                        }
                    })
                });
                if(vm.availableModels.length > 0) vm.selectedModel = vm.availableModels[0];
                createTable();
            })
            .catch(function (error) {
                console.log(error);
            });
    }

    //endregion
}