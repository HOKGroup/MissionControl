/**
 * Created by konrad.sobon on 2018-08-23.
 */
angular.module('MissionControlApp').controller('WarningsController', WarningsController);

function WarningsController($routeParams, WarningsFactory, HealthReportFactory, UtilityService, DTOptionsBuilder, DTColumnBuilder, $scope){
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
            createTable();
        });

        function createTable() {
            vm.dtInstance = {};
            vm.dtOptions = DTOptionsBuilder.fromFnPromise(function () {
                return new Promise(function(resolve, reject){
                    if (!vm.openWarnings) reject();
                    else resolve(vm.openWarnings);
                });
            }).withPaginationType('simple_numbers')
                .withDisplayLength(15)
                .withOption('order', [0, 'desc'])
                .withOption('deferRender', true)
                .withOption('lengthMenu', [[15, 25, 50, 100, -1],[15, 25, 50, 100, 'All']]);

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
        }

        setChartData();

        //region Utilities

        /**
         *
         */
        function setChartData(){
            var data = vm.WarningData.warningStats.reduce(function (data, item) {
                var key = item.createdAt.split('T')[0];
                var created = (data[key] || (data[key] = {'date': key, 'added': 0, 'removed': 0}));
                created['added'] += 1;

                if(!item.isOpen){
                    var key1 = item.closedAt.split('T')[0];
                    var closed = (data[key1] || (data[key1] = {'date': key1, 'added': 0, 'removed': 0}));
                    closed['removed'] -= 1;
                }

                return data
            }, {});

            // (Konrad) Set data for the histogram chart. IE doesn't support Object.values
            vm.chartsData = Object.keys(data).map(function(item) { return data[item]; });
            vm.chartsData.sort(function(a,b){
                return new Date(a.date) - new Date(b.date);
            }); // sort in reverse a-b

            // (Konrad) Set data for the table.
            vm.openWarnings = vm.WarningData.warningStats.filter(function (item) {
                return item.isOpen;
            });
        }

        //endregion

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
                centralPath: vm.WarningData.warningStats[0].centralPath
            };
            HealthReportFactory.processWarningStats(data, function (result) {
                if (!result) console.log("Given date range contains no data.");

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
    };
}