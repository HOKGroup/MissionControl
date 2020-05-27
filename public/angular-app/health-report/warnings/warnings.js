/**
 * Created by konrad.sobon on 2018-08-23.
 */
angular.module('MissionControlApp').controller('WarningsController', WarningsController);

function WarningsController($routeParams, HealthReportFactory, DTOptionsBuilder, DTColumnBuilder, $scope){
    var vm = this;
    this.$onInit = function () {
        vm.projectId = $routeParams.projectId;
        vm.WarningData = this.processed;
        vm.showTimeSettings = false;
        vm.loading = false;
        vm.chartsData = [];
        vm.openWarnings = [];

        /**
         * Since all health report components are initiated when data is finished loading
         * none of them are yet visible. The DOM has not yet loaded the divs etc. This means
         * that all divs have a width of 0 and table is initiated with that width as well.
         * By watching this variable we can detect when user selected to see this page.
         */
        $scope.$watch('vm.WarningData.show.value', function (newValue) {
            if (newValue === true) createTable();
        });

        $scope.$watch('vm.WarningData.warningStats', function (newValue) {
            if (newValue && newValue.length > 0) setChartData();
        });


        /**
         * Creates Warnings Table
         */
        function createTable() {
            vm.dtInstance = {};
            vm.dtOptions = DTOptionsBuilder.newOptions()
                .withOption('ajax', {
                    url: '/api/v2/warnings/datatable',
                    type: 'POST',
                    data: { centralPath: vm.WarningData.centralPath }
                })
                .withDataProp('data')
                .withOption('processing', true)
                .withOption('serverSide', true)
                .withPaginationType('simple_numbers')
                .withOption('autoWidth', false)
                .withOption('lengthMenu', [[10, 50, 100, -1], [10, 50, 100, 'All']]);

            vm.dtColumns = [
                DTColumnBuilder.newColumn('createdAt')
                    .withTitle('Created At')
                    .withOption('width', '15%')
                    .renderWith(parseDateTime),
                DTColumnBuilder.newColumn('createdBy')
                    .withTitle('Created By')
                    .withOption('className', 'text-center')
                    .withOption('width', '25%'),
                DTColumnBuilder.newColumn('descriptionText')
                    .withTitle('Message')
                    .withOption('width', '60%')
            ];
        }

        /**
         * Callback method for Date Time Range selection.
         * @param date
         * @constructor
         */
        vm.OnFilter = function (date) {
            if(vm.WarningData.warningStats.length === 0) return;

            vm.loading = true;
            var data = {
                from: date.from,
                to: date.to,
                centralPath: vm.WarningData.centralPath
            };
            HealthReportFactory.processWarningStats(data, function (result) {
                if (!result) console.log('Given date range contains no data.');

                vm.loading = false;
                vm.WarningData = result;
                setChartData();
            });
        };

        /**
         * Toggles Date Time picker div on/off.
         */
        vm.toggleTimeSettings = function() {
            vm.showTimeSettings = !vm.showTimeSettings;
        };

        //region Utilities

        /**
         * Parses UTC Date into local date.
         * @param value
         * @returns {string}
         */
        function parseDateTime(value) {
            return new Date(value).toLocaleString('en-US', {
                year: '2-digit',
                month: '2-digit',
                day: '2-digit'
            });
        }

        /**
         *
         */
        function setChartData(){
            vm.chartsData = vm.WarningData.warningStats;
            vm.chartsData.sort(function(a,b){
                return new Date(a.date) - new Date(b.date);
            }); // sort in reverse a-b

        }

        //endregion
    };
}