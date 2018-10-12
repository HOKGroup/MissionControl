/**
 * Created by konrad.sobon on 2018-10-04.
 */
angular.module('MissionControlApp').controller('FilePathsController', FilePathsController);

function FilePathsController(FilePathsFactory, DTOptionsBuilder, DTColumnBuilder, ngToast, $location, $scope, $compile){
    var vm = this;
    var toasts = [];
    vm.files = [];

    vm.dtInstance = {};
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: '/api/v2/filepaths/datatable',
            type: 'POST'
        })
        .withDataProp('data')
        .withOption('processing', true)
        .withOption('serverSide', true)
        .withPaginationType('full_numbers')
        .withOption('lengthMenu', [[15, 50, 100, -1], [15, 50, 100, 'All']])
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
        DTColumnBuilder.newColumn('centralPath')
            .withTitle('File Path')
            .withOption('width', '90%'),
        DTColumnBuilder.newColumn('projectId')
            .withTitle('')
            .withOption('className', 'text-center')
            .withOption('width', '10%')
            .renderWith(function (data, type, full) {
                var disabled = full.projectId === null;
                var contents = '';
                contents += '<div>';

                if (disabled){
                    contents += '<button class="btn btn-default btn-sm pull-right disabled" type="button"><i class="fa fa-external-link-alt"></i></button>';
                } else {
                    contents += '<button class="btn btn-default btn-sm pull-right" type="button" tooltip-placement="top-right" uib-tooltip="Navigate to assigned Configuration." ' +
                        'ng-click="vm.go(\'' + '/projects/configurations/' + full.projectId + '\')"><i class="fa fa-external-link-alt"></i></button>';
                }

                var json = full._id + '|' + full.isDisabled;
                if(full.isDisabled){
                    contents += '<button class="btn btn-default btn-sm pull-right" style="margin-right: 10px;" tooltip-placement="top-right" ' +
                        'uib-tooltip="Enable. It will be available for Configurations." ng-click="vm.toggle(\'' + json + '\')"><i class="fa fa-eye"></button>';
                } else {
                    contents += '<button class="btn btn-warning btn-sm pull-right" style="margin-right: 10px;" tooltip-placement="top-right" ' +
                        'uib-tooltip="Disable. It will not be available for Configurations." ng-click="vm.toggle(\'' + json + '\')"><i class="fa fa-eye-slash"></button>';
                }

                contents += '</div>';
                return contents;
            })
    ];

    vm.toggle = function (item) {
        item.isDisabled = !item.isDisabled;
        this.onDisable({item: item});
    };

    vm.go = function(path){
        $location.path(path);
    };

    function reloadTable() {
        if(vm.dtInstance){
            vm.dtInstance.reloadData();
            vm.dtInstance.rerender();
        }
    }



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
                content: 'Successfully' + (isDisabled ? ' disabled ' : ' enabled ') + 'File Path!'
            }));

            reloadTable();
        });
    };

    // /**
    //  * Retrieves all FilePath objects from the DB.
    //  */
    // function getFiles(){
    //     FilePathsFactory.getAll()
    //         .then(function (response) {
    //             if(!response || response.status !== 200){
    //                 toasts.push(ngToast.danger({
    //                     dismissButton: true,
    //                     dismissOnTimeout: true,
    //                     timeout: 7000,
    //                     newestOnTop: true,
    //                     content: 'Failed to retrieve data for File Paths.'
    //                 }));
    //                 return;
    //             }
    //
    //             vm.data = response.data;
    //             response.data.forEach(function (item) {
    //                 vm.files.push(item);
    //             });
    //
    //             createTable(); // generate table instance and render
    //         }).catch(function (error) {
    //             toasts.push(ngToast.danger({
    //                 dismissButton: true,
    //                 dismissOnTimeout: true,
    //                 timeout: 7000,
    //                 newestOnTop: true,
    //                 content: error.message
    //             }));
    //             console.log(error);
    //     });
    // }
}