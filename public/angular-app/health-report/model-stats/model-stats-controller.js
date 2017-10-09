angular.module('MissionControlApp').controller('ModelStatsController', ModelStatsController);

function ModelStatsController($routeParams, UtilityService){
    var vm = this;
    vm.projectId = $routeParams.projectId;
    vm.ModelData = this.processed;

    var allData = this.full;
    vm.SessionLogs = allData.sessionLogs;
    vm.ModelSizes = allData.modelSizes;
    vm.ModelOpenTimes = allData.openTimes;
    vm.ModelSynchTimes = allData.synchTimes;

    vm.formatValue = function(item){
        return UtilityService.formatNumber(item);
    };

    vm.formatDuration = function(item){
        return UtilityService.formatDuration(item);
    };
}