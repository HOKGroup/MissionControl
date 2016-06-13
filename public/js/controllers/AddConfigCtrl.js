var app = angular.module('AddConfigCtrl',['ng']);

app.controller('AddConfigController', ['$scope', '$routeParams','ConfigFactory', '$window',
function($scope, $routeParams, ConfigFactory, $window){
	$scope.status;
	$scope.projectId = $routeParams.projectId;
	$scope.selectedProject;
	$scope.newConfig;
	$scope.newFile;
	
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
			addInName:'DTM Tool',
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
			addInId:'A27F1E68-A2AB-434C-9E31-34E79FB9A419',
			addInName:'CA Door',
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
			addInId:'3E9DE71C-B02B-414C-AC79-20DDC1212B58',
			addInName:'Revision Tracker',
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
		if(filePath.length >0 )
		{
			var file= {centralPath:filePath};
			$scope.newConfig.files.push(file);
			$scope.status='File added';
			$scope.newFile = '';
		}
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
			ConfigFactory.getProjectById($scope.projectId)
			.then(function(response){
				var project = response.data;
				project.configurations.push(configId);
				ConfigFactory.updateProject(project)
				.then(function(response){
					$scope.status = 'Project updated';
					$window.location.assign('#/projects/'+$scope.projectId);
				}, function(error){
					$scope.status = 'Unable to update project';
				});
			}, function(error){
				$scope.status='Unable to get project: '+error.message;
			});			
		}, function(error){
			$scope.status = 'Unabl to add configuration: ' + error.message;
		});
	};
}]);