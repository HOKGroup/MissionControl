angular.module('MissionControlApp').controller('ConfigController', ConfigController);

function ConfigController($routeParams, ConfigFactory, TriggerRecordsFactory, DTColumnDefBuilder, $window, $uibModal){
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
    vm.loading = false;

    vm.dtRecordsOptions = {
        paginationType: 'simple_numbers',
        lengthMenu: [[10, 25, 50, 100, -1], [10, 25, 50, 100, 'All']],
        stateSave: false,
        deferRender: true
    };

    vm.format = 'dd-MMMM-yyyy';
    vm.dateOptions = {
        formatYear: 'yy',
        maxDate: new Date(2020, 5, 22),
        minDate: new Date(2015, 5, 22),
        startingDay: 1
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

    vm.popup1 = {
        opened: false
    };

    vm.popup2 = {
        opened: false
    };

    /**
     * Opens pop-up date pickers.
     * @param popup
     */
    vm.openDatePicket = function(popup) {
        popup === 'from' ? vm.popup1.opened = true : vm.popup2.opened = true;
    };

    vm.dtRecordsColumnDefs = [
        DTColumnDefBuilder.newColumnDef(0), //file name
        DTColumnDefBuilder.newColumnDef(1), //category
        DTColumnDefBuilder.newColumnDef(2), //edited on
        DTColumnDefBuilder.newColumnDef(3) //edited by
    ];

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
            .getConfigurationById(configId)
            .then(function(response){
                vm.selectedConfig = response.data;
                vm.PlaceholderSharedParameterLocation = GetSharedParamLocation(vm.selectedConfig);
                SetFilter();
                vm.filterDate();
            })
            .catch(function(err){
                vm.status = 'Unable to get Editing Records by Configuration Id: ' + configId;
                console.log(err);
            })
    }

    vm.getConfigurationById = getSelectedConfiguration;

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
            windowClass: 'zindex',
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
        ConfigFactory
            .getByCentralPath(uri).then(function(response){
                if(!response || response.status !== 200) return;
                console.log(response);

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
                } else{
                    vm.fileWarningMsg = 'Warning! Please enter a valid file.';
                }

            }, function(error){
                vm.status = 'Unable to get configuration data: ' + error.message;
            });
    };

    //TODO: This should update the DB automatically. No need for Update button at the bottom.
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

        return path.substring(0, index) + "\Support\\SharedParameterFileName.txt";
    }
}