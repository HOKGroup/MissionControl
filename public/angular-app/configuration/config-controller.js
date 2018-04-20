/**
 * Created by konrad.sobon on 2018-04-19.
 */
angular.module('MissionControlApp').controller('ConfigController', ConfigController);

function ConfigController($routeParams, ConfigFactory, ProjectFactory, TriggerRecordsFactory, DTColumnDefBuilder, $window, $uibModal){
    var vm = this;
    vm.status = '';
    vm.projectId = $routeParams.projectId;
    vm.selectedProject = {};
    vm.selectedConfig = {};
    vm.configurations = [];
    vm.PlaceholderSharedParameterLocation = '';
    vm.selectedRecords = {};
    vm.newFile = '';
    vm.fileWarningMsg = '';

    getSelectedProjectConfiguration(vm.projectId);

    //region Family Name Overrides

    vm.familyNameCheckTag = null;
    vm.dimensionValueCheckTag = null;

    /**
     * Add tag to family name overrides.
     * @param arr
     * @constructor
     */
    vm.AddFamilyTag = function (arr) {
        if(vm.familyNameCheckTag === null) return;

        arr.push(vm.familyNameCheckTag);
        vm.familyNameCheckTag = null;
    };

    vm.AddDimensionTag = function (arr) {
        if(vm.dimensionValueCheckTag === null) return;

        arr.push(vm.dimensionValueCheckTag);
        vm.dimensionValueCheckTag = null;
    };

    /**
     * Event handler for adding new Tags to Override Filters.
     * @param event
     * @param arr
     * @param action
     */
    vm.onEnter = function (event, arr, action) {
        if(event.which !== 13) return;

        switch (action){
            case 'FamilyNameCheck':
                vm.AddFamilyTag(arr);
                break;
            case 'DimensionValueCheck':
                vm.AddDimensionTag(arr);
                break;
        }
    };

    /**
     * Removes a string from arry by index.
     * @param arr
     * @param index
     * @constructor
     */
    vm.RemoveTag = function (arr, index) {
        arr.splice(index, 1);
    };
    //endregion

    //region Date Filtering

    vm.loading = false;
    vm.format = 'dd-MMMM-yyyy';
    vm.dateOptions = {
        formatYear: 'yy',
        maxDate: new Date(2020, 5, 22),
        minDate: new Date(2015, 5, 22),
        startingDay: 1
    };
    vm.popup1 = { opened: false };
    vm.popup2 = { opened: false };

    /**
     * Opens pop-up date pickers.
     * @param popup
     */
    vm.openDatePicket = function(popup) {
        popup === 'from' ? vm.popup1.opened = true : vm.popup2.opened = true;
    };

    /**
     * Filters Editing Records based on selected date range.
     */
    vm.filterDate = function () {
        if(!vm.selectedConfig) return;

        vm.loading = true;
        var data = {
            from: vm.dtFrom,
            to: vm.dtTo,
            configId: vm.selectedConfig._id
        };
        TriggerRecordsFactory.getByConfigIdDates(data)
            .then(function (response) {
                if(!response || response.status !== 200) return;

                vm.selectedRecords = response.data;
                vm.loading = false;
            })
            .catch(function (err) {
                console.log(err);
            });
    };

    //endregion

    //region DataTable Setup

    vm.dtRecordsOptions = {
        paginationType: 'simple_numbers',
        lengthMenu: [[10, 25, 50, 100, -1], [10, 25, 50, 100, 'All']],
        stateSave: false,
        deferRender: true
    };

    vm.dtRecordsColumnDefs = [
        DTColumnDefBuilder.newColumnDef(0), //file name
        DTColumnDefBuilder.newColumnDef(1), //category
        DTColumnDefBuilder.newColumnDef(2), //edited on
        DTColumnDefBuilder.newColumnDef(3) //edited by
    ];

    //endregion

    /**
     * Sets active/selected Configuration.
     * @param configId
     */
    vm.setSelectedConfig = function (configId) {
        vm.selectedConfig = vm.configurations.find(function (item) {
            return item._id === configId;
        });
    };

    /**
     * Opens modal dialog allowing for change of file path.
     * @param filePath
     * @param size
     */
    vm.editPath = function(filePath, size){
        $uibModal.open({
            animation: true,
            templateUrl: 'angular-app/configuration/edit-file-path.html',
            controller: 'EditFilePathController as vm',
            size: size,
            resolve: {
                filePath: function () {
                    return filePath;
                },
                id: function () {
                    return vm.selectedConfig._id;
                }}
        }).result.then(function(request){
            if(!request) return;

            var data = request.response;
            vm.selectedConfig.files.forEach(function(item){
                if(item.centralPath.toLowerCase() === data.before.toLowerCase()){
                    item.centralPath = data.after;
                }
            })
        }).catch(function(){
            //if modal dismissed
        });
    };

    /**
     * Adds a new file to configuration.
     */
    vm.addFile = function(){
        if(!vm.newFile){
            vm.fileWarningMsg = 'Please enter valid file path.';
            return;
        }

        // (Konrad) All file paths are stored in MongoDB with lower case.
        // This allows for case insensitive searches and use of indexes.
        var filePath = vm.newFile.toLowerCase();
        vm.fileWarningMsg='';

        var uri = filePath.replace(/\\/g, '|');
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
                        for(var j=0; j<config.files.length; j++){
                            var file = config.files[j];
                            if(file.centralPath === filePath){
                                configMatched = true;
                                configNames += ' [' + config.name + '] ';
                                break;
                            }
                        }
                    }
                }
                if(configMatched){
                    vm.fileWarningMsg = 'Warning! File already exists in other configurations.\n' + configNames;
                } else if(filePath.length > 0 && filePath.includes('.rvt')){
                    var file1 = { centralPath: filePath };
                    vm.selectedConfig.files.push(file1);
                    vm.newFile = '';

                    return ConfigFactory.addFile(vm.selectedConfig._id, file1);
                } else {
                    vm.fileWarningMsg = 'Warning! Please enter a valid file.';
                }
            })
            .then(function (response) {
                if(!response || response.status !== 202) return;

                vm.status = 'Successfully added new file to Configuration.';
            })
            .catch(function (err) {
                console.log(err.message);
                vm.status = 'Unable to get configuration data: ' + err.message;
            });
    };

    /**
     * Removes selected file from MongoDB.
     * @param filePath
     */
    vm.deleteFile = function(filePath){
        for (var i = 0; i < vm.selectedConfig.files.length; i++) {
            var file =  vm.selectedConfig.files[i];
            if (file.centralPath.toLowerCase() === filePath.toLowerCase()) {
                vm.selectedConfig.files.splice(i, 1);

                ConfigFactory.deleteFile(vm.selectedConfig._id, file)
                    .then(function (response) {
                        if(!response || response.status !== 202) return;

                        console.log(response);
                    })
                    .catch(function (err) {
                        console.log(err.message);
                    });
                break;
            }
        }
    };

    /**
     * Updates current Configuration.
     */
    vm.updateConfiguration = function(){
        ConfigFactory.updateConfiguration(vm.selectedConfig)
            .then(function(response){
                if (response && response.status === 202){
                    $window.location.reload();
                } else {
                    vm.status = 'Configuration update failed.';
                }
            }, function(error){
                vm.status = 'Unabl to update configuration: ' + error.message;
            });
    };

    /**
     * Removes Configuration from Project, and Configurations collection.
     * @param id
     */
    vm.deleteConfiguration = function(id){
        ConfigFactory.deleteConfiguration(id)
            .then(function(response) {
                if(!response || response.status !== 204) return;

                for (var i = 0; i < vm.configurations.length; i++) {
                    var config = vm.configurations[i];
                    if (config._id === id) {
                        vm.configurations.splice(i, 1);
                        return ProjectFactory.deleteConfig(vm.projectId, id);
                    }
                }
                $window.location.reload();
            })
            .then(function (response) {
                if(!response || response.status !== 204) return;

                vm.status = 'Successfully delete Configuration.';
            })
            .catch(function (err) {
                console.log(err.message);
                vm.status = 'Unable to delete Configuration:' + err.message;
            });
    };

    //region Utilities

    /**
     * Retrieves Project Configuration.
     * @param projectId
     */
    function getSelectedProjectConfiguration(projectId) {
        ProjectFactory.getProjectById(projectId)
            .then(function(response){
                if(!response || response.status !== 200) return;

                vm.selectedProject = response.data;
                return ConfigFactory.getMany(response.data.configurations);
            })
            .then(function (response) {
                if (!response || response.status !== 200) return;

                vm.configurations = response.data;
                if (vm.configurations.length > 0){
                    vm.selectedConfig = vm.configurations[0];
                    vm.PlaceholderSharedParameterLocation = GetSharedParamLocation(vm.selectedConfig);

                    vm.filterDate();
                }
                SetFilter();
            })
            .catch(function (err) {
                console.log(err.message);
                vm.status = 'Unable to load Configuration data: ' + err.message;
            });
    }

    /**
     * Set filter dates.
     */
    function SetFilter() {
        vm.dtFrom = new Date();
        vm.dtFrom.setMonth(vm.dtFrom.getMonth() - 1);
        vm.dtTo = new Date();
    }

    /**
     * @return {string}
     */
    function GetSharedParamLocation(config){
        var path = config.files[0].centralPath;
        var indices = [];
        for (var i = 0; i < path.length; i++){
            if (path[i] === "\\") indices.push(i + 1);
        }
        indices.splice(-2); // drop last two folders
        var index = indices[indices.length - 1]; // index of E-Bim folder

        return path.substring(0, index) + "\\Support\\SharedParameterFileName.txt";
    }

    //endregion
}