angular.module('MissionControlApp', ['ngRoute', 'ui.bootstrap', 'ngAnimate', 'datatables', 'datatables.buttons', 'ngSanitize', 'ngToast'])
  .config(['ngToastProvider', '$routeProvider', '$locationProvider', '$httpProvider', function( ngToast, $routeProvider, $locationProvider, $httpProvider){
    // ngRoute - used for routing below
    // ui.bootstrap - used by modal dialog
    // ngAnimate - used by modal dialog
    // datatables - used by all tables
    // ngToast - used by zombie logs

    // (Konrad) Browser caching has been a pain for some of the pages like Configurations
    // Users would create a new Configuration and it will not show, since cache kicks in
    // and old page is served up again. This has led to some confusion and complaints.
    $httpProvider.defaults.headers.common['Cache-Control'] = 'no-cache';
    $httpProvider.defaults.cache = false;

    ngToast.configure({
      verticalPosition: 'top',
      horizontalPosition: 'right',
      maxNumber: 10,
      animation: 'fade'
    });

    $locationProvider.hashPrefix('');
    $routeProvider
    //home page
      .when('/', {
        templateUrl: 'angular-app/home/home.html'
      })

      //home page
      .when('/home', {
        templateUrl: 'angular-app/home/home.html'
      })

      // project page
      .when('/projects', {
        templateUrl: 'angular-app/project/project.html',
        controller: 'ProjectController',
        controllerAs: 'vm'
      })

      // file paths page
      .when('/file-paths', {
        templateUrl: 'angular-app/file-paths/file-paths.html',
        controller: 'FilePathsController',
        controllerAs: 'vm'
      })

      // addins page
      .when('/addins', {
        templateUrl: 'angular-app/addins/addins.html',
        controller: 'AddinsController',
        controllerAs: 'vm'
      })

      // zombie logs page
      .when('/zombie-logs', {
        templateUrl: 'angular-app/zombie-logs/zombie-logs.html',
        controller: 'ZombieLogsController',
        controllerAs: 'vm'
      })

      // add project
      .when('/projects/add', {
        templateUrl: 'angular-app/add-project/add-project.html',
        controller: 'AddProjectController',
        controllerAs: 'vm'
      })

      // edit project
      .when('/projects/edit/:projectId', {
        templateUrl: 'angular-app/edit-project/edit-project.html',
        controller: 'EditProjectController',
        controllerAs: 'vm'
      })

      //show configuration
      .when('/projects/configurations/:projectId', {
        templateUrl: 'angular-app/configuration/configuration.html',
        controller: 'ConfigController',
        controllerAs: 'vm'
      })

      //add configuration
      .when('/configurations/add/:projectId', {
        templateUrl: 'angular-app/add-configuration/add-configuration.html',
        controller: 'AddConfigController',
        controllerAs: 'vm'
      })
      // Health report main page
      .when('/projects/healthreport/:projectId', {
        templateUrl: 'angular-app/health-report/health-report.html',
        controller: 'HealthReportController',
        controllerAs: 'vm'
      })
      // Sheets page
      .when('/projects/sheets/:projectId', {
        templateUrl: 'angular-app/sheets/sheets.html',
        controller: 'SheetsController',
        controllerAs: 'vm'
      })

      //Fake Data Creation page
      .when('/faker', {
        templateUrl: 'angular-app/faker/faker.html',
        controller: 'FakerController',
        controllerAs: 'vm'
      });
  }]);