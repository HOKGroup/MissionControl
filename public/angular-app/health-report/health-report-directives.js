angular.module('MissionControlApp').component('linkStats', {
    templateUrl: 'angular-app/health-report/link-stats/link-stats.html',
    controller: 'LinkStatsController',
    controllerAs: 'vm',
    bindings: {
        processed: '='
    }
});

angular.module('MissionControlApp').component('worksetStats', {
    templateUrl: 'angular-app/health-report/workset-stats/workset-stats.html',
    controller: 'WorksetsController',
    controllerAs: 'vm',
    bindings: {
        processed: '='
    }
});

angular.module('MissionControlApp').component('familyStats', {
    templateUrl: 'angular-app/health-report/family-stats/family-stats.html',
    controller: 'FamilyStatsController',
    controllerAs: 'vm',
    resolve: FamilyStatsController.resolve,
    bindings: {
        processed: '='
    }
});

angular.module('MissionControlApp').component('modelStats', {
    templateUrl: 'angular-app/health-report/model-stats/model-stats.html',
    controller: 'ModelStatsController',
    controllerAs: 'vm',
    bindings: {
        processed: '=',
        show: '='
    }
});

angular.module('MissionControlApp').component('viewStats', {
    templateUrl: 'angular-app/health-report/view-stats/views-stats.html',
    controller: 'ViewStatsController',
    controllerAs: 'vm',
    bindings: {
        processed: '='
    }
});

angular.module('MissionControlApp').component('styleStats', {
    templateUrl: 'angular-app/health-report/styles-stats/styles-stats.html',
    controller: 'StyleStatsController',
    controllerAs: 'vm',
    bindings: {
        processed: '='
    }
});