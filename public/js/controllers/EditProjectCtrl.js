var app = angular.module('EditProjectCtlr',['ng']);

app.controller('EditProjectController', ['$scope', '$routeParams', 'ProjectFactory', '$window',
function($scope, $routeParams, ProjectFactory, $window){
	$scope.status;
	$scope.projectId = $routeParams.projectId;
	$scope.selectedProject = {
		'address':{},
		'geoLocation':{},
		'geoPolygon':{}
	};
	$scope.initialized= false;

	(function init(){
		ProjectFactory.getProjectById($scope.projectId)
		.then(function(response) {
			$scope.selectedProject = response.data;
			$scope.initialized = true;
		}, function(error){
			$scope.status = 'Unable to get project by Id: '+$scope.projectId+'  '+error.message;
		});
	})();
	
	function getProjectById(id){
		ProjectFactory.getProjectById(id)
		.then(function(response) {
			$scope.selectedProject = response.data;
		}, function(error){
			$scope.status = 'Unable to get project by Id: '+id+'  '+error.message;
		});
	};
	
	$scope.updateProject = function(){
		ProjectFactory.updateProject($scope.selectedProject)
		.then(function(response){
			$scope.status = 'Project updated';
			$window.location.assign('#/projects/');
		}, function(error){
			$scope.status = 'Unabl to update project: ' + error.message;
		});
	};
	
	$scope.deleteProject = function(){
		ProjectFactory.deleteProject($scope.selectedProject._id)
		.then(function(response) {
			$scope.status = 'Deleted Project.';
			//delete configurations
			for(var j = 0; j < $scope.selectedProject.configurations.length; j++){
				var configId = $scope.selectedProject.configurations[i];
				ProjectFactory.deleteConfiguration(configId)
				.then(function(response){
					$scope.status = 'Configuration Deleted';
				},function(error){
					$scope.status = 'Unable to delete configuration' +error.message;
				});
			}		
			$window.location.assign('#/projects/');
		}, function(error){
			$scope.status = 'Unable to delete project:' +error.message;
		});
	};
}]);
