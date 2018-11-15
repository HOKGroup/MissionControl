/**
 * Created by konrad.sobon on 2018-11-15.
 */
angular.module('MissionControlApp').controller('AddConfigurationController', AddConfigurationController);

function AddConfigurationController(FilePathsFactory, $uibModalInstance, DTColumnBuilder, DTOptionsBuilder, $compile, $scope, id) {
    var vm = this;
    vm.filePath = null;
    vm.selectedProject = null;

    getFilePath(id);

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
            // (Konrad) Recompiling so we can bind Angular directive to the DT
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
            .withOption('className', 'text-center')
            .withOption('width', '8%')
            .renderWith(function (data, type, full) {
                var contents = '';
                contents += '<div>';

                // (Konrad) Add to Configuration button.
                if(vm.selectedProject === null){
                    contents += '<button class="btn btn-success btn-sm pull-right" style="margin-right: 10px;" ng-click="vm.selectProject(\'' + full._id + '\')"><i class="fas fa-check"></i></button>';
                } else {
                    contents += '<button class="btn btn-danger btn-sm pull-right" style="margin-right: 10px;" ng-click="vm.deselectProject()"><i class="fas fa-times"></i></button>';
                }

                contents += '</div>';
                return contents;
            })
    ];

    /**
     *
     */
    vm.deselectProject = function () {
        vm.selectedProject = null;
        reloadTable();
    };

    /**
     *
     * @param id
     */
    vm.selectProject = function (id) {
        vm.selectedProject = id;
        reloadTable();
    };

    /**
     * Closes modal dialog.
     */
    vm.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };

    //region Utilities

    /**
     *
     * @param id
     */
    function getFilePath(id) {
        FilePathsFactory.findById(id)
            .then(function (response) {
                if(!response || response.status !== 200) return;

                vm.filePath = response.data;
                console.log(response);
            })
            .catch(function (error) {
                console.log(error);
            });
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