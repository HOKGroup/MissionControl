/**
 * Created by konrad.sobon on 2018-02-14.
 */
angular.module('MissionControlApp').factory('EmailFactory', EmailFactory);

function EmailFactory($http){
    return {
        sendEmail: function sendEmail(data) {
            return $http.post('/api/v1/email', data).then(complete).catch(failed);
        }
    };

    function complete(response) {
        return response;
    }

    function failed(error) {
        console.log(error.statusText);
    }
}