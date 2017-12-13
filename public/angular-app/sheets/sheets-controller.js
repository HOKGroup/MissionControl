/**
 * Created by konrad.sobon on 2017-10-24.
 */
angular.module('MissionControlApp')
    .controller('SheetsController', SheetsController);

function SheetsController($route, $routeParams, SheetsFactory, DTColumnDefBuilder, DTInstances, $uibModal, Socket, UtilityService){
    var vm = this;
    vm.projectId = $routeParams.projectId;
    vm.selectedProject = null;

    var dtInstance;
    DTInstances.getLast().then(function(inst) {
        dtInstance = inst;
    });

    Socket.on('sheet_changes_updated', function(data){
        console.log('sheet_changes_updated');
    });

    getSelectedProject(vm.projectId);

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

    vm.SetCurrentModelFilter = function (file) {
        vm.selectedModel = file;

        //(Konrad) We need to re-render the table when Filter is updated.
        dtInstance.rerender();
    };

    vm.filterFile = function (file) {
        return file.fileName === vm.selectedModel.name || vm.selectedModel.name === "All";
    };

    vm.selectedItems = [];
    vm.selectAll = false;
    vm.toggleAll = function () {
        vm.allSheets.forEach(function (item) {
            item.isSelected = vm.selectAll;
            if(vm.selectAll){
                vm.selectedItems.push(item);
            } else {
                vm.selectedItems = [];
            }
        })
    };

    vm.toggleOne = function (sheet) {
        if(sheet.isSelected){
            vm.selectedItems.push(sheet);
        } else {
            var index = vm.selectedItems.indexOf(sheet);
            if(index > -1){
                vm.selectedItems.splice(index, 1)
            }
        }
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
                sheet.tasks.length > 0 ? vm.showAllTasks('lg', sheet) : vm.editSheet('lg', sheet, 'Add Task')
            } else {
                vm.showAllTasks('lg', sheet);
            }
        } else if (selected.length === 0){
            sheet.tasks.length > 0 ? vm.showAllTasks('lg', sheet) : vm.editSheet('lg', sheet, 'Add Task')
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

            var updatedSheet = request.response.data.sheets.find(function(item){
                return item.identifier === sheet.identifier;
            });
            sheet.tasks = updatedSheet.tasks;

            console.log("Event called when all tasks get closed...")

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
    vm.editSheet = function(size, sheet, action){
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

            var updatedSheet = request.response.data.sheets.find(function(item){
                return item.identifier === sheet.identifier;
            });
            sheet.tasks = updatedSheet.tasks;
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

                    var file = vm.availableModels.find(function(item){
                        return item.collectionId === request.collectionId;
                    });

                    // (Konrad) Push it into vm.changed and vm.allSheets
                    for(var i=0; i < request.sheets.length; i++){
                        var newSheet = request.sheets[i];
                        newSheet['collectionId'] = request.collectionId; // needed to identify what MongoDB collection item belongs to
                        newSheet['fileName'] = file.name; // used by the model filter

                        // (Konrad) We are adding multiple items with '' id.
                        vm.changed[newSheet.identifier] = newSheet;
                        vm.allSheets.push(newSheet);
                    }

                }, function (err) {
                    console.log('Unable to create Multiple Sheets: ' + err.message);
                });

        }).catch(function(){
            //if modal dismissed
        });
    };

    // vm.editMultipleSheets = function (size, sheets) {
    //     $uibModal.open({
    //         animation: true,
    //         templateUrl: 'editMultipleSheets',
    //         controller: modalEditMultipleSheetsCtrl,
    //         size: size,
    //         resolve: {
    //             sheets: function () {
    //                 return sheets;
    //             }
    //         }
    //     }).result.then(function(){
    //         //after modal succeeded
    //     }).catch(function(){
    //         //if modal dismissed
    //     });
    // };

    // var modalEditMultipleSheetsCtrl = function ($scope, $uibModalInstance, $uibModal, sheets) {
    //     $scope.sheets = sheets;
    //     $scope.name;
    //
    //     $scope.cancel = function () {
    //         $uibModalInstance.dismiss('cancel');
    //     };
    //
    //     $scope.submit = function () {
    //         //(Konrad) Since sheets can come from different models, they also can
    //         // be stored in different collections we need to group them by collectionId
    //         var groups = {};
    //         vm.selectedItems.forEach(function(item){
    //             item.name = $scope.name; // update sheet name
    //             var list = groups[item.collectionId];
    //             if(list){
    //                 list.push(item);
    //             } else {
    //                 groups[item.collectionId] = [item]
    //             }
    //         });
    //
    //         for (var collection in groups){
    //             var sheets = groups[collection];
    //             SheetsFactory
    //                 .updateChanges(collection, sheets)
    //                 .then(function (sheetResponse) {
    //                     if(!sheetResponse) return;
    //                 }, function (err) {
    //                     console.log('Unable to update Multiple Sheets: ' + err.message);
    //                 });
    //         }
    //
    //         $uibModalInstance.close();
    //     }
    // };

    /**
     * Assigns proper row class to table.
     * Red if sheet was marked for deletion.
     * Orange if it was edited.
     * Green if it was added.
     * @param sheet
     * @returns {string}
     * @constructor
     */
    vm.AssignClass = function (sheet) {
        if(sheet.tasks.length > 0){
            var task = sheet.tasks[sheet.tasks.length - 1]; // latest task is the last one
            if(task.completedBy) return 'table-info';
            if(task.isDeleted){
                return 'bg-danger strike';
            } else {
                return 'bg-warning';
            }
        } else {
            return 'table-info';
        }
    };

    /**
     * If row/sheet has tasks it will assign proper values to name/number/revision.
     * @param sheet
     * @param propName
     * @returns {*}
     * @constructor
     */
    vm.AssignDisplayValue = function (sheet, propName) {
        if(sheet.tasks.length > 0){
            var task = sheet.tasks[sheet.tasks.length - 1]; // latest task is the last one
            if(!task.completedBy) return task[propName]; // only return task props when task is not completed
            else return sheet[propName];
        } else {
            return sheet[propName];
        }
    };

    /**
     * Used to retrieve the Project info.
     * Also, parses through sheets/sheetsChanges to populate DataTable.
     * @param projectId
     */
    function getSelectedProject(projectId) {
        SheetsFactory
            .getProjectById(projectId)
            .then(function(response){
                if(!response) return;

                vm.selectedProject = response.data;
                if(response.data.sheets.length > 0){
                    SheetsFactory
                        .populateSheets(projectId)
                        .then(function (sheetsResponse) {
                            if(!sheetsResponse) return;

                            vm.selectedProject = sheetsResponse.data;
                            vm.allSheets = [];
                            vm.selectedProject.sheets.forEach(function (item) {

                                // (Konrad) Select all model names for filtering.
                                vm.availableModels.push({
                                    name: UtilityService.fileNameFromPath(item.centralPath),
                                    collectionId: item._id
                                });

                                // (Konrad) Assign CollectionId and File Name to all sheets.
                                item.sheets.forEach(function (sheet) {
                                    if(!sheet.isDeleted){
                                        sheet['collectionId'] = item._id;
                                        vm.allSheets.push(sheet);
                                    }
                                })
                            });
                            if(vm.availableModels.length > 0) vm.selectedModel = vm.availableModels[0];
                        }, function (error) {
                            console.log('Unable to load Sheets data ' + error.message);
                        });
                }
            },function(error){
                console.log('Unable to load project data: ' + error.message);
            });
    }
}