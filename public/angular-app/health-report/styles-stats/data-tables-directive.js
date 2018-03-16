/**
 * Created by konrad.sobon on 2018-03-16.
 */
angular.module('MissionControlApp').component('dataTable', {
    templateUrl: 'angular-app/health-report/styles-stats/data-tables.html',
    controller: 'DimensionsTableController',
    controllerAs: 'vm',
    bindings: {
        data: '='}
});