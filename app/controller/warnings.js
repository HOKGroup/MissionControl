/**
 * Created by konrad.sobon on 2018-08-16.
 */
/**
 * @param {{ existingWarningIds: [string] }} Existing Warning Ids
 * @param {{ newWarnings: [object] }} New Warning Objects
 * @param {{ centralPath: string }} File Path
 */
var mongoose = require('mongoose');
var global = require('./socket/global');
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
                        update: {
                            $set: {
                                'updatedAt': Date.now()
                            },
                            $setOnInsert: {
                                'createdBy': 'Unknown', // override this to unknown
                                'createdAt': Date.now(),
                                'updatedAt': Date.now(),
                                'descriptionText': item.descriptionText,
                                'closedBy': item.closedBy,
                                'closedAt': item.closedAt,
                                'isOpen': item.isOpen,
                                'failingElements': item.failingElements,
                                '__v': 0
                            }
                        },
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

    getOpen: function(req, res) {
        var rgx = global.utilities.uriToString(req.params.uri);
        Warnings
            .find({$and: [{'centralPath': rgx}, {'isOpen': true}]}, function (err, response) {
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

    getByCentralPath: function (req, res) {
        var rgx = global.utilities.uriToString(req.params.uri);

        Warnings
            .find({'centralPath': rgx})
            .exec(function (err, response) {
                var result = {
                    status: 200,
                    message: response
                };
                if (err){
                    result.status = 500;
                    result.message = err;
                } else if (response.length === 0){
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
                    } else if (response.length === 0){
                        result.status = 404;
                        result.message = err;
                    }
                    res.status(result.status).json(result.message);
                }
            )
    },

    /**
     *
     * @param req
     * @param res
     */
    updateFilePath: function (req, res) {
        var before = req.body.before.replace(/\\/g, "\\").toLowerCase();
        var after = req.body.after.replace(/\\/g, "\\").toLowerCase();
        Warnings
            .update(
                { 'centralPath': before },
                { $set: { 'centralPath': after }},
                { multi: true }, function (err, response){
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