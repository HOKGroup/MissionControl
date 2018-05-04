/**
 * Created by konrad.sobon on 2018-04-23.
 */
var mongoose = require('mongoose');
var Worksets = mongoose.model('Worksets');

WorksetService = {
    // /**
    //  * Finds Worksets collection by central path.
    //  * @param req
    //  * @param res
    //  */
    // findByCentralPath: function(req, res){
    //     // (Konrad) Since we cannot pass file path with "\" they were replaced with illegal pipe char "|".
    //     // (Konrad) RSN and BIM 360 paths will have forward slashes instead of back slashes.
    //     var rgx;
    //     if(req.params.uri.includes('RSN:') || req.params.uri.includes('BIM 360:')){
    //         rgx = req.params.uri.replace(/\|/g, "/").toLowerCase();
    //     } else {
    //         rgx = req.params.uri.replace(/\|/g, "\\").toLowerCase();
    //     }
    //     Worksets
    //         .find(
    //             {"centralPath": rgx}, function (err, response){
    //                 var result = {
    //                     status: 200,
    //                     message: response
    //                 };
    //                 if (err){
    //                     result.status = 500;
    //                     result.message = err;
    //                 } else if (!response){
    //                     result.status = 404;
    //                     result.message = err;
    //                 }
    //                 res.status(result.status).json(result.message);
    //             })
    // },

    /**
     *
     * @param req
     * @param res
     */
    add: function(req, res){
        Worksets
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
     * Pushes Workset Item counts into an array.
     * @param req
     * @param res
     */
    postItemCount: function (req, res) {
        var id = req.params.id;
        Worksets
            .update(
                { '_id': id },
                { '$push': { 'itemCount': req.body }}, function (err, response){
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
     * Pushes workset info for Open events into array.
     * @param req
     * @param res
     */
    onOpened: function (req, res) {
        var id = req.params.id;
        Worksets
            .update(
                { '_id': id },
                { '$push': { 'onOpened': req.body }}, function (err, response){
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
     * Pushes Workset info for Synch events into an array.
     * @param req
     * @param res
     */
    onSynched: function (req, res) {
        var id = req.params.id;
        Worksets
            .update(
                { '_id': id },
                { '$push': { 'onSynched': req.body}}, function (err, response){
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
        Worksets
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
     *
     * @param req
     * @param res
     */
    getWorksetStats: function (req, res) {
        var from = new Date(req.body.from);
        var to = new Date(req.body.to);
        Worksets
            .aggregate([
                { $match: { 'centralPath': req.body.centralPath }},
                { $project: {
                    'onOpened': { $filter: {
                        input: '$onOpened',
                        as: 'item',
                        cond: { $and: [
                            { $gte: ['$$item.createdOn', from]},
                            { $lte: ['$$item.createdOn', to]}
                        ]}
                    }},
                    'onSynched': { $filter: {
                        input: '$onSynched',
                        as: 'item',
                        cond: { $and: [
                            { $gte: ['$$item.createdOn', from]},
                            { $lte: ['$$item.createdOn', to]}
                        ]}
                    }},
                    'itemCount': { $slice: ['$itemCount', -1]},
                    '_id': 1,
                    'centralPath': 1
                }}]
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

module.exports = WorksetService;