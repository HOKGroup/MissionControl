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
         *
         * @param item
         */
        vm.moveView = function(item) {
            vm.workingViews = item.value;
            $scope.$apply();
        };

        /**
         *
         */
        vm.outView = function () {
            vm.workingViews = v.totalViews - v.viewsOnSheet;
            $scope.$apply();
        };

        /**
         *
         */
        vm.outSchedule = function () {
            vm.workingSchedules = v.totalSchedules - v.schedulesOnSheet;
            $scope.$apply();
        };

        /**
         *
         * @param item
         */
        vm.moveSchedule = function(item) {
            vm.workingSchedules = item.value;
            $scope.$apply();
        };

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
    };
}