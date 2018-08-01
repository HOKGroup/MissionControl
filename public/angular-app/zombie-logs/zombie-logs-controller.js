/**
 * Created by konrad.sobon on 2018-08-01.
 */
angular.module('MissionControlApp').controller('ZombieLogsController', ZombieLogsController);

function ZombieLogsController(ZombieLogsFactory, DTColumnDefBuilder){
    var vm = this;
    vm.logs = null;

    vm.officeFilters = [
        {name: "All", code: "All"},
        {name: "Atlanta", code: ["ATL"]},
        {name: "Beijing", code: ["BEI"]},
        {name: "St. Louis", code: ["BJC"]},
        {name: "Calgary", code: ["CAL"]},
        {name: "Chicago", code: ["CHI"]},
        {name: "Columbus", code: ["COL"]},
        {name: "Dallas", code: ["DAL"]},
        {name: "Doha", code: ["DOH"]},
        {name: "Dubai", code: ["DUB"]},
        {name: "Hong Kong", code: ["HK"]},
        {name: "Houston", code: ["HOU"]},
        {name: "Kansas City", code: ["KC"]},
        {name: "Los Angeles", code: ["LA"]},
        {name: "London", code: ["LON"]},
        {name: "New York", code: ["NY"]},
        {name: "Ottawa", code: ["OTT"]},
        {name: "Philadephia", code: ["PHI"]},
        {name: "Seattle", code: ["SEA"]},
        {name: "San Francisco", code: ["SF"]},
        {name: "Shanghai", code: ["SH"]},
        {name: "St. Louis", code: ["STL"]},
        {name: "Toronto", code: ["TOR"]},
        {name: "Tampa", code: ["TPA"]},
        {name: "Washington DC", code: ["WDC"]},
        {name: "Undefined", code: ["EMC", "SDC", "OSS", "LD", "LDC", ""]}
    ];

    vm.selectedOffice = "All";

    //region Date Filtering

    vm.dtFrom = new Date();
    vm.dtTo = null;
    vm.loading = false;
    vm.format = 'dd-MMMM-yyyy';
    vm.dateOptions = {
        formatYear: 'yy',
        maxDate: new Date(2020, 5, 22),
        minDate: new Date(2015, 5, 22),
        startingDay: 1
    };
    vm.popup1 = { opened: false };
    vm.popup2 = { opened: false };

    /**
     * Opens pop-up date pickers.
     * @param popup
     */
    vm.openDatePicket = function(popup) {
        popup === 'from' ? vm.popup1.opened = true : vm.popup2.opened = true;
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
            office: vm.selectedOffice
        };

        // TriggerRecordsFactory.getManyByCentralPathDates(data)
        //     .then(function (response) {
        //         if(!response || response.status !== 200) return;
        //
        //         vm.triggerRecords = response.data;
        //         var triggerRecords = [];
        //         response.data.forEach(function (item) {
        //             item.triggerRecords.forEach(function (record) {
        //                 record['centralPath'] = item.centralPath;
        //                 triggerRecords.push(record);
        //             })
        //         });
        //
        //         vm.selectedRecords = triggerRecords;
        //         vm.loading = false;
        //     })
        //     .catch(function (err) {
        //         vm.loading = false;
        //         console.log(err);
        //     });
    };

    vm.SetOfficeFilter = function (office) {
        vm.selectedOffice = office.name;
    };

    //endregion

    getLogs();

    /**
     * Callback method for Date Time Range selection.
     * @param date
     * @constructor
     */
    vm.OnFilter = function (date) {
        vm.loading = true;
        var data = {
            from: date.from,
            to: date.to,
            centralPath: vm.WorksetData.worksetStats.centralPath
        };

        // do stuff
    };

    /**
     * Toggles Date Time picker div on/off.
     */
    vm.toggleTimeSettings = function() {
        vm.showTimeSettings = !vm.showTimeSettings;
    };

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
        if(parts.length > 2) return parts[1] + '-' + parts[2];
        else return parts[1];
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