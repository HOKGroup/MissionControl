angular.module('MissionControlApp').controller('ViewStatsController', ViewStatsController);

function ViewStatsController($routeParams, HealthReportFactory){
    var vm = this;
    this.$onInit = function () {
        vm.projectId = $routeParams.projectId;
        vm.ViewData = this.processed;
        vm.showTimeSettings = false;
        vm.loading = false;

        /**
         * Callback method for Date Time Range selection.
         * @param date
         * @constructor
         */
        vm.OnFilter = function (date) {
            vm.loading = true;
            HealthReportFactory.processViewStats(vm.ViewData.viewStats._id, date, function (result) {
                vm.ViewData = result;
                vm.loading = false;
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