var app = angular.module('MissionControlApp');

    app.controller('FamilyStatsController', FamilyStatsController);

function FamilyStatsController($routeParams){
    var vm = this;
    vm.projectId = $routeParams.projectId;
    vm.sortType = "name"; // table sort param
    vm.sortReverse = false; // table sort param
    vm.FamilyData = this.processed;
    var allData = this.full;
    vm.AllFamilies = allData.familyStats[allData.familyStats.length - 1].suspectFamilies;
    vm.TaskFamily = {};

    vm.evaluateFamily = function (f){
        var score = 0;
        if(f.sizeValue > 1000000) score++;
        if(f.name.indexOf('_HOK_I') === -1 && f.name.indexOf('_HOK_M') === -1) score++;
        if(f.instances === 0) score++;
        return score;
    };

    vm.dataTableOpt = {
        "aLengthMenu": [[10, 50, 100,-1], [10, 50, 100,'All']]
    };

    vm.ShowTaskDialog = function(familyInfo){
        vm.TaskFamily = familyInfo;
        vm.Recipient = "konrad.sobon";
    };

    vm.SubmitTask = function(){
        var formSubmitted = true;
    }
}
