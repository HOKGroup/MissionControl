/**
 * Created by konrad.sobon on 2018-08-13.
 */
angular.module('MissionControlApp').controller('AddinsController', AddinsController);

function AddinsController(AddinsFactory, UtilityService) {
    var vm = this;

    //region Properties

    vm.SelectedYear = '2019';
    vm.SelectedPlugin = '';
    vm.UserDetails = [];
    vm.YearsAggregate = [];
    vm.MainChartColor = 'steelblue';
    vm.UserChartColor = '#d9534f';
    vm.officeFilters = UtilityService.getOffices();
    vm.SelectedOffice = 'All'; //TODO: Do we need to define this as a {}?

    //endregion

    // region Methods

    vm.ProcessData = function (year){
        AddinsFactory
            .getByYear(year).then(function(response){
                if(!response || response.status !== 200) return;
                /**
                vm.AddinLogs = response.data;
                var output = vm.AddinLogs.reduce(function(sums,entry){
                    sums[entry.pluginName] = (sums[entry.pluginName] || 0) + 1;
                    return sums;
                },{});
                */
               var output = response.data;

                var list = getTotals(output);
                list.sort(function(a,b){
                    return a.count - b.count;
                }).reverse(); // sorted by count

                vm.d3HorizontalData = list;
                vm.SelectedYear = year;
                vm.UserDetails = [];
                vm.SelectedPlugin = '';
            }).catch(function (error) {
                console.log('Error retrieving Usage Logs: ', error);
            });
    };

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
        var addinManagerDetails = {};
        var users = [];
        var output = vm.AddinLogs.reduceRight(function (sums, entry) {
            if(item.name === 'AddinManager')
            {
                // (Konrad) This plugin publishes extra information we can use to make a normalized bar chart.
                // The idea here is that for each tool we create a normalized bar, that shows how many users
                // have given tool set to Always. Never and InSessionOnly. Each user is logged only once. Last
                // set of data published by user is used (reduceRight iterates from end to get most recent).
                if(entry.pluginName === item.name
                    && entry.revitVersion === vm.SelectedYear
                    && isOfficeMatch(entry.office, vm.SelectedOffice)){

                    sums[entry.user] = (sums[entry.user] || 0) + 1; // data needed by user specific chart.
                    if(entry.detailInfo.length > 0 && users.indexOf(entry.user) === -1) // log exists and wasn't added yet
                    {
                        users.push(entry.user); // store user
                        for(var i = 0; i < entry.detailInfo.length; i++){
                            var detailItem = entry.detailInfo[i];
                            if(addinManagerDetails.hasOwnProperty(detailItem.name))
                            {
                                switch (detailItem.value){
                                    case 'Never':
                                        addinManagerDetails[detailItem.name].never += 1;
                                        break;
                                    case 'Always':
                                        addinManagerDetails[detailItem.name].always += 1;
                                        break;
                                    case 'ThisSessionOnly':
                                        addinManagerDetails[detailItem.name].thisSessionOnly += 1;
                                        break;
                                }
                            } else {
                                var pluginDetail = {
                                    name: detailItem.name,
                                    never: 0,
                                    always: 0,
                                    thisSessionOnly: 0
                                };
                                switch (detailItem.value){
                                    case 'Never':
                                        pluginDetail.never = 1;
                                        break;
                                    case 'Always':
                                        pluginDetail.always = 1;
                                        break;
                                    case 'ThisSessionOnly':
                                        pluginDetail.thisSessionOnly = 1;
                                        break;
                                }
                                addinManagerDetails[detailItem.name] = pluginDetail;
                            }
                        }
                    }
                }
                return sums;
            } else {
                if(entry.pluginName === item.name
                    && entry.revitVersion === vm.SelectedYear
                    && isOfficeMatch(entry.office, vm.SelectedOffice)){
                    sums[entry.user] = (sums[entry.user] || 0) + 1;
                }
                return sums;
            }
        }, {});

        vm.AddinManagerStats = Object.keys(addinManagerDetails).map(function (item) {
            return addinManagerDetails[item];
        });

        var totals = getTotals(output);
        totals.sort(function(a,b){
            return a.count - b.count;
        }).reverse(); // sorted by count

        vm.UserDetails = totals;
        vm.SelectedPlugin = item.name;
    };

    //endregion

    //region Utilities

    /**
     * Utility used to convert data totals to proper format
     * @param data
     * @returns {Array}
     */
    function getTotals(data){
        var list = [];
        for (var k in data){
            if(data.hasOwnProperty(k)){
                list.push({name: k, count: data[k]});
            }
        }
        return list;
    }

    /**
     *
     * @param office
     * @param filter
     * @returns {boolean}
     */
    function isOfficeMatch(office, filter){
        if(filter === 'All') return true;
        if(filter.constructor === Array){
            return filter.indexOf(office) > -1;
        }else {
            return office === filter;
        }
    }

    //endregion

    // (Konrad) Get initial data for current year.
    vm.ProcessData(vm.SelectedYear);
}