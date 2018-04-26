/**
 * Created by konrad.sobon on 2018-04-26.
 */
angular.module('MissionControlApp').factory('ViewsFactory', ViewsFactory);

function ViewsFactory($http){
    return {
        updateFilePath: function updateFilePath(id, data){
            return $http.put('/api/v1/views/' + id + '/updatefilepath', data).then(complete).catch(failed);
        }
    };

    function complete(response) {
        return response;
    }

    function failed(error) {
        console.log(error.statusText);
    }
}