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

        getProject: function getProject(name) {
            return authorize().then(function (response) {
                var auth = 'Bearer ' + response;
                return $http({
                    method: 'GET',
                    url: 'https://app.stage.connect.trimble.com/tc/api/2.0/projects',
                    headers: {
                        'Authorization': auth,
                        'Content-Type': 'application/json'
                    },
                    transformRequest: angular.identity
                })
            }).then(function (response) {
                var project = response.data.filter(function (item) {
                    return item.name === name;
                });
                if(!project || project.length === 0) {
                    return {status: 204, project: project};
                } else {
                    return {status: 200, project: project[0]}
                }
            }).catch(failed)
        },

        createProject: function createProject(projectName) {
            return $http.post('/api/v1/vr/project/' + projectName).then(complete).catch(failed);
        },

        addUser: function addUser(projectId) {
            return $http.post('/api/v1/vr/project/' + projectId + '/users').then(complete).catch(failed);
        },

        getFolderItems: function getFolderItems(folderId) {
            return $http.get('/api/v1/vr/folders/' + folderId + '/items').then(complete).catch(failed);
        },

        downloadFile: function downloadFile(fileId) {
            return authorize().then(function (response) {
                var auth = 'Bearer ' + response;
                return $http({
                    method: 'GET',
                    url: 'https://app.stage.connect.trimble.com/tc/api/2.0/files/' + fileId + '/content',
                    headers: {
                        'Authorization': auth
                    },
                    responseType: "arraybuffer",
                    transformRequest: angular.identity
                })
            }).then(complete).catch(failed)
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
            }).then(complete).catch(failed)
        },

        deleteFile: function deleteFile(fileId) {
            return authorize().then(function (response) {
                var auth = 'Bearer ' + response;
                return $http({
                    method: 'DELETE',
                    url: 'https://app.stage.connect.trimble.com/tc/api/2.0/files/' + fileId,
                    headers: {
                        'Authorization': auth
                    },
                    transformRequest: angular.identity
                })
            }).then(complete).catch(failed);
        },

        createFolder: function createFolder(data) {
            return authorize().then(function (response) {
                var auth = 'Bearer ' + response;
                return $http({
                    method: 'POST',
                    url: 'https://app.stage.connect.trimble.com/tc/api/2.0/folders',
                    headers: {
                        'Authorization': auth,
                        'Content-Type': 'application/json'
                    },
                    data: JSON.stringify({
                        'name': data.name,
                        'parentId': data.rootId
                    }),
                    transformRequest: angular.identity
                })
            }).then(complete).catch(failed);
        },

        deleteFolder: function deleteFolder(folderId) {
            return authorize().then(function (response) {
                var auth = 'Bearer ' + response;
                return $http({
                    method: 'DELETE',
                    url: 'https://app.stage.connect.trimble.com/tc/api/2.0/folders/' + folderId,
                    headers: {
                        'Authorization': auth
                    },
                    transformRequest: angular.identity
                })
            }).then(complete).catch(failed);
        },

        getComments: function getComments(data) {
            return authorize().then(function (response) {
                var auth = 'Bearer ' + response;
                return $http({
                    method: 'GET',
                    url: 'https://app.stage.connect.trimble.com/tc/api/2.0/comments?objectId=' + data.objectId + '&objectType=' + data.objectType,
                    headers: {
                        'Authorization': auth,
                        'Content-Type': 'application/json'
                    },
                    transformRequest: angular.identity
                })
            }).then(complete).catch(failed);
        },

        updateComment: function updateComment(data) {
            return authorize().then(function (response) {
                var auth = 'Bearer ' + response;
                return $http({
                    method: 'PATCH',
                    url: 'https://app.stage.connect.trimble.com/tc/api/2.0/comments/' + data.commentId,
                    headers: {
                        'Authorization': auth,
                        'Content-Type': 'application/json'
                    },
                    data: JSON.stringify({
                        'description': data.description
                    }),
                    transformRequest: angular.identity
                })
            }).then(complete).catch(failed);
        },

        addComment: function addComment(data) {
            return authorize().then(function (response) {
                var auth = 'Bearer ' + response;
                return $http({
                    method: 'POST',
                    url: 'https://app.stage.connect.trimble.com/tc/api/2.0/comments',
                    headers: {
                        'Authorization': auth,
                        'Content-Type': 'application/json'
                    },
                    data: JSON.stringify({
                        'objectId': data.objectId,
                        'objectType': data.objectType,
                        'description': data.description
                    }),
                    transformRequest: angular.identity
                })
            }).then(complete).catch(failed);
        },

        copyFile: function copyFile(data) {
            return authorize().then(function (response) {
                var auth = 'Bearer ' + response;
                return $http({
                    method: 'POST',
                    url: 'https://app.stage.connect.trimble.com/tc/api/2.0/files',
                    headers: {
                        'Authorization': auth,
                        'Content-Type': 'application/json'
                    },
                    data: JSON.stringify({
                        'fromFileVersionId': data.fromFileVersionId,
                        'parentId': data.parentId,
                        'parentType': data.parentType,
                        'copyMetaData': data.copyMetaData,
                        'mergeExisting': data.mergeExisting
                    }),
                    transformRequest: angular.identity
                })
            }).then(complete).catch(failed);
        },

        renameFolder: function renameFolder(data) {
            return authorize().then(function (response) {
                var auth = 'Bearer ' + response;
                return $http({
                    method: 'PATCH',
                    url: 'https://app.stage.connect.trimble.com/tc/api/2.0/folders/' + data.folderId,
                    headers: {
                        'Authorization': auth,
                        'Content-Type': 'application/json'
                    },
                    data: JSON.stringify({
                        'name': data.name
                    }),
                    transformRequest: angular.identity
                })
            }).then(complete).catch(failed);
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