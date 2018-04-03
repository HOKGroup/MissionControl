angular.module('MissionControlApp').controller('WorksetsController', WorksetsController);

function WorksetsController($routeParams, UtilityService, HealthReportFactory){
    var vm = this;
    this.$onInit = function () {
        vm.projectId = $routeParams.projectId;
        vm.WorksetData = this.processed;
        vm.selectedWorkset = this.full;
        vm.UserData = [];
        vm.d3GoalLine = {name: "Goal", value: 50}; // reference line

        vm.loading = false;
        vm.dtFrom = null;
        vm.dtTo = null;
        vm.format = 'dd-MMMM-yyyy';
        vm.dateOptions = {
            formatYear: 'yy',
            maxDate: new Date(2020, 5, 22),
            minDate: new Date(2015, 5, 22),
            startingDay: 1
        };

        SetFilter();

        /**
         * Set filter dates.
         */
        function SetFilter() {
            vm.dtFrom = new Date();
            vm.dtFrom.setMonth(vm.dtFrom.getMonth() - 1);
            vm.dtTo = new Date();
        }

        /**
         * Filters Editing Records based on selected date range.
         */
        vm.filterDate = function () {
            vm.loading = true;
            var dateRange = {
                from: vm.dtFrom,
                to: vm.dtTo
            };

            HealthReportFactory.processWorksetStats(vm.selectedWorkset._id, dateRange, function (result) {
                vm.WorksetData = result;
                vm.selectedWorkset = result.worksetStats;
                vm.loading = false;
            });
        };

        vm.popup1 = {
            opened: false
        };

        vm.popup2 = {
            opened: false
        };

        /**
         * Opens pop-up date pickers.
         * @param popup
         */
        vm.openDatePicker = function(popup) {
            popup === 'from' ? vm.popup1.opened = true : vm.popup2.opened = true;
        };

        vm.showTimeSettings = false;
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
         *
         * @param item
         */
        vm.d3OnClick = function(item){
            var allData;
            if(item.name === "onOpened"){
                allData = vm.selectedWorkset.onOpened;
            }else{
                allData = vm.selectedWorkset.onSynched;
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
            // return userData;
            vm.UserData = userData;
            vm.SelectedUser = item.user;
            vm.WorksetsOpenedType = item.name;
        };
    };
}