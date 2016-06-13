var app = angular.module('ConfigCtrl',['ng']);

app.controller('ConfigController', ['$scope', '$routeParams','ConfigFactory', '$window',
function($scope, $routeParams, ConfigFactory, $window){
	$scope.status;
	$scope.projectId = $routeParams.projectId;
	$scope.selectedProject;
	$scope.configurations;
	$scope.selectedConfig;
	$scope.filteredConfig;
	$scope.newFile;
	$scope.newConfig;
	
	getSelectedProjectConfiguration($scope.projectId);

	function getSelectedProjectConfiguration(projectId) {
		ConfigFactory.getProjectByProjectId(projectId)
		.then(function(response){
			$scope.selectedProject = response.data;
			$scope.configurations = response.data.configurations;
			if($scope.configurations.length > 0)
			{
				 var config = $scope.configurations[0];
				ConfigFactory.getConfigurationById(config._id)
				.then(function(response) {
					$scope.selectedConfig = response.data;
				}, function(error){
					$scope.status = 'Unable to get configuration by Id: '+id+'  '+error.message;
				});
			}
			
		},function(error){
			$scope.status = 'Unable to load configuration data: '+error.message;
		});
	};
	
	function getConfigurations() {
		ConfigFactory.getConfigurations()
		.then(function(response){
			$scope.configurations = response.data;
		},function(error){
			$scope.status = 'Unable to load configuration data: '+error.message;
		});
	};
	
	$scope.getConfigurationById = function(id){
		ConfigFactory.getConfigurationById(id)
		.then(function(response) {
			$scope.selectedConfig = response.data;
		}, function(error){
			$scope.status = 'Unable to get configuration by Id: '+id+'  '+error.message;
		});
	};

	
	$scope.getByFileId = function(fileId){
		ConfigFactory.getByFileId(fileId)
		.then(function(response) {
			$scope.filteredConfig = response.data;
		}, function(error){
			$scope.status = 'Unable to get by file Id: '+fileId+'  '+error.message;
		});
	};
	
	$scope.addFile = function(){
		var file = { centralPath: $scope.newFile };
		if(filePath.length >0 )
		{
			$scope.selectedConfig.files.push(file);
			$scope.newFile='';
			$scope.status='File added';
		}
	};
	
	$scope.deleteFile = function(filePath){
		for (var i = 0; i < $scope.selectedConfig.files.length; i++) {
                var file =  $scope.selectedConfig.files[i];
                if (file.centralPath === filePath) {
                    $scope.selectedConfig.files.splice(i, 1);
                    break;
                }
            }
	};
	
	$scope.getByUpdaterId = function(updaterId){
		ConfigFactory.getByUpdaterId(updaterId)
		.then(function(response) {
			$scope.filteredConfig = response.data;
		}, function(error){
			$scope.status = 'Unable to get by updater Id: '+updaterId+'  '+error.message;
		});
	};

	$scope.updateConfiguration = function(){
		ConfigFactory.updateConfiguration($scope.selectedConfig)
		.then(function(response){
			$window.location.reload();
			$scope.status = 'Configuration updated';
		}, function(error){
			$scope.status = 'Unabl to update configuration: ' + error.message;
		});
	};

	$scope.deleteConfiguration = function(id){
		ConfigFactory.deleteConfiguration(id)
		.then(function(response) {
			$scope.status = 'Deleted Configuration.';
			for (var i = 0; i < $scope.configurations.length; i++) {
                var config = $scope.configurations[i];
                if (config._id === id) {
                    $scope.configurations.splice(i, 1);
                    break;
                }
            }
			$window.location.reload();
		}, function(error){
			$scope.status = 'Unable to delete configuration:' +error.message;
		});
	};
}]);