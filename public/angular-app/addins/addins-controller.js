/**
 * Created by konrad.sobon on 2018-08-13.
 */
angular.module('MissionControlApp').controller('AddinsController', AddinsController);

function AddinsController(AddinsFactory, UtilityService, SettingsFactory, ngToast) {
    var vm = this;

    //region Properties

    var toasts = [];
    vm.SelectedYear = '2019';
    vm.SelectedPlugin = '';
    vm.UserDetails = [];
    vm.YearsAggregate = [];
    vm.MainChartColor = 'steelblue';
    vm.UserChartColor = '#d9534f';
    vm.SelectedOffice = 'All'; //TODO: Do we need to define this as a {}?
    vm.settings = null;

    //endregion

    // region Methods

    getSettings();

    /**
     * Retrieves Mission Control Settings from the DB.
     */
    function getSettings() {
        SettingsFactory.get()
            .then(function (response) {
                if(!response || response.status !== 200) throw { message: 'Unable to retrieve the Settings.'};

                vm.settings = response.data;
            })
            .catch(function (err) {
                toasts.push(ngToast.danger({
                    dismissButton: true,
                    dismissOnTimeout: true,
                    timeout: 4000,
                    newestOnTop: true,
                    content: err.message
                }));
            });
    }

    /**
     * Handles user selecting a year filter for all plugin stats.
     * @param year
     * @constructor
     */
    vm.ProcessData = function (year){
        vm.AddinManagerStats = [];
        AddinsFactory.getByYear(year)
            .then(function(response){
                if(!response || response.status !== 200) throw response;

                var list = response.data;
                list.sort(function(a,b){
                    return a.count - b.count;
                }).reverse(); // sorted by count

                vm.d3HorizontalData = list;
                vm.SelectedYear = year;
                vm.UserDetails = [];
                vm.SelectedPlugin = '';
            })
            .catch(function (error) {
                console.log('Error retrieving Usage Logs: ', error);
            });
    };

    /**
     * Handles user selecting an office specific filter for user stats.
     * @param office
     * @constructor
     */
    vm.SetOfficeFilter = function (office) {
        vm.SelectedOffice = office.name;
        var plugin = vm.d3HorizontalData.find(function (item) { return item.name === vm.SelectedPlugin; });
        vm.OnClick(plugin);
    };

    /**
     * Handles user clicking on the bar object in the `Plugin Use Frequency` chart.
     * @param item
     * @constructor
     */
    vm.OnClick = function(item) {
        // (Konrad) First we need to get just plugins that match the name/year filters per user
        // Used for Bar Chart
        var office;
        if (vm.SelectedOffice !== 'All') {
            var matchedOffice = vm.settings.offices.find(function (filter) { return filter.name === vm.SelectedOffice; });
            office = matchedOffice.code;
        }

        AddinsFactory.getUsersOfPlugin(item.name, vm.SelectedYear, office)
            .then(function(response){
                if(!response || response.status !== 200) throw response;

                var totals = response.data;
                totals.sort(function(a,b){
                    return a.count - b.count;
                }).reverse(); // sorted by count

                vm.UserDetails = totals;
                vm.SelectedPlugin = item.name;
            })
            .catch(function (err) {
                console.log(err);
            });

        if (item.name === 'AddinManager') {
            AddinsFactory.getAddinManagerDetails(vm.SelectedYear, office)
                .then(function(response){
                    if(!response || response.status !== 200) throw response;

                    vm.AddinManagerStats = response.data;
                })
                .catch(function (err) {
                    console.log(err);
                });
        } else {
            vm.AddinManagerStats = [];
        }
    };

    //endregion

    // (Konrad) Get initial data for current year.
    vm.ProcessData(vm.SelectedYear);
}