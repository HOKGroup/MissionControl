var app = angular.module('ProjectCtlr',['ng']);

app.controller('ProjectController', ['$scope', 'ProjectFactory', 
function($scope, ProjectFactory){
	$scope.status;
	$scope.projects={};
	$scope.selectedProject ={};
	$scope.filteredProject={};

	getProjects();
	
	function getProjects() {
		ProjectFactory.getProjects()
		.then(function(response){
			$scope.projects = response.data;
		},function(error){
			$scope.status = 'Unable to load project data: '+error.message;
		});
	}
	
	$scope.getProjectById = function(id){
		ProjectFactory.getProjectById(id)
		.then(function(response) {
			$scope.selectedProject = response.data;
		}, function(error){
			$scope.status = 'Unable to get project by Id: '+id+'  '+error.message;
		});
	};
	
	$scope.getByConfigId = function(id){
		ProjectFactory.getByConfigId(id)
		.then(function(response) {
			$scope.selectedProject = response.data;
		}, function(error){
			$scope.status = 'Unable to get by configuration Id: '+id+'  '+error.message;
		});
	};
	
	$scope.getByOffice = function(office){
		ProjectFactory.getByOffice(office)
		.then(function(response) {
			$scope.filteredProject = response.data;
		}, function(error){
			$scope.status = 'Unable to get by office: '+office+'  '+error.message;
		});
	};

}]);
