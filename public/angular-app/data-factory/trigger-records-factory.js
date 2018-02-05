/**
 * Created by konrad.sobon on 2018-01-03.
 */
angular.module('MissionControlApp').factory('TriggerRecordsFactory', TriggerRecordsFactory);

function TriggerRecordsFactory($http){
    return {
        updateFilePath: function updateFilePath(id, data) {
            return $http.put('/api/v1/triggerrecords/' + id + '/updatefilepath', data).then(complete).catch(failed);
        },

        getRecordsByConfigId: function getRecordsByConfigId(configId){
        	return $http.get('/api/v1/triggerrecords/configid/' + configId);
        }
    };

    function complete(response) {
        return response;
    }

    function failed(error) {
        console.log(error.statusText);
    }
}

