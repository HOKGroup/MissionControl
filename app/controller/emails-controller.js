/**
 * Created by konrad.sobon on 2018-02-14.
 */
var config = require('./config');
var nodemailer = require('nodemailer');
var Email = require('email-templates');
var xoauth2 = require('xoauth2');

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
            attachments: [
                {
                    filename: 'header.png',
                    path: 'emails/shares/images/header.png',
                    cid: 'header@hok.com'
                },
                {
                    filename: 'left.png',
                    path: 'emails/shares/images/left.png',
                    cid: 'left@hok.com'
                },
                {
                    filename: 'right.png',
                    path: 'emails/shares/images/right.png',
                    cid: 'right@hok.com'
                },
                {
                    filename: 'facebook.png',
                    path: 'emails/shares/images/facebook.png',
                    cid: 'facebook@hok.com'
                },
                {
                    filename: 'instagram.png',
                    path: 'emails/shares/images/instagram.png',
                    cid: 'instagram@hok.com'
                },
                {
                    filename: 'youtube.png',
                    path: 'emails/shares/images/youtube.png',
                    cid: 'youtube@hok.com'
                },
                {
                    filename: 'twitter.gif',
                    path: 'emails/shares/images/twitter.png',
                    cid: 'twitter@hok.com'
                }
            ]
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


