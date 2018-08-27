/**
 * Created by konrad.sobon on 2018-08-16.
 */
/**
 * @param {{ existingWarningIds: [string] }} Existing Warning Ids
 * @param {{ newWarnings: [object] }} New Warning Objects
 * @param {{ centralPath: string }} File Path
 */
var mongoose = require('mongoose');
var Warnings = mongoose.model('Warnings');

WarningsService = {
    /**
     * Method used to only create new warnings if they don't exist.
     * @param req
     * @param res
     */
    add: function(req, res){
        Warnings.bulkWrite(
            req.body.map(function (item) {
                return {
                    'updateOne': {
                        filter: {'centralPath': item.centralPath, 'uniqueId': item.uniqueId},
                        update: {$set: {
                            'createdBy': 'Unknown', // override this to unknown
                            'descriptionText': item.descriptionText,
                            'createdAt': Date.now(),
                            'closedBy': item.closedBy,
                            'closedAt': item.closedAt,
                            'isOpen': item.isOpen,
                            'failingElements': item.failingElements,
                            'updatedAt': Date.now(),
                            '__v': 0
                        }},
                        upsert: true
                    }
                }
            }), function (err, response) {
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
            }
        );
    },

    /**
     * Method used to make updates to existing warnings or create new ones.
     * @param req
     * @param res
     */
    update: function(req, res){
        Warnings.update(
            {'centralPath': req.body.centralPath, 'isOpen': true, 'uniqueId': {$nin: req.body.existingWarningIds}},
            {$set: {'isOpen': false, 'closedBy': req.body.closedBy, 'closedAt': Date.now()}},
            {multi: true}, function (err, response){
                var result = {
                    status: 201,
                    message: response
                };
                Warnings.insertMany(req.body.newWarnings, function (err, response) {
                    if (err){
                        result.status = 500;
                        result.message = err;
                    } else if (!response){
                        result.status = 404;
                        result.message = err;
                    }
                    res.status(result.status).json(result.message);
                })
            });
    },

    getByCentralPath: function (req, res) {
        // (Konrad) Since we cannot pass file path with "\" they were replaced with illegal pipe char "|".
        // (Konrad) RSN and A360 paths will have forward slashes instead of back slashes.
        var isRevitServer = req.params.uri.match(/rsn:/i);
        var isBim360 = req.params.uri.match(/bim 360:/i);
        var rgx;
        if(isRevitServer || isBim360){
            rgx = req.params.uri.replace(/\|/g, "/").toLowerCase();
        } else {
            rgx = req.params.uri.replace(/\|/g, "\\").toLowerCase();
        }

        Warnings
            .find({'centralPath': rgx})
            .sort({'_id': -1})
            .limit(200)
            .exec(function (err, response) {
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
        })
    },

    /**
     * Retrieves latest entry in the Groups Stats array.
     * @param req
     * @param res
     */
    getWarningStats: function (req, res) {
        var from = new Date(req.body.from);
        var to = new Date(req.body.to);
        Warnings
            .find(
                {'centralPath': req.body.centralPath, 'createdAt': {$gte: from, $lte: to}}, function (err, response){
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
                }
            )
    }
};

module.exports = WarningsService;