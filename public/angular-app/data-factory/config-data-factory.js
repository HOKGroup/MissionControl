angular.module('MissionControlApp').factory('ConfigFactory', ConfigFactory);

function ConfigFactory($http){
    return {
        getConfigurations: function getConfigurations() {
            return $http.get('/api/v1/configurations').then(complete).catch(failed);
        },

        getProjectByProjectId: function getProjectByProjectId(projectId) {
            return $http.get('/api/v1/projects/populate/' + projectId).then(complete).catch(failed);
        },

        getProjectById: function getProjectById(projectId) {
            return $http.get('/api/v1/projects/' + projectId).then(complete).catch(failed);
        },

        getConfigurationById: function getConfigurationById(id) {
            return $http.get('/api/v1/configurations/' + id).then(complete).catch(failed);
        },

        getByCentralPath: function getByCentralPath(centralPath) {
            return $http.get('/api/v1/configurations/centralpath/' + centralPath).then(complete).catch(failed);
        },

        getByUpdaterId: function getByUpdaterId(updaterId) {
            return $http.get('/api/v1/configurations/updaterid/' + updaterId).then(complete).catch(failed);
        },

        addConfiguration: function addConfiguration(config) {
            return $http.post('/api/v1/configurations', config).then(complete).catch(failed);
        },

        addConfigToProject: function addConfigToProject(projectId, configId) {
            return $http.put('/api/v1/projects/' + projectId + '/addconfig/' + configId).then(complete).catch(failed);
        },

        deleteConfigFromProject: function deleteConfigFromProject(projectId, configId) {
            return $http.put('/api/v1/projects/' + projectId + '/deleteconfig/' + configId).then(complete).catch(failed);
        },

        updateConfiguration: function updateConfiguration(config) {
            return $http.put('/api/v1/configurations/' + config._id, config).then(complete).catch(failed);
        },

        deleteConfiguration: function deleteConfiguration(id) {
            return $http.delete('/api/v1/configurations/' + id).then(complete).catch(failed);
        },

        deleteMany: function deleteMany(configIds){
            return $http.post('/api/v1/configurations/deletemany', configIds).then(complete).catch(failed);
        },

        updateProject: function updateProject(project) {
            return $http.put('/api/v1/projects/' + project._id, project).then(complete).catch(failed);
        },

        updateFilePath: function updateFilePath(id, data) {
            return $http.put('/api/v1/configurations/' + id + '/updatefilepath', data).then(complete).catch(failed);
        }
    };

    function complete(response) {
        return response;
    }

    function failed(error) {
        console.log(error.statusText);
    }
}

