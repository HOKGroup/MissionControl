/**
 * Created by konrad.sobon on 2018-01-03.
 */
angular.module('MissionControlApp').controller('EditFilePathController', EditFilePathController);

function EditFilePathController($uibModalInstance, ConfigFactory, FamiliesFactory, LinksFactory, ModelsFactory,
                                SheetsFactory, StylesFactory, TriggerRecordsFactory, ViewsFactory, WorksetsFactory,
                                filePath, id) {
    var vm = this;
    vm.filePath = filePath.toLowerCase();
    vm.warning = '';

    /**
     * Submits edits to existing file path.
     */
    vm.submit = function () {
        var filePath = vm.filePath.toLowerCase();
        if(!filePath){
            vm.warning = 'Please enter valid file path.';
            return;
        } else if (filePath.length < 4 || !filePath.includes('.rvt')) {
            vm.warning = 'Please make sure that file path includes ".rvt" extension.';
            return;
        }

        // (Konrad) Everything is lower case to make matching easier.
        // Checks if file path is one of the three (3) approved types
        var isLocal = filePath.lastIndexOf('\\\\group\\hok\\', 0) === 0;
        var isBim360 = filePath.lastIndexOf('bim 360://', 0) === 0;
        var isRevitServer = filePath.lastIndexOf('rsn://', 0) === 0;

        if(!isLocal || !isBim360 || !isRevitServer){
            vm.warning = 'File Path must be either Local, BIM 360 or Revit Server.';
            return;
        }

        // (Konrad) Before allowing user to change file name, let's check they are not changing it to
        // name that might already exist in the DB.
        var uri = vm.filePath.replace(/\\/g, '|');
        ConfigFactory.getByCentralPath(uri)
            .then(function(response){
                if(!response || response.status !== 200) return;

                var configFound = response.data;
                var configNames = '';
                var configMatched = false;
                if(configFound.length > 0){
                    //find an exact match from text search result
                    for(var i = 0; i < configFound.length; i++) {
                        var config = configFound[i];
                        for(var j = 0; j < config.files.length; j++){
                            var file = config.files[j];
                            if(file.centralPath.toLowerCase() === vm.filePath.toLowerCase()){
                                configMatched = true;
                                configNames += ' [' + config.name + '] ';
                                break;
                            }
                        }
                    }
                }
                if(configMatched){
                    vm.warning = 'This file already exists in other configurations. Please try a different name, or remove this one first';
                } else {
                    // (Konrad) All checks passed, we can safely execute name update.
                    updateName();
                }
            })
            .catch(function (err) {
                vm.warning = 'Unable to retrieve Configuration data from DB. Verify your connection to server.';
                console.log(err.message);
            });
    };

    /**
     * Closes modal dialog.
     */
    vm.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };

    /**
     * Executes all DB updates for given file path.
     */
    var updateName = function(){
        // (Konrad) Updating just the array stored in the configuration is not enough.
        // Each collection (Familes, Sheets, etc.) uses Central Path to
        // distinguish from one model to another. We need to update all of those paths to
        // prevent data from getting disassociated.
        var data = { before: filePath.toLowerCase(), after: vm.filePath.toLowerCase() };

        ConfigFactory.updateFilePath(id, data)
            .then(function (response) {
                if(!response) return;
                return FamiliesFactory.updateFilePath(id, data);
            })
            .then(function (response) {
                if(!response) return;
                return LinksFactory.updateFilePath(id, data);
            })
            .then(function (response) {
                if(!response) return;
                return ModelsFactory.updateFilePath(id, data);
            })
            .then(function (response) {
                if(!response) return;
                return SheetsFactory.updateFilePath(id, data);
            })
            .then(function (response) {
                if(!response) return;
                return StylesFactory.updateFilePath(id, data);
            })
            .then(function (response) {
                if(!response) return;
                return TriggerRecordsFactory.updateFilePath(id, data);
            })
            .then(function (response) {
                if(!response) return;
                return ViewsFactory.updateFilePath(id, data);
            })
            .then(function (response) {
                if(!response) return;
                return WorksetsFactory.updateFilePath(id, data);
            })
            .then(function (response) {
                if(!response) return;
                $uibModalInstance.close({ response: data });
            })
            .catch(function (err) {
                console.log(err);
            });
    }
}