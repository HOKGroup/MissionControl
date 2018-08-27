/**
 * Created by konrad.sobon on 2018-04-26.
 */
angular.module('MissionControlApp').factory('ModelsFactory', ModelsFactory);

function ModelsFactory($http){
    return {
        updateFilePath: function updateFilePath(id, data){
            return $http.put('/api/v2/models/' + id + '/updatefilepath', data).then(complete).catch(failed);
        },

        getModelStats: function getModelStats(data) {
            return $http.post('/api/v2/models/modelstats', data).then(complete).catch(failed);
        },

        getUserNamesByCentralPath: function getUserNamesByCentralPath(centralPath) {
            return $http.get('/api/v2/models/usernames/' + centralPath).then(complete).catch(failed);
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