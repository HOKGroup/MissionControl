/**
 * Created by konrad.sobon on 2018-04-19.
 */
angular.module('MissionControlApp').controller('ConfigController', ConfigController);

function ConfigController($routeParams, FilePathsFactory, ConfigFactory, ProjectFactory, TriggerRecordsFactory,
                          DTColumnDefBuilder, UtilityService, $window, $uibModal, ngToast){

    //region Init

    var vm = this;
    var toasts = [];
    vm.status = '';
    vm.projectId = $routeParams.projectId;
    vm.selectedProject = {};
    vm.selectedConfig = {};
    vm.configurations = [];
    vm.PlaceholderSharedParameterLocation = '';
    vm.selectedRecords = [];
    vm.newFile = '';
    vm.fileWarningMsg = '';
    vm.sharedParamWarningMsg = '';
    vm.files = [];
    vm.offices = UtilityService.getOffices();
    vm.selectedOffice = { name: 'All', code: 'All' };
    vm.fileTypes = [ 'All', 'Local', 'Revit Server', 'BIM 360'];
    vm.selectedType = 'All';
    vm.searchString = '';
    vm.pageNum = 0;
    vm.numItems = 5;
    vm.paginatedFiles = [];

    getSelectedProjectConfiguration(vm.projectId);
    getFiles();

    //endregion

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

    /**
     * Method used by the files dropdown to filter out results.
     * @param item
     * @returns {boolean}
     */
    vm.filterFn = function(item)
    {
        var filePath = item.centralPath.toLowerCase();
        var passedOffice = false;
        var passedType = false;
        var passedNameSearch = false;

        if(vm.selectedOffice.name === 'All'){
            passedOffice = true;
        } else {
            var isLocal = filePath.lastIndexOf('\\\\group\\hok\\', 0) === 0;
            var isBim360 = filePath.lastIndexOf('bim 360://', 0) === 0;
            var isRevitServer = filePath.lastIndexOf('rsn://', 0) === 0;

            if(isLocal){
                var regx = /^\\\\group\\hok\\(.+?(?=\\))|^\\\\(.{2,3})-\d{2}svr(\.group\.hok\.com)?\\/g;
                var match = regx.exec(filePath);
                if(match === null || match[1] === null){
                    passedOffice = false;
                } else {
                    passedOffice = (vm.selectedOffice.code.findIndex(function (item) {
                        return item.toLowerCase() === match[1];
                    }) !== -1);
                }
            }

            if(isRevitServer){
                var regx1 = /(rsn:\/\/)(\w*)/g;
                var match1 = regx1.exec(filePath);
                if(match1 === null || match1[2] === null){
                    passedOffice = false;
                } else {
                    passedOffice = (vm.selectedOffice.code.findIndex(function (item) {
                        return item.toLowerCase() === match1[2];
                    }) !== -1);
                }
            }

            // (Konrad) BIM 360 files are not being stored with proper office designations
            // so we can just ignore them when filtering for office.
            if(isBim360){
                passedOffice = true;
            }
        }

        switch(vm.selectedType){
            case 'All':
                passedType = true;
                break;
            case 'Local':
                passedType = filePath.lastIndexOf('\\\\group\\hok\\', 0) === 0;
                break;
            case 'Revit Server':
                passedType = filePath.lastIndexOf('rsn://', 0) === 0;
                break;
            case 'BIM 360':
                passedType = filePath.lastIndexOf('bim 360://', 0) === 0;
                break;
        }

        if (vm.searchString !== '') {
            passedNameSearch = filePath.includes(vm.searchString);
        } else {
            passedNameSearch = true;
        }

        return passedType && passedOffice && passedNameSearch;
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
        var centralPaths = [];
        vm.selectedConfig.files.forEach(function (file) {
            centralPaths.push(file.centralPath);
        });

        var data = {
            from: vm.dtFrom,
            to: vm.dtTo,
            paths: centralPaths
        };

        TriggerRecordsFactory.getManyByCentralPathDates(data)
            .then(function (response) {
                if(!response || response.status !== 200) throw response;

                vm.triggerRecords = response.data;
                var triggerRecords = [];
                response.data.forEach(function (item) {
                    item.triggerRecords.forEach(function (record) {
                        record['centralPath'] = item.centralPath;
                        triggerRecords.push(record);
                    });
                });

                vm.selectedRecords = triggerRecords;
                vm.loading = false;
            })
            .catch(function (err) {
                vm.loading = false;
                console.log(err);
                toasts.push(ngToast.danger({
                    dismissButton: true,
                    dismissOnTimeout: true,
                    timeout: 4000,
                    newestOnTop: true,
                    content: err.message
                }));
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
     *
     * @param type
     */
    vm.setTypeFilter = function (type) {
        vm.selectedType = type;
        if(type === 'BIM 360'){
            vm.selectedOffice = { name: 'All', code: 'All' };
        }
    };

    /**
     * Sets active/selected Configuration.
     * @param configId
     */
    vm.setSelectedConfig = function (configId) {
        vm.selectedConfig = vm.configurations.find(function (item) {
            return item._id === configId;
        });

        vm.filterDate();
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

            // (Konrad) Update config file path.
            vm.selectedConfig.files.forEach(function(item){
                if(item.centralPath.toLowerCase() === data.before.toLowerCase()){
                    item.centralPath = data.after.toLowerCase();
                }
            });

            // (Konrad) Update file path for dropdown.
            vm.files.forEach(function (item) {
                if(item.centralPath.toLowerCase() === data.before.toLowerCase()){
                    item.centralPath = data.after.toLowerCase();
                }
            });

            toasts.push(ngToast.success({
                dismissButton: true,
                dismissOnTimeout: true,
                timeout: 4000,
                newestOnTop: true,
                content: 'Successfully changed file path.'
            }));
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
        vm.fileWarningMsg = '';

        // (Konrad) Everything is lower case to make matching easier.
        // Checks if file path is one of the three (3) approved types.
        var isLocal = filePath.lastIndexOf('\\\\group\\hok\\', 0) === 0;
        var isBim360 = filePath.lastIndexOf('bim 360://', 0) === 0;
        var isRevitServer = filePath.lastIndexOf('rsn://', 0) === 0;

        if(!isLocal && !isBim360 && !isRevitServer){
            vm.fileWarningMsg = 'File Path must be either Local, BIM 360 or Revit Server.';
            return;
        }

        // (Konrad) Let's make sure we have a valid, non empty name
        if(!filePath || !filePath.length || !filePath.includes('.rvt')){
            vm.fileWarningMsg = 'File name is not valid. Must be non-empty and include *.rvt';
            return;
        }

        var uri = UtilityService.getHttpSafeFilePath(filePath);
        ConfigFactory.getByCentralPath(uri)
            .then(function(response){
                if(!response || response.status !== 200) throw response;

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
                } else {
                    var file1 = { centralPath: filePath };
                    vm.selectedConfig.files.push(file1);
                    vm.newFile = '';

                    return ConfigFactory.addFile(vm.selectedConfig._id, file1);
                }
            })
            .then(function (response) {
                if(!response || response.status !== 202) throw response;

                var data = {
                    centralPath: filePath,
                    projectId: vm.projectId
                };
                return FilePathsFactory.addToProject(data);
            })
            .then(function (response) {
                if(!response || response.status !== 201) throw response;

                // (Konrad) Now that file path was used, let's remove it from dropdown.
                vm.files = vm.files.filter(function (path) {
                    return path.centralPath !== filePath;
                });

                toasts.push(ngToast.success({
                    dismissButton: true,
                    dismissOnTimeout: true,
                    timeout: 4000,
                    newestOnTop: true,
                    content: 'Successfully added new file to Configuration.'
                }));
            })
            .catch(function (err) {
                console.log(err);
                toasts.push(ngToast.danger({
                    dismissButton: true,
                    dismissOnTimeout: true,
                    timeout: 4000,
                    newestOnTop: true,
                    content: err.message
                }));
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
                        if(!response || response.status !== 202) throw response;

                        var data = {
                            centralPath: filePath.toLowerCase()
                        };
                        return FilePathsFactory.removeFromProject(data);
                    })
                    .then(function (response) {
                        if(!response || response.status !== 201) throw response;

                        vm.files.push({
                            centralPath: filePath.toLowerCase(),
                            name: UtilityService.fileNameFromPath(filePath.toLowerCase())
                        });

                        toasts.push(ngToast.success({
                            dismissButton: true,
                            dismissOnTimeout: true,
                            timeout: 4000,
                            newestOnTop: true,
                            content: 'Successfully removed file from Configuration.'
                        }));
                    })
                    .catch(function (err) {
                        console.log(err);
                        toasts.push(ngToast.danger({
                            dismissButton: true,
                            dismissOnTimeout: true,
                            timeout: 4000,
                            newestOnTop: true,
                            content: err.message
                        }));
                    });

                // (Konrad) It worked! Jump out...
                break;
            }
        }
    };

    /**
     * Updates current Configuration.
     */
    vm.updateConfiguration = function(){
        if(vm.selectedConfig.sharedParamMonitor.isMonitorOn && (!vm.selectedConfig.sharedParamMonitor.filePath ||
            vm.selectedConfig.sharedParamMonitor.filePath.length === 0)){
                vm.sharedParamWarningMsg = 'Please specify a valid File Path to Shared Parameters file.';
                return;
        }

        ConfigFactory.updateConfiguration(vm.selectedConfig)
            .then(function(response){
                if (response && response.status === 201){
                    $window.location.reload();
                } else {
                    toasts.push(ngToast.danger({
                        dismissButton: true,
                        dismissOnTimeout: true,
                        timeout: 4000,
                        newestOnTop: true,
                        content: 'Configuration update failed.'
                    }));
                }
            })
            .catch(function (err) {
                console.log(err);
                toasts.push(ngToast.danger({
                    dismissButton: true,
                    dismissOnTimeout: true,
                    timeout: 4000,
                    newestOnTop: true,
                    content: err.message
                }));
            });
    };

    /**
     * Removes Configuration document, reference to Configuration from Project, and
     * also removes Trigger Record documents that were used by this Configuration.
     * @param id
     */
    vm.deleteConfiguration = function(id){
        var ids = vm.triggerRecords.map(function (record) {
            return record._id;
        });

        ConfigFactory.deleteConfiguration(id) // Configuration
            .then(function(response) {
                if(!response || response.status !== 204) throw response;
                return ProjectFactory.deleteConfig(vm.projectId, id); // Project.Configurations
            })
            .then(function (response) {
                if(!response || response.status !== 201) throw response;
                return FilePathsFactory.removeManyFromProject(vm.selectedConfig.files); // File Paths
            })
            .then(function (response) {
                if(!response || response.status !== 201) throw response;
                return TriggerRecordsFactory.deleteMany(ids); // Trigger Records
            })
            .then(function (response) {
                if(!response || response.status !== 201) throw response;
                return ProjectFactory.deleteTriggerRecords(vm.projectId, ids); // Project.TriggerRecords
            })
            .then(function (response) {
                if(!response || response.status !== 201) throw response;
                $window.location.reload();
            })
            .catch(function (err) {
                console.log(err);
                toasts.push(ngToast.danger({
                    dismissButton: true,
                    dismissOnTimeout: true,
                    timeout: 4000,
                    newestOnTop: true,
                    content: 'Unable to delete Configuration.'
                }));
            });
    };

    /**
     * Launches help window for the File Path.
     * @param size
     */
    vm.launchHelpWindow = function (size) {
        $uibModal.open({
            animation: true,
            templateUrl: 'angular-app/configuration/file-path-help.html',
            controller: 'FilePathHelpController as vm',
            size: size
        }).result.then(function(request){
            //model closed

        }).catch(function(){
            //if modal dismissed
        });
    };

    //region Utilities

    /**
     * Retrieves all central model file paths that were not yet assigned
     * to any configurations.
     */
    function getFiles(){
        FilePathsFactory.getAllUnassigned()
            .then(function (response) {
                if(!response || response.status !== 200) throw response;

                response.data.forEach(function (file) {
                    file['name'] = UtilityService.fileNameFromPath(file.centralPath);
                });
                vm.files = response.data;
                vm.filesPagination(vm.pageNum, vm.numItems);
            })
            .catch(function (err) {
                console.log(err);
                toasts.push(ngToast.danger({
                    dismissButton: true,
                    dismissOnTimeout: true,
                    timeout: 4000,
                    newestOnTop: true,
                    content: err.message
                }));
            });
    }

    /**
     * 
     */
    vm.filesPagination = function(page, numItems) {
        vm.pageNum = page;
        var filteredArray = vm.files.filter(vm.filterFn);
        var start = page * numItems; 
        var end = start + numItems;
        var currentView = filteredArray.slice(start, end);
        console.log(currentView);
        vm.paginatedFiles =  currentView;

    };

    vm.searchFilePaths = function(string) {
        console.log(string);
        vm.filesPagination(0, vm.numItems);
    };

    vm.fullFilesArrayCount = function() {
        var filteredArray = vm.files.filter(vm.filterFn);
        return filteredArray.length;
    };

    // Overriding Bootstrap's data-toggle attribute
    vm.toggleFilePicker = function(event) {
        vm.filesPagination(0, vm.numItems);
        $('#file-picker').parent().toggleClass('open');
    };
    
    // (Dan) Not a fan of using a click-handler here. Would like to remove if possible
    $('body').on('click', function (e) {
        if (!$('.scrollable-menu-centered').is(e.target) 
            && $('.scrollable-menu-centered').has(e.target).length === 0 
            && $('.open').has(e.target).length === 0
        ) {
            $('#file-picker').parent().removeClass('open');
        }
    });

    /**
     * Retrieves Project Configuration.
     * @param projectId
     */
    function getSelectedProjectConfiguration(projectId) {
        ProjectFactory.getProjectByIdPopulateConfigurations(projectId)
            .then(function(response){
                if(!response || response.status !== 200) throw response;

                SetFilter();

                vm.selectedProject = response.data;
                vm.configurations = response.data.configurations;
                if (vm.configurations.length > 0){
                    vm.selectedConfig = vm.configurations[0];
                    vm.PlaceholderSharedParameterLocation = GetSharedParamLocation(vm.selectedConfig);

                    vm.filterDate();
                }
            })
            .catch(function (err) {
                console.log(err);
                toasts.push(ngToast.danger({
                    dismissButton: true,
                    dismissOnTimeout: true,
                    timeout: 4000,
                    newestOnTop: true,
                    content: err.message
                }));
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
            if (path[i] === '\\') indices.push(i + 1);
        }
        indices.splice(-2); // drop last two folders
        var index = indices[indices.length - 1]; // index of E-Bim folder

        return path.substring(0, index) + '\\Support\\SharedParameterFileName.txt';
    }

    //endregion
}