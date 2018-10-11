/**
 * Created by konrad.sobon on 2018-10-04.
 */
angular.module('MissionControlApp').controller('FilePathsController', FilePathsController);

function FilePathsController(FilePathsFactory, DTColumnDefBuilder, ngToast){
    var vm = this;
    var toasts = [];
    vm.files = [];

    getFiles();

    /**
     * Removes given file Path object from the DB.
     * @param item
     */
    vm.disable = function (item) {
        FilePathsFactory.disable(item).then(function (response) {
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
                content: 'Successfully' + (item.isDisabled ? ' disabled ' : ' enabled ') + 'File Path!'
            }));
        });
    };

    /**
     * Returns appropriate row style based on file path properties.
     * @param item
     * @returns {string}
     */
    vm.getRowStyle = function (item) {
        var style = 'table-info';
        if(item.isDisabled) style = 'bg-warning';
        if(item.projectId !== null) style = 'bg-success';

        return style;
    };

    /**
     * Retrieves all FilePath objects from the DB.
     */
    function getFiles(){
        FilePathsFactory.getAll()
            .then(function (response) {
                if(!response || response.status !== 200){
                    toasts.push(ngToast.danger({
                        dismissButton: true,
                        dismissOnTimeout: true,
                        timeout: 7000,
                        newestOnTop: true,
                        content: 'Failed to retrieve data for File Paths.'
                    }));
                    return;
                }

                vm.data = response.data;
                response.data.forEach(function (item) {
                    vm.files.push(item);
                });

                createTable(); // generate table instance and render
            }).catch(function (error) {
                toasts.push(ngToast.danger({
                    dismissButton: true,
                    dismissOnTimeout: true,
                    timeout: 7000,
                    newestOnTop: true,
                    content: error.message
                }));
                console.log(error);
        });
    }

    /**
     * Initiates DataTables options.
     */
    function createTable() {
        vm.dtOptions = {
            paginationType: 'simple_numbers',
            lengthMenu: [[15, 50, 100, -1], [15, 50, 100, 'All']],
            stateSave: true,
            deferRender: true
        };

        vm.dtColumnDefs = [
            DTColumnDefBuilder.newColumnDef(0), //index
            DTColumnDefBuilder.newColumnDef(1), //file path
            DTColumnDefBuilder.newColumnDef(2), //assigned
            DTColumnDefBuilder.newColumnDef(3).notSortable() //buttons
        ];
    }
}