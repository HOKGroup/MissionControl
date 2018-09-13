/**
 * Created by konrad.sobon on 2018-09-13.
 */
angular.module('MissionControlApp').factory('UsersFactory', UsersFactory);

function UsersFactory($http){
    return {
        getAll: function (){
            return $http.get('/api/v2/users').then(complete).catch(failed);
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