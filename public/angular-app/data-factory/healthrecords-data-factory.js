angular.module('MissionControlApp').factory('HealthRecordsFactory', HealthRecordsFactory);

function HealthRecordsFactory($http){
    return {
        getProjectById: function getProjectById(projectId) {
            return $http.get('/api/v1/projects/' + projectId).then(complete).catch(failed);
        },

        populateProject: function populateProject(projectId) {
            return $http.get('/api/v1/projects/populatehr/' + projectId).then(complete).catch(failed);
        }
    };

    function complete(response) {
        return response;
    }

    function failed(error) {
        console.log(error.statusText);
    }
}

