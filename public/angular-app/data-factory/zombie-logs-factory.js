/**
 * Created by konrad.sobon on 2018-08-01.
 */
angular.module('MissionControlApp').factory('ZombieLogsFactory', ZombieLogsFactory);

function ZombieLogsFactory($http){
    return {
        get: function get(){
            return $http.get('/api/v2/zombielogs').then(complete).catch(failed);
        },

        getFiltered: function getFiltered(data) {
            return $http.post('/api/v2/zombielogs/filter', data).then(complete).catch(failed);
        },

        getDirtyDozen: function getDirtyDozen() {
            return $http.get('/api/v2/zombielogs/dirtydozen').then(complete).catch(failed);
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