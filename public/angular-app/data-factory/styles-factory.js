/**
 * Created by konrad.sobon on 2018-04-26.
 */
angular.module('MissionControlApp').factory('StylesFactory', StylesFactory);

function StylesFactory($http){
    return {
        updateFilePath: function updateFilePath(id, data){
            return $http.put('/api/v2/styles/' + id + '/updatefilepath', data).then(complete).catch(failed);
        },

        getStyleStats: function getStyleStats(data) {
            return $http.post('/api/v2/styles/stylestats', data).then(complete).catch(failed);
        }
    };

    function complete(response) {
        return response;
    }

    function failed(error) {
        console.log(error.statusText);
    }
}