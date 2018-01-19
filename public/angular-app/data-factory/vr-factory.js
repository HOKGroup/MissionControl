/**
 * Created by konrad.sobon on 2018-01-09.
 */
angular.module('MissionControlApp').factory('VrFactory', VrFactory);

function VrFactory($http){
    return {
        getProjectById: function getProjectById(projectId) {
            return $http.get('/api/v1/projects/' + projectId).then(complete).catch(failed);
        },

        populateVr: function populateVr(projectId) {
            return $http.get('/api/v1/projects/populatevr/' + projectId).then(complete).catch(failed);
        },

        requestToken: function requestToken() {
            return $http.post('/api/v1/vr/requesttoken').then(complete).catch(failed);
        }
    };

    function complete(response) {
        return response;
    }

    function failed(error) {
        console.log(error.statusText);
    }
}