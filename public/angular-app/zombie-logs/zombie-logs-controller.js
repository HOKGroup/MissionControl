/**
 * Created by konrad.sobon on 2018-08-01.
 */
angular.module('MissionControlApp').controller('ZombieLogsController', ZombieLogsController);

function ZombieLogsController($timeout, ZombieLogsFactory, DTOptionsBuilder, DTColumnBuilder, ngToast, $scope){
    var vm = this;
    var toasts = [];

    //region Sockets

    var app = {
        socket: null,
        connect: function() {
            var self = this;
            if( self.socket ) {
                self.socket.destroy();
                delete self.socket;
                self.socket = null;
            }
            this.socket = io.connect({transports: ['websocket']});
            this.socket.reconnection = true;
            this.socket.reconnectionDelay = 1000;
            this.socket.reconnectionDelayMax = 5000;
            this.socket.reconnectionAttempts = Infinity;

            this.socket.on('connect', function () {
                self.socket.emit('room', 'zombie_logs');
            });
            this.socket.on( 'disconnect', function () {
                $timeout( app.connect, 5000 );
            });
            this.socket.on('log_added', function (data) {
                vm.logs.push(data);
                vm.dtInstance.changeData(function () {
                    return ZombieLogsFactory.get()
                        .then(function (response) {
                            if(!response || response.status !== 200) return;

                            return response.data;
                        })
                        .catch(function (err) {
                            console.log('Unable to load project data: ' + err.message);
                        })
                });
                toasts.push(ngToast.success({
                    dismissButton: true,
                    dismissOnTimeout: true,
                    timeout: 4000,
                    newestOnTop: true,
                    content: '<strong>Added: </strong>' + parseDateTime(data.createdAt) + ' ' + data.machine
                }))
            });
        }
    };

    app.connect();

    //endregion

    //region Public Properties

    vm.logs = []; // logs shown in main table
    vm.donutData = []; // data filtered for the donut chart
    vm.selectedMachines = []; // data filtered for second table
    vm.latestVersion = "0.0.0.0"; // latest version of the plugin (used to color chart)
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
    vm.dtTo.setDate(vm.dtTo.getDate() + 1);
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

    //region Table

    // set table options for zombielogs
    vm.dtInstance = {};
    vm.dtOptions = DTOptionsBuilder.fromFnPromise(function () {
        return ZombieLogsFactory.get()
            .then(function (response) {
                if(!response || response.status !== 200) return;

                //region DataTable

                vm.logs = response.data.sort(function(a,b){
                    return new Date(b.createdAt) - new Date(a.createdAt);
                });

                //endregion

                //region Toast Messages

                var fLogs = vm.logs.filter(function (item) {
                    return item.level === 'Fatal';
                }).forEach(function (log) {
                    toasts.push(ngToast.danger({
                        dismissButton: true,
                        dismissOnTimeout: false,
                        newestOnTop: true,
                        content: '<strong>Fatal: </strong>' + parseDateTime(log.createdAt) + ' ' + log.machine
                    }))
                });

                //endregion

                //region Donut Chart

                var donuts = {};
                var temp = {};
                var fatal = [];
                vm.logs.forEach(function (log) {
                    if(temp.hasOwnProperty(log.machine)) return;

                    if(log.level === 'Fatal') fatal.push(log); // store 'fatal' logs for second table
                    temp[log.machine] = log;

                    var version = getVersion(log.message);
                    if(donuts.hasOwnProperty(version)){
                        donuts[version] = donuts[version] + 1;
                    } else {
                        donuts[version] = 1;
                    }
                });
                vm.donutData = Object.keys(donuts).map(function(key) {
                    if(versionCompare(key, vm.latestVersion) === 1){
                        vm.latestVersion = key;
                    }
                    return {
                        name: key,
                        count: donuts[key]
                    }
                });
                vm.selectedMachines = fatal;

                // refresh table1
                vm.dtInstance1.changeData(function () {
                    return new Promise(function(resolve, reject){
                        if (!vm.selectedMachines) reject();
                        else resolve(vm.selectedMachines);
                    });
                });

                //endregion

                return vm.logs;
            })
            .catch(function (err) {
                console.log('Unable to load project data: ' + err.message);
            })
    }).withPaginationType('simple_numbers')
        .withDisplayLength(10)
        .withOption('order', [0, 'desc'])
        .withOption('lengthMenu', [[10, 25, 50, 100, -1],[10, 25, 50, 100, 'All']])
        .withOption('rowCallback', function (row, data, index) {
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

    // set table options for zombielogs
    vm.dtInstance1 = {};
    vm.dtOptions1 = DTOptionsBuilder.fromFnPromise(function () {
        return new Promise(function(resolve, reject){
            if (!vm.selectedMachines) reject();
            else resolve(vm.selectedMachines);
        });
    }).withPaginationType('simple_numbers')
        .withDisplayLength(10)
        .withOption('order', [0, 'desc'])
        .withOption('lengthMenu', [[10, 25, 50, 100, -1],[10, 25, 50, 100, 'All']])
        .withOption('rowCallback', function (row, data, index) {
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

    vm.dtColumns1 = [
        DTColumnBuilder.newColumn('machine')
            .withTitle('Location')
            .withOption('width', '13%')
            .withOption('className', 'text-center')
            .renderWith(parseLocation),
        DTColumnBuilder.newColumn('machine')
            .withTitle('Machine')
            .withOption('className', 'text-center')
            .withOption('width', '13%')
            .renderWith(parseMachine),
        DTColumnBuilder.newColumn('message')
            .withTitle('Message')
            .withOption('width', '74%')
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

    /**
     * Parses the message string to retrieve the version of the plugin.
     * @param s
     * @returns {*}
     */
    function getVersion(s){
        var myRegexp = /Version:\s?(.*?)$/g;
        var match = myRegexp.exec(s);
        if(match !== null) return match[1];
        else return 'Fatal';
    }

    /**
     * Compares two version of the plugin where result is
     * 1 if v1 > v2, 0 if v1 === v2 and -1 if v1 < v2
     * @param v1
     * @param v2
     * @param options
     * @returns {*}
     */
    function versionCompare(v1, v2, options) {
        var lexicographical = options && options.lexicographical,
            zeroExtend = options && options.zeroExtend,
            v1parts = v1.split('.'),
            v2parts = v2.split('.');

        function isValidPart(x) {
            return (lexicographical ? /^\d+[A-Za-z]*$/ : /^\d+$/).test(x);
        }

        if (!v1parts.every(isValidPart) || !v2parts.every(isValidPart)) {
            return NaN;
        }

        if (zeroExtend) {
            while (v1parts.length < v2parts.length) v1parts.push("0");
            while (v2parts.length < v1parts.length) v2parts.push("0");
        }

        if (!lexicographical) {
            v1parts = v1parts.map(Number);
            v2parts = v2parts.map(Number);
        }

        for (var i = 0; i < v1parts.length; ++i) {
            if (v2parts.length === i) {
                return 1;
            }

            if (v1parts[i] === v2parts[i]) {

            }
            else if (v1parts[i] > v2parts[i]) {
                return 1;
            }
            else {
                return -1;
            }
        }

        if (v1parts.length !== v2parts.length) {
            return -1;
        }

        return 0;
    }

    /**
     * Handles user clicking on Donut Chart. Populates the table.
     * @param item
     * @constructor
     */
    vm.OnClick = function(item){
        vm.dtInstance1.changeData(function () {
            return new Promise(function(resolve, reject){
                var data = {};
                var result = [];
                if(item.name === 'Fatal'){
                    result = vm.logs.filter(function (log) {
                        if(!data.hasOwnProperty(log.machine)){
                            data[log.machine] = log;
                            return true;
                        } else {
                            return false;
                        }
                    }).filter(function (log) {
                        return log.level === 'Fatal';
                    });
                } else {
                    result = vm.logs.filter(function (log) {
                        if(!data.hasOwnProperty(log.machine)){
                            data[log.machine] = log;
                            return true;
                        } else {
                            return false;
                        }
                    }).filter(function (log) {
                        return getVersion(log.message) === item.name;
                    });
                }

                if (!result) reject();
                else resolve(result);
            });
        });
    };

    //endregion

    //region Toasts

    /**
     * Makes sure that the toasts get dismissed.
     */
    $scope.$on('$locationChangeStart', function( event ) {
        vm.dismissAll();
    });

    /**
     * Dismisses all toast notifications.
     */
    vm.dismissAll = function () {
        ngToast.dismiss();
        toasts = [];
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
    };

    /**
     * Sets current office filter selection.
     * @param office
     * @constructor
     */
    vm.SetOfficeFilter = function (office) {
        vm.selectedOffice = office;
    };

    //endregion
}