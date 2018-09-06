/**
 * Created by konrad.sobon on 2018-09-06.
 */
angular.module('MissionControlApp').factory('OpenTimesFactory', OpenTimesFactory);

function OpenTimesFactory($http){
    return {
        getAll: function (data) {
            return $http.post('/api/v2/opentimes/getall', data).then(complete).catch(failed);
        },

        getByDate: function (data) {
            return $http.post('/api/v2/opentimes/getbydate', data).then(complete).catch(failed);
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