/**
 * Created by konrad.sobon on 2018-04-26.
 */
angular.module('MissionControlApp').factory('LinksFactory', LinksFactory);

function LinksFactory($http){
    return {
        updateFilePath: function updateFilePath(id, data){
            return $http.put('/api/v1/links/' + id + '/updatefilepath', data).then(complete).catch(failed);
        },

        getLinkStats: function getLinkStats(data) {
            return $http.post('/api/v1/links/linkstats', data).then(complete).catch(failed);
        }
    };

    function complete(response) {
        return response;
    }

    function failed(error) {
        console.log(error.statusText);
    }
}