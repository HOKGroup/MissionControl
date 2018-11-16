/**
 * Created by konrad.sobon on 2018-11-15.
 */
angular.module('MissionControlApp').controller('AddConfigurationController', AddConfigurationController);

function AddConfigurationController(FilePathsFactory, ProjectFactory, $uibModalInstance, DTColumnBuilder, DTOptionsBuilder, $compile, $scope, id) {
    var vm = this;
    vm.filePath = null;
    vm.selectedProject = null;
    vm.configurations = [];
    vm.selectedConfiguration = null;

    getFilePath(id);
    createConfigurationsTable();

    //region Handlers

    /**
     * Resets contents of the Projects table.
     */
    vm.deselectProject = function () {
        vm.selectedProject = null;
        reloadTable('Projects');
    };

    /**
     * Resets contents of the Configurations table.
     */
    vm.deselectConfiguration = function () {
        vm.selectedConfiguration = vm.configurations;
        reloadTable('Configurations');
    };

    /**
     * Sets Configurations table to exactly one object.
     * @param id
     */
    vm.selectConfiguration = function (id) {
        vm.selectedConfiguration = id;
        reloadTable('Configurations');
    };

    /**
     * Sets Projects table to exactly one object, and populates Configurations table.
     * @param id
     */
    vm.selectProject = function (id) {
        vm.selectedProject = id;
        reloadTable('Projects');

        ProjectFactory.getProjectById(id)
            .then(function (response) {
                if(!response || response.status !== 200) return;

                vm.configurations = response.data.configurations;
                vm.selectedConfiguration = response.data.configurations;
            })
            .catch(function (error) {
                console.log(error);
            });
    };

    /**
     * Closes modal dialog.
     */
    vm.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };

    //endregion

    //region Utilities

    /**
     * Retrieves information about the File Path.
     * @param id
     */
    function getFilePath(id) {
        FilePathsFactory.findById(id)
            .then(function (response) {
                if(!response || response.status !== 200) return;

                vm.filePath = response.data;
                createProjectsTable();
            })
            .catch(function (error) {
                console.log(error);
            });
    }

    /**
     * Initializes Projects Table.
     */
    function createProjectsTable() {
        vm.dtInstance = {};
        vm.dtOptions = DTOptionsBuilder.newOptions()
            .withOption('ajax', {
                url: '/api/v2/projects/datatable',
                type: 'POST',
                data: function (d) {
                    d.projectId = vm.selectedProject;
                }
            })
            .withDataProp('data')
            .withOption('processing', true)
            .withOption('serverSide', true)
            .withPaginationType('simple_numbers')
            .withOption('lengthMenu', [[5, 10, 50, -1], [5, 10, 50, 'All']])
            .withOption('createdRow', function(row) {
                // (Konrad) Recompiling so we can bind Angular directive to the datatable
                $compile(angular.element(row).contents())($scope);
            });

        vm.dtColumns = [
            DTColumnBuilder.newColumn('number')
                .withTitle('Project Number')
                .withOption('width', '20%'),
            DTColumnBuilder.newColumn('name')
                .withTitle('Project Name')
                .withOption('width', '71%'),
            DTColumnBuilder.newColumn('office')
                .withTitle('Office')
                .withOption('width', '15%'),
            DTColumnBuilder.newColumn('name')
                .withTitle('')
                .notSortable()
                .withOption('className', 'text-center')
                .withOption('width', '8%')
                .renderWith(function (data, type, full) {
                    var contents = '';
                    contents += '<div>';

                    // (Konrad) Add to Configuration button.
                    if(vm.selectedProject === null){
                        contents += '<button class="btn btn-success btn-sm pull-right" style="margin-right: 10px;" ' +
                            'ng-click="vm.selectProject(\'' + full._id + '\')"><i class="fas fa-check"></i></button>';
                    } else {
                        contents += '<button class="btn btn-danger btn-sm pull-right" style="margin-right: 10px;" ' +
                            'ng-click="vm.deselectProject()"><i class="fas fa-times"></i></button>';
                    }

                    contents += '</div>';
                    return contents;
                })
        ];
    }

    /**
     * Initializes Configurations table.
     */
    function createConfigurationsTable() {
        vm.dtInstance1 = {};
        vm.dtOptions1 = DTOptionsBuilder.newOptions()
            .withOption('ajax', {
                url: '/api/v2/configurations/datatable',
                type: 'POST',
                data: function (d) {
                    d.configurationId = vm.selectedConfiguration;
                }
            })
            .withDataProp('data')
            .withOption('processing', true)
            .withOption('serverSide', true)
            .withPaginationType('simple_numbers')
            .withOption('lengthMenu', [[5, 10, 50, -1], [5, 10, 50, 'All']])
            .withOption('createdRow', function(row) {
                // (Konrad) Recompiling so we can bind Angular directive to the datatable
                $compile(angular.element(row).contents())($scope);
            });

        vm.dtColumns1 = [
            DTColumnBuilder.newColumn('name')
                .withTitle('Configuration Name')
                .withOption('width', '92%'),
            DTColumnBuilder.newColumn('name')
                .withTitle('')
                .notSortable()
                .withOption('className', 'text-center')
                .withOption('width', '8%')
                .renderWith(function (data, type, full) {
                    var contents = '';
                    contents += '<div>';

                    // (Konrad) Add to Configuration button.
                    if(Array.isArray(vm.selectedConfiguration) || vm.selectedConfiguration === null){
                        contents += '<button class="btn btn-success btn-sm pull-right" style="margin-right: 10px;" ' +
                            'ng-click="vm.selectConfiguration(\'' + full._id + '\')"><i class="fas fa-check"></i></button>';
                    } else {
                        contents += '<button class="btn btn-danger btn-sm pull-right" style="margin-right: 10px;" ' +
                            'ng-click="vm.deselectConfiguration()"><i class="fas fa-times"></i></button>';
                    }

                    contents += '</div>';
                    return contents;
                })
        ];
    }

    /**
     * Reloads the table.
     * @param type
     */
    function reloadTable(type) {
        var instance;
        switch(type){
            case 'Configurations':
                instance = vm.dtInstance1;
                break;
            case 'Projects':
                instance = vm.dtInstance;
                break;
        }
        if(instance){
            instance.reloadData();
            instance.rerender();
        }
    }

    //endregion
}