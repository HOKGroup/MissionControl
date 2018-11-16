/**
 * Created by konrad.sobon on 2018-10-04.
 */
angular.module('MissionControlApp').controller('FilePathsController', FilePathsController);

function FilePathsController(FilePathsFactory, DTOptionsBuilder, DTColumnBuilder, ngToast, $location, $scope, $compile,
                             $uibModal){
    var vm = this;
    var toasts = [];
    vm.files = [];
    vm.revitVersions = ['All', '2016', '2017', '2018', '2019'];
    vm.selectedRevitVersion = 'All';
    vm.offices = [
        {name: 'All', code: 'All'},
        {name: 'Atlanta', code: ['ATL']},
        {name: 'Beijing', code: ['BEI']},
        {name: 'St. Louis', code: ['BJC']},
        {name: 'Calgary', code: ['CAL']},
        {name: 'Chicago', code: ['CHI']},
        {name: 'Columbus', code: ['COL']},
        {name: 'Dallas', code: ['DAL']},
        {name: 'Doha', code: ['DOH']},
        {name: 'Dubai', code: ['DUB']},
        {name: 'Hong Kong', code: ['HK']},
        {name: 'Houston', code: ['HOU']},
        {name: 'Kansas City', code: ['KC']},
        {name: 'Los Angeles', code: ['LA']},
        {name: 'London', code: ['LON']},
        {name: 'New York', code: ['NY']},
        {name: 'Ottawa', code: ['OTT']},
        {name: 'Philadephia', code: ['PHI']},
        {name: 'Seattle', code: ['SEA']},
        {name: 'San Francisco', code: ['SF']},
        {name: 'Shanghai', code: ['SH']},
        {name: 'St. Louis', code: ['STL']},
        {name: 'Toronto', code: ['TOR']},
        {name: 'Tampa', code: ['TPA']},
        {name: 'Washington DC', code: ['WDC']},
        {name: 'Undefined', code: ['EMC', 'SDC', 'OSS', 'LD', 'LDC', '']}
    ];
    vm.selectedOffice = { name: 'All', code: 'All' };
    vm.disabledFilter = false;

    createTable();

    //region Handlers

    /**
     *
     * @param id
     */
    vm.addToConfiguration = function (id) {
        $uibModal.open({
            animation: true,
            templateUrl: 'angular-app/file-paths/add-configuration.html',
            controller: 'AddConfigurationController as vm',
            size: 'lg',
            resolve: {
                id: function () {
                    return id;
                }}
        }).result.then(function(){
            reloadTable();
        }).catch(function(){
            //if modal dismissed
        });
    };

    /**
     * Sets the disabled filter and reloads the table.
     */
    vm.setDisabled = function () {
        vm.disabledFilter = !vm.disabledFilter;
        reloadTable();
    };

    /**
     * Sets the office filter and reloads the table.
     * @param office
     */
    vm.setOffice = function (office) {
        vm.selectedOffice = office;
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
     * Navigates to Configuration file path.
     * @param path
     */
    vm.go = function(path){
        $location.path(path);
    };

    /**
     * Removes given file Path object from the DB.
     * @param item
     */
    vm.toggle = function (item) {
        var id = item.split('|')[0];
        var isDisabled = item.split('|')[1] === 'true';

        FilePathsFactory.disable({_id: id, isDisabled: isDisabled}).then(function (response) {
            if(!response || response.status !== 201){
                toasts.push(ngToast.danger({
                    dismissButton: true,
                    dismissOnTimeout: true,
                    timeout: 4000,
                    newestOnTop: true,
                    content: 'Failed to disable File Path.'
                }));
                return;
            }

            toasts.push(ngToast.success({
                dismissButton: true,
                dismissOnTimeout: true,
                timeout: 7000,
                newestOnTop: true,
                content: 'Successfully' + (isDisabled ? ' enabled ' : ' disabled ') + 'File Path!'
            }));

            reloadTable();
        });
    };

    //endregion

    //region Utilities

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
                    d.disabled = vm.disabledFilter;
                }
            })
            .withDataProp('data')
            .withOption('processing', true)
            .withOption('serverSide', true)
            .withPaginationType('simple_numbers')
            .withOption('stateSave', true)
            .withOption('lengthMenu', [[10, 50, 100, -1], [10, 50, 100, 'All']])
            .withOption('rowCallback', function (row, data) {
                var style = ' table-info';
                if(data.isDisabled) style = ' bg-warning';
                if(data.projectId !== null) style = ' bg-success';
                row.className = row.className + style;
            })
            .withOption('createdRow', function(row) {
                // (Konrad) Recompiling so we can bind Angular directive to the DT
                $compile(angular.element(row).contents())($scope);
            });

        vm.dtColumns = [
            DTColumnBuilder.newColumn('revitVersion')
                .withTitle('Version')
                .withOption('width', '8%'),
            DTColumnBuilder.newColumn('fileLocation')
                .withTitle('Office')
                .withOption('width', '8%'),
            DTColumnBuilder.newColumn('centralPath')
                .withTitle('File Path')
                .withOption('width', '70%'),
            DTColumnBuilder.newColumn('projectId')
                .withTitle('')
                .withOption('className', 'text-center')
                .withOption('width', '14%')
                .renderWith(function (data, type, full) {
                    var disabled = full.projectId === null;
                    var contents = '';
                    contents += '<div>';

                    // (Konrad) Navigate to Configuration button.
                    if (disabled){
                        contents += '<button class="btn btn-default btn-sm pull-right disabled" type="button"><i class="fa fa-external-link-alt"></i></button>';
                    } else {
                        contents += '<button class="btn btn-default btn-sm pull-right" type="button" tooltip-placement="top-right" uib-tooltip="Navigate to assigned Configuration." ' +
                            'ng-click="vm.go(\'' + '/projects/configurations/' + full.projectId + '\')"><i class="fa fa-external-link-alt"></i></button>';
                    }

                    // (Konrad) Add to Configuration button.
                    if(!full.isDisabled && full.projectId === null){
                        contents += '<button class="btn btn-success btn-sm pull-right" style="margin-right: 10px;" ng-click="vm.addToConfiguration(\'' + full._id + '\')"><i class="fa fa-plus"></i></button>';
                    } else {
                        contents += '<button class="btn btn-default btn-sm pull-right disabled" style="margin-right: 10px;"><i class="fa fa-plus"></i></button>';
                    }

                    // (Konrad) Disable/Enable button.
                    var json = full._id + '|' + full.isDisabled;
                    var disabledClass = disabled ? '' : ' disabled';
                    if(full.isDisabled){
                        contents += '<button class="btn btn-default btn-sm pull-right' + disabledClass +
                            '" style="margin-right: 10px;" tooltip-placement="top-right" ' +
                            'uib-tooltip="Enable. It will be available for Configurations." ng-click="vm.toggle(\'' + json + '\')"><i class="fa fa-eye"></i></button>';
                    } else {
                        contents += '<button class="btn btn-warning btn-sm pull-right' + disabledClass +
                            '" style="margin-right: 10px;" tooltip-placement="top-right" ' +
                            'uib-tooltip="Disable. It will not be available for Configurations." ng-click="vm.toggle(\'' + json + '\')"><i class="fa fa-eye-slash"></i></button>';
                    }

                    contents += '</div>';
                    return contents;
                })
        ];
    }

    /**
     * Reloads the table.
     */
    function reloadTable() {
        if(vm.dtInstance){
            vm.dtInstance.reloadData();
            vm.dtInstance.rerender();
        }
    }

    //endregion
}