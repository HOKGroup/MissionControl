angular.module('MissionControlApp').controller('LinkStatsController', LinkStatsController);

function LinkStatsController($routeParams, DTColumnDefBuilder, HealthReportFactory){
    var vm = this;
    this.$onInit = function () {
        vm.projectId = $routeParams.projectId;
        vm.LinkData = this.processed;
        vm.StylesKeys = ["totalDwgStyles", "totalImportedStyles"];
        vm.d3GoalLine = {name: "Goal", value: 50};
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
                centralPath: vm.LinkData.linkStats.centralPath
            };
            HealthReportFactory.processLinkStats(data, function (result) {
                if (!result){
                    console.log("Given date range contains no data.")
                }
                vm.LinkData = result;
                vm.loading = false;
            });
        };

        /**
         * Toggles Date Time picker div on/off.
         */
        vm.toggleTimeSettings = function() {
            vm.showTimeSettings = !vm.showTimeSettings;
        };

        vm.dtOptions1 = {
            paginationType: 'simple_numbers',
            lengthMenu: [[10, 25, 50, 100, -1], [10, 25, 50, 100, 'All']]
        };

        vm.dtColumnDefs1 = [
            DTColumnDefBuilder.newColumnDef(0), //index
            DTColumnDefBuilder.newColumnDef(1), //name
            DTColumnDefBuilder.newColumnDef(2), //qty
            DTColumnDefBuilder.newColumnDef(3), //view specific
            DTColumnDefBuilder.newColumnDef(4) // link import
        ];
    };
}