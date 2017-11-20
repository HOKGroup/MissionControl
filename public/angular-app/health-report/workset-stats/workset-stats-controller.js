angular.module('MissionControlApp').controller('WorksetsController', WorksetsController);

function WorksetsController($routeParams, UtilityService){
    var vm = this;
    vm.projectId = $routeParams.projectId;
    vm.UserData = [];

    vm.formatDuration = function(item){
        return UtilityService.formatPercentage(item);
    };

    vm.WorksetData = this.processed;
    vm.selectedWorkset = this.full;
    vm.d3GoalLine = {name: "Goal", value: 50}; // reference line

    vm.d3OnClick = function(item){
        var allData;
        if(item.name === "onOpened"){
            allData = vm.selectedWorkset.onOpened;
        }else{
            allData = vm.selectedWorkset.onSynched;
        }

        var userData = [];
        allData.forEach(function (d) {
            if(d.user === item.user){
                userData.push({
                    name: d.user,
                    value: (d.opened * 100) / (d.closed + d.opened),
                    createdOn: d.createdOn
                })
            }
        });
        // return userData;
        vm.UserData = userData;
        vm.SelectedUser = item.user;
        vm.WorksetsOpenedType = item.name;
    };
}