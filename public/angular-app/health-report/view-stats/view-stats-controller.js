angular.module('MissionControlApp').controller('ViewStatsController', ViewStatsController);

function ViewStatsController($routeParams, HealthReportFactory){
    var vm = this;
    this.$onInit = function () {
        vm.projectId = $routeParams.projectId;
        vm.FamilyData = this.processed;
        vm.d3ViewStatsData = this.full;
        vm.showTimeSettings = false;

        /**
         * Callback method for Date Time Range selection.
         * @param date
         * @constructor
         */
        vm.OnFilter = function (date) {
            HealthReportFactory.processViewStats(vm.d3ViewStatsData._id, date, function (result) {
                vm.FamilyData = result;
                vm.d3ViewStatsData = result.viewStats;
            });
        };

        /**
         * Toggles Date Time picker div on/off.
         */
        vm.toggleTimeSettings = function() {
            vm.showTimeSettings = !vm.showTimeSettings;
        };

        vm.ViewKeys = ["totalViews", "viewsOnSheet"]; // chart 1
        vm.ScheduleKeys = ["totalSchedules", "schedulesOnSheet"]; // chart2
        vm.d3GoalLine = null;
    };
}