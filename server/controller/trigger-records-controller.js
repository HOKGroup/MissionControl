var mongoose = require('mongoose');
TriggerRecord = mongoose.model('TriggerRecord');

TriggerRecordService = {
    /**
     * Finds Trigger Record Document by central path. This is used pretty much just to get the _id
     * since it will be used on the .NET side to post new Trigger Record. No need to retrieve entire
     * document.
     * @param req
     * @param res
     */
    findByCentralPath: function (req, res) {
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

        TriggerRecord
            .find({'centralPath': rgx})
            .select('_id centralPath')
            .exec(function (err, response) {
                var result = {
                    status: 200,
                    message: response
                };
                if (err) {
                    result.status = 500;
                    result.message = err;
                } else if (!response) {
                    result.status = 404;
                    result.message = err;
                }
                res.status(result.status).json(result.message);
            });
    },

    /**
     * Creates new Trigger Record Document.
     * @param req
     * @param res
     */
    add: function (req, res) {
        TriggerRecord
            .create(req.body, function (err, response) {
                var result = {
                    status: 201,
                    message: response
                };
                if (err) {
                    result.status = 500;
                    result.message = err;
                } else if (!response) {
                    result.status = 404;
                    result.message = err;
                }
                res.status(result.status).json(result.message);
            });
    },

    /**
     * Removes many Trigger Record documents by their Central Path.
     * @param req
     * @param res
     */
    deleteMany: function (req, res) {
        var ids = req.body.map(function (item) {
            return mongoose.Types.ObjectId(item);
        });
        TriggerRecord
            .remove(
                {'_id': {$in: ids}}, function (err, response) {
                    var result = {
                        status: 201,
                        message: response
                    };
                    if (err) {
                        result.status = 500;
                        result.message = err;
                    } else if (!response) {
                        result.status = 404;
                        result.message = err;
                    }
                    res.status(result.status).json(result.message);
                });
    },

    /**
     * Adds new Trigger Record to array.
     * @param req
     * @param res
     */
    postTriggerRecord: function (req, res) {
        var id = req.params.id;
        TriggerRecord
            .update(
                {'_id': id},
                {$push: {'triggerRecords': req.body}}, function (err, response) {
                    var result = {
                        status: 201,
                        message: response
                    };
                    if (err) {
                        result.status = 500;
                        result.message = err;
                    } else if (!response) {
                        result.status = 404;
                        result.message = err;
                    }
                    res.status(result.status).json(result.message);
                });
    },

    /**
     * Retrieves all Trigger Record Documents by Central Path and filters values by date.
     * @param req
     * @param res
     */
    findManyByCentralPathDates: function (req, res) {
        var from = new Date(req.body.from);
        var to = new Date(req.body.to);
        TriggerRecord
            .aggregate([
                {$match: {'centralPath': {$in: req.body.paths}}},
                {$project: {
                    'triggerRecords': {
                        $filter: {
                            input: '$triggerRecords',
                            as: 'item',
                            cond: {
                                $and: [
                                    {$gte: ['$$item.createdOn', from]},
                                    {$lte: ['$$item.createdOn', to]}
                                ]
                            }
                        }
                    },
                    'centralPath': 1
                }}]
            ).exec(function (err, response) {
                var result = {
                    status: 200,
                    message: response
                };
                if (err) {
                    result.status = 500;
                    result.message = err;
                } else if (!response) {
                    result.status = 404;
                    result.message = err;
                }
                res.status(result.status).json(result.message);
            });
    },

    /**
     * Updates file path value when Configuration is changed.
     * @param req
     * @param res
     */
    updateFilePath: function (req, res) {
        var before = req.body.before.replace(/\\/g, '\\').toLowerCase();
        var after = req.body.after.replace(/\\/g, '\\').toLowerCase();
        TriggerRecord
            .update(
                {'centralPath': before},
                {'$set': {'centralPath': after}}, function (err, response) {
                    var result = {
                        status: 201,
                        message: response
                    };
                    if (err) {
                        result.status = 500;
                        result.message = err;
                    } else if (!response) {
                        result.status = 404;
                        result.message = err;
                    }
                    res.status(result.status).json(result.message);
                });
    }
};

module.exports = TriggerRecordService;