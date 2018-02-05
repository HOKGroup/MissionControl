/**
 * Created by konrad.sobon on 2018-01-03.
 */
angular.module('MissionControlApp').controller('EditFilePathController', EditFilePathController);

function EditFilePathController($uibModalInstance, ConfigFactory, FamiliesFactory, HealthRecordsFactory, TriggerRecordsFactory, SheetsFactory, filePath, id) {
    var vm = this;
    vm.filePath = filePath.toLowerCase();
    vm.warning = '';

    /**
     * Submits edits to existing file path.
     */
    vm.submit = function () {
        if(!vm.filePath){
            vm.warning = 'Please enter valid file path.';
            return;
        } else if (vm.filePath.length < 4 || !vm.filePath.includes('.rvt'))
        {
            vm.warning = 'Please make sure that file path includes ".rvt" extension.';
            return;
        }

        // (Konrad) Before allowing user to change file name, let's check they are not changing it to
        // name that might already exist in the DB.
        var uri = vm.filePath.replace(/\\/g, '|');
        ConfigFactory
            .getByCentralPath(uri).then(function(response){
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
            } else
            {
                // (Konrad) All checks passed, we can safely execute name update.
                updateName();
            }
        }, function(error){
            vm.warning = 'Unable to retrieve Configuration data from DB. Verify your connection to server.';
            console.log(error);
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
        // Each collection (Familes, Sheets, Health Records etc.) uses Central Path to
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
                return HealthRecordsFactory.updateFilePath(id, data);
            })
            .then(function (response) {
                if(!response) return;
                return TriggerRecordsFactory.updateFilePath(id, data);
            })
            .then(function (response) {
                if(!response) return;
                return SheetsFactory.updateFilePath(id, data);
            })
            .then(function (response) {
                if(!response) return;
                $uibModalInstance.close({response: data});
            })
            .catch(function (err) {
                console.log(err);
            });
    }
}