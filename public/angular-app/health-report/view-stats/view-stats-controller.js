/**
 * Created by konrad.sobon on 2018-08-23.
 */
angular.module('MissionControlApp').controller('ViewStatsController', ViewStatsController);

function ViewStatsController($routeParams, HealthReportFactory, ngToast, $scope){
    var vm = this;
    var toasts = [];
    this.$onInit = function () {
        vm.projectId = $routeParams.projectId;
        vm.ViewData = this.processed;
        vm.showTimeSettings = false;
        vm.loading = false;

        var v = vm.ViewData.viewStats.viewStats[vm.ViewData.viewStats.viewStats.length - 1];
        vm.workingViews = v.totalViews - v.viewsOnSheet;
        vm.workingSchedules = v.totalSchedules - v.schedulesOnSheet;
        vm.viewsColor = vm.ViewData.bullets[0].bulletColor === 'badge progress-bar-danger'
            ? '#d9534f'
            : vm.ViewData.bullets[0].bulletColor === 'badge progress-bar-warning'
                ? '#f0ad4e'
                : '#5cb85c';
        vm.schedulesColor = vm.ViewData.bullets[1].bulletColor === 'badge progress-bar-danger'
            ? '#d9534f'
            : vm.ViewData.bullets[1].bulletColor === 'badge progress-bar-warning'
                ? '#f0ad4e'
                : '#5cb85c';

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

        /**
         * Callback method for view chart when mouse is moved.
         * Adjusts a label on a div.
         * @param item
         */
        vm.moveView = function(item) {
            vm.workingViews = item.value;
            $scope.$apply();
        };

        /**
         * Callback method for view chart when mouse leaves the chart.
         * Resets the label on a div to default value.
         */
        vm.outView = function () {
            vm.workingViews = v.totalViews - v.viewsOnSheet;
            $scope.$apply();
        };

        /**
         * Callback method for schedule chart when mouse is moved.
         * Adjusts a label on a div.
         */
        vm.outSchedule = function () {
            vm.workingSchedules = v.totalSchedules - v.schedulesOnSheet;
            $scope.$apply();
        };

        /**
         * Callback method for schedule chart when mouse leaves the chart.
         * Resets the label on a div to default value.
         * @param item
         */
        vm.moveSchedule = function(item) {
            vm.workingSchedules = item.value;
            $scope.$apply();
        };
    };
}