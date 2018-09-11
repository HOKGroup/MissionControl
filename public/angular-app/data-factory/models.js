/**
 * Created by konrad.sobon on 2018-09-06.
 */
angular.module('MissionControlApp').factory('ModelsFactory', ModelsFactory);

function ModelsFactory($http){
    return {
        getUserNamesByCentralPath: function (centralPath) {
            return $http.get('/api/v2/model/opentimes/usernames/' + centralPath).then(complete).catch(failed);
        },
        getall: function (data) {
            return $http.post('/api/v2/model/getall', data).then(complete).catch(failed);
        },

        getByDate: function (data) {
            return $http.post('/api/v2/model/getbydate', data).then(complete).catch(failed);
        },

        getModelsData: function (data) {
            return $http.post('/api/v2/model/getmodelsdata', data).then(complete).catch(failed);
        },

        updateFilePath: function (data){
            return $http.put('/api/v2/model/updatefilepath', data).then(complete).catch(failed);
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