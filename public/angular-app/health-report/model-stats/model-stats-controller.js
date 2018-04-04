angular.module('MissionControlApp').controller('ModelStatsController', ModelStatsController);

function ModelStatsController($routeParams, UtilityService, DTColumnDefBuilder, $uibModal, HealthReportFactory){
    var vm = this;
    this.$onInit = function () {
        vm.projectId = $routeParams.projectId;
        var synchLimit = 3600000; // 1h
        var openLimit = 18000000; // 5h
        vm.showTimeSettings = false;
        vm.ModelData = this.processed;
        vm.Data = this.full;
        vm.TableDataTypes = ['Open', 'Synch'];
        vm.loading = false;

        /**
         * Callback method for Date Time Range selection.
         * @param date
         * @constructor
         */
        vm.OnFilter = function (date) {
            vm.loading = true;
            HealthReportFactory.processModelStats(vm.Data._id, date, function (result) {
                vm.ModelData = result;
                vm.Data = result.modelStats;

                setDefaults();
                vm.loading = false;
            });
        };

        /**
         * Toggles Date Time picker div on/off.
         */
        vm.toggleTimeSettings = function() {
            vm.showTimeSettings = !vm.showTimeSettings;
        };

        // set table options
        vm.dtOptions = {
            paginationType: 'simple_numbers',
            lengthMenu: [[10, 25, 50, 100, -1], [10, 25, 50, 100, 'All']],
            stateSave: false,
            deferRender: true
        };

        vm.dtColumnDefs = [
            DTColumnDefBuilder.newColumnDef(0), //date/time
            DTColumnDefBuilder.newColumnDef(1), //user name
            DTColumnDefBuilder.newColumnDef(2).withOption('orderData', '3'), //open time
            DTColumnDefBuilder.newColumnDef(3).notVisible(), //duration in ms
            DTColumnDefBuilder.newColumnDef(4).withOption('orderData', '5'), //worksets
            DTColumnDefBuilder.newColumnDef(5).notVisible() //workset percentage
        ];

        /**
         * Checks if value is larger than a given limit.
         * @param item
         * @returns {boolean}
         */
        vm.evaluateEventTime = function(item)
        {
            if (vm.selectedTableData === 'Synch'){
                return item.value > synchLimit;
            } else {
                return item.value > openLimit;
            }
        };

        /**
         * Processes data for table filter Open | Synch.
         * @param type
         */
        vm.setTableDataType = function (type) {
            vm.selectedTableData = type;

            if(type === 'Open'){
                vm.tableData = processData(vm.Data.onOpened, vm.Data.openTimes);
            } else if (type === 'Synch'){
                vm.tableData = processData(vm.Data.onSynched, vm.Data.synchTimes);
            }
        };

        setDefaults();

        /**
         * Method that sets/resets all calcs for tables/charts.
         */
        function setDefaults() {
            vm.ModelSizes = vm.Data.modelSizes;

            // set data for synch charts
            var filtered = filterData(vm.Data.synchTimes, synchLimit, "All"); //1h
            vm.ModelSynchTimes = filtered.data;
            vm.ExcludedModelSynchTimes = filtered.excludedData;

            // set data for open charts
            var filtered1 = filterData(vm.Data.openTimes, openLimit, "All"); //5h
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
            vm.selectedTableData = 'Synch';

            vm.setTableDataType(vm.selectedTableData);
        }

        /**
         * Filters Model Open Time data for specific user only.
         * @param user
         * @param data
         */
        vm.setUserFilter = function (user, data) {
            var filtered;
            if(data === 'synchTimes'){
                vm.selectedSynchUser = user;
                filtered = filterData(vm.Data.synchTimes, synchLimit, user); // 1h
                vm.ModelSynchTimes = filtered.data;
                vm.ExcludedModelSynchTimes = filtered.excludedData;
            } else if (data === 'openTimes'){
                vm.selectedOpenUser = user;
                filtered = filterData(vm.Data.openTimes, openLimit, user); // 5h
                vm.ModelOpenTimes = filtered.data;
                vm.ExcludedModelOpenTimes = filtered.excludedData;
            }
        };

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
         * Sorts Table by date.
         * @param item
         * @returns {Date}
         */
        vm.sortDate = function (item) {
            return UtilityService.convertUTCDateToLocalDate(new Date(item.createdOn));
        };

        /**
         * Processes synch times and open times to correlate them with workset data
         * This info is displayed in the table.
         * @param worksetArr
         * @param timeArr
         * @returns {Array}
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
                if(!request) return;

            }).catch(function(){
                //if modal dismissed
            });
        };

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
    };
}