/**
 * Created by konrad.sobon on 2018-04-19.
 */
angular.module('MissionControlApp').factory('ProjectFactory', ProjectFactory);

function ProjectFactory($http){
    return {
        getProjects: function getProjects(){
            return $http.get('/api/v2/projects/sort').then(complete).catch(failed);
        },

        getProjectById: function getProjectById(id){
            return $http.get('/api/v2/projects/' + id).then(complete).catch(failed);
        },

        getProjectByIdPopulateConfigurations: function getProjectByIdPopulateConfigurations(id){
            return $http.get('/api/v2/projects/' + id + '/populateconfigurations').then(complete).catch(failed);
        },

        addProject: function addProject(project){
            return $http.post('/api/v2/projects', project).then(complete).catch(failed);
        },

        deleteProject: function deleteProject(id){
            return $http.delete('/api/v2/projects/' + id).then(complete).catch(failed);
        },

        updateProject: function updateProject(project){
            return $http.put('/api/v2/projects/' + project._id, project).then(complete).catch(failed);
        },

        populateSheets: function populateSheets(projectId) {
            return $http.get('/api/v2/projects/populatesheets/' + projectId).then(complete).catch(failed);
        },

        addConfig: function addConfig(projectId, configId) {
            return $http.put('/api/v2/projects/' + projectId + '/addconfig/' + configId).then(complete).catch(failed);
        },

        deleteConfig: function deleteConfig(projectId, configId) {
            return $http.put('/api/v2/projects/' + projectId + '/deleteconfig/' + configId).then(complete).catch(failed);
        },

        deleteTriggerRecords: function deleteTriggerRecords(projectId, ids) {
            return $http.post('/api/v2/projects/' + projectId + '/deletetriggerrecords', ids).then(complete).catch(failed);
        }
    };

    function complete(response) {
        return response;
    }

    function failed(error) {
        console.log(error.statusText);
        return error;
    }
}