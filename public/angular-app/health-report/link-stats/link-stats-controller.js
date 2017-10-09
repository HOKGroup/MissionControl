angular.module('MissionControlApp').controller('LinkStatsController', LinkStatsController);

function LinkStatsController($routeParams, DTColumnDefBuilder){
    var vm = this;
    vm.projectId = $routeParams.projectId;
    vm.LinkData = this.processed;
    vm.d3ViewStatsData = this.full.linkStats;
    vm.StylesKeys = ["totalDwgStyles", "totalImportedStyles"];
    vm.d3GoalLine = {name: "Goal", value: 50};

    var importCount = 0;
    this.processed.importedFiles.forEach(function(item){
        if(!item.isLinked) importCount++;
    });

    vm.ImportCount = importCount;

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
}