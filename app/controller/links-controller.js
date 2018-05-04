/**
 * Created by konrad.sobon on 2018-04-24.
 */
var mongoose = require('mongoose');
var Links = mongoose.model('Links');

LinksService = {
    // /**
    //  * Finds Links collection by central path.
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
    //     Links
    //         .find(
    //             { "centralPath": rgx }, function (err, response){
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
        Links
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
     * Pushes Links info into an array
     * @param req
     * @param res
     */
    linkStats: function (req, res) {
        var id = req.params.id;
        Links
            .update(
                { '_id': id },
                { '$push': { 'linkStats': req.body}}, function (err, response){
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
        Links
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
     * Retrieves latest entry in the Link Stats array.
     * @param req
     * @param res
     */
    getLinkStats: function (req, res) {
        var from = new Date(req.body.from);
        var to = new Date(req.body.to);
        Links
            .aggregate([
                { $match: { 'centralPath': req.body.centralPath }},
                { $project: {
                    'linkStats': { $filter: {
                        input: '$linkStats',
                        as: 'item',
                        cond: { $and: [
                            { $gte: ['$$item.createdOn', from]},
                            { $lte: ['$$item.createdOn', to]}
                        ]}
                    }},
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

module.exports = LinksService;