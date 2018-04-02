angular.module('MissionControlApp').controller('ViewStatsController', ViewStatsController);

function ViewStatsController($routeParams){
    var vm = this;
    this.$onInit = function () {
        vm.projectId = $routeParams.projectId;
        vm.FamilyData = this.processed;
        vm.d3ViewStatsData = this.full;
        
        vm.ViewKeys = ["totalViews", "viewsOnSheet"]; // chart 1
        vm.ScheduleKeys = ["totalSchedules", "schedulesOnSheet"]; // chart2
        vm.d3GoalLine = null;
    };
}