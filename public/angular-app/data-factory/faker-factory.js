/**
 * Created by konrad.sobon on 2018-04-19.
 */
angular.module('MissionControlApp').factory('FakerFactory', FakerFactory);

function FakerFactory($http){
    return {
        createFakes: function createFakes(){
            console.log("Second Level of Fakes!")
            return $http.post('/api/v2/faker/add').then(complete).catch(failed);
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