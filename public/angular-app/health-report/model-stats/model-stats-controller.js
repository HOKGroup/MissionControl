/**
 * Created by konrad.sobon on 2018-04-26.
 */
angular.module('MissionControlApp').controller('ModelStatsController', ModelStatsController);

function ModelStatsController($timeout, $routeParams, UtilityService, DTColumnBuilder, DTOptionsBuilder, $scope, $uibModal, HealthReportFactory){
    var vm = this;
    this.$onInit = function () {
        vm.projectId = $routeParams.projectId;
        var synchLimit = 3600000; // 1h
        var openLimit = 18000000; // 5h
        vm.showTimeSettings = false;
        vm.ModelData = this.processed;
        vm.TableDataTypes = ['Open', 'Synch'];
        vm.loading = false;
        vm.tableData = [];

        setDefaults();
        createTable();

        /**
         * Since all health report components are initiated when data is finished loading
         * none of them are yet visible. The DOM has not yet loaded the divs etc. This means
         * that all divs have a width of 0 and table is initiated with that width as well.
         * By watching this variable we can detect when user selected to see this page.
         */
        $scope.$watch('vm.ModelData.show.value', function (newValue) {
            if (newValue === true){
                reloadTable();
            }
        });

        /**
         * Processes data for table filter Open | Synch.
         * @param type
         */
        vm.setTableDataType = function (type) {
            vm.selectedTableData = type;
            reloadTable();
        };

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
                centralPath: vm.ModelData.modelStats.centralPath
            };
            HealthReportFactory.processModelStats(data, function (result) {
                vm.ModelData = result;

                setDefaults();
                reloadTable();
                vm.loading = false;
            });
        };

        /**
         * Toggles Date Time picker div on/off.
         */
        vm.toggleTimeSettings = function() {
            vm.showTimeSettings = !vm.showTimeSettings;
        };

        /**
         * Filters Model Open Time data for specific user only.
         * @param user
         * @param data
         */
        vm.setUserFilter = function (user, data) {
            var filtered;
            if(data === 'synchTimes'){
                vm.selectedSynchUser = user;
                filtered = filterData(vm.ModelData.modelStats.synchTimes, synchLimit, user); // 1h
                vm.ModelSynchTimes = filtered.data;
                vm.ExcludedModelSynchTimes = filtered.excludedData;
            } else if (data === 'openTimes'){
                vm.selectedOpenUser = user;
                filtered = filterData(vm.ModelData.modelStats.openTimes, openLimit, user); // 5h
                vm.ModelOpenTimes = filtered.data;
                vm.ExcludedModelOpenTimes = filtered.excludedData;
            }
        };

        /**
         * Formats file size from bytes to Kb, Mb etc.
         * @param item
         * @returns {string|*}
         */
        vm.formatValue = function(item){
            return UtilityService.formatNumber(item);
        };

        /**
         * Formats time from ms to hours, minutes, seconds.
         * @param item
         * @returns {*}
         */
        vm.formatDuration = function(item){
            return UtilityService.formatDuration(item);
        };

        /**
         * Launches help window for the Sheets.
         * @param size
         */
        vm.launchHelpWindow = function (size) {
            $uibModal.open({
                animation: true,
                templateUrl: 'angular-app/health-report/model-stats/help.html',
                controller: 'ModelStatsHelpController as vm',
                size: size
            }).result.then(function(request){
                //model closed

            }).catch(function(){
                //if modal dismissed
            });
        };

        //region DataTable

        function createTable() {
            vm.dtInstance = {};
            vm.dtOptions = DTOptionsBuilder.fromFnPromise(function () {
                return getData()
            }).withPaginationType('simple_numbers')
                .withDisplayLength(10)
                .withOption('order', [0, 'asc'])
                .withOption('lengthMenu', [[10, 25, 50, 100, -1],[10, 25, 50, 100, 'All']])
                .withOption('rowCallback', function (row, data, index) {
                    if (evaluateEventTime(data)){
                        row.className = row.className + ' bg-danger'
                    } else {
                        row.className = row.className + ' table-info'
                    }
                });

            vm.dtColumns = [
                DTColumnBuilder.newColumn('createdOn')
                    .withTitle('Date/Time')
                    .withOption('width', '15%')
                    .renderWith(parseDateTime),
                DTColumnBuilder.newColumn('user')
                    .withTitle('User')
                    .withOption('width', '50%'),
                DTColumnBuilder.newColumn('value')
                    .withTitle('Duration')
                    .withOption('className', 'text-center')
                    .withOption('width', '15%')
                    .withOption('orderData', 3)
                    .renderWith(durationFromValue),
                DTColumnBuilder.newColumn('value')
                    .withTitle('Hidden')
                    .notVisible(),
                DTColumnBuilder.newColumn('worksets')
                    .withTitle('Size')
                    .withOption('className', 'text-center')
                    .withOption('orderData', 5)
                    .withOption('width', '10%'),
                DTColumnBuilder.newColumn('worksetPercentage')
                    .withTitle('Hidden')
                    .notVisible()
            ];
        }

        /**
         * Retrieves data. We need a function that returns a promise here so that we can
         * use it with the datatables. It will also call this method when we call
         * dt.instance.reloadData() which helps when we do filtering.
         * @returns {*}
         */
        function getData() {
            return new Promise(function(resolve, reject){
                var data = [];
                if(vm.selectedTableData === 'Open'){
                    data = processData(vm.ModelData.modelStats.onOpened, vm.ModelData.modelStats.openTimes);
                } else if (vm.selectedTableData === 'Synch'){
                    data = processData(vm.ModelData.modelStats.onSynched, vm.ModelData.modelStats.synchTimes);
                }

                if (!data) reject();
                else resolve(data);
            });
        }

        /**
         *
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
         *
         * @param value
         * @returns {*}
         */
        function durationFromValue(value)
        {
            return UtilityService.formatDuration(value);
        }

        /**
         * Checks if value is larger than a given limit.
         * @param item
         * @returns {boolean}
         */
        function evaluateEventTime(item)
        {
            if (vm.selectedTableData === 'Synch'){
                return item.value > synchLimit;
            } else {
                return item.value > openLimit;
            }
        }

        //endregion

        //region Utilities

        /**
         * Method to recalculate data table contents and reload it.
         */
        function reloadTable() {
            if(vm.dtInstance) {vm.dtInstance.reloadData(false);}
            if(vm.dtInstance) {vm.dtInstance.rerender();}
        }

        /**
         * Filters selected array by value limit.
         * @param arr
         * @param limit
         * @param user
         * @returns {{data: Array, excludedData: Array}}
         */
        function filterData(arr, limit, user){
            var data = [];
            var excludedData = [];
            arr.forEach(function (item) {
                if(user === 'All'){
                    if(+item.value > limit) excludedData.push(item);
                    else data.push(item);
                } else {
                    if (+item.value > limit && item.user === user) excludedData.push(item);
                    else if (+item.value < limit && item.user === user) data.push(item);
                }
            });
            return {'data' : data, "excludedData" : excludedData}
        }

        /**
         * Returns index of an item that was the closest time to the given synchTime.
         * (Konrad) The idea here is that on synch event Workset info gets posted first so the time
         * stamp for that will have x value. Then when synch is done, a synch time is posted
         * and its time stamp now is y. When we are matching synch times to workset info we
         * make sure that y-x is not negative which would mean that synch time occured later than
         * workset info was posted. That would be info for another synch event. If it's positive
         * then we are looking for the smallest time difference, and that's our synch time/workset data.
         * @param arr
         * @param synchTime
         * @returns {number}
         */
        function findMinIndex(arr, synchTime){
            var min = 0;
            var index = 0;

            for (var i = 0, len = arr.length; i < len; i++){
                var current = arr[i].createdOn;
                var diff = new Date(synchTime) - new Date(current);
                min = diff < 0 ? min : diff;
                index = diff < 0 ? index : i;
            }

            return index;
        }

        /**
         * Processes synch times and open times to correlate them with workset data
         * This info is displayed in the table.
         * @param worksetArr
         * @param timeArr
         */
        function processData(worksetArr, timeArr){
            var worksetData = {};
            var tempData = [];
            worksetArr.forEach(function (item) {
                if(!item.user) return;

                if(worksetData.hasOwnProperty(item.user)){
                    worksetData[item.user].push(item);
                } else {
                    worksetData[item.user] = [item];
                }
            });

            timeArr.forEach(function (item) {
                if(!item.user) return;

                if(worksetData.hasOwnProperty(item.user)){
                    var synchTime = item.createdOn;
                    var index = findMinIndex(worksetData[item.user], synchTime);

                    var data = worksetData[item.user][index];
                    item['worksets'] = parseFloat((data.opened * 100) / (data.closed + data.opened)).toFixed(0) + '%';
                    item['worksetPercentage'] = (data.opened * 100) / (data.closed + data.opened);
                    tempData.push(item);
                }
            });

            return tempData;
        }

        /**
         * Method that sets/resets all calcs for tables/charts.
         */
        function setDefaults() {
            vm.ModelSizes = vm.ModelData.modelStats.modelSizes;

            // set data for synch charts
            var filtered = filterData(vm.ModelData.modelStats.synchTimes, synchLimit, "All"); //1h
            vm.ModelSynchTimes = filtered.data;
            vm.ExcludedModelSynchTimes = filtered.excludedData;

            // set data for open charts
            var filtered1 = filterData(vm.ModelData.modelStats.openTimes, openLimit, "All"); //5h
            vm.ModelOpenTimes = filtered1.data;
            vm.ExcludedModelOpenTimes = filtered1.excludedData;

            // set data for user filters
            vm.selectedSynchUser = "All";
            vm.selectedOpenUser = "All";
            vm.OpenUsers = Array.from(new Set(vm.ModelOpenTimes.map(function(item){
                return item.user;
            })));
            vm.OpenUsers.unshift("All");
            vm.SynchUsers = Array.from(new Set(vm.ModelSynchTimes.map(function(item){
                return item.user;
            })));
            vm.SynchUsers.unshift("All");
            vm.selectedTableData = 'Open';
        }

        //endregion
    };
}