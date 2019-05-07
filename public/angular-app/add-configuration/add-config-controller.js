/**
 * Created by konrad.sobon on 2018-04-19.
 */
angular.module('MissionControlApp').controller('AddConfigController', AddConfigController);

function AddConfigController($routeParams, ConfigFactory, ProjectFactory, FilePathsFactory, UtilityService,
                             DTOptionsBuilder, DTColumnBuilder, DTColumnDefBuilder, $uibModal, $window,
                             $compile, $scope, ngToast, SettingsFactory){

    //region Init

    var vm = this;
    var toasts = [];
    vm.status = ' ';
    vm.projectId = $routeParams.projectId;
    vm.selectedProject = {};
    vm.newConfig = {};
    vm.newFile = '';
    vm.fileWarningMsg = '';
    vm.HasFiles = false;
    vm.files = [];
    vm.settings = null;
    vm.selectedOffice = { name: 'All', code: 'All' };
    vm.fileTypes = [ 'All', 'Local', 'Revit Server', 'BIM 360'];
    vm.selectedType = 'All';
    vm.revitVersions = UtilityService.getRevitVersions();
    vm.selectedRevitVersion = 'All';
    vm.searchString = '';

    getSettings();
    getSelectedProject(vm.projectId);
    setDefaultConfig();
    createTable();

    //endregion

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
        var isLocal = vm.settings.localPathRgx.some(function(pattern) { 
            var rgx = new RegExp(pattern, 'i');
            return rgx.test(filePath); 
        });
        var isBim360 = filePath.lastIndexOf('bim 360://', 0) === 0;
        var isRevitServer = filePath.lastIndexOf('rsn://', 0) === 0;

        if(!isLocal && !isBim360 && !isRevitServer) {
            vm.fileWarningMsg = 'File Path must be either Local, BIM 360 or Revit Server.';
            return;
        }

        // (Konrad) Let's make sure we are not adding the same file twice.
        var matchingFiles = vm.newConfig.files.find(function (item) {
            return item.centralPath === filePath;
        });
        if(matchingFiles !== undefined) {
            vm.fileWarningMsg = 'Warning! File already added to current configuration.';
            return;
        }

        // (Konrad) Let's make sure we have a valid, non empty name
        if(!filePath || !filePath.length || !filePath.includes('.rvt')) {
            vm.fileWarningMsg = 'Warning! File name is not valid. Must be non-empty and include *.rvt';
            return;
        }

        // (Konrad) Let's make sure file is not already in other configurations
        var uri = UtilityService.getHttpSafeFilePath(filePath);
        ConfigFactory.getByCentralPath(uri)
            .then(function(response){
                if(!response || response.status !== 200) throw response;

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
                    throw { message: 'File already exists in other configurations.\n' + configNames };
                } else {
                    var file1 = { centralPath: filePath };
                    vm.newConfig.files.push(file1);
                    vm.HasFiles = true;
                    vm.newFile = '';

                    // (Konrad) Temporarily remove from vm.files
                    vm.files = vm.files.filter(function (item) {
                        return item.centralPath !== filePath;
                    });
                }
            })
            .catch(function (err) {
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
     * Removes file from files array.
     * @param filePath
     */
    vm.deleteFile = function(filePath){
        for (var i = 0; i < vm.newConfig.files.length; i++) {
            var file =  vm.newConfig.files[i];
            if (file.centralPath === filePath) {
                vm.newConfig.files.splice(i, 1);
                if (vm.newConfig.files.length === 0) vm.HasFiles = false;

                // (Konrad) Add it back to vm.files
                vm.files.push({
                    centralPath: filePath,
                    name: UtilityService.fileNameFromPath(filePath)
                });
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
                    if(!response || response.status !== 201) throw response;

                    var configId = response.data._id;
                    return ProjectFactory.addConfig(vm.projectId, configId);
                })
                .then(function (response) {
                    if(!response || response.status !== 201) throw response;

                    var data = [];
                    vm.newConfig.files.forEach(function (item) {
                        data.push({
                            centralPath: item.centralPath,
                            projectId: vm.projectId
                        });
                    });
                    return FilePathsFactory.addMany(data);
                })
                .then(function (response) {
                    if(!response || response.status !== 201) throw response;

                    $window.location.href = '#/projects/configurations/' + vm.projectId;
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
        else vm.HasFiles = false;

        if(!vm.HasFiles || vm.newConfig.name.length === 0) {
            toasts.push(ngToast.warning({
                dismissButton: true,
                dismissOnTimeout: true,
                timeout: 4000,
                newestOnTop: true,
                content: 'Please fill out all required fields.'
            }));
        }
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
     * Removes a string from array by index.
     * @param arr
     * @param index
     * @constructor
     */
    vm.RemoveTag = function (arr, index) {
        arr.splice(index, 1);
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

    //region Utilities

    /**
     * Retrieves Mission Control Settings from the DB.
     */
    function getSettings() {
        SettingsFactory.get()
            .then(function (response) {
                if(!response || response.status !== 200) throw { message: 'Unable to retrieve the Settings.'};

                vm.settings = response.data;
            })
            .catch(function (err) {
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
     * Retrieves Project from MongoDB.
     * @param projectId
     */
    function getSelectedProject(projectId) {
        ProjectFactory.getProjectById(projectId)
            .then(function(response){
                if(!response || response.status !== 200) throw response;

                vm.selectedProject = response.data;
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
     * Creates a default configuration settings.
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
                        categoryName: 'Grids',
                        description: 'Grid elements cannot be modified except 2D extents.',
                        isEnabled: false,
                        locked: false
                    },
                    {
                        categoryName: 'Levels',
                        description: 'Level elements cannot be modified.',
                        isEnabled: false,
                        locked: false
                    },
                    {
                        categoryName: 'Views',
                        description: 'View template elements cannot be modified.',
                        isEnabled: false,
                        locked: false
                    },
                    {
                        categoryName: 'Scope Boxes',
                        description: 'Scope Boxes elements cannot be modified.',
                        isEnabled: false,
                        locked: false
                    },
                    {
                        categoryName: 'RVT Links',
                        description: 'RVT Links cannot be modified.',
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
                        categoryName: 'Doors',
                        description: 'Invalid Door Parameter.',
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
                        categoryName: 'Sheets',
                        description: '',
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
                isUpdaterOn: false,
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
                    description: 'Family Name Check:',
                    values: ['HOK_I', 'HOK_M']
                },
                dimensionValueCheck: {
                    description: 'Dimension Override Check:',
                    values: ['EQ']
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

    /**
     * Initiates File Paths table.
     */
    function createTable() {
        vm.dtInstance = {};
        vm.dtOptions = DTOptionsBuilder.newOptions()
            .withOption('ajax', {
                url: '/api/v2/filepaths/datatable',
                type: 'POST',
                data: function (d) {
                    d.revitVersion = vm.selectedRevitVersion;
                    d.office = vm.selectedOffice;
                    d.fileType  = vm.selectedType;
                    d.disabled = false;
                    d.unassigned = true;
                    d.localPathRgx = !vm.settings ? null : vm.settings.localPathRgx;
                }
            })
            .withDataProp('data')
            .withOption('processing', true)
            .withOption('serverSide', true)
            .withPaginationType('simple_numbers')
            .withOption('stateSave', true)
            .withOption('lengthMenu', [[5, 10, 50, -1], [5, 10, 50, 'All']])
            
            // (Konrad) We need to style the columns ourselves otherwise they look .net-ish
            .withOption('initComplete', function() {
                $('#files_datatable_wrapper')
                    .addClass('col-md-offset-3')
                    .prepend('<div class="row" id="files_datatable_row1">');
                $('#files_datatable_row1')
                    .append( $('#files_datatable_length').addClass('col-md-3'))
                    .append( $('#files_datatable_wrapper > .dt-buttons').addClass('col-md-5').css({'padding-left': '5px'}))
                    .append( $('#files_datatable_filter').addClass('col-md-4'));

                $('#filters').insertAfter($('#files_datatable_row1 > div').first());
            })
            .withOption('createdRow', function(row) {
                // (Konrad) Recompiling so we can bind Angular directive to the DT
                $compile(angular.element(row).contents())($scope);
            });

        vm.dtColumns = [
            DTColumnBuilder.newColumn('revitVersion')
                .withTitle('Version')
                .withOption('width', '13%'),
            DTColumnBuilder.newColumn('fileLocation')
                .withTitle('Office')
                .withOption('width', '13%')
                .renderWith(function (data, type, full) {
                    return full.fileLocation.toUpperCase();
                }),
            DTColumnBuilder.newColumn('centralPath')
                .withTitle('File Path')
                .withOption('width', '60%'),
            DTColumnBuilder.newColumn('projectId')
                .withTitle('')
                .withOption('className', 'text-center')
                .withOption('width', '14%')
                .renderWith(function (data, type, full) {
                    var central = addSlashes(full.centralPath);
                    return '<div>'
                            + '<button class="btn btn-success btn-sm pull-right" style="margin-right: 10px;" ng-click="vm.newFile = \'' + central + '\'; vm.addFile();">'
                            +    '<i class="fa fa-plus"></i>'
                            + '</button>'
                            +'</div>';
                })
        ];
    }

    /**
     * Sets the office filter and reloads the table.
     * @param office
     */
    vm.setOffice = function (office) {
        vm.selectedOffice = office;
        reloadTable();
    };

    /**
     * Sets the Revit file type filter and reloads the table.
     * @param type
     */
    vm.setType = function (type) {
        vm.selectedType = type;
        reloadTable();
    };

    /**
     * Sets the revit version filter and reloads the table.
     * @param version
     */
    vm.setVersion = function (version) {
        vm.selectedRevitVersion = version;
        reloadTable();
    };

    /**
     * Reloads the table.
     */
    function reloadTable() {
        var filtersElement = $('#filters').detach();
        if(vm.dtInstance){
            vm.dtInstance.reloadData();
            vm.dtInstance.rerender();

            // (Dan) This depends on initDataTable to trigger which doesn't happen on reload
            // hence we are inserting the filters back into the table manually.
            filtersElement.appendTo('#filterWrapper');
        }
    }
    
    /**
     * Adds escape slashes to a string for encoding file paths to HTML attributes.
     * @param str
     */
    function addSlashes(str) {
        return (str + '').replace(/[\\"']/g, '\\$&').replace(/\u0000/g, '\\0');
    }

    //endregion
}
