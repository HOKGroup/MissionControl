/**
 * Created by konrad.sobon on 2018-07-27.
 */
var mongoose = require('mongoose');
var ZombieLogs = mongoose.model('ZombieLogs');

ZombieLogsService = {
    /**
     * Creates a Log entry for ZombieService.
     * @param req
     * @param res
     */
    add: function(req, res){
        ZombieLogs
            .create(req.body, function (err, response){
                var result = {
                    status: 201,
                    message: response
                };
                if (err){
                    result.status = 500;
                    result.message = err;
                } else if (!response){
                    result.status = 404;
                    result.message = err;
                }
                res.status(result.status).json(result.message);
            });
    },

    get : function(req, res){
        ZombieLogs
            .find({})
            .sort('-createdAt')
            .limit(200)
            .exec(function (err, response){
                var result = {
                    status: 200,
                    message: response
                };
                if (err){
                    result.status = 500;
                    result.message = err;
                } else if (!response){
                    result.status = 404;
                    result.message = err;
                }
                res.status(result.status).json(result.message);
            });
    },

    getByDate : function(req, res){
        var from = new Date(req.body.from);
        var to = new Date(req.body.to);
        var office = req.body.office;
        if (office.name === 'All'){
            ZombieLogs
                .find(
                    {'createdAt': {'$gte': from, '$lte': to}}
                )
                .exec(function (err, response){
                    var result = {
                        status: 201,
                        message: response
                    };
                    if (err){
                        result.status = 500;
                        result.message = err;
                    } else if (!response){
                        result.status = 404;
                        result.message = err;
                    }
                    res.status(result.status).json(result.message);
                });
        } else {
            var regex = [];
            office.code.forEach(function (item) {
                var ex = new RegExp('^' + item, 'i');
                regex.push(ex);
            });
            ZombieLogs
                .find(
                    {'createdAt': {'$gte': from, '$lte': to}, 'machine': {'$in': regex}}
                )
                .exec(function (err, response){
                    var result = {
                        status: 201,
                        message: response
                    };
                    if (err){
                        result.status = 500;
                        result.message = err;
                    } else if (!response){
                        result.status = 404;
                        result.message = err;
                    }
                    res.status(result.status).json(result.message);
                });
        }
    }
};

module.exports = ZombieLogsService;