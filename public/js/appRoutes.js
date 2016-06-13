angular.module('appRoutes', []).config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {

	$routeProvider
		//home page
		.when('/home', {
			templateUrl: 'view/home.html'
		})
	
		// project page
		.when('/projects', {
			templateUrl: 'view/project.html',
			controller: 'ProjectController'
		})
		//show configuration
		.when('/projects/:projectId', {
			templateUrl: 'view/configuration.html',
			controller: 'ConfigController'
		})
		
		//add configuration
		.when('/configurations/add/:projectId', {
			templateUrl: 'view/add_configuration.html',
			controller: 'AddConfigController'
		})
		
		//home page
		.when('/', {
			templateUrl: 'view/home.html'
		});

		//$locationProvider.html5Mode(true);
		
}]);