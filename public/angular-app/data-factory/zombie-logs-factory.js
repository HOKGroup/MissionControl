/**
 * Created by konrad.sobon on 2018-08-01.
 */
angular.module('MissionControlApp').factory('ZombieLogsFactory', ZombieLogsFactory);

function ZombieLogsFactory($http){
    return {
        get: function get(){
            return $http.get('/api/v2/zombielogs').then(complete).catch(failed);
        }
    };

    function complete(response) {
        return response;
    }

    function failed(error) {
        console.log(error.statusText);
    }
}