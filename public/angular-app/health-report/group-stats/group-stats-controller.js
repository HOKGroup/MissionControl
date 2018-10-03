/**
 * Created by konrad.sobon on 2018-05-16.
 */
angular.module('MissionControlApp').controller('GroupStatsController', GroupStatsController);

function GroupStatsController($scope, DTOptionsBuilder, DTColumnBuilder){
    var vm = this;
    this.$onInit = function () {
        vm.GroupData = this.processed;
        vm.showTimeSettings = false;
        vm.loading = false;
        setSankeyData();

        /**
         * Since all health report components are initiated when data is finished loading
         * none of them are yet visible. The DOM has not yet loaded the divs etc. This means
         * that all divs have a width of 0 and table is initiated with that width as well.
         * By watching this variable we can detect when user selected to see this page.
         */
        $scope.$watch('vm.GroupData.show.value', function (newValue) {
            if(newValue) reloadTable();
        });

        //region Table

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

        /**
         * Row styling for groups based on count.
         * @param item
         * @returns {*}
         */
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
         * Replaces instance count with "-" for group that don't have any.
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

        /**
         * Method to recalculate data table contents and reload it.
         */
        function reloadTable() {
            if(vm.dtInstance) {vm.dtInstance.reloadData(false);}
            if(vm.dtInstance) {vm.dtInstance.rerender();}
        }

        //endregion

        //region Utilities

        /**
         * Processes Group data into format needed by a sankey diagram.
         */
        function setSankeyData(){
            var nodes = [];
            var links = [];
            var linkIndexes = {}; // { key: createdBy, index: index in nodes }

            vm.GroupData.groupStats.groupStats.groups.forEach(function (g) {
                if (g.instances.length === 0) return;

                nodes.push({ name: g.name }); //assumes that all group names are unique
                var targetIndex = nodes.length - 1;

                var tempLinks = {}; // { key: createdBy, source: userIndex, target: groupIndex, value: count }
                g.instances.forEach(function (i) {

                    // figure out source indices
                    var sourceIndex = -1;
                    if(linkIndexes.hasOwnProperty(i.createdBy)){
                        sourceIndex = linkIndexes[i.createdBy].index;
                    } else {
                        nodes.push({ name: i.createdBy });
                        sourceIndex = nodes.length - 1;
                        linkIndexes[i.createdBy] = {
                            index: sourceIndex
                        }
                    }

                    // increment the value
                    if (tempLinks.hasOwnProperty(i.createdBy)){
                        tempLinks[i.createdBy].value = tempLinks[i.createdBy].value + 1;
                    } else {
                        tempLinks[i.createdBy] = {
                            source: sourceIndex,
                            target: targetIndex,
                            value: 1
                        }
                    }
                });

                for (var key in tempLinks){
                    if (tempLinks.hasOwnProperty(key)){
                        links.push(tempLinks[key])
                    }
                }
            });

            vm.sankeyData = {
                nodes: nodes,
                links: links
            };
        }

        //endregion
    }
}