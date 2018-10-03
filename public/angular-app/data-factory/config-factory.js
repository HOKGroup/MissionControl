/**
 * Created by konrad.sobon on 2018-04-19.
 */
angular.module('MissionControlApp').factory('ConfigFactory', ConfigFactory);

function ConfigFactory($http){
    return {
        getByCentralPath: function getByCentralPath(centralPath) {
            return $http.get('/api/v2/configurations/centralpath/' + centralPath).then(complete).catch(failed);
        },

        addConfiguration: function addConfiguration(config) {
            return $http.post('/api/v2/configurations', config).then(complete).catch(failed);
        },

        addFile: function addFile(configId, file) {
            return $http.post('/api/v2/configurations/' + configId + '/addfile', file).then(complete).catch(failed);
        },

        deleteFile: function deleteFile(configId, file) {
            return $http.post('/api/v2/configurations/' + configId + '/deletefile', file).then(complete).catch(failed);
        },

        updateConfiguration: function updateConfiguration(config) {
            return $http.put('/api/v2/configurations/' + config._id, config).then(complete).catch(failed);
        },

        deleteConfiguration: function deleteConfiguration(id) {
            return $http.delete('/api/v2/configurations/' + id).then(complete).catch(failed);
        },

        getMany: function getMany(configIds) {
            return $http.post('/api/v2/configurations/getmany', configIds).then(complete).catch(failed);
        },

        deleteMany: function deleteMany(configIds){
            return $http.post('/api/v2/configurations/deletemany', configIds).then(complete).catch(failed);
        },

        updateFilePath: function updateFilePath(id, data) {
            return $http.put('/api/v2/configurations/' + id + '/updatefilepath', data).then(complete).catch(failed);
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

