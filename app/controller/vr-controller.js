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
        .then(function (response) { //(Konrad) Add sobon.konrad@gmail.com to users on that project.
            var projectId = response.id;
            var auth = 'Bearer ' + access_token;
            var options = {
                method: 'POST',
                uri: 'https://app.stage.connect.trimble.com/tc/api/2.0/projects/' + projectId + '/users',
                headers: {
                    'Authorization': auth,
                    'Content-Type': 'application/json'
                },
                json: {
                    "email": "sobon.konrad@gmail.com",
                    "role": "USER"
                }
            };

            return request(options);
        })
        .then(function (response) {
            res.status(200).json({ message: response })
        })
        .catch(function (err) {
            res.status(500).json({ message:err.message })
        })
};

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
                res.status(200).json(project);
            }
        })
        .catch(function (err) {
            res.status(500).json({ message: err.message })
        });
};

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