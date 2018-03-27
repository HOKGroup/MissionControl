/**
 * Created by konrad.sobon on 2018-03-15.
 */
angular.module('MissionControlApp').controller('StyleStatsController', StyleStatsController);

function StyleStatsController($routeParams, DTColumnDefBuilder, DTOptionsBuilder, DTColumnBuilder, UtilityService){
    var vm = this;
    this.$onInit = function () {
        vm.projectId = $routeParams.projectId;
        vm.StylesData = this.processed;
        var allData = this.full;

        var index = allData.styleStats.length - 1;
        vm.DimensionSegmentStats = allData.styleStats[index].dimSegmentStats;
        vm.DimensionStats = allData.styleStats[index].dimStats;
        vm.TextStats = allData.styleStats[index].textStats;

        // set table options for dimension segments
        vm.dtOptions = {
            paginationType: 'simple_numbers',
            lengthMenu: [[10, 25, 50, 100, -1], [10, 25, 50, 100, 'All']],
            stateSave: false,
            deferRender: true
        };

        vm.dtColumnDefs = [
            DTColumnDefBuilder.newColumnDef(0), //value
            DTColumnDefBuilder.newColumnDef(1), //value override
            DTColumnDefBuilder.newColumnDef(2), //is locked
            DTColumnDefBuilder.newColumnDef(3), //view type
            DTColumnDefBuilder.newColumnDef(4) //view id
        ];

        // set table options for dimension types
        vm.dtInstance1 = {};
        vm.dtOptions2 = DTOptionsBuilder.newOptions()
            .withOption('data', vm.DimensionStats)
            .withPaginationType('simple_numbers')
            .withDisplayLength(10)
            .withOption('order', [0, 'asc'])
            .withOption('lengthMenu', [[10, 25, 50, 100, -1],[10, 25, 50, 100, 'All']])
            .withDataProp('data')
            .withOption('rowCallback', function (row, data, index) {
                if (data.instances === 0){
                    row.className = row.className + ' bg-warning';
                }
            })
            // (Konrad) We need to style the columns ourselves otherwise they look .net-ish
            .withOption('initComplete', function() {
                $('.dataTables_length').addClass('col-md-7 no-padding');
                $('.dataTables_filter').addClass('col-md-4 no-padding');
                $('.dt-buttons').removeClass('dt-buttons').addClass('col-md-1 no-padding');
                $('.dt-button').removeClass('dt-button');
            })
            .withButtons([
                {
                    extend: 'csv',
                    title : 'DimensionTypes' + '.xlsx',
                    text: 'Excel',
                    exportOptions: { columns:[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] },
                    className: 'btn btn-sm btn-default'
                }
            ]);

        vm.dtColumns2 = [
            DTColumnBuilder.newColumn('name')
                .withTitle('Name')
                .withOption('className', 'details-control pointer')
                .withOption('width', '50%'),
            DTColumnBuilder.newColumn('styleType')
                .withTitle('Type')
                .withOption('width', '15%'),
            DTColumnBuilder.newColumn('instances')
                .withTitle('Count')
                .withOption('className', 'text-center')
                .withOption('width', '10%'),
            DTColumnBuilder.newColumn('usesProjectUnits')
                .withTitle('Uses PU')
                .withOption('className', 'text-center')
                .withOption('width', '15%')
                .renderWith(stringFromBool),
            DTColumnBuilder.newColumn('textSizeString')
                .withTitle('Size')
                .withOption('className', 'text-center')
                .withOption('width', '10%'),
            DTColumnBuilder.newColumn('bold').withTitle('Bold').notVisible(),
            DTColumnBuilder.newColumn('italic').withTitle('Italic').notVisible(),
            DTColumnBuilder.newColumn('leaderType').withTitle('Leader Type').notVisible(),
            DTColumnBuilder.newColumn('lineWeight').withTitle('Line Weight').notVisible(),
            DTColumnBuilder.newColumn('textFont').withTitle('Font').notVisible(),
            DTColumnBuilder.newColumn('textSizeString').withTitle('Size').notVisible(),
            DTColumnBuilder.newColumn('underline').withTitle('Underline').notVisible()
        ];

        // set table options for dimension types
        vm.dtInstance2 = {};
        vm.dtOptions3 = DTOptionsBuilder.newOptions()
            .withOption('data', vm.TextStats)
            .withPaginationType('simple_numbers')
            .withDisplayLength(10)
            .withOption('order', [0, 'asc'])
            .withOption('lengthMenu', [[10, 25, 50, 100, -1],[10, 25, 50, 100, 'All']])
            .withDataProp('data')
            .withOption('rowCallback', function (row, data, index) {
                if (data.instances === 0){
                    row.className = row.className + ' bg-warning';
                }
            })
            // (Konrad) We need to style the columns ourselves otherwise they look .net-ish
            .withOption('initComplete', function() {
                console.log("callback method for init");
                $('.dataTables_length').addClass('col-md-7 no-padding');
                $('.dataTables_filter').addClass('col-md-4 no-padding');
                $('.dt-buttons').removeClass('dt-buttons').addClass('col-md-1 no-padding');
                $('.dt-button').removeClass('dt-button');
            })
            .withButtons([
                {
                    extend: 'csv',
                    title : 'TextTypes' + '.xlsx',
                    text: 'Excel',
                    exportOptions: { columns:[0, 1, 2, 3, 5, 6, 7, 8, 9, 10] },
                    className: 'btn btn-sm btn-default'
                }
            ]);

        vm.dtColumns3 = [
            DTColumnBuilder.newColumn('name')
                .withTitle('Name')
                .withOption('className', 'details-control3 pointer')
                .withOption('width', '50%'),
            DTColumnBuilder.newColumn('instances')
                .withTitle('Count')
                .withOption('className', 'text-center')
                .withOption('width', '10%'),
            DTColumnBuilder.newColumn('textFont')
                .withTitle('Font')
                .withOption('className', 'text-center')
                .withOption('width', '20%'),
            DTColumnBuilder.newColumn('textSizeString')
                .withTitle('Size')
                .withOption('className', 'text-center')
                .withOption('width', '10%')
                .withOption('orderData', 4),
            DTColumnBuilder.newColumn('textSize')
                .withTitle('Size')
                .withOption('className', 'text-center')
                .notVisible(),
            DTColumnBuilder.newColumn('color')
                .withTitle('Color')
                .withOption('className', 'text-center')
                .withOption('width', '10%')
                .renderWith(renderColor),
            DTColumnBuilder.newColumn('bold').withTitle('Bold').notVisible(),
            DTColumnBuilder.newColumn('italic').withTitle('Italic').notVisible(),
            DTColumnBuilder.newColumn('leaderArrowhead').withTitle('Leader Arrowhead').notVisible(),
            DTColumnBuilder.newColumn('lineWeight').withTitle('Line Weight').notVisible(),
            DTColumnBuilder.newColumn('underline').withTitle('Underline').notVisible()
        ];

        /**
         * Converts bool to string true=Yes, false=No
         * @param value
         * @returns {string}
         */
        function stringFromBool(value){
            return value ? "Yes" : "No";
        }

        /**
         * Custom renderer to convert Array[r,g,b] to #HexColor
         * @param data
         * @returns {string}
         */
        function renderColor(data) {
            var colorHex = UtilityService.rgbToHex(data[0], data[1], data[2]);
            return ' <i class="fa fa-square" style="color: ' + colorHex + '"></i>';
        }

        /**
         * Formatting function to add table with details about Dimension Type.
         * @param d
         * @returns {*}
         */
        var format = function ( d ) {
            // `d` is the original data object for the row
            if (!d) return '';
            return '<table cellpadding="5" cellspacing="0" border="0" style="padding-left:100px;">'+
                '<tr>'+
                '<td style="padding-left: 25px">Type Name:</td>'+
                '<td><b>' + d.name + '</b></td>'+
                '<td></td>'+
                '</tr>'+
                '<tr>'+
                '<td style="padding-left: 25px">Type:</td>'+
                '<td><b>'+ d.styleType + '</b></td>'+
                '<td></td>'+
                '</tr>'+
                '<tr>'+
                '<td style="padding-left: 25px">Count:</td>'+
                '<td><b>' + d.instances + '</b></td>'+
                '<td></td>'+
                '</tr>'+
                '<tr>'+
                '<td style="padding-left: 25px">Uses Project Units:</td>'+
                '<td><b>'+ stringFromBool(d.usesProjectUnits) + '</b></td>'+
                '<td></td>'+
                '</tr>'+
                '<tr>'+
                '<td style="padding-left: 25px">Bold:</td>'+
                '<td><b>'+ stringFromBool(d.bold) + '</b></td>'+
                '<td></td>'+
                '</tr>'+
                '<tr>'+
                '<td style="padding-left: 25px">Italic:</td>'+
                '<td><b>'+ stringFromBool(d.italic) + '</b></td>'+
                '<td></td>'+
                '</tr>'+
                '<tr>'+
                '<td style="padding-left: 25px">Leader Type:</td>'+
                '<td><b>'+ d.leaderType + '</b></td>'+
                '<td></td>'+
                '</tr>'+
                '<tr>'+
                '<td style="padding-left: 25px">Line Weight:</td>'+
                '<td><b>'+ d.lineWeight + '</b></td>'+
                '<td></td>'+
                '</tr>'+
                '<tr>'+
                '<td style="padding-left: 25px">Font:</td>'+
                '<td><b>'+ d.textFont + '</b></td>'+
                '<td></td>'+
                '</tr>'+
                '<tr>'+
                '<td style="padding-left: 25px">Size:</td>'+
                '<td><b>'+ d.textSizeString + '</b></td>'+
                '<td></td>'+
                '</tr>'+
                '<tr>'+
                '<td style="padding-left: 25px">Underline:</td>'+
                '<td><b>'+ stringFromBool(d.underline) + '</b></td>'+
                '<td></td>'+
                '</tr>'+
                '</table>';
        };

        /**
         * Formatting function to add table with details about Text Type.
         * @param d
         * @returns {*}
         */
        var format3 = function ( d ) {
            // `d` is the original data object for the row
            if (!d) return '';
            var colorHex = UtilityService.rgbToHex(d.color[0], d.color[1], d.color[2]);
            return '<table cellpadding="5" cellspacing="0" border="0" style="padding-left:100px;">'+
                '<tr>'+
                '<td style="padding-left: 25px">Type Name:</td>'+
                '<td><b>' + d.name + '</b></td>'+
                '<td></td>'+
                '</tr>'+
                '<tr>'+
                '<td style="padding-left: 25px">Count:</td>'+
                '<td><b>' + d.instances + '</b></td>'+
                '<td></td>'+
                '</tr>'+
                '<tr>'+
                '<td style="padding-left: 25px">Font:</td>'+
                '<td><b>'+ d.textFont + '</b></td>'+
                '<td></td>'+
                '</tr>'+
                '<tr>'+
                '<td style="padding-left: 25px">Size:</td>'+
                '<td><b>'+ d.textSizeString + '</b></td>'+
                '<td></td>'+
                '</tr>'+
                '<tr>'+
                '<td style="padding-left: 25px">Color:</td>'+
                '<td><i class="fa fa-square" style="color: ' + colorHex + '"></i></td>'+
                '<td></td>'+
                '</tr>'+
                '<tr>'+
                '<td style="padding-left: 25px">Bold:</td>'+
                '<td><b>'+ stringFromBool(d.bold) + '</b></td>'+
                '<td></td>'+
                '</tr>'+
                '<tr>'+
                '<td style="padding-left: 25px">Italic:</td>'+
                '<td><b>'+ stringFromBool(d.italic) + '</b></td>'+
                '<td></td>'+
                '</tr>'+
                '<tr>'+
                '<td style="padding-left: 25px">Leader Arrowhead:</td>'+
                '<td><b>'+ d.leaderArrowhead + '</b></td>'+
                '<td></td>'+
                '</tr>'+
                '<tr>'+
                '<td style="padding-left: 25px">Line Weight:</td>'+
                '<td><b>'+ d.lineWeight + '</b></td>'+
                '<td></td>'+
                '</tr>'+
                '<tr>'+
                '<td style="padding-left: 25px">Underline:</td>'+
                '<td><b>'+ stringFromBool(d.underline) + '</b></td>'+
                '<td></td>'+
                '</tr>'+
                '</table>';
        };

        /**
         * Sorts Table by date.
         * @param item
         * @returns {Date}
         */
        vm.sortDate = function (item) {
            return new Date(item.createdOn);
        };

        $('body').on('click', '.details-control', function() {
            var tr = $(this).closest('tr');
            var row = vm.dtInstance1.DataTable.row( tr );
            if ( row.child.isShown() ) {
                // This row is already open - close it
                row.child.hide();
                tr.removeClass('shown');
            }
            else {
                // Open this row
                row.child( format(row.data()) ).show();
                tr.addClass('shown');
            }
        }).on('click', '.details-control3', function() {
            var tr = $(this).closest('tr');
            var row = vm.dtInstance2.DataTable.row( tr );
            if ( row.child.isShown() ) {
                // This row is already open - close it
                row.child.hide();
                tr.removeClass('shown');
            }
            else {
                // Open this row
                row.child( format3(row.data()) ).show();
                tr.addClass('shown');
            }
        });
    };
}