/**
 * Created by konrad.sobon on 2019-05-02.
 */
angular.module('MissionControlApp').factory('SettingsFactory', SettingsFactory);

function SettingsFactory($http){
    return {
        get: function add(data) {
            return $http.get('/api/v2/settings', data).then(complete).catch(failed);
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