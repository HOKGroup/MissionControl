var app = angular.module('ProjectService',[]);

app.factory('ProjectFactory', ['$http', function($http){
	var urlBase = '/api/v1/projects';
	var dataFactory = {};
	
	dataFactory.getProjects = function(){
		//sort by number
		return $http.get(urlBase+'/sort');
	};
	
	dataFactory.getProjectById = function(id){
		return $http.get(urlBase+'/'+id);
	};
	
	dataFactory.getByConfigId = function(id){
		return $http.get(urlBase+'/configid/'+id); 
	};
	
	dataFactory.getByOffice = function(office){
		return $http.get(urlBase+'/office/'+office); 
	};
	
	dataFactory.addProject = function(project){
		return $http.post(urlBase, project);
	};
	
	dataFactory.updateProject = function(project){
		return $http.put(urlBase+'/'+project._id, project);
	};
	
	dataFactory.deleteProject = function(id){
		return $http.delete(urlBase + '/' + id);
	};
	
	dataFactory.deleteConfiguration = function(configId){
		return $http.delete('/api/v1/configurations/'+configId);
	};
	
	return dataFactory;
}]);
