var app = angular.module('AddProjectCtlr',['ng']);

app.controller('AddProjectController', ['$scope', 'ProjectFactory', '$window',
function($scope, ProjectFactory, $window){
	$scope.status;
	$scope.newProject= {
		'address':{},
		'geoLocation':{},
		'geoPolygon':{}
	};
	$scope.initialized= false;

	//warning messages
	$scope.warning_number='';
	$scope.warning_name='';
	
	$scope.addProject = function(){
		if(!$scope.newProject.hasOwnProperty('number')|| !$scope.newProject.hasOwnProperty('name')
		|| !$scope.newProject.hasOwnProperty('office')){return;}
		
		var project = {
			number: $scope.newProject.number,
			name: $scope.newProject.name,
			office: $scope.newProject.office,
			address:$scope.newProject.address
			};
		
		if($scope.newProject.geoLocation.hasOwnProperty('type') && $scope.newProject.geoLocation.hasOwnProperty('coordinates'))
		{
			project.geoLocation = $scope.newProject.geoLocation;
		}
		if($scope.newProject.geoPolygon.hasOwnProperty('type') && $scope.newProject.geoPolygon.hasOwnProperty('coordinates'))
		{
			project.geoPolygon = $scope.newProject.geoPolygon;
		}
		
			ProjectFactory.addProject(project)
			.then(function(response){
				$scope.status = 'Project added';
				$window.location.assign('#/projects/');
			},function(error){
				$scope.status = 'Unable to add project: '+ error.message;
			});
	};
}]);
