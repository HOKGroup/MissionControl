/**
 * Created by konrad.sobon on 2018-04-03.
 */
angular.module('MissionControlApp').controller('TimeRangeSelectorController', TimeRangeSelectorController);

function TimeRangeSelectorController(){
    var vm = this;
    this.$onInit = function () {
        vm.loading = false;
        vm.dtFrom = new Date();
        vm.dtFrom.setMonth(vm.dtFrom.getMonth() - 1);
        vm.dtTo = new Date();
        vm.format = 'dd-MMMM-yyyy';
        vm.dateOptions = {
            formatYear: 'yy',
            maxDate: new Date(2020, 5, 22),
            minDate: new Date(2015, 5, 22),
            startingDay: 1
        };
        vm.popup1 = { opened: false };
        vm.popup2 = { opened: false };

        /**
         * Opens pop-up date pickers.
         * @param popup
         */
        vm.openDatePicker = function(popup) {
            popup === 'from' ? vm.popup1.opened = true : vm.popup2.opened = true;
        };

        /**
         * Call defined hide function that will hide the div.
         */
        vm.hide = function () {
            this.onHide()
        };

        /**
         * Call defined filter function with selected Date Range.
         */
        vm.filterDate = function () {
            this.onFilter({date: {
                from: vm.dtFrom,
                to: vm.dtTo
            }});
        };
    };
}