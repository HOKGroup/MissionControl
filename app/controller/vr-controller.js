/**
 * Created by konrad.sobon on 2018-01-09.
 */
var mongoose = require('mongoose');
var global = require('./socket/global');
var request = require('request-promise');
var querystring = require('querystring');

var Vrs = mongoose.model('Vrs');
var username = 'sobon.konrad@gmail.com';
var password = 'Password_123456';
var client_id = 'qK34zw1Ktnvy2R6tMfGf73wXtJca';
var client_secret = 'eAoSUqTSLX_fiZ9r8dxyZ5uUGxMa';
var access_token;

module.exports.uploadFile = function (req, res) {
    authorize
        .then(function (response) { //(Konrad) Add sobon.konrad@gmail.com to users on that project.
            var auth = 'Bearer ' + response.token;
            var options = {
                method: 'POST',
                uri: 'https://app.stage.connect.trimble.com/tc/api/2.0/files',
                headers: {
                    'Authorization': auth,
                    'Content-Type': 'multipart/form-data'
                },
                formData: {
                    'file': req.body.file
                },
                json: {
                    parentId: req.body.parentId,
                    parentType: 'FOLDER'
                }
            };

            return request(options);
        })
        .then(function (response) {
            res.status(201).json(response)
        })
        .catch(function (err) {
            res.status(500).json({ message: err.message })
        })
};

module.exports.getFolderItems = function (req, res) {
    authorize
        .then(function (response) {
            var auth = 'Bearer ' + response.token;
            var options = {
                method: 'GET',
                uri: 'https://app.stage.connect.trimble.com/tc/api/2.0/folders/' + req.params.folderid + '/items',
                headers: {
                    'Authorization': auth,
                    'Content-Type': 'application/json'
                },
                json: true
            };

            return request(options);
        })
        .then(function (response) {
            res.status(200).json(response)
        })
        .catch(function (err) {
            res.status(500).json({ message: err.message })
        })
};

module.exports.addFolder = function (req, res) {
    var name = req.body.name;
    var rootId = req.body.rootId;
    authorize
        .then(function (response) { //(Konrad) Add sobon.konrad@gmail.com to users on that project.
            var auth = 'Bearer ' + access_token;
            var options = {
                method: 'POST',
                uri: 'https://app.stage.connect.trimble.com/tc/api/2.0/folders',
                headers: {
                    'Authorization': auth,
                    'Content-Type': 'application/json'
                },
                json: {
                    'name': name,
                    'parentId': rootId
                }
            };

            return request(options);
        })
        .then(function (response) {
            res.status(200).json(response)
        })
        .catch(function (err) {
            res.status(500).json({ message: err.message })
        })
};


/**
 * Adds default admin user to project. Helpful to have at least one user always
 * be added to every project so that in Trimble's web UI someone can have access
 * to all of the projects.
 * @param req
 * @param res
 */
module.exports.addUser = function (req, res) {
    var trimbleProjectId = req.params.id;
    authorize
        .then(function (response) { //(Konrad) Add sobon.konrad@gmail.com to users on that project.
            var auth = 'Bearer ' + access_token;
            var options = {
                method: 'POST',
                uri: 'https://app.stage.connect.trimble.com/tc/api/2.0/projects/' + trimbleProjectId + '/users',
                headers: {
                    'Authorization': auth,
                    'Content-Type': 'application/json'
                },
                json: {
                    "email": username,
                    "role": "USER"
                }
            };

            return request(options);
        })
        .then(function (response) {
            res.status(200).json(response)
        })
        .catch(function (err) {
            res.status(500).json({ message:err.message })
        })
};

/**
 * Creates new project in Trimble Connect.
 * @param req
 * @param res
 */
module.exports.createProject = function (req, res) {
    authorize
        .then(function (response) { //(Konrad) Create new project.
            access_token = response.token;
            var auth = 'Bearer ' + access_token;
            var options = {
                method: 'POST',
                uri: 'https://app.stage.connect.trimble.com/tc/api/2.0/projects',
                headers: {
                    'Authorization': auth,
                    'Content-Type': 'application/json'
                },
                json: {
                    'name': req.params.name
                }
            };

            return request(options);
        })
        .then(function (response) {
            res.status(200).json(response)
        })
        .catch(function (err) {
            res.status(500).json({ message:err.message })
        })
};

/**
 * Retrieves project from Trimble Connect by name.
 * Works under assumption that all new projects are created with
 * Project Number + Project Name schema.
 * TODO: This is flaky at best. Users can rename projects in Mission Control.
 * @param req
 * @param res
 */
module.exports.getProjectByName = function (req, res) {
    authorize
        .then(function (response) {
            var auth = 'Bearer ' + response.token;
            var options = {
                method: 'GET',
                uri: 'https://app.stage.connect.trimble.com/tc/api/2.0/projects',
                headers: {
                    'Authorization': auth,
                    'Content-Type': 'application/json'
                },
                json: true
            };

            return request(options);
        })
        .then(function (response) {
            var name = req.params.name;
            var project = response.filter(function (item) {
                return item.name === name;
            });
            if(!project || project.length === 0) {
                res.status(204).json(project);
            } else {
                res.status(200).json(project[0]);
            }
        })
        .catch(function (err) {
            res.status(500).json({ message: err.message })
        });
};

/**
 * Gets an access token from Trimble Connect server using oauth2 service.
 * We need to get that token every time we make a call to Trimble since
 * tokens expire.
 */
var authorize = new Promise(
    function authorize(resolve, reject){
        var auth = 'Basic ' + new Buffer(client_id + ':' + client_secret).toString('base64');
        var form = {
            username: username,
            password: password,
            grant_type: 'client_credentials',
            clientDomain: 'trimble.com',
            scope: 'openid'
        };
        var formData = querystring.stringify(form);
        var contentLength = formData.length;
        var options = {
            method: 'POST',
            uri: 'https://identity-stg.trimble.com/token',
            headers: {
                'Content-Length': contentLength,
                'Accept': 'application/json',
                'Authorization': auth,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: formData,
            json: true
        };

        request(options)
            .then(function (response) {
                var requestData = {
                    'jwt': response.id_token
                };
                var options1 = {
                    method: 'POST',
                    uri: 'https://app.stage.connect.trimble.com/tc/api/2.0/auth/token',
                    headers: {
                        'Content-Length': requestData.length,
                        'Content-Type': 'application/json'
                    },
                    json: requestData
                };

                return request(options1);
            })
            .then(function (response) {
                resolve({ token: response.token, message: "Success" });
            })
            .catch(function (err) {
                reject({ token: null, message: err.statusCode });
            });
    }
);