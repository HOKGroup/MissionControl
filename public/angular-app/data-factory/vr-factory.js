/**
 * Created by konrad.sobon on 2018-01-09.
 */
angular.module('MissionControlApp').factory('VrFactory', VrFactory);

var username = 'sobon.konrad@gmail.com';
var password = 'Password_123456';
var client_id = 'qK34zw1Ktnvy2R6tMfGf73wXtJca';
var client_secret = 'eAoSUqTSLX_fiZ9r8dxyZ5uUGxMa';
var access_token;

function VrFactory($http, $base64){
    return {
        populateVr: function populateVr(projectId) {
            return $http.get('/api/v1/projects/populatevr/' + projectId).then(complete).catch(failed);
        },

        getProject: function getProject(projectName) {
            return $http.get('/api/v1/vr/project/' + projectName).then(complete).catch(failed);
        },

        createProject: function createProject(projectName) {
            return $http.post('/api/v1/vr/project/' + projectName).then(complete).catch(failed);
        },

        addUser: function addUser(projectId) {
            return $http.post('/api/v1/vr/project/' + projectId + '/users').then(complete).catch(failed);
        },

        addFolder: function addFolder(data) {
            return $http.post('/api/v1/vr/folders', data).then(complete).catch(failed);
        },

        getFolderItems: function getFolderItems(folderId) {
            return $http.get('/api/v1/vr/folders/' + folderId + '/items').then(complete).catch(failed);
        },

        uploadFile: function uploadFile(data) {
            return authorize().then(function (response) {
                var auth = 'Bearer ' + response;
                return $http({
                    method: 'POST',
                    url: 'https://app.stage.connect.trimble.com/tc/api/2.0/files?parentId=' + data.parentId,
                    headers: {
                        'Authorization': auth,
                        'Cache-Control': 'no-cache',
                        'Content-Type': undefined
                    },
                    transformRequest: function () {
                        var formData = new FormData();
                        formData.append('file', data.file);
                        return formData;
                    }
                })
            }).then(function (response){
                console.log(response);
            }).catch(failed)
        }
    };

    /**
     *
     * @returns {*|Promise}
     */
    function authorize() {
        var auth = 'Basic ' + $base64.encode(client_id + ':' + client_secret).toString('base64');
        var postData = 'username=' + username + '&password=' + password + '&grant_type=client_credentials&clientDomain=trimble.com&scope=openid';
        return $http({
            method: 'POST',
            url: 'https://identity-stg.trimble.com/token',
            data: postData,
            transformRequest: angular.identity,
            headers: {
                'Accept': 'application/json',
                'Authorization': auth,
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }).then(function (response) {
            return $http({
                method: 'POST',
                url: 'https://app.stage.connect.trimble.com/tc/api/2.0/auth/token',
                data: JSON.stringify({
                    'jwt': response.data.id_token
                }),
                transformRequest: angular.identity,
                headers: {
                    'Content-Type': 'application/json'
                }
            })
        }).then(function (response) {
            return response.data.token;
        }).catch(failed);
    }

    function complete(response) {
        return response;
    }

    function failed(error) {
        console.log(error.statusText);
    }
}