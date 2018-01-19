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
var access_token = '';

module.exports.requestToken = function(req, res){
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
    }).then(function (response) {
        access_token = response.token;
        res.status(200).json(response.token);
    }).catch(function (err) {
        console.log(err);
    });
};