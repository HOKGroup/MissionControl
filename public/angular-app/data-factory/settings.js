/**
 * Created by konrad.sobon on 2019-05-02.
 */
angular.module('MissionControlApp').factory('SettingsFactory', SettingsFactory);

function SettingsFactory($http){
    return {
        get: function get() {
            return $http.get('/api/v2/settings').then(complete).catch(failed);
        },

        update: function update(data) {
            return $http.put('/api/v2/settings/' + data._id, data).then(complete).catch(failed);
        },
    };

    function complete(response) {
        return response;
    }

    function failed(error) {
        console.log(error.statusText);
        return error;
    }
}