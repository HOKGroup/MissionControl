var app = angular.module('ProjectCtlr',['ng']);

app.controller('ProjectController', ['$scope', 'ProjectFactory', 
function($scope, ProjectFactory){
	$scope.status;
	$scope.projects={};
	$scope.newProject= {}; 
	$scope.selectedProject ={};
	$scope.filteredProject={};
	$scope.gPlace={};
	
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
	
	$scope.addProject = function(){
		if(!$scope.newProject.hasOwnProperty('number')|| !$scope.newProject.hasOwnProperty('name')
		|| !$scope.newProject.hasOwnProperty('office')){return;}
		
		var project = {
			number: $scope.newProject.number,
			name: $scope.newProject.name,
			office: $scope.newProject.office,
			address:$scope.newProject.address
			};
		
			ProjectFactory.addProject(project)
			.then(function(response){
				$scope.projects.push(project);
				$scope.status = 'Project added';
			
				$scope.newProject.number='';
				$scope.newProject.name='';
				$scope.newProject.office='';
				$scope.newProject.address={};

			},function(error){
				$scope.status = 'Unable to add project: '+ error.message;
			});
	};
	
	$scope.updateProject = function(){
		ProjectFactory.updateProject($scope.selectedProject)
		.then(function(response){
			$scope.status = 'Project updated';
		}, function(error){
			$scope.status = 'Unabl to update project: ' + error.message;
		});
	};

	$scope.deleteProject = function(id){
		ProjectFactory.deleteProject(id)
		.then(function(response) {
			$scope.status = 'Deleted Project.';
			for (var i = 0; i < $scope.projects.length; i++) {
                var project = $scope.projects[i];
                if (project._id === id) {
                    $scope.projects.splice(i, 1);
                    break;
                }
            }
		}, function(error){
			$scope.status = 'Unable to delete project:' +error.message;
		});
	};
}]);
