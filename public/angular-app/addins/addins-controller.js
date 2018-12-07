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
        vm.AddinManagerStats = [];
        AddinsFactory
            .getByYear(year).then(function(response){
                if(!response || response.status !== 200) return;
               var list = response.data;

                // var list = getTotals(output);
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
        var plugin = vm.d3HorizontalData.find(function (item) { return item.name == vm.SelectedPlugin; });
        vm.OnClick(plugin);
    };

    vm.OnClick = function(item){
        // (Konrad) First we need to get just plugins that match the name/year filters per user
        // Used for Bar Chart
        var office;
            if (vm.SelectedOffice !== 'All') {
                office = vm.officeFilters.find(function (filter) { return filter.name == vm.SelectedOffice; }).code;
            }
        AddinsFactory.
            getUsersOfPlugin(item.name, vm.SelectedYear, office).then(function(response){
                var totals = response.data;
                totals.sort(function(a,b){
                    return a.count - b.count;
                }).reverse(); // sorted by count
                vm.UserDetails = totals;
                vm.SelectedPlugin = item.name;
            });

        if (item.name === 'AddinManager') {
            AddinsFactory.getAddinManagerDetails(vm.SelectedYear, office)
                .then(function(response){ 
                    vm.AddinManagerStats = response.data; 
                });
        }
    };

    //endregion

    // (Konrad) Get initial data for current year.
    vm.ProcessData(vm.SelectedYear);
}