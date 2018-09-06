angular.module('MissionControlApp').controller('WorksetsController', WorksetsController);

function WorksetsController($routeParams, UtilityService, HealthReportFactory){
    var vm = this;
    this.$onInit = function () {
        vm.projectId = $routeParams.projectId;
        vm.WorksetData = this.processed;
        vm.UserData = [];
        vm.d3GoalLine = {name: "Goal", value: 50}; // reference line
        vm.showTimeSettings = false;
        vm.loading = false;

        console.log(vm.WorksetData.worksetOpenedData);

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
                centralPath: vm.WorksetData.worksetStats.centralPath
            };
            HealthReportFactory.processWorksetStats(data, function (result) {
                vm.WorksetData = result;
                vm.loading = false;

                vm.UserData = [];
                vm.SelectedUser = '';
                vm.WorksetsOpenedType = '';
            });
        };

        /**
         * Toggles Date Time picker div on/off.
         */
        vm.toggleTimeSettings = function() {
            vm.showTimeSettings = !vm.showTimeSettings;
        };

        /**
         * Returns formatted string for time.
         * @param item
         * @returns {*}
         */
        vm.formatDuration = function(item){
            return UtilityService.formatPercentage(item);
        };

        /**
         * Handler for user clicking on one of the Worksets Chart's bars.
         * It filters data just for that user and type (onOpend/onSynched).
         * @param item
         */
        vm.d3OnClick = function(item) {
            var allData;
            if(item.name === "onOpened") {
                allData = vm.WorksetData.worksetStats.onOpened;
            } else {
                allData = vm.WorksetData.worksetStats.onSynched;
            }

            var userData = [];
            allData.forEach(function (d) {
                if(d.user === item.user){
                    userData.push({
                        name: d.user,
                        value: (d.opened * 100) / (d.closed + d.opened),
                        createdOn: d.createdOn
                    })
                }
            });

            vm.UserData = userData;
            vm.SelectedUser = item.user;
            vm.WorksetsOpenedType = item.name;
        };
    };
}