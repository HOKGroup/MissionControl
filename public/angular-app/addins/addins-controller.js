angular.module('MissionControlApp').controller('AddinsController', AddinsController);

function AddinsController(AddinsFactory) {
    var vm = this;
    vm.SelectedYear = '2018';
    vm.SelectedPlugin = "";
    vm.UserDetails = [];
    vm.YearsAggregate = [];
    vm.MainChartColor = "steelblue";
    vm.UserChartColor = "#d9534f";

    getAddinsData();

    function getAddinsData() {
        AddinsFactory
            .getAllLogs()
            .then(function(response){
                if(!response) return;
                if(!response.data[0]) return;
                vm.AddinLogs = response.data[0].usageLogs;

                vm.ProcessData('2018');

            },function(error){
                console.log("Error retrieving Usage Logs: ", error)
            });
    }

    vm.OnClick = function(item){
        // (Konrad) First we need to get just plugins that match the name/year filters per user
        // Used for Bar Chart
        var output = vm.AddinLogs.reduce(function (sums, entry) {
            if(entry.pluginName === item.name && entry.revitVersion === vm.SelectedYear){
                sums[entry.user] = (sums[entry.user] || 0) + 1;
            }
            return sums;
        }, {});

        // (Konrad) Second we need to get total for each version of a given plugin
        // Used for Donut Chart
        var output1 = vm.AddinLogs.reduce(function (sums, entry) {
            if(entry.pluginName === item.name){
                sums[entry.revitVersion] = (sums[entry.revitVersion] || 0) + 1;
            }
            return sums;
        }, {});

        vm.YearsAggregate = getTotals(output1);
        vm.UserDetails = getTotals(output);
        vm.SelectedPlugin = item.name;
    };

    vm.ProcessData = function (year){
        var output = vm.AddinLogs.reduce(function(sums,entry){
            if(entry.revitVersion === year){
                sums[entry.pluginName] = (sums[entry.pluginName] || 0) + 1;
            }
            return sums;
        },{});

        var list = getTotals(output);
        list.sort(function (a, b){
            var x = a.name.toLowerCase();
            var y = b.name.toLowerCase();
            return x < y ? -1 : x > y ? 1 : 0;
        }); // sorted by name

        vm.d3HorizontalData = list;
        vm.SelectedYear = year;
        vm.UserDetails = [];
        vm.YearsAggregate
    };

    // Utility used to convert data totals to proper format
    function getTotals(data){
        var list = [];
        for (var k in data){
            if(data.hasOwnProperty(k)){
                list.push({name: k, count: data[k]})
            }
        }
        return list;
    }
}