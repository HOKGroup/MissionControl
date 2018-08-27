/**
 * Created by konrad.sobon on 2017-10-24.
 */
angular.module('MissionControlApp').factory('SheetsFactory', SheetsFactory);

function SheetsFactory($http){
    return {
        add: function add(sheetsData) {
            return $http.post('/api/v2/sheets', sheetsData).then(complete).catch(failed);
        },

        addSheetTask: function addSheetTask(id, sheet) {
            return $http.post('/api/v2/sheets/' + id + '/addsheettask', sheet).then(complete).catch(failed);
        },

        addSheets: function addSheets(id, sheets) {
            return $http.post('/api/v2/sheets/' + id + '/addsheets', sheets).then(complete).catch(failed);
        },

        deleteNewSheet: function deleteNewSheet(id, sheet) {
            return $http.post('/api/v2/sheets/' + id + '/deletenewsheet', sheet).then(complete).catch(failed);
        },

        deleteSheetTasks: function deleteSheetTasks(id, tasks) {
            return $http.post('/api/v2/sheets/'+ id + '/deletetasks', tasks).then(complete).catch(failed);
        },

        updateTasks: function updateTasks(id, tasks) {
            return $http.post('/api/v2/sheets/'+ id + '/updatetasks', tasks).then(complete).catch(failed);
        },

        updateFilePath: function updateFilePath(id, data) {
            return $http.put('/api/v2/sheets/'+ id + '/updatefilepath', data).then(complete).catch(failed);
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