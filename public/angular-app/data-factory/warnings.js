/**
 * Created by konrad.sobon on 2018-08-23.
 */
angular.module('MissionControlApp').factory('WarningsFactory', WarningsFactory);

function WarningsFactory($http){
    return {
        getByCentralPath: function getByCentralPath(centralPath) {
            return $http.get('/api/v2/warnings/centralpath/' + centralPath).then(complete).catch(failed);
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