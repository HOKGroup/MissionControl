/**
 * Created by konrad.sobon on 2018-07-27.
 */
var mongoose = require('mongoose');
var global = require('./socket/global');
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
                global.io.sockets.in('zombie_logs').emit('log_added', req.body);
                console.log('Emmitted socket msg!');
                res.status(result.status).json(result.message);
            });
    },

    /**
     *
     * @param req
     * @param res
     */
    get : function(req, res){
        ZombieLogs
            .find({})
            .sort({'_id': -1})
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

    /**
     *
     * @param req
     * @param res
     */
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
    },

    /**
     *
     * @param req
     * @param res
     */
    getDirtyDozen : function(req, res){
        ZombieLogs
            .aggregate([
                { $match: { "level": "Fatal" }},
                { $sort: { "createdAt": -1 }},
                { $group: {
                    "_id": "$machine",
                    "level": { $first: "$level" },
                    "createdAt": { $first: "$createdAt" }
                }},
                { $limit: 10 },
                { $project: {
                    "machine": "$_id",
                    "level": 1,
                    "_id": 0,
                    "createdAt": 1
                }}
            ])
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
    }
};

module.exports = ZombieLogsService;