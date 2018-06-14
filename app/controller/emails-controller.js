/**
 * Created by konrad.sobon on 2018-02-14.
 */
var config = require('./config');
var nodemailer = require('nodemailer');
var Email = require('email-templates');

var transport = nodemailer.createTransport({
    host: config.host,
    port: 25,
    tls: {rejectUnauthorized: false}
});

module.exports.sendEmail = function (req, res) {
    var recipients = req.body.recipients;
    var email = new Email({
        message: {
            from: config.user,
            attachments: req.body.attachments
        },
        transport: transport
    });
    email.send({
        template: req.body.template,
        message: {
            to: recipients
        },
        locals: req.body.locals
    }).then(function(response){
        res.status(200).json(response);
    }).catch(function(error){
        res.status(500).json(error);
    })
};


