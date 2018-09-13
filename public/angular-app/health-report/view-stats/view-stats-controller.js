angular.module('MissionControlApp').controller('ViewStatsController', ViewStatsController);

function ViewStatsController($routeParams, HealthReportFactory, ngToast){
    var vm = this;
    var toasts = [];
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
            var data = {
                from: date.from,
                to: date.to,
                centralPath: vm.ViewData.viewStats.centralPath
            };
            HealthReportFactory.processViewStats(data, function (result) {
                if (!result || result.viewStats.viewStats.length < 2){
                    toasts.push(ngToast.warning({
                        dismissButton: true,
                        dismissOnTimeout: true,
                        timeout: 4000,
                        newestOnTop: true,
                        content: 'No data found for these dates.'
                    }));
                }

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