angular.module('MissionControlApp').controller('LinkStatsController', LinkStatsController);

function LinkStatsController($routeParams){
    var vm = this;
    vm.projectId = $routeParams.projectId;
    vm.LinkData = this.processed;
    vm.d3ViewStatsData = this.full.linkStats;
    vm.StylesKeys = ["totalDwgStyles", "totalImportedStyles"];
    vm.d3GoalLine = {name: "Goal", value: 50}
}