angular.module('MissionControlApp').controller('ModelStatsController', ModelStatsController);

function ModelStatsController($routeParams, UtilityService, DTColumnDefBuilder, DTInstances){
    var vm = this;
    vm.projectId = $routeParams.projectId;
    vm.ModelData = this.processed;

    var allData = this.full;
    vm.ModelSizes = allData.modelSizes;
    vm.ModelOpenTimes = allData.openTimes;

    var worksetData = {};
    allData.onOpened.forEach(function (item) {
        if(!item.user) return;

        if(worksetData.hasOwnProperty(item.user)){
            worksetData[item.user].push(item);
        } else {
            worksetData[item.user] = [item];
        }
    });

    vm.modelOpenTimes2 = [];
    allData.openTimes.forEach(function (item) {
        if(!item.user) return;

        if(worksetData.hasOwnProperty(item.user)){
            var data = worksetData[item.user].find(function (date) {
                return Math.abs(new Date(date.createdOn) - new Date(item.createdOn)) < 10000;
            });
            if(data){
                item['worksets'] = parseFloat((data.opened * 100) / (data.closed + data.opened)).toFixed(0) + '%';
                item['worksetPercentage'] = (data.opened * 100) / (data.closed + data.opened);
                vm.modelOpenTimes2.push(item);
            }
        } else {

        }
    });

    vm.ModelSynchTimes = allData.synchTimes;
    vm.selectedUser = "All";

    vm.users = Array.from(new Set(vm.ModelOpenTimes.map(function(item){
        return item.user;
    })));
    vm.users.unshift("All");

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

    var dtInstance;
    DTInstances.getLast().then(function(inst) {
        dtInstance = inst;
    });

    /**
     * Filters Model Open Time data for specific user only.
     * @param user
     */
    vm.setUserFilter = function (user) {
        vm.selectedUser = user;
        if(user === "All"){
            vm.ModelOpenTimes = allData.openTimes;
        } else {
            vm.ModelOpenTimes = allData.openTimes.filter(function (item) {
                return item.user === user;
            });
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