/**
 * Created by konrad.sobon on 2017-10-24.
 */
angular.module('MissionControlApp')
    .controller('SheetsController', SheetsController);

function SheetsController($routeParams, SheetsFactory, DTColumnDefBuilder, DTInstances, $uibModal, Socket, UtilityService){
    var vm = this;
    vm.projectId = $routeParams.projectId;
    vm.selectedProject = null;

    vm.selectedModel = "";
    vm.availableModels = ["All"];

    vm.SetCurrentModelFilter = function (file) {
        vm.selectedModel = file;

        //(Konrad) We need to re-render the table when Filter is updated.
        dtInstance.rerender();
    };

    vm.filterFile = function (file) {
        return file.fileName === vm.selectedModel || vm.selectedModel === "All";
    };

    Socket.on('sheet_changes_updated', function(data){
        console.log('sheet_changes_updated');
    });

    getSelectedProject(vm.projectId);

    var dtInstance;
    DTInstances.getLast().then(function(inst) {
        dtInstance = inst;
    });

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

    vm.editSheet = function (size, sheet) {
        $uibModal.open({
            animation: true,
            templateUrl: 'editSingleSheet',
            controller: modalEditSheetCtrl,
            size: size,
            resolve: {
                sheet: function () {
                    return sheet;
                }
            }
        }).result.then(function(){
            //after modal succeeded
        }).catch(function(){
            //if modal dismissed
        });
    };

    vm.editMultipleSheets = function (size, sheets) {
        $uibModal.open({
            animation: true,
            templateUrl: 'editMultipleSheets',
            controller: modalEditMultipleSheetsCtrl,
            size: size,
            resolve: {
                sheets: function () {
                    return sheets;
                }
            }
        }).result.then(function(){
            //after modal succeeded
        }).catch(function(){
            //if modal dismissed
        });
    };

    var modalEditMultipleSheetsCtrl = function ($scope, $uibModalInstance, $uibModal, sheets) {
        $scope.sheets = sheets;
        $scope.name;

        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };

        $scope.submit = function () {
            //(Konrad) Since sheets can come from different models, they also can
            // be stored in different collections we need to group them by collectionId
            var groups = {};
            vm.selectedItems.forEach(function(item){
                item.name = $scope.name; // update sheet name
                var list = groups[item.collectionId];
                if(list){
                    list.push(item);
                } else {
                    groups[item.collectionId] = [item]
                }
            });

            for (var collection in groups){
                var sheets = groups[collection];
                SheetsFactory
                    .updateChanges(collection, sheets)
                    .then(function (sheetResponse) {
                        if(!sheetResponse) return;
                    }, function (err) {
                        console.log('Unable to update Multiple Sheets: ' + err.message);
                    });
            }

            $uibModalInstance.close();
        }
    };

    var modalEditSheetCtrl = function ($scope, $uibModalInstance, $uibModal, sheet) {
        $scope.sheet = sheet;

        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };

        $scope.submit = function () {
            SheetsFactory
                .updateChanges($scope.sheet.collectionId, $scope.sheet)
                .then(function(sheetResponse){
                    if(!sheetResponse) return;

                    vm.changed[$scope.sheet.identifier] = $scope.sheet;
            }, function (err) {
                console.log('Unable to update Single Sheet: ' + err.message)
            });

            $uibModalInstance.close();
        }
    };

    /**
     * Checks if given sheet exists in vm.changed. Used by UI to style rows.
     * @returns {boolean}
     * @param identifier
     */
    vm.isChanged = function (identifier) {
        return identifier in vm.changed;
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
                            vm.changed = {};
                            vm.allSheets = [];
                            vm.checklist = {};

                            vm.selectedProject.sheets.forEach(function(item){
                                vm.availableModels.push(UtilityService.fileNameFromPath(item.centralPath));
                                item.sheetsChanges.forEach(function(changed){
                                    changed['collectionId'] = item._id;
                                    changed['fileName'] = UtilityService.fileNameFromPath(item.centralPath);
                                    vm.changed[changed.identifier] = changed; // store only changed elements for styling
                                    vm.checklist[changed.identifier] = changed; // store all elements but changed first
                                    vm.allSheets.push(changed)
                                });
                                item.sheets.forEach(function(sheet){
                                    if(sheet.identifier in vm.checklist){
                                        // skip
                                    } else {
                                        sheet['collectionId'] = item._id;
                                        sheet['fileName'] = UtilityService.fileNameFromPath(item.centralPath);
                                        vm.checklist[sheet.identifier] = sheet; // add rest of elements that were not changed yet
                                        vm.allSheets.push(sheet)
                                    }
                                });
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