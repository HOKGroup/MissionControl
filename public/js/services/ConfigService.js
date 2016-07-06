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
	
/* 	dataFactory.getPopulatedConfigurationById = function(id){
		return $http.get(urlBase+'/populate/'+id);
	}; */
	
	dataFactory.getByFileId = function(fileId){
		return $http.get(urlBase+'/fileid/'+fileId); 
	};
	
	dataFactory.getByFilePath = function(filePath){
		return $http.get(urlBase+'/filepath/'+filePath); 
	};
	
	dataFactory.getByEncodedUri = function(uri){
		return $http.get(urlBase+'/uri/'+uri); 
	};
	
	dataFactory.getByUpdaterId = function(updaterId){
		return $http.get(urlBase+'/updaterid/'+updaterId); 
	};
	
	dataFactory.addConfiguration = function(config){
		return $http.post(urlBase, config);
	};
	
	dataFactory.addConfigToProject = function(projectId, configId){
		return $http.put('/api/v1/projects/'+projectId+'/addconfig/'+configId);
	};
	
	dataFactory.deleteConfigFromProject = function(projectId, configId){
		return $http.put('/api/v1/projects/'+projectId+'/deleteconfig/'+configId);
	};
	
	dataFactory.getProjectFile = function(fileId){
		return $http.post('/api/v1/projectfiles/'+fileId);
	};
	
	dataFactory.addProjectFile = function(file){
		return $http.post('/api/v1/projectfiles/', file);
	};
	
	dataFactory.deleteProjectFile = function(fileId){
		return $http.delete('/api/v1/projectfiles/'+fileId);
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
