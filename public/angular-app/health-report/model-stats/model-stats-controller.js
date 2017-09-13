angular.module('MissionControlApp').controller('ModelStatsController', ModelStatsController);

function ModelStatsController($routeParams){
    var vm = this;
    vm.projectId = $routeParams.projectId;
    vm.ModelData = this.processed;

    // (Konrad) Line chart Y-axis formatting arguments
    vm.FormatObjectSize = {
        specifier: ".0s", // decimal notation with an SI prefix, rounded to significant digits.
        multiplier: 1, // none
        suffix: "b" // bytes
    };

    vm.FormatObjectTime = {
        specifier: ".0r", // decimal notation, rounded to significant digits
        multiplier: 0.001, // convert from ms
        suffix: "s" // seconds
    };

    var allData = this.full;
    vm.SessionLogs = allData.sessionLogs;
    vm.ModelSizes = allData.modelSizes;
    vm.ModelOpenTimes = allData.openTimes;
    vm.ModelSynchTimes = allData.synchTimes;
}