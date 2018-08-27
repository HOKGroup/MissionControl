/**
 * Created by konrad.sobon on 2018-08-23.
 */
angular.module('MissionControlApp').controller('WarningsController', WarningsController);

function WarningsController($routeParams, HealthReportFactory){
    var vm = this;
    this.$onInit = function () {
        vm.projectId = $routeParams.projectId;
        vm.WarningData = this.processed;
        vm.showTimeSettings = false;
        vm.loading = false;
        vm.chartsData = [];

        setChartData();

        //region Utilities

        /**
         *
         */
        function setChartData(){
            var data = vm.WarningData.warningStats.reduce(function (data, item) {
                var key = item.updatedAt.split('T')[0];
                var current = (data[key] || (data[key] = {date: key, added: 0, removed: 0}));
                if(item.isOpen) current['added'] += 1;
                else current['removed'] -= 1;
                return data
            }, {});

            vm.chartsData = Object.values(data).reverse();
        }

        //endregion

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