/**
 * Created by konrad.sobon on 2018-01-09.
 */
angular.module('MissionControlApp').factory('VrFactory', VrFactory);

function VrFactory($http){
    return {
        populateVr: function populateVr(projectId) {
            return $http.get('/api/v1/projects/populatevr/' + projectId).then(complete).catch(failed);
        },

        getProject: function getProject(projectName) {
            return $http.get('/api/v1/vr/project/' + projectName).then(complete).catch(failed);
        },

        createProject: function createProject(projectName) {
            return $http.post('/api/v1/vr/project/' + projectName).then(complete).catch(failed);
        },

        addUser: function addUser(projectId) {
            return $http.post('/api/v1/vr/project/' + projectId + '/users').then(complete).catch(failed);
        },

        addFolder: function addFolder(data) {
            return $http.post('/api/v1/vr/folders', data).then(complete).catch(failed);
        },

        getFolderItems: function getFolderItems(folderId) {
            return $http.get('/api/v1/vr/folders/' + folderId + '/items').then(complete).catch(failed);
        },

        uploadFile: function uploadFile(data) {
            return $http.post('/api/v1/vr/files', data).then(complete).catch(failed);
        }
    };

    function complete(response) {
        return response;
    }

    function failed(error) {
        console.log(error.statusText);
    }
}