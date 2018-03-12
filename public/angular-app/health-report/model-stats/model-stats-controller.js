angular.module('MissionControlApp').controller('ModelStatsController', ModelStatsController);

function ModelStatsController($routeParams, UtilityService, DTColumnDefBuilder){
    var vm = this;
    vm.projectId = $routeParams.projectId;
    vm.ModelData = this.processed;
    var allData = this.full;

    vm.ModelSizes = allData.modelSizes;
    vm.ModelOpenTimes = allData.openTimes;
    vm.ModelSynchTimes = allData.synchTimes;
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
    vm.TableDataTypes = ['Open', 'Synch'];

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
     * Processes data for table filter Open | Synch.
     * @param type
     */
    vm.setTableDataType = function (type) {
        vm.selectedTableData = type;

        if(type === 'Open'){
            vm.tableData = processData(allData.onOpened, allData.openTimes);
        } else if (type === 'Synch'){
            vm.tableData = processData(allData.onSynched, allData.synchTimes);
        }
    };

    vm.setTableDataType(vm.selectedTableData);

    /**
     * Filters Model Open Time data for specific user only.
     * @param user
     * @param data
     */
    vm.setUserFilter = function (user, data) {
        if(data === 'synchTimes'){
            vm.selectedSynchUser = user;
            if(user === 'All'){
                vm.ModelSynchTimes = allData.synchTimes;
            } else {
                vm.ModelSynchTimes = allData.synchTimes.filter(function (item) {
                    return item.user === user;
                });
            }
        } else if (data === 'openTimes'){
            vm.selectedOpenUser = user;
            if(user === 'All'){
                vm.ModelOpenTimes = allData.openTimes;
            } else {
                vm.ModelOpenTimes = allData.openTimes.filter(function (item) {
                    return item.user === user;
                });
            }
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
     * Sorts Table by date.
     * @param item
     * @returns {Date}
     */
    vm.sortDate = function (item) {
        return new Date(item.createdOn);
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
}