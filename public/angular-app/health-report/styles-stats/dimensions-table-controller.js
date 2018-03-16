/**
 * Created by konrad.sobon on 2018-03-16.
 */
angular.module('MissionControlApp').controller('DimensionsTableController', DimensionsTableController);

function DimensionsTableController(){
    var vm = this;
    vm.DimensionStats = this.data;

    var dtInstance;
    DTInstances.getLast().then(function(inst) {
        dtInstance = inst;
    });

    // set table options for dimension types
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('data', vm.DimensionStats)
        .withPaginationType('full_numbers')
        .withDisplayLength(10)
        .withOption('order', [0, 'asc'])
        .withOption('lengthMenu', [[10, 25, 50, 100, -1],[10, 25, 50, 100, 'All']])
        .withDataProp('data')
        .withOption('rowCallback', function (row, data, index) {
            if (data.instances === 0){
                row.className = row.className + ' bg-warning';
            }
        });

    vm.dtColumns = [
        DTColumnBuilder.newColumn('name')
            .withTitle('Name')
            .withOption('className', 'details-control pointer')
            .withOption('width', '40%'),
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
            .withOption('width', '15%'),
        DTColumnBuilder.newColumn('textFont')
            .withTitle('Font')
            .withOption('className', 'text-center')
            .withOption('width', '10%'),
        DTColumnBuilder.newColumn('textSize')
            .withTitle('Size')
            .withOption('className', 'text-center')
            .withOption('width', '10%')
    ];

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
            '<td style="padding-left: 25px">Instances:</td>'+
            '<td><b>' + d.instances + '</b></td>'+
            '<td></td>'+
            '</tr>'+
            '<tr>'+
            '<td style="padding-left: 25px">Uses Project Units:</td>'+
            '<td><b>'+ d.usesProjectUnits+ '</b></td>'+
            '<td></td>'+
            '</tr>'+
            '<tr>'+
            '<td style="padding-left: 25px">Bold:</td>'+
            '<td><b>'+ d.bold + '</b></td>'+
            '<td></td>'+
            '</tr>'+
            '<tr>'+
            '<td style="padding-left: 25px">Italic:</td>'+
            '<td><b>'+ d.italic + '</b></td>'+
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
            '<td><b>'+ d.textSize + '</b></td>'+
            '<td></td>'+
            '</tr>'+
            '<tr>'+
            '<td style="padding-left: 25px">Underline:</td>'+
            '<td><b>'+ d.underline + '</b></td>'+
            '<td></td>'+
            '</tr>'+
            '</table>';
    };

    $('body').on('click', '.details-control', function() {
        var tr = $(this).closest('tr');
        var row = dtInstance.DataTable.row( tr );
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
    });
}