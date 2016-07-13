var app = angular.module('AddConfigCtrl',['ng']);

app.controller('AddConfigController', ['$scope', '$routeParams','ConfigFactory', '$window',
function($scope, $routeParams, ConfigFactory, $window){
	$scope.status;
	$scope.projectId = $routeParams.projectId;
	$scope.selectedProject={};
	$scope.newConfig={};
	$scope.newFile;
	$scope.warningMsg='';
	
	getSelectedProject($scope.projectId);
	setDefaultConfig();
	
	
	function getSelectedProject(projectId) {
		ConfigFactory.getProjectByProjectId(projectId)
		.then(function(response){
			$scope.selectedProject = response.data;
		},function(error){
			$scope.status = 'Unable to load configuration data: '+error.message;
		});
	}
	
	function setDefaultConfig(){

		var updater_dtm = 
		{
			updaterId:'A7483418-F1FF-4DBE-BB71-C6C8CEAE0FD4',
			updaterName:'DTM Tool',
			description:'This tool will display an alert message when Revit users try to modify elements of selected categories.',
			addInId:'9C4D37B2-155D-4AC8-ACCF-383D86673F1C',
			addInName:'Mission Control',
			isUpdaterOn: true,
			categoryTriggers:[
			{
				categoryName:"Grids",
				isEnabled: false,
				locked:false,
				modifiedBy: "",
				modified: Date.now()
			},
			{
				categoryName:"Levels",
				isEnabled: false,
				locked:false,
				modifiedBy: "",
				modified: Date.now()
			},
			{
				categoryName:"Views",
				isEnabled: false,
				locked:false,
				modifiedBy: "",
				modified: Date.now()
			},
			{
				categoryName:"RVT Links",
				isEnabled: false,
				locked:false,
				modifiedBy: "",
				modified: Date.now()
			}]
		};
		
		var updater_ca = 
		{
			updaterId:'C2C658D7-EC43-4721-8D2C-2B8C10C340E2',
			updaterName:'CA Door',
			description:'This tool will monitor door families to apply proper door clearance values following ADA standards for accessible design.',
			addInId:'9C4D37B2-155D-4AC8-ACCF-383D86673F1C',
			addInName:'Mission Control',
			isUpdaterOn: false,
			categoryTriggers:[
			{
				categoryName:"Doors",
				isEnabled: true,
				locked:true,
				modifiedBy: "",
				modified: Date.now()
			}]
		};
		
		var updater_revision = 
		{
			updaterId:'0504A758-BF15-4C90-B996-A795D92B42DB',
			updaterName:'Revision Tracker',
			description:'This tool will push updates to database when modification made on revision items.',
			addInId:'9C4D37B2-155D-4AC8-ACCF-383D86673F1C',
			addInName:'Mission Control',
			isUpdaterOn: false,
			categoryTriggers:[
			{
				categoryName:"Revisions",
				isEnabled: true,
				locked:true,
				modifiedBy: "",
				modified: Date.now()
			}]
		};
		
		var config =
		{
			name:'',
			files:[],
			updaters:[ updater_dtm, updater_ca, updater_revision ]
		};
		
		$scope.newConfig = config;
	}
	
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
					$scope.newConfig.files.push(file);
					$scope.status='File added';
					$scope.newFile = '';
				}
			}

		}, function(error){
			$scope.status = 'Unable to get configuration data: '+error.message;
		});
	};
	
	$scope.deleteFile = function(filepath){
		$scope.status = 'Deleted File.';
		for (var i = 0; i < $scope.newConfig.files.length; i++) 
		{
            var file =  $scope.newConfig.files[i];
            if (file.centralPath === filepath) 
			{
                $scope.newConfig.files.splice(i, 1);
                break;    
            }       
        }	
	};

	$scope.addConfiguration = function(){
		ConfigFactory.addConfiguration($scope.newConfig)
		.then(function(response){
			$scope.status = 'Configuration added';
			var configId = response.data._id;
			ConfigFactory.addConfigToProject($scope.projectId, configId)
			.then(function(response){
				$scope.status = 'Project updated';
				$window.location.assign('#/projects/configurations/'+$scope.projectId);
			}, function(error){
				$scope.status='Unable to add to project: '+error.message;
			});
		}, function(error){
			$scope.status = 'Unabl to add configuration: ' + error.message;
		});
	};
}]);