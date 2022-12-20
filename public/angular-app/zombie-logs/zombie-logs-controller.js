/**
 * Created by konrad.sobon on 2018-08-01.
 */
angular.module('MissionControlApp').controller('ZombieLogsController', ZombieLogsController);

function ZombieLogsController(ZombieLogsFactory, UsersFactory, DTOptionsBuilder, DTColumnBuilder, SettingsFactory, ngToast){
    var vm = this;
    var toasts = [];

    //region Public Properties

    vm.logs = []; // logs shown in main table
    vm.donutData = []; // data filtered for the donut chart
    vm.selectedMachines = []; // data filtered for second table
    vm.latestVersion = '0.0.0.0'; // latest version of the plugin (used to color chart)
    vm.settings = null;
    vm.selectedOffice = { name: 'All', code: 'All' };
    vm.MainChartColor = 'steelblue';
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
    vm.users = {};

    getSettings();
    getUsers();

    //endregion

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
     * 
     */
    function getUsers() {
        UsersFactory.getAll()
            .then(function (response) {
                if(!response || response.status !== 200) throw { message: 'Could not retrieve user info.' };

                vm.users = response.data.reduce(function (obj, item) {
                    obj[item.machine] = item.user;
                    return obj;
                });
            })
            .catch(function (err) {
                toasts.push(ngToast.warning({
                    dismissButton: true,
                    dismissOnTimeout: true,
                    timeout: 4000,
                    newestOnTop: true,
                    content: err.message
                }));
            });
    }

    //region Table

    // set table options for zombielogs
    vm.dtInstance = {};
    vm.dtOptions = DTOptionsBuilder.fromFnPromise(function () {
        return ZombieLogsFactory.get()
            .then(function (response) {
                if(!response || response.status !== 200) return;

                processTableData(response.data);

                return vm.logs;
            })
            .catch(function (err) {
                console.log('Unable to load project data: ' + err.message);
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

    vm.dtColumns = [
        DTColumnBuilder.newColumn('createdAt')
            .withTitle('Date/Time')
            .withOption('width', '12%')
            // .withOption('orderData', 0)
            .renderWith(parseDateTime),
        DTColumnBuilder.newColumn('machine')
            .withTitle('Location')
            .withOption('width', '8%')
            .withOption('className', 'text-center')
            .renderWith(parseLocation),
        DTColumnBuilder.newColumn('machine')
            .withTitle('Machine')
            .withOption('className', 'text-center')
            .withOption('width', '10%')
            .renderWith(parseMachine),
        DTColumnBuilder.newColumn('machine')
            .withTitle('User')
            .withOption('className', 'text-center')
            .withOption('width', '15%')
            .renderWith(parseUsername),
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
            .withOption('width', '8%')
            .withOption('className', 'text-center')
            .renderWith(parseLocation),
        DTColumnBuilder.newColumn('machine')
            .withTitle('Machine')
            .withOption('className', 'text-center')
            .withOption('width', '10%')
            .renderWith(parseMachine),
        DTColumnBuilder.newColumn('machine')
            .withTitle('User')
            .withOption('className', 'text-center')
            .withOption('width', '15%')
            .renderWith(parseUsername),
        DTColumnBuilder.newColumn('message')
            .withTitle('Message')
            .withOption('width', '67%')
    ];

    /**
     * Extracts machine number from full machine name.
     * @param machine
     * @returns {*}
     */
    function parseMachine(machine) {
        if(!machine) {
            return 'N/A';
        }

        var parts = machine.split('-');
        if(parts.length > 2) {
            return parts[1] + '-' + parts[2];
        }
        else {
            return parts[1];
        }
    }

    function parseUsername(machine) {
        if(!machine) {
            return 'N/A';
        }

        if(vm.users.hasOwnProperty(machine)) {
            return vm.users[machine];
        }
        else {
            return 'Unknown';
        }
    }

    /**
     * Extracts location from machine name.
     * @param machine
     * @returns {string}
     */
    function parseLocation(machine) {
        if(!machine) {
            return 'N/A';
        }

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
        var myRegexp1 = /version:\s?(.*?)$/g;
        var match = myRegexp.exec(s);
        var match1 = myRegexp1.exec(s);
        if(match !== null) {
            return match[1];
        }
        if(match1 !== null) {
            return match1[1];
        }
        return 'Fatal';
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
            while (v1parts.length < v2parts.length) v1parts.push('0');
            while (v2parts.length < v1parts.length) v2parts.push('0');
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
     *
     * @param data
     */
    function processTableData(data) {
        vm.logs = data.sort(function(a,b){
            return new Date(b.createdAt) - new Date(a.createdAt);
        });

        var donuts = {};
        var temp = {};
        var fatal = [];
        vm.logs.forEach(function (log) {
            if(temp.hasOwnProperty(log.machine)){
                var existing = temp[log.machine];
                if(log.level === 'Info' && existing.level !== 'Info'){
                    // override stored one with info status which is latest successful update
                    temp[log.machine] = log;
                }
            } else {
                temp[log.machine] = log;
            }
        });

        Object.keys(temp).map(function (key) {
            var version = getVersion(temp[key].message);
            if(version === 'Fatal') {
                fatal.push(temp[key]);
            }
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
            };
        });
        vm.selectedMachines = fatal;
    }

    /**
     * Handles user clicking on Donut Chart. Populates the table.
     * @param item
     * @constructor
     */
    vm.OnClick = function(item){
        vm.dtInstance1.changeData(function () {
            return new Promise(function(resolve, reject){

                // (Konrad) Sort all logs by machine with preference for last successful update.
                var temp = {};
                vm.logs.forEach(function (log) {
                    if(temp.hasOwnProperty(log.machine)){
                        var existing = temp[log.machine];
                        if(log.level === 'Info' && existing.level !== 'Info'){
                            // override stored one with info status which is latest successful update
                            temp[log.machine] = log;
                        }
                    } else {
                        temp[log.machine] = log;
                    }
                });

                var data = {};
                var result = [];
                Object.keys(temp).map(function (key) {
                    var version = getVersion(temp[key].message);
                    if(item.name === 'Fatal'){
                        if(version === 'Fatal') {
                            result.push(temp[key]);
                        }
                    } else {
                        if(version === item.name) {
                            result.push(temp[key]);
                        }
                    }
                });

                if (!result) reject();
                else resolve(result);
            });
        });
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

                    processTableData(response.data);
                    vm.loading = false;

                    return vm.logs;
                })
                .catch(function (err) {
                    vm.loading = false;
                    console.log(err);
                });
        });
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