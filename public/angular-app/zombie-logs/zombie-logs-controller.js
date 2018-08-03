/**
 * Created by konrad.sobon on 2018-08-01.
 */
angular.module('MissionControlApp').controller('ZombieLogsController', ZombieLogsController);

function ZombieLogsController(ZombieLogsFactory, DTOptionsBuilder, DTColumnBuilder, ngToast, $scope){
    var vm = this;

    //region Properties

    var toasts = [];
    vm.logs = [];
    vm.selectedOffice = { name: "All", code: "All" };
    vm.officeFilters = [
        { name: "All", code: "All" },
        { name: "Atlanta", code: ["ATL"] },
        { name: "Beijing", code: ["BEI"] },
        { name: "St. Louis", code: ["BJC"] },
        { name: "Calgary", code: ["CAL"] },
        { name: "Chicago", code: ["CHI"] },
        { name: "Columbus", code: ["COL"] },
        { name: "Dallas", code: ["DAL"] },
        { name: "Doha", code: ["DOH"] },
        { name: "Dubai", code: ["DUB"] },
        { name: "Hong Kong", code: ["HK"] },
        { name: "Houston", code: ["HOU"] },
        { name: "Kansas City", code: ["KC"] },
        { name: "Los Angeles", code: ["LA"] },
        { name: "London", code: ["LON"] },
        { name: "New York", code: ["NY"] },
        { name: "Ottawa", code: ["OTT"] },
        { name: "Philadephia", code: ["PHI"] },
        { name: "Seattle", code: ["SEA"] },
        { name: "San Francisco", code: ["SF"] },
        { name: "Shanghai", code: ["SH"] },
        { name: "St. Louis", code: ["STL"] },
        { name: "Toronto", code: ["TOR"] },
        { name: "Tampa", code: ["TPA"] },
        { name: "Washington DC", code: ["WDC"] },
        { name: "Undefined", code: ["EMC", "SDC", "OSS", "LD", "LDC", ""] }
    ];
    vm.dtFrom = new Date();
    vm.dtTo = new Date();
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

    //endregion

    //region Toasts

    getDirtyDozen();

    /**
     * Retrieves dozen Fatal warnings and shows them as a toast notification.
     */
    function getDirtyDozen() {
        ZombieLogsFactory.getDirtyDozen()
            .then(function (response) {
                if(!response || response.status !== 200) return;

                response.data.forEach(function (item) {
                    toasts.push(ngToast.danger({
                        dismissButton: true,
                        dismissOnTimeout: false,
                        newestOnTop: true,
                        content: '<strong>Fatal: </strong>' + parseDateTime(item.createdAt) + ' ' + item.machine
                    }))
                });
            })
            .catch(function (err) {
                console.log(err);
            });
    }

    /**
     * Makes sure that the toasts get dismissed.
     */
    $scope.$on('$locationChangeStart', function( event ) {
        vm.dismissAll();
        toasts = [];
    });

    vm.dismissAll = function () {
        ngToast.dismiss();
    };

    //endregion

    //region Date Filtering

    /**
     * Opens pop-up date pickers.
     * @param popup
     */
    vm.openDatePicker = function(popup) {
        popup === 'from' ? vm.popup1.opened = true : vm.popup2.opened = true;
    };

    /**
     * Filters Editing Records based on selected date range.
     */
    vm.filterDate = function () {
        vm.loading = true;
        var data = {
            from: vm.dtFrom,
            to: vm.dtTo,
            office: vm.selectedOffice
        };

        vm.dtInstance.changeData(function () {
            return ZombieLogsFactory.getFiltered(data)
                .then(function (response) {
                    if(!response || response.status !== 201) return;

                    vm.loading = false;
                    return response.data;
                })
                .catch(function (err) {
                    vm.loading = false;
                    console.log(err);
                });
        })
        // TODO: Setup a chart that can display NYC > users > version installed in a pie chart.
        // TODO: Setup a little streaming side bar notification list that has users with fatal errors. This would just be a running list of 10 users, that Zombie crashed out for.
    };

    vm.SetOfficeFilter = function (office) {
        vm.selectedOffice = office;
    };

    //endregion

    //region Table

    // set table options for dimension types
    vm.dtInstance = {};
    vm.dtOptions = DTOptionsBuilder.fromFnPromise(function () {
        return ZombieLogsFactory.get()
            .then(function (response) {
                if(!response || response.status !== 200) return;

                return response.data;
            })
            .catch(function (err) {
                console.log('Unable to load project data: ' + err.message);
            })
    }).withPaginationType('simple_numbers')
        .withDisplayLength(15)
        .withOption('order', [0, 'desc'])
        .withOption('lengthMenu', [[15, 25, 50, 100, -1],[15, 25, 50, 100, 'All']])
        .withOption('rowCallback', function (row, data, index) {
            console.log(data.level);
            switch(data.level){
                case 'Info':
                    row.className = row.className + ' table-info';
                    break;
                case 'Error':
                    row.className = row.className + ' bg-warning';
                    break;
                case 'Fatal':
                    row.className = row.className + ' bg-danger';
                    break;
                default:
                    row.className = row.className + ' table-info';
                    break;
            }
        });

    vm.dtColumns = [
        DTColumnBuilder.newColumn('createdAt')
            .withTitle('Date/Time')
            .withOption('width', '15%')
            // .withOption('orderData', 0)
            .renderWith(parseDateTime),
        DTColumnBuilder.newColumn('machine')
            .withTitle('Location')
            .withOption('width', '10%')
            .withOption('className', 'text-center')
            .renderWith(parseLocation),
        DTColumnBuilder.newColumn('machine')
            .withTitle('Machine')
            .withOption('className', 'text-center')
            .withOption('width', '10%')
            .renderWith(parseMachine),
        DTColumnBuilder.newColumn('level')
            .withTitle('Level')
            .withOption('className', 'text-center')
            .withOption('width', '10%'),
        DTColumnBuilder.newColumn('message')
            .withTitle('Message')
            .withOption('width', '55%')
    ];

    /**
     * Extracts machine number from full machine name.
     * @param machine
     * @returns {*}
     */
    function parseMachine(machine) {
        if(!machine) return 'N/A';

        var parts = machine.split('-');
        if(parts.length > 2) return parts[1] + '-' + parts[2];
        else return parts[1];
    }

    /**
     * Extracts location from machine name.
     * @param machine
     * @returns {string}
     */
    function parseLocation(machine) {
        if(!machine) return 'N/A';

        var parts = machine.split('-');
        return parts[0];
    }

    /**
     * Parses UTC Date into local date.
     * @param value
     * @returns {string}
     */
    function parseDateTime(value) {
        return new Date(value).toLocaleString('en-US', {
            year: '2-digit',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    //endregion
}