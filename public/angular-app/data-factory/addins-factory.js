angular.module('MissionControlApp').factory('AddinsFactory', AddinsFactory);

function AddinsFactory($http){
    return {
        getAllLogs: function getAllLogs() {
            return $http.get('/api/v1/addins').then(complete).catch(failed);
        }
    };

    function complete(response) {
        return response;
    }

    function failed(error) {
        console.log(error.statusText);
    }
}