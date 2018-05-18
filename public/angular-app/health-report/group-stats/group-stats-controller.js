/**
 * Created by konrad.sobon on 2018-05-16.
 */
angular.module('MissionControlApp').controller('GroupStatsController', GroupStatsController);

function GroupStatsController(DTOptionsBuilder, DTColumnBuilder){
    var vm = this;
    this.$onInit = function () {
        vm.GroupData = this.processed;
        vm.showTimeSettings = false;
        vm.loading = false;


        // set table options for dimension types
        vm.dtInstance = {};
        vm.dtOptions = DTOptionsBuilder.fromFnPromise(function () {
            return getData()
        }).withPaginationType('simple_numbers')
            .withDisplayLength(10)
            .withOption('order', [0, 'asc'])
            .withOption('lengthMenu', [[10, 25, 50, 100, -1],[10, 25, 50, 100, 'All']])
            .withOption('rowCallback', function (row, data, index) {
                row.className = row.className + evaluateGroup(data);
            });

        vm.dtColumns = [
            DTColumnBuilder.newColumn('name')
                .withTitle('Name')
                .withOption('width', '50%'),
            DTColumnBuilder.newColumn('type')
                .withTitle('Type')
                .withOption('className', 'text-center')
                .withOption('width', '20%'),
            DTColumnBuilder.newColumn('instances')
                .withTitle('Instances')
                .withOption('className', 'text-center')
                .withOption('width', '15%')
                .renderWith(countFromArray),
            DTColumnBuilder.newColumn('memberCount')
                .withTitle('Member Count')
                .withOption('className', 'text-center')
                .withOption('width', '15%')
                .renderWith(memberCountFromValue)
        ];

        function evaluateGroup(item){
            if(item.instances.length <= 1) return ' bg-danger';
            else if (item.instances.length > 1 && item.instances.length <= 5) return ' bg-warning';
            else return ' table-info';
        }

        /**
         * Converts an array of instances into count.
         * @param value
         */
        function countFromArray(value){
            return value.length;
        }

        /**
         *
         * @param value
         * @returns {*}
         */
        function memberCountFromValue(value){
            if (value === 0) return '-';
            else return value;
        }

        /**
         * Retrieves data. We need a function that returns a promise here so that we can
         * use it with the datatables. It will also call this method when we call
         * dt.instance.reloadData() which helps when we do filtering.
         * @returns {*}
         */
        function getData() {
            return new Promise(function(resolve, reject){
                var data = vm.GroupData.groupStats.groupStats.groups;

                if (!data) reject();
                else resolve(data);
            });
        }
    }
}