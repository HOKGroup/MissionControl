angular.module('MissionControlApp').factory('HealthRecordsFactory', HealthRecordsFactory);

function HealthRecordsFactory($http){
    return {
        getById: function getById(id) {
            return $http.get('/api/v1/healthrecords/' + id).then(complete).catch(failed);
        },

        getByCentralPath: function getByCentralPath(centralPath) {
            return $http.get('/api/v1/healthrecords/centralpath/' + centralPath).then(complete).catch(failed);
        },

        getNames: function getNames(ids) {
            return $http.post('/api/v1/healthrecords/names', ids).then(complete).catch(failed);
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

        getStyleStats: function getStyleStats(id, dateRange) {
            return $http.get('/api/v1/healthrecords/' + id + '/stylestats', {
                params: {
                    from: dateRange.from,
                    to: dateRange.to }
            }).then(complete).catch(failed);
        },

        getModelStats: function getModelStats(id, dateRange) {
            return $http.get('/api/v1/healthrecords/' + id + '/modelstats', {
                params: {
                    from: dateRange.from,
                    to: dateRange.to }
            }).then(complete).catch(failed);
        },

        getFamilyStats: function getFamilyStats(id) {
            return $http.get('/api/v1/healthrecords/' + id + '/familystats').then(complete).catch(failed);
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

