/**
 * Created by konrad.sobon on 2017-09-14.
 */
angular.module('MissionControlApp').factory('FamiliesFactory', FamiliesFactory);

function FamiliesFactory($http){
    return {
        getById: function getById(familiesDataId) {
            return $http.get('/api/v1/families/' + familiesDataId).then(complete).catch(failed);
        },

        addTask: function addTask(familyCollectionId, famId, task) {
            return $http.post('/api/v1/families/' + familyCollectionId + '/family/' + famId, task).then(complete).catch(failed);
        },

        deleteMultipleTasks: function deleteMultipleTasks(familyCollectionId, familyName, taskIds) {
          return $http.post('/api/v1/families/' + familyCollectionId + '/name/' + familyName + '/deletemany', taskIds).then(complete).catch(failed);
        },

        updateTask: function updateTask(familyCollectionId, familyName, taskId, task) {
            return $http.post('/api/v1/families/' + familyCollectionId + '/name/' + familyName + '/updatetask/' + taskId, task).then(complete).catch(failed);
        }
    };

    function complete(response) {
        return response;
    }

    function failed(error) {
        console.log(error.statusText);
    }
}