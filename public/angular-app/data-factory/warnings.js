/**
 * Created by konrad.sobon on 2018-08-23.
 */
angular.module('MissionControlApp').factory('WarningsFactory', WarningsFactory);

function WarningsFactory($http){
    return {
        getByCentralPath: function (centralPath) {
            return $http.get('/api/v2/warnings/centralpath/' + centralPath).then(complete).catch(failed);
        },

        getByCentralPathOpen: function (centralPath) {
            return $http.get('/api/v2/warnings/centralpath/' + centralPath + '/open').then(complete).catch(failed);
        },

        getByDateRange: function (data) {
            return $http.post('/api/v2/warnings/daterange', data).then(complete).catch(failed);
        },

        updateFilePath: function (data) {
            return $http.put('/api/v2/warnings/updatefilepath', data).then(complete).catch(failed);
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