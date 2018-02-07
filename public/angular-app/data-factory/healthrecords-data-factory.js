angular.module('MissionControlApp').factory('HealthRecordsFactory', HealthRecordsFactory);

function HealthRecordsFactory($http){
    return {
        populateProject: function populateProject(projectId) {
            return $http.get('/api/v1/projects/populatehr/' + projectId).then(complete).catch(failed);
        },

        getById: function getById(id) {
            return $http.get('/api/v1/healthrecords/' + id).then(complete).catch(failed);
        },

        getNames: function getNames(ids) {
            return $http.post('/api/v1/healthrecords/names', ids).then(complete).catch(failed);
        },

        updateFilePath: function updateFilePath(id, data) {
            return $http.put('/api/v1/healthrecords/' + id + '/updatefilepath', data).then(complete).catch(failed);
        }
    };

    function complete(response) {
        return response;
    }

    function failed(error) {
        console.log(error.statusText);
    }
}

