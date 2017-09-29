angular.module('MissionControlApp').controller('LinkStatsController', LinkStatsController);

function LinkStatsController($routeParams){
    var vm = this;
    vm.projectId = $routeParams.projectId;
    vm.LinkData = this.processed;
    vm.d3ViewStatsData = this.full.linkStats;
    vm.StylesKeys = ["totalDwgStyles", "totalImportedStyles"];
    vm.d3GoalLine = {name: "Goal", value: 50}

    var importCount = 0;
    this.processed.importedFiles.forEach(function(item){
        if(!item.isLinked) importCount++;
    });

    vm.ImportCount = importCount;
}