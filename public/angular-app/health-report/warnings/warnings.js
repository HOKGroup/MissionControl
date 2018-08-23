/**
 * Created by konrad.sobon on 2018-08-23.
 */
angular.module('MissionControlApp').controller('WarningsController', WarningsController);

function WarningsController($routeParams, HealthReportFactory){
    var vm = this;
    this.$onInit = function () {
        vm.projectId = $routeParams.projectId;
        vm.WarningData = this.processed;
        vm.showTimeSettings = true;
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
                if (!result){
                    console.log("Given date range contains no data.")
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