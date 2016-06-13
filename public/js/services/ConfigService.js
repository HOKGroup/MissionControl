var app = angular.module('ConfigService',[]);

app.factory('ConfigFactory', ['$http', function($http){
	var urlBase = '/api/v1/configurations';
	var dataFactory = {};
	
	dataFactory.getConfigurations = function(){
		return $http.get(urlBase);	
	};
	
	//populate
	dataFactory.getProjectByProjectId = function(projectId){
		return $http.get('/api/v1/projects/populate/'+projectId);
	};
	
	dataFactory.getProjectById = function(projectId){
		return $http.get('/api/v1/projects/'+projectId);
	};
	
	dataFactory.getConfigurationById = function(id){
		return $http.get(urlBase+'/'+id);
	};
	
	dataFactory.getByFileId = function(fileId){
		return $http.get(urlBase+'/fileid/'+fileId); 
	};
	
	dataFactory.getByUpdaterId = function(updaterId){
		return $http.get(urlBase+'/updaterid/'+updaterId); 
	};
	
	dataFactory.addConfiguration = function(config){
		return $http.post(urlBase, config);
	};
	
	dataFactory.updateConfiguration = function(config){
		return $http.put(urlBase+'/'+config._id, config);
	};
	
	dataFactory.deleteConfiguration = function(id){
		return $http.delete(urlBase + '/' + id);
	};
	
	dataFactory.updateProject=function(project){
		return $http.put('/api/v1/projects/'+project._id, project);
	};
	
	return dataFactory;
}]);
