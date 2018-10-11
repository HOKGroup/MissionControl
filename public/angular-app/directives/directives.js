/**
 * Created by konrad.sobon on 2018-04-04.
 */
angular.module('MissionControlApp').component('timeRangeSelection', {
    templateUrl: 'angular-app/directives/time-range-selector/template.html',
    controller: 'TimeRangeSelectorController',
    controllerAs: 'vm',
    bindings: {
        onFilter: '&onFilter',
        onHide: '&onHide',
        loading: '='
    }
});

angular.module('MissionControlApp').component('healthReportSummary', {
    templateUrl: 'angular-app/directives/health-score-summary/template.html',
    controller: 'HealthScoreSummaryController',
    controllerAs: 'vm',
    bindings: {
        data: '=',
        description: '=',
        bullets: '=',
        title: '=',
        details: '=',
        name: '='
    }
});

angular.module('MissionControlApp').component('filePathButtons', {
    templateUrl: 'angular-app/directives/file-path-buttons/template.html',
    controller: 'FilePathButtonsController',
    controllerAs: 'vm',
    bindings: {
        item: '=',
        onDisable: '&onDisable'
    }
});