angular.module('MissionControlApp').controller('ConfigController', ConfigController);

function ConfigController($routeParams, ConfigFactory, $window){
    var vm = this;
    vm.status;
    vm.projectId = $routeParams.projectId;
    vm.selectedProject;
    vm.configurations = [];
    vm.selectedConfig;
    vm.selectedRecords;
    vm.filteredConfig;
    vm.newFile;
    vm.fileWarningMsg = '';
    vm.PlaceholderSharedParameterLocation = "";

    //get populated configurations
    getSelectedProjectConfiguration(vm.projectId);

    function getSelectedProjectConfiguration(projectId) {
        ConfigFactory
            .getProjectById(projectId)
            .then(function(response){
                if(!response) return;
                vm.selectedProject = response.data;
                vm.configurations = response.data.configurations;
                if(vm.configurations.length > 0)
                {
                    populateConfig(projectId);
                }
            },function(error){
                vm.status = 'Unable to load configuration data: ' + error.message;
            });
    }

    function populateConfig(projectId){
        ConfigFactory
            .getProjectByProjectId(projectId) // this methid actually populates Configurations with data
            .then(function(response){
                if(!response) return;
                vm.selectedProject = response.data;
                vm.configurations = response.data.configurations;
                if(vm.configurations.length > 0)
                {
                    var config = vm.configurations[0];
                    getSelectedConfiguration(config._id);
                }

            },function(error){
                vm.status = 'Unable to load configuration data: ' + error.message;
            });
    }

    function getSelectedConfiguration(configId){
        ConfigFactory
            .getConfigurationById(configId).then(function(response){
                vm.selectedConfig = response.data;
                vm.PlaceholderSharedParameterLocation = GetSharedParamLocation(vm.selectedConfig);
                ConfigFactory
                    .getRecordsByConfigId(configId).then(function(response){
                        if(!response) return;
                        vm.selectedRecords = response.data;
                    },function(error){
                        vm.status = 'Unable to get records by config Id: '+ configId;
                    });
            },function(error){
                vm.status = 'Unable to get by config Id: ' + configId;
            });
    }

    vm.getConfigurationById = getSelectedConfiguration;

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
                    vm.selectedConfig.files.push(file1);
                    vm.newFile = '';
                } else{
                    vm.fileWarningMsg = 'Warning! Please enter a valid file.';
                }

            }, function(error){
                vm.status = 'Unable to get configuration data: ' + error.message;
            });

    };

    vm.deleteFile = function(filePath){
        for (var i = 0; i < vm.selectedConfig.files.length; i++) {
            var file =  vm.selectedConfig.files[i];
            if (file.centralPath.toLowerCase() === filePath.toLowerCase()) {
                vm.selectedConfig.files.splice(i, 1);
                break;
            }
        }
    };

    vm.getByUpdaterId = function(updaterId){
        ConfigFactory.getByUpdaterId(updaterId)
            .then(function(response) {
                vm.filteredConfig = response.data;
            }, function(error){
                vm.status = 'Unable to get by updater Id: '+updaterId+'  '+error.message;
            });
    };

    vm.updateConfiguration = function(){
        ConfigFactory.updateConfiguration(vm.selectedConfig)
            .then(function(response){
                $window.location.reload();
                vm.status = 'Configuration updated';
            }, function(error){
                vm.status = 'Unabl to update configuration: ' + error.message;
            });
    };

    vm.deleteConfiguration = function(id){
        ConfigFactory
            .deleteConfiguration(id)
            .then(function(response) {
                vm.status = 'Deleted Configuration.';
                for (var i = 0; i < vm.configurations.length; i++) {
                    var config = vm.configurations[i];
                    if (config._id === id) {
                        vm.configurations.splice(i, 1);
                        ConfigFactory.deleteConfigFromProject(vm.projectId, id);
                        break;
                    }
                }
                $window.location.reload();
            }, function(error){
                vm.status = 'Unable to delete configuration:' +error.message;
            });
    };

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

        return path.substring(0, index) + "\Support\\SharedParameterFileName.txt";
    }
}