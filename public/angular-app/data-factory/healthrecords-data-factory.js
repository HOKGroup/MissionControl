angular.module('MissionControlApp').factory('HealthRecordsFactory', HealthRecordsFactory);

function HealthRecordsFactory($http){
    return {
        getById: function getById(id) {
            return $http.get('/api/v1/healthrecords/' + id).then(complete).catch(failed);
        },

        getByCentralPath: function getByCentralPath(centralPath) {
            return $http.get('/api/v1/healthrecords/centralpath/' + centralPath).then(complete).catch(failed);
        },

        updateFilePath: function updateFilePath(id, data) {
            return $http.put('/api/v1/healthrecords/' + id + '/updatefilepath', data).then(complete).catch(failed);
        },

        getWorksetStats: function getWorksetStats(id, dateRange) {
            return $http.get('/api/v1/healthrecords/' + id + '/worksetstats', {
                params: {
                    from: dateRange.from,
                    to: dateRange.to }
            }).then(complete).catch(failed);
        },

        getLinkStats: function getLinkStats(id, dateRange) {
            return $http.get('/api/v1/healthrecords/' + id + '/linkstats', {
                params: {
                    from: dateRange.from,
                    to: dateRange.to }
            }).then(complete).catch(failed);
        },

        getViewStats: function getViewStats(id, dateRange) {
            return $http.get('/api/v1/healthrecords/' + id + '/viewstats', {
                params: {
                    from: dateRange.from,
                    to: dateRange.to }
            }).then(complete).catch(failed);
        },

        getUserNamesByCentralPath: function getUserNamesByCentralPath(centralPath) {
            return $http.get('/api/v1/healthrecords/usernames/' + centralPath).then(complete).catch(failed);
        }
    };

    function complete(response) {
        return response;
    }

    function failed(error) {
        console.log(error.statusText);
    }
}

