angular.module('MissionControlApp').controller('ViewStatsController', ViewStatsController);

function ViewStatsController($routeParams){
    var vm = this;
    vm.projectId = $routeParams.projectId;
    vm.FamilyData = this.processed;
    var allData = this.full;
    vm.d3ViewStatsData = allData.viewStats;
    vm.ViewKeys = ["totalViews", "viewsOnSheet"]; // chart 1
    vm.ScheduleKeys = ["totalSchedules", "schedulesOnSheet"]; // chart2
    vm.d3GoalLine = null;
}