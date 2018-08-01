/**
 * Created by konrad.sobon on 2018-08-01.
 */
angular.module('MissionControlApp').controller('ZombieLogsController', ZombieLogsController);

function ZombieLogsController(ZombieLogsFactory, DTColumnDefBuilder){
    var vm = this;
    vm.logs = null;

    getLogs();

    /**
     *
     * @param x
     * @returns {*}
     */
    vm.getClass = function (x) {
        switch(x.level){
            case 'Info':
                return 'table-info';
            case 'Error':
                return 'bg-warning';
            case 'Fatal':
                return 'bg-danger';
            default:
                return 'table-info';
        }
    };

    /**
     *
     * @param machine
     */
    vm.getLocation = function (machine) {
        if(!machine) return 'N/A';

        var parts = machine.split('-');
        return parts[0];
    };

    /**
     *
     * @param machine
     * @returns {string}
     */
    vm.getMachine = function (machine) {
        if(!machine) return 'N/A';

        var parts = machine.split('-');
        return parts[1] + '-' + parts[2];
    };

    /**
     *
     * @param value
     * @returns {string}
     */
    vm.getDateTime = function (value) {
        return new Date(value).toLocaleString('en-US', {
            year: '2-digit',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    /**
     *
     */
    function getLogs() {
        ZombieLogsFactory.get()
            .then(function (response) {
                if(!response || response.status !== 200) return;

                vm.logs = response.data;
                createTable();
            })
            .catch(function (err) {
                console.log('Unable to load project data: ' + err.message);
            });
    }

    /**
     *
     */
    function createTable() {
        vm.dtOptions = {
            paginationType: 'simple_numbers',
            lengthMenu: [[25, 50, 100, -1], [25, 50, 100, 'All']],
            order: [[0, 'desc']]
        };

        vm.dtColumnDefs = [
            DTColumnDefBuilder.newColumnDef(0), //created at
            DTColumnDefBuilder.newColumnDef(1), //location
            DTColumnDefBuilder.newColumnDef(2), //machine
            DTColumnDefBuilder.newColumnDef(3), //level
            DTColumnDefBuilder.newColumnDef(4) //message
        ];
    }
}