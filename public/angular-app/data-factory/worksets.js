/**
 * Created by konrad.sobon on 2018-09-10.
 */
angular.module('MissionControlApp').factory('WorksetsFactory', WorksetsFactory);

function WorksetsFactory($http){
    return {
        // aggregates
        updateFilePath: function (data){
            return $http.put('/api/v2/worksets/updatefilepath', data).then(complete).catch(failed);
        },

        getWorksetStats: function getWorksetStats(data) {
            return $http.post('/api/v2/worksets/getworksetsdata', data).then(complete).catch(failed);
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