var app = angular.module('ConfigCtrl',['ng']);

app.controller('ConfigController', ['$scope', '$routeParams','ConfigFactory', '$window',
function($scope, $routeParams, ConfigFactory, $window){
	$scope.status;
	$scope.projectId = $routeParams.projectId;
	$scope.selectedProject;
	$scope.configurations;
	$scope.selectedConfig;
	$scope.selectedRecords;
	$scope.filteredConfig;
	$scope.newFile;
	$scope.warningMsg='';
	
	//get populated configurations
	getSelectedProjectConfiguration($scope.projectId);

	function getSelectedProjectConfiguration(projectId) {
		ConfigFactory.getProjectByProjectId(projectId)
		.then(function(response){
			$scope.selectedProject = response.data;
			$scope.configurations = response.data.configurations;
			if($scope.configurations.length > 0)
			{
				 var config = $scope.configurations[0];
				 getSelectedConfiguraiton(config._id);
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
	
	function getSelectedConfiguraiton(configId){
		ConfigFactory.getConfigurationById(configId)
		.then(function(response){
			$scope.selectedConfig = response.data;
			ConfigFactory.getRecordsByConfigId(configId)
			.then(function(response){
				$scope.selectedRecords = response.data;
			},function(error){
				$scope.status ='Unable to get records by config Id: '+configId;
			});
		},function(error){
			$scope.status='Unable to get by config Id: '+configId;
		});
	};
	
	$scope.getConfigurationById = getSelectedConfiguraiton;

	$scope.addFile = function(){
		var filePath = $scope.newFile;
		var encodedUri = encodeURIComponent(filePath);
		$scope.warningMsg='';
		
		ConfigFactory.getByEncodedUri(encodedUri)
		.then(function(response){
			var configFound = response.data;
			var configNames = '';
			var configMatched = false;
			if(configFound.length > 0)
			{
				//find an exact match from text search result
				for(var i = 0; i < configFound.length; i++)
				{
					var config = configFound[i];
					for(var j=0; j<config.files.length; j++)
					{
						var file = config.files[j];
						if(file.centralPath.toLowerCase() == filePath.toLowerCase())
						{
							configMatched = true;
							configNames+=' ['+config.name+'] '; 
							break;
						}
					}
				}
			}
			
			if(configMatched)
			{
				$scope.warningMsg= 'Warning! File already exists in other configurations.\n'+ configNames;
			}
			else
			{
				if(filePath.length >0 )
				{
					var file= 
					{
						centralPath:filePath
					};
					$scope.selectedConfig.files.push(file);
					$scope.status='File added';
					$scope.newFile = '';
				}
			}
			
		}, function(error){
			$scope.status = 'Unable to get configuration data: '+error.message;
		});
		
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
					ConfigFactory.deleteConfigFromProject($scope.projectId, id);
                    break;
                }
            }
			$window.location.reload();
		}, function(error){
			$scope.status = 'Unable to delete configuration:' +error.message;
		});
	};
}]);