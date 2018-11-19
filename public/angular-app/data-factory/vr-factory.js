/**
 * Created by konrad.sobon on 2018-01-09.
 */
angular.module('MissionControlApp').factory('VrFactory', VrFactory);

// (Konrad) Look for HOK Teams Mission Control Wiki page. It has all of these values updated.
// Previous credentials that were used here were reset so that we don't compromise them when
// Mission Control was open sourced. 
var username = '';
var password = '';
var client_id = '';
var client_secret = '';

function VrFactory($http, $base64){
    return {
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
            var auth = 'Bearer ' + window.localStorage.getItem('tc_token');
            return $http({
                method: 'POST',
                url: 'https://app.stage.connect.trimble.com/tc/api/2.0/projects',
                headers: {
                    'Authorization': auth,
                    'Cache-Control': 'no-cache',
                    'Content-Type': 'application/json'
                },
                data: JSON.stringify({
                    "name": projectName
                }),
                transformRequest: angular.identity
            }).then(complete).catch(failed)
        },

        addUser: function addUser(projectId) {
            var auth = 'Bearer ' + window.localStorage.getItem('tc_token');
            return $http({
                method: 'POST',
                url: 'https://app.stage.connect.trimble.com/tc/api/2.0/projects/' + projectId + '/users',
                headers: {
                    'Authorization': auth,
                    'Cache-Control': 'no-cache',
                    'Content-Type': 'application/json'
                },
                data: JSON.stringify({
                    "email": username,
                    "role": "USER"
                }),
                transformRequest: angular.identity
            }).then(complete).catch(failed)
        },

        getFolderItems: function getFolderItems(folderId) {
            var auth = 'Bearer ' + window.localStorage.getItem('tc_token');
            return $http({
                method: 'GET',
                url: 'https://app.stage.connect.trimble.com/tc/api/2.0/folders/' + folderId + '/items',
                headers: {
                    'Authorization': auth,
                    'Content-Type': 'application/json'
                },
                transformRequest: angular.identity
            }).then(complete).catch(failed)
        },

        //TODO: Not used.
        downloadFile: function downloadFile(fileId) {
            var auth = 'Bearer ' + window.localStorage.getItem('tc_token');
            return $http({
                method: 'GET',
                url: 'https://app.stage.connect.trimble.com/tc/api/2.0/files/' + fileId + '/content',
                headers: {
                    'Authorization': auth
                },
                responseType: "arraybuffer",
                transformRequest: angular.identity
            }).then(complete).catch(failed)
        },

        uploadFile: function uploadFile(data) {
            var auth = 'Bearer ' + window.localStorage.getItem('tc_token');
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
            }).then(complete).catch(failed)
        },

        deleteFile: function deleteFile(fileId) {
            var auth = 'Bearer ' + window.localStorage.getItem('tc_token');
            return $http({
                method: 'DELETE',
                url: 'https://app.stage.connect.trimble.com/tc/api/2.0/files/' + fileId,
                headers: {
                    'Authorization': auth
                },
                transformRequest: angular.identity
            }).then(complete).catch(failed);
        },

        createFolder: function createFolder(data) {
            var auth = 'Bearer ' + window.localStorage.getItem('tc_token');
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
            }).then(complete).catch(failed);
        },

        deleteFolder: function deleteFolder(folderId) {
            var auth = 'Bearer ' + window.localStorage.getItem('tc_token');
            return $http({
                method: 'DELETE',
                url: 'https://app.stage.connect.trimble.com/tc/api/2.0/folders/' + folderId,
                headers: {
                    'Authorization': auth
                },
                transformRequest: angular.identity
            }).then(complete).catch(failed);
        },

        getComments: function getComments(data) {
            var auth = 'Bearer ' + window.localStorage.getItem('tc_token');
            return $http({
                method: 'GET',
                url: 'https://app.stage.connect.trimble.com/tc/api/2.0/comments?objectId=' + data.objectId + '&objectType=' + data.objectType,
                headers: {
                    'Authorization': auth,
                    'Content-Type': 'application/json'
                },
                transformRequest: angular.identity
            }).then(complete).catch(failed);
        },

        updateComment: function updateComment(data) {
            var auth = 'Bearer ' + window.localStorage.getItem('tc_token');
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
            }).then(complete).catch(failed);
        },

        addComment: function addComment(data) {
            var auth = 'Bearer ' + window.localStorage.getItem('tc_token');
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
            }).then(complete).catch(failed);
        },

        copyFile: function copyFile(data) {
            var auth = 'Bearer ' + window.localStorage.getItem('tc_token');
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
            }).then(complete).catch(failed);
        },

        renameFolder: function renameFolder(data) {
            var auth = 'Bearer ' + window.localStorage.getItem('tc_token');
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
            }).then(complete).catch(failed);
        }

        // createShare: function createShare(data) {
        //     var auth = 'Bearer ' + window.localStorage.getItem('tc_token');
        //     return $http({
        //         method: 'POST',
        //         url: 'https://app.stage.connect.trimble.com/tc/api/2.0/shares',
        //         headers: {
        //             'Authorization': auth,
        //             'Content-Type': 'application/json'
        //         },
        //         data: JSON.stringify({
        //             'mode': data.mode,
        //             'projectId': data.projectId,
        //             'objects': data.objects,
        //             'permission': 'DOWNLOAD',
        //             'notify': data.notify,
        //             'message': data.message
        //         }),
        //         transformRequest: angular.identity
        //     }).then(complete).catch(failed);
        // },

        // getShare: function getShare(shareId) {
        //     var auth = 'Bearer ' + window.localStorage.getItem('tc_token');
        //     return $http({
        //         method: 'GET',
        //         url: 'https://app.stage.connect.trimble.com/tc/api/2.0/shares/' + shareId,
        //         headers: {
        //             'Authorization': auth,
        //             'Content-Type': 'application/json'
        //         },
        //         transformRequest: angular.identity
        //     }).then(complete).catch(failed);
        // },

        // updateShare: function updateShare(data) {
        //     var auth = 'Bearer ' + window.localStorage.getItem('tc_token');
        //     return $http({
        //         method: 'PATCH',
        //         url: 'https://app.stage.connect.trimble.com/tc/api/2.0/shares/' + data.shareId,
        //         headers: {
        //             'Authorization': auth,
        //             'Content-Type': 'application/json'
        //         },
        //         data: JSON.stringify({
        //             'notify': data.notify,
        //             'message': data.message,
        //             'objects': data.objects
        //         }),
        //         transformRequest: angular.identity
        //     }).then(complete).catch(failed);
        // },

        // getShares: function getShares(projectId) {
        //     var auth = 'Bearer ' + window.localStorage.getItem('tc_token');
        //     return $http({
        //         method: 'GET',
        //         url: 'https://app.stage.connect.trimble.com/tc/api/2.0/shares?projectId=' + projectId,
        //         headers: {
        //             'Authorization': auth,
        //             'Content-Type': 'application/json'
        //         },
        //         transformRequest: angular.identity
        //     }).then(complete).catch(failed);
        // }
    };

    /**
     *
     * @returns {*|Promise}
     */
    function authorize() {
        var auth = 'Basic ' + $base64.encode(client_id + ':' + client_secret).toString('base64');
        var postData = 'username=' + username + '&password=' + password + '&grant_type=password&clientDomain=trimble.com&scope=openid';
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
            window.localStorage.setItem('tc_token', response.data.token);
            return response.data.token;
        }).catch(failed);
    }

    function complete(response) {
        return response;
    }

    function failed(error) {
        console.log(error.statusText);
        return error;
    }
}
