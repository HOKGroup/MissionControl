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
    setTableData(vm.selectedTableData);

    vm.dtOptions = {
        paginationType: 'simple_numbers',
        lengthMenu: [[10, 25, 50, 100, -1], [10, 25, 50, 100, 'All']],
        stateSave: false,
        deferRender: true
    };

    vm.dtColumnDefs = [
        DTColumnDefBuilder.newColumnDef(0), //opened on
        DTColumnDefBuilder.newColumnDef(1), //user name
        DTColumnDefBuilder.newColumnDef(2).withOption('orderData', '3'), //open time
        DTColumnDefBuilder.newColumnDef(3).notVisible(), //open time in ms
        DTColumnDefBuilder.newColumnDef(4).withOption('orderData', '5'), //worksets
        DTColumnDefBuilder.newColumnDef(5).notVisible() //workset percentage
    ];

    function setTableData(dataType){
        var worksetData = {};
        var tempData = [];
        if(dataType === 'Open'){
            allData.onOpened.forEach(function (item) {
                if(!item.user) return;

                if(worksetData.hasOwnProperty(item.user)){
                    worksetData[item.user].push(item);
                } else {
                    worksetData[item.user] = [item];
                }
            });

            allData.openTimes.forEach(function (item) {
                if(!item.user) return;

                if(worksetData.hasOwnProperty(item.user)){
                    var data = worksetData[item.user].find(function (date) {
                        return Math.abs(new Date(date.createdOn) - new Date(item.createdOn)) < 10000;
                    });
                    if(data){
                        item['worksets'] = parseFloat((data.opened * 100) / (data.closed + data.opened)).toFixed(0) + '%';
                        item['worksetPercentage'] = (data.opened * 100) / (data.closed + data.opened);
                        tempData.push(item);
                    }
                }
            });
        } else if (dataType === 'Synch'){
            allData.onSynched.forEach(function (item) {
                if(!item.user) return;

                if(worksetData.hasOwnProperty(item.user)){
                    worksetData[item.user].push(item);
                } else {
                    worksetData[item.user] = [item];
                }
            });

            allData.synchTimes.forEach(function (item) {
                if(!item.user) return;

                if(worksetData.hasOwnProperty(item.user)){
                    var data = worksetData[item.user].find(function (date) {
                        return Math.abs(new Date(date.createdOn) - new Date(item.createdOn)) < 10000;
                    });
                    if(data){
                        item['worksets'] = parseFloat((data.opened * 100) / (data.closed + data.opened)).toFixed(0) + '%';
                        item['worksetPercentage'] = (data.opened * 100) / (data.closed + data.opened);
                        tempData.push(item);
                    }
                }
            });
        }

        vm.tableData = tempData;
    }

    vm.setTableDataType = function (type) {
        vm.selectedTableData = type;
        setTableData(vm.selectedTableData);
    };

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
}