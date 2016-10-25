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
		//initialize FME
		FMEServer.init({
	                server: "http://fme.hok.com",
	                token: "4919b579f13ce37d6ac3917f655b8b6143f203d3"
	    });
		
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
	
	$scope.updateProject = function(){
		ProjectFactory.updateProject($scope.selectedProject)
		.then(function(response){
			$scope.status = 'Project updated';
			$window.location.assign('#/projects/');
		}, function(error){
			$scope.status = 'Unabl to update project: ' + error.message;
		});
	};
	
	$scope.downloadPDF = function(){
		var repositoryName = 'MissionControl';
		var workspaceName = 'MissionControl_PDFCreator.fmw';
		var parameters= 'ProjectId='+$scope.projectId;
		
		FMEServer.runDataDownload(repositoryName, workspaceName, parameters, showResults);
	};
	
	function showResults(json){
		var downloadURL = json.serviceResponse.url;
		var downloadLink = angular.element('<a> HOK Mission Control - Download Project PDF </a>');
        downloadLink.attr('href',downloadURL); 
		downloadLink[0].click();			
	};
	
}]);
