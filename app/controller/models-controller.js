/**
 * Created by konrad.sobon on 2018-04-24.
 */
var mongoose = require('mongoose');
var Models = mongoose.model('Models');

ModelsService = {
    /**
     * Createa a new Views Document.
     * @param req
     * @param res
     */
    add: function(req, res){
        Models
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
     * Posts model siezes.
     * @param req
     * @param res
     */
    postModelSize: function (req, res) {
        var id = req.params.id;
        Models
            .update(
                { '_id': id },
                { '$push': { 'modelSizes': req.body }}, function (err, response){
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
     * Posts model open times.
     * @param req
     * @param res
     */
    postModelOpenTime: function (req, res) {
        var id = req.params.id;
        Models
            .update(
                {'_id': id},
                {'$push': {'openTimes': req.body}}, function (err, response){
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
     * Posts model synch time.
     * @param req
     * @param res
     */
    postModelSynchTime: function (req, res) {
        var id = req.params.id;
        Models
            .update(
                {'_id': id},
                {'$push': {'synchTimes': req.body}}, function (err, response){
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
        var before = req.body.before.replace(/\\/g, "\\").toLowerCase();
        var after = req.body.after.replace(/\\/g, "\\").toLowerCase();
        Models
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
     * Retrieves model stats data by central path.
     * It also aggregates data from worksets and
     * filters by provided date range.
     * @param req
     * @param res
     */
    getModelStats: function (req, res) {
        var from = new Date(req.body.from);
        var to = new Date(req.body.to);
        Models
            .aggregate([
                { $match: { 'centralPath': req.body.centralPath }},
                { $lookup: {
                    from: 'worksets',
                    localField: 'centralPath',
                    foreignField: 'centralPath',
                    as: 'worksets'
                }},
                { $unwind: '$worksets'},
                { $project: {
                    'modelSizes': { $filter: {
                        input: '$modelSizes',
                        as: 'item',
                        cond: { $and: [
                            { $gte: ['$$item.createdOn', from]},
                            { $lte: ['$$item.createdOn', to]}
                        ]}
                    }},
                    'openTimes': { $filter: {
                        input: '$openTimes',
                        as: 'item',
                        cond: { $and: [
                            { $gte: ['$$item.createdOn', from]},
                            { $lte: ['$$item.createdOn', to]}
                        ]}
                    }},
                    'synchTimes': { $filter: {
                        input: '$synchTimes',
                        as: 'item',
                        cond: { $and: [
                            { $gte: ['$$item.createdOn', from]},
                            { $lte: ['$$item.createdOn', to]}
                        ]}
                    }},
                    'worksets.onOpened': { $filter: {
                        input: '$worksets.onOpened',
                        as: 'item',
                        cond: { $and: [
                            { $gte: ['$$item.createdOn', from]},
                            { $lte: ['$$item.createdOn', to]}
                        ]}
                    }},
                    'worksets.onSynched': { $filter: {
                        input: '$worksets.onSynched',
                        as: 'item',
                        cond: { $and: [
                            { $gte: ['$$item.createdOn', from]},
                            { $lte: ['$$item.createdOn', to]}
                        ]}
                    }},
                    'centralPath': 1
                }}]
            ).exec(function (err, response){
                console.log(response);
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
    },

    /**
     * Retrieves user names from openTimes collection. It is used by Sheets Tools
     * to get a list of all users that work on the given model.
     * @param req
     * @param res
     */
    getUserNamesByCentralPath: function (req, res) {
        // (Konrad) Since we cannot pass file path with "\" they were replaced with illegal pipe char "|".
        // (Konrad) RSN and A360 paths will have forward slashes instead of back slashes.
        var rgx;
        if(req.params.uri.includes('RSN:') || req.params.uri.includes('BIM 360:')){
            rgx = req.params.uri.replace(/\|/g, "/").toLowerCase();
        } else {
            rgx = req.params.uri.replace(/\|/g, "\\").toLowerCase();
        }
        Models
            .find(
                { 'centralPath': rgx},
                { 'openTimes.user': 1 }, function (err, response){
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
                }
            )
    }
};

module.exports = ModelsService;