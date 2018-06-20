/**
 * Created by konrad.sobon on 2018-04-19.
 */
angular.module('MissionControlApp').controller('AddConfigController', AddConfigController);

function AddConfigController($routeParams, ConfigFactory, ProjectFactory, $window, $uibModal){
    var vm = this;
    vm.projectId = $routeParams.projectId;
    vm.selectedProject = {};
    vm.newConfig = {};
    vm.newFile = '';
    vm.fileWarningMsg = '';
    vm.HasFiles = false;
    vm.status = " ";

    getSelectedProject(vm.projectId);
    setDefaultConfig();

    /**
     * Adds new file to the Configuration, but first it verifies that it doesn't
     * exists in any other Configuration.
     */
    vm.addFile = function(){
        // (Konrad) All file paths are stored as lower case in DB.
        // This makes the search and comparison case insensitive.
        var filePath = vm.newFile.toLowerCase();
        vm.fileWarningMsg = '';

        // (Konrad) Everything is lower case to make matching easier.
        // Checks if file path is one of the three (3) approved types.
        var isLocal = filePath.lastIndexOf('\\\\group\\hok\\', 0) === 0;
        var isBim360 = filePath.lastIndexOf('bim 360://', 0) === 0;
        var isRevitServer = filePath.lastIndexOf('rsn://', 0) === 0;

        if(!isLocal || !isBim360 || !isRevitServer){
            vm.fileWarningMsg = 'File Path must be either Local, BIM 360 or Revit Server.';
            return;
        }

        // (Konrad) Let's make sure we are not adding the same file twice.
        var matchingFiles = vm.newConfig.files.find(function (item) {
            return item.centralPath === filePath;
        });
        if(matchingFiles !== undefined){
            vm.fileWarningMsg = 'Warning! File already added to current configuration.';
            return;
        }

        // (Konrad) Let's make sure we have a valid, non empty name
        if(!filePath || !filePath.length || !filePath.includes('.rvt')){
            vm.fileWarningMsg = 'Warning! File name is not valid. Must be non-empty and include *.rvt';
            return;
        }

        // (Konrad) Let's make sure file is not already in other configurations
        var centralPath = filePath.replace(/\\/g, '|');
        ConfigFactory.getByCentralPath(centralPath)
            .then(function(response){
                if(!response || response.status !== 200) return;

                var configFound = response.data;
                var configNames = '';
                var configMatched = false;

                if(configFound.length > 0){
                    for(var i = 0; i < configFound.length; i++) {
                        var config = configFound[i];
                        for(var j = 0; j < config.files.length; j++){
                            var file = config.files[j];
                            if(file.centralPath === filePath){
                                configMatched = true;
                                configNames += ' [' + config.name + '] ';
                                break;
                            }
                        }
                    }
                }
                if(configMatched) {
                    vm.fileWarningMsg = 'Warning! File already exists in other configurations.\n' + configNames;
                } else{
                    var file1 = { centralPath: filePath };
                    vm.newConfig.files.push(file1);
                    vm.HasFiles = true;
                    vm.newFile = '';
                }
            }, function(error){
                vm.status = 'Unable to get configuration data: ' + error.message;
            });
    };

    /**
     * Removes file from files array.
     * @param filePath
     */
    vm.deleteFile = function(filePath){
        for (var i = 0; i < vm.newConfig.files.length; i++) {
            var file =  vm.newConfig.files[i];
            if (file.centralPath.toLowerCase() === filePath.toLowerCase()) {
                vm.newConfig.files.splice(i, 1);
                if(vm.newConfig.files.length === 0) vm.HasFiles = false;
                break;
            }
        }
    };

    /**
     * Adds new Configuration to Project.
     */
    vm.addConfiguration = function(){
        if(vm.newConfig.files.length > 0)
        {
            ConfigFactory.addConfiguration(vm.newConfig)
                .then(function(response){
                    if(!response || response.status !== 201) return;

                    var configId = response.data._id;
                    return ProjectFactory.addConfig(vm.projectId, configId);
                })
                .then(function (response) {
                    if(!response || response.status !== 201) return;

                    $window.location.href = '#/projects/configurations/' + vm.projectId;
                })
                .catch(function (err) {
                    console.log(err.message);
                    vm.status = 'Unable to create Configuration: ' + err.message;
                });
        }
        else vm.HasFiles = false;

        if(!vm.HasFiles || vm.newConfig.name.length === 0) vm.status = "Please fill out all required fields."
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
     *
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

    //region Utilities

    /**
     * Retrieves Project from MongoDB.
     * @param projectId
     */
    function getSelectedProject(projectId) {
        ProjectFactory.getProjectById(projectId)
            .then(function(response){
                if(!response || response.status !== 200) return;

                vm.selectedProject = response.data;
            })
            .catch(function (err) {
                console.log(err.message);
                vm.status = 'Unable to load configuration data: ' + err.message;
            });
    }

    /**
     * Creates a default configuration setttings.
     */
    function setDefaultConfig(){
        var updater_dtm =
            {
                updaterId: 'A7483418-F1FF-4DBE-BB71-C6C8CEAE0FD4',
                updaterName: 'DTM Tool',
                description: 'This tool will display an alert message when Revit users try to modify elements of selected categories.',
                addInId: '9C4D37B2-155D-4AC8-ACCF-383D86673F1C',
                addInName: 'Mission Control',
                isUpdaterOn: false,
                categoryTriggers:[
                    {
                        categoryName: "Grids",
                        description: "Grid elements cannot be modified except 2D extents.",
                        isEnabled: false,
                        locked: false
                    },
                    {
                        categoryName: "Levels",
                        description: "Level elements cannot be modified.",
                        isEnabled: false,
                        locked: false
                    },
                    {
                        categoryName: "Views",
                        description: "View template elements cannot be modified.",
                        isEnabled: false,
                        locked: false
                    },
                    {
                        categoryName: "Scope Boxes",
                        description: "Scope Boxe elements cannot be modified.",
                        isEnabled: false,
                        locked: false
                    },
                    {
                        categoryName: "RVT Links",
                        description: "RVT Links cannot be modified.",
                        isEnabled: false,
                        locked: false
                    }]
            };

        var updater_ca =
            {
                updaterId: 'C2C658D7-EC43-4721-8D2C-2B8C10C340E2',
                updaterName: 'California Door',
                description: 'This tool will monitor door families to apply proper door clearance values following ADA standards for accessible design.',
                addInId: '9C4D37B2-155D-4AC8-ACCF-383D86673F1C',
                addInName: 'Mission Control',
                isUpdaterOn: false,
                categoryTriggers:[
                    {
                        categoryName: "Doors",
                        description: "Invalid Door Parameter.",
                        isEnabled: false,
                        locked: false
                    }]
            };

        // (Konrad) This is Sheet Tracker
        var updater_sheet =
            {
                updaterId: '0504A758-BF15-4C90-B996-A795D92B42DB',
                updaterName: 'Sheet Tracker',
                description: 'This tool will push updates to database when modification were made on sheets or revisions.',
                addInId: '3FBC935E-FB1C-438D-9398-A6700442A5A8',
                addInName: 'Sheet Data Manager',
                isUpdaterOn: false,
                categoryTriggers:[
                    {
                        categoryName: "Sheets",
                        description: "",
                        isEnabled: false,
                        locked: false
                    }
                ]
            };

        var monitor_linkUnload =
            {
                updaterId: '90391154-67BB-452E-A1A7-A07A98B94F86',
                updaterName: 'Link Unload Monitor',
                description: 'This tool will prevent users from Unloading Linked Revit files for "all users" which causes such Linked File to be unloaded by default when opening project.',
                addInId: '9C4D37B2-155D-4AC8-ACCF-383D86673F1C',
                addInName: 'Mission Control',
                isUpdaterOn: true,
                categoryTriggers: []
            };

        var updater_healthRecords = {
            updaterId: '56603be6-aeb2-45d0-9ebc-2830fad6368b',
            updaterName: 'Health Report Monitor',
            description: 'This tool will monitor and report on some of the most critical Revit Model "health" metrics like Worksets, Families, Views etc.',
            addInId: 'd812f403-125c-4e76-83f4-32d6f7227dfe',
            addInName: 'Mission Control',
            isUpdaterOn: false,
            categoryTriggers: [],
            userOverrides: {
                familyNameCheck: {
                    description: "Family Name Check:",
                    values: ["HOK_I", "HOK_M"]
                },
                dimensionValueCheck: {
                    description: "Dimension Override Check:",
                    values: ["EQ"]
                }
            }
        };

        var monitor_sharedParameters = {
            monitorId: '32d44b45-7bf6-49f1-9b81-f41ae929cfcb',
            monitorName: 'Shared Parameter Monitor',
            description: 'This tool will monitor and make sure that the appropriate Shared Parameter file is being used on the project.',
            filePath: '',
            addInName: 'Mission Control',
            isMonitorOn: false
        };

        vm.newConfig = {
            name: '',
            files: [],
            sheetDatabase: '',
            sharedParamMonitor: monitor_sharedParameters,
            updaters: [updater_dtm, updater_ca, updater_sheet, monitor_linkUnload, updater_healthRecords]
        };
    }

    //endregion
}