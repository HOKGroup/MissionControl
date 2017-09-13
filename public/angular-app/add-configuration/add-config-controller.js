angular.module('MissionControlApp').controller('AddConfigController', AddConfigController);

function AddConfigController($routeParams, ConfigFactory, $window){
    var vm = this;
    vm.projectId = $routeParams.projectId;
    vm.selectedProject = {};
    vm.newConfig = {};
    vm.newFile;
    vm.fileWarningMsg = '';
    vm.Submitted = false;
    vm.HasFiles = false;
    vm.status = " ";

    getSelectedProject(vm.projectId);
    setDefaultConfig();

    function getSelectedProject(projectId) {
        ConfigFactory
            .getProjectById(projectId)
            .then(function(response){
                vm.selectedProject = response.data;
            },function(error){
                vm.status = 'Unable to load configuration data: ' + error.message;
            });
    }

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
                updaterName: 'CA Door',
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

        var updater_revision =
            {
                updaterId: '0504A758-BF15-4C90-B996-A795D92B42DB',
                updaterName: 'Sheet Tracker',
                description: 'This tool will push updates to database when modification were made on sheets or revisions.',
                addInId: '3FBC935E-FB1C-438D-9398-A6700442A5A8',
                addInName: 'Sheet Data Manager',
                isUpdaterOn: false,
                categoryTriggers:[
                    {
                        categoryName: "Revisions",
                        description: "",
                        isEnabled: false,
                        locked: false
                    },
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
                isUpdaterOn: false
            };

        var updater_healthRecords = {
            updaterId: '56603be6-aeb2-45d0-9ebc-2830fad6368b',
            updaterName: 'Health Report Monitor',
            description: 'This tool will monitor and report on some of the most critical Revit Model "health" metrics like Worksets, Families, Views etc.',
            addInId: 'd812f403-125c-4e76-83f4-32d6f7227dfe',
            addInName: 'Mission Control',
            isUpdaterOn: false
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
            updaters: [updater_dtm, updater_ca, updater_revision, monitor_linkUnload, updater_healthRecords]
        };
    }

    vm.addFile = function(){
        var filePath = vm.newFile;
        var encodedUri = encodeURIComponent(filePath);
        vm.fileWarningMsg='';

        ConfigFactory
            .getByEncodedUri(encodedUri).then(function(response){
            var configFound = response.data;
            var configNames = '';
            var configMatched = false;
            if(response.status === 200 && configFound.length > 0){
                //find an exact match from text search result
                for(var i = 0; i < configFound.length; i++) {
                    var config = configFound[i];
                    for(var j=0; j<config.files.length; j++){
                        var file = config.files[j];
                        if(file.centralPath.toLowerCase() === filePath.toLowerCase()){
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
                vm.newConfig.files.push(file1);
                vm.HasFiles = true;
                vm.newFile = '';
            } else{
                vm.fileWarningMsg = 'Warning! Please enter a valid file.';
            }

        }, function(error){
            vm.status = 'Unable to get configuration data: ' + error.message;
        });
    };

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

    vm.addConfiguration = function(){
        vm.Submitted = true;
        if(vm.newConfig.files.length > 0)
        {
            ConfigFactory
                .addConfiguration(vm.newConfig)
                .then(function(response){
                    var configId = response.data._id;
                    ConfigFactory
                        .addConfigToProject(vm.projectId, configId)
                        .then(function(response){
                            $window.location.assign('#/projects/configurations/'+vm.projectId);
                        }, function(error){
                            vm.status='Unable to add to project: '+error.message;
                        });
                }, function(error){
                    vm.status = 'Unabl to add configuration: ' + error.message;
                });
        }
        else{
            vm.HasFiles = false;
        }
        if(!vm.HasFiles || vm.newConfig.name.length === 0) vm.status = "Please fill out all required fields."
    };
}