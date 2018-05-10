/**
 * Created by konrad.sobon on 2018-04-26.
 */
angular.module('MissionControlApp').factory('ViewsFactory', ViewsFactory);

function ViewsFactory($http){
    return {
        updateFilePath: function updateFilePath(id, data){
            return $http.put('/api/v2/views/' + id + '/updatefilepath', data).then(complete).catch(failed);
        },

        getViewStats: function getViewStats(data) {
            return $http.post('/api/v2/views/viewstats', data).then(complete).catch(failed);
        }
    };

    function complete(response) {
        return response;
    }

    function failed(error) {
        console.log(error.statusText);
    }
}