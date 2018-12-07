angular.module('MissionControlApp').factory('AddinsFactory', AddinsFactory);

function AddinsFactory($http){
    return {
        getAllLogs: function getAllLogs() {
            return $http.get('/api/v2/addins').then(complete).catch(failed);
        },

        getByYear: function getByYear(year){
            return $http.get('/api/v2/addins/' + year).then(complete).catch(failed);
        },

        getUsersOfPlugin: function getUsersOfPlugin(name, year, office){
            var officeFilter = '';
            if (office !== undefined) {
                var officeCodes = office.reduce(function (accumulator, value) { return accumulator = accumulator + '|' + value });
                officeFilter += '&office=' + officeCodes;
            }
            return $http.get('/api/v2/addins/' + year + '?name=' + name  + officeFilter).then(complete).catch(failed);
        },

        getAddinManagerDetails: function getAddinManagerDetails(year, office){
            var officeFilter = '';
            if (office !== undefined) {
                var officeCodes = office.reduce(function (accumulator, value) { return accumulator = accumulator + '|' + value });
                officeFilter += '?office=' + officeCodes;
            }
            return $http.get('/api/v2/addins/' + year  + '/addinmanager' +  officeFilter).then(complete).catch(failed); 
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