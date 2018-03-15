/**
 * Created by konrad.sobon on 2018-03-15.
 */
angular.module('MissionControlApp').controller('StyleStatsController', StyleStatsController);

function StyleStatsController($routeParams){
    var vm = this;
    vm.projectId = $routeParams.projectId;
    vm.StylesData = this.processed;
    // vm.FamilyData = this.processed;
    // var allData = this.full;
    // vm.d3ViewStatsData = allData.viewStats;
    // vm.ViewKeys = ["totalViews", "viewsOnSheet"]; // chart 1
    // vm.ScheduleKeys = ["totalSchedules", "schedulesOnSheet"]; // chart2
    // vm.d3GoalLine = null;
}