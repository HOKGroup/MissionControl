angular.module('MissionControlApp').controller('AddinsController', AddinsController);

function AddinsController(AddinsFactory) {
    var vm = this;
    vm.SelectedYear = '2018';
    vm.SelectedPlugin = "";
    vm.UserDetails = [];
    vm.YearsAggregate = [];
    vm.MainChartColor = "steelblue";
    vm.UserChartColor = "#d9534f";

    vm.officeFilters = [
        {name: "All", code: "All"},
        {name: "Atlanta", code: ["ATL"]},
        {name: "Beijing", code: ["BEI"]},
        {name: "St. Louis", code: ["BJC"]},
        {name: "Calgary", code: ["CAL"]},
        {name: "Chicago", code: ["CHI"]},
        {name: "Columbus", code: ["COL"]},
        {name: "Dallas", code: ["DAL"]},
        {name: "Doha", code: ["DOH"]},
        {name: "Dubai", code: ["DUB"]},
        {name: "Hong Kong", code: ["HK"]},
        {name: "Houston", code: ["HOU"]},
        {name: "Kansas City", code: ["KC"]},
        {name: "Los Angeles", code: ["LA"]},
        {name: "London", code: ["LON"]},
        {name: "New York", code: ["NY"]},
        {name: "Ottawa", code: ["OTT"]},
        {name: "Philadephia", code: ["PHI"]},
        {name: "Seattle", code: ["SEA"]},
        {name: "San Francisco", code: ["SF"]},
        {name: "Shanghai", code: ["SH"]},
        {name: "St. Louis", code: ["STL"]},
        {name: "Toronto", code: ["TOR"]},
        {name: "Tampa", code: ["TPA"]},
        {name: "Washington DC", code: ["WDC"]},
        {name: "Undefined", code: ["EMC", "SDC", "OSS", "LD", "LDC", ""]}
    ];

    vm.SelectedOffice = "All";

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

    vm.ProcessData = function (year){
        var output = vm.AddinLogs.reduce(function(sums,entry){
            if(entry.revitVersion === year){
                sums[entry.pluginName] = (sums[entry.pluginName] || 0) + 1;
            }
            return sums;
        },{});

        var list = getTotals(output);
        list.sort(function(a,b){
            return a.count - b.count;
        }).reverse(); // sorted by count

        vm.d3HorizontalData = list;
        vm.SelectedYear = year;
        vm.UserDetails = [];
        vm.SelectedPlugin = "";
    };

    function isOfficeMatch(office, filter){
        if(filter === "All") return true;
        if(filter.constructor === Array){
            return filter.indexOf(office) > -1
        }else{
            office === filter;
        }
    }

    vm.SetOfficeFilter = function (office) {
        vm.SelectedOffice = office.name;

        // (Konrad) First we need to get just plugins that match the name/year filters per user
        // Used for Bar Chart
        var output = vm.AddinLogs.reduce(function (sums, entry) {
            if(entry.pluginName === vm.SelectedPlugin
                && entry.revitVersion === vm.SelectedYear
                && isOfficeMatch(entry.office, office.code)){
                sums[entry.user] = (sums[entry.user] || 0) + 1;
            }
            return sums;
        }, {});

        var totals = getTotals(output);
        totals.sort(function(a,b){
            return a.count - b.count;
        }).reverse(); // sorted by count

        vm.UserDetails = totals;
    };

    vm.OnClick = function(item){
        // (Konrad) First we need to get just plugins that match the name/year filters per user
        // Used for Bar Chart
        var output = vm.AddinLogs.reduce(function (sums, entry) {
            if(entry.pluginName === item.name
                && entry.revitVersion === vm.SelectedYear
                && isOfficeMatch(entry.office, vm.SelectedOffice)){
                sums[entry.user] = (sums[entry.user] || 0) + 1;
            }
            return sums;
        }, {});

        var totals = getTotals(output);
        totals.sort(function(a,b){
            return a.count - b.count;
        }).reverse(); // sorted by count

        vm.UserDetails = totals;
        vm.SelectedPlugin = item.name;
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