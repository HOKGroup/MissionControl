angular.module('MissionControlApp').factory('ProjectFactory', ProjectFactory);

function ProjectFactory($http){
    return {
        getProjects: function getProjects(){
            return $http.get('/api/v1/projects/sort').then(complete).catch(failed);
        },

        getProjectById: function getProjectById(id){
            return $http.get('/api/v1/projects/' + id).then(complete).catch(failed);
        },

        getByConfigId: function getByConfigId(id){
            return $http.get('/api/v1/projects/configid/' + id).then(complete).catch(failed);
        },

        getByOffice: function getByOffice(office){
            return $http.get('/api/v1/projects/office/' + office).then(complete).catch(failed);
        },

        addProject: function addProject(project){
            return $http.post('/api/v1/projects', project).then(complete).catch(failed);
        },
        updateProject: function updateProject(project){
            return $http.put('/api/v1/projects/' + project._id, project).then(complete).catch(failed);
        },

        deleteProject: function deleteProject(id){
            return $http.delete('/api/v1/projects/' + id).then(complete).catch(failed);
        },

        deleteConfiguration: function deleteConfiguration(configId){
            return $http.delete('/api/v1/configurations/' + configId).then(complete).catch(failed);
        },

        populateSheets: function populateSheets(projectId) {
            return $http.get('/api/v1/projects/populatesheets/' + projectId).then(complete).catch(failed);
        }
    };

    function complete(response) {
        return response;
    }

    function failed(error) {
        console.log(error.statusText);
    }
}