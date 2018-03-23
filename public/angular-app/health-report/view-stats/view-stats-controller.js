angular.module('MissionControlApp').controller('ViewStatsController', ViewStatsController);

function ViewStatsController($routeParams){
    var vm = this;
    this.$onInit = function () {
        vm.FamilyData = this.processed;
        vm.AllData = this.full;

        vm.projectId = $routeParams.projectId;
        vm.d3ViewStatsData = vm.AllData.viewStats;
        vm.ViewKeys = ["totalViews", "viewsOnSheet"]; // chart 1
        vm.ScheduleKeys = ["totalSchedules", "schedulesOnSheet"]; // chart2
        vm.d3GoalLine = null;
    };
}