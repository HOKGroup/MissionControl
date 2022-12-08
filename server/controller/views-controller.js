/**
 * Created by konrad.sobon on 2018-04-24.
 */
var mongoose = require('mongoose');
var Views = mongoose.model('Views');

ViewsService = {
    /**
     * Finds Views collection by central path.
     * @param req
     * @param res
     */
    findByCentralPath: function(req, res){
        // (Konrad) Since we cannot pass file path with "\" they were replaced with illegal pipe char "|".
        // (Konrad) RSN and BIM 360 paths will have forward slashes instead of back slashes.
        var isRevitServer = req.params.uri.match(/rsn:/i);
        var isBim360 = req.params.uri.match(/bim 360:/i);
        var rgx;
        if(isRevitServer || isBim360){
            rgx = req.params.uri.replace(/\|/g, '/').toLowerCase();
        } else {
            rgx = req.params.uri.replace(/\|/g, '\\').toLowerCase();
        }
        Views
            .find(
                {'centralPath': rgx}, function (err, response){
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
     * Creates Views Document.
     * @param req
     * @param res
     */
    add: function(req, res){
        Views
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

    /**
     * Posts Views stats.
     * @param req
     * @param res
     */
    viewStats: function (req, res) {
        var id = req.params.id;
        Views
            .update(
                { '_id': id },
                { '$push': { 'viewStats': req.body }}, function (err, response){
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

    /**
     * Updates the centralPath value. Used by the Configurations tool.
     * @param req
     * @param res
     */
    updateFilePath: function (req, res) {
        var before = req.body.before.replace(/\\/g, '\\').toLowerCase();
        var after = req.body.after.replace(/\\/g, '\\').toLowerCase();
        Views
            .update(
                { 'centralPath': before },
                { '$set': { 'centralPath' : after }}, function (err, response){
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

    /**
     * Retrieves views stats by central path.
     * @param req
     * @param res
     */
    getViewStats: function (req, res) {
        var limit = -200;
        var pipeline = [];
        var from = new Date(req.body.from);
        var to = new Date(req.body.to);

        if(!req.body.from || !req.body.to){
            pipeline = {
                'viewStats': { $slice: ['$viewStats', limit]},
                '_id': 1,
                'centralPath': 1
            };
        } else {
            pipeline = {
                'viewStats': { $filter: {
                    input: '$viewStats',
                    as: 'item',
                    cond: { $and: [
                        { $gte: ['$$item.createdOn', from]},
                        { $lte: ['$$item.createdOn', to]}
                    ]}}
                },
                '_id': 1,
                'centralPath': 1
            };
        }

        Views.aggregate([
            { $match: { 'centralPath': req.body.centralPath }},
            { $project: pipeline }]
        ).exec(function (err, response){
            var result = {
                status: 201,
                message: response[0]
            };
            if (err){
                result.status = 500;
                result.message = err;
            } else if (!response[0]){
                result.status = 404;
                result.message = err;
            }
            res.status(result.status).json(result.message);
        });
    }
};

module.exports = ViewsService;