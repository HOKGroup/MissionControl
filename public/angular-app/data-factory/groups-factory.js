/**
 * Created by konrad.sobon on 2018-05-16.
 */
angular.module('MissionControlApp').factory('GroupsFactory', GroupsFactory);

function GroupsFactory($http){
    return {
        updateFilePath: function updateFilePath(id, data){
            return $http.put('/api/v2/views/' + id + '/updatefilepath', data).then(complete).catch(failed);
        },

        getGroupStats: function getGroupStats(data) {
            return $http.post('/api/v2/groups/groupstats', data).then(complete).catch(failed);
        }
    };

    function complete(response) {
        return response;
    }

    function failed(error) {
        console.log(error.statusText);
    }
}