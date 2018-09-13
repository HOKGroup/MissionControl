/**
 * Created by konrad.sobon on 2018-09-10.
 */
var mongoose = require('mongoose');
var OnOpeneds = mongoose.model('OnOpeneds');
var OnSyncheds = mongoose.model('OnSyncheds');
var ItemCounts = mongoose.model('ItemCounts');

module.exports = {

    /**
     * Pushes workset info for Open events into array.
     * @param req
     * @param res
     */
    addOnOpened: function (req, res) {
        OnOpeneds.create(req.body, function (err, response){
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
    addOnSynched: function (req, res) {
        OnSyncheds.create(req.body, function (err, response){
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
    addItemsCount: function (req, res) {
        ItemCounts.create(req.body, function (err, response){
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
        OnOpeneds.update(
            { 'centralPath': before },
            { $set: { 'centralPath' : after }},
            { multi: true }, function (err, response){
                OnSyncheds.update(
                    { 'centralPath': before },
                    { $set: { 'centralPath' : after }},
                    { multi: true }, function (err, response){
                        ItemCounts.update(
                            { 'centralPath': before },
                            { $set: { 'centralPath' : after }},
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
                            });
                    });
            });
    },

    /**
     *
     * @param req
     * @param res
     */
    getWorksetsData: function(req, res){
        var limit = 200;
        var pipeline = [];
        var from = new Date(req.body.from);
        var to = new Date(req.body.to);

        if(!req.body.from || !req.body.to){
            pipeline = [
                { $match: { 'centralPath': req.body.centralPath }},
                { $sort: { '_id': -1 }},
                { $limit: limit }
            ];
        } else {
            pipeline = [
                { $match: { $and: [
                    { 'centralPath': req.body.centralPath },
                    { 'createdOn': { $gte: from, $lte: to }}
                ]}}
            ];
        }

        OnOpeneds.aggregate([
            { $facet: {
                'onOpened': pipeline,
                'onSynched': [
                    { $limit: 1 },
                    { $lookup: {
                        from: 'onsyncheds',
                        pipeline: pipeline,
                        as: 'onsynched'
                    }},
                    { $unwind: '$onsynched' },
                    { $replaceRoot: { newRoot: '$onsynched' }}
                ],
                'itemCount': [
                    { $limit: 1 },
                    { $lookup: {
                        from: 'itemcounts',
                        pipeline: pipeline,
                        as: 'itemcount'
                    }},
                    { $unwind: '$itemcount' },
                    { $replaceRoot: { newRoot: '$itemcount' }}
                ]
            }},
            { $project: { 'onOpened': 1, 'onSynched': 1, 'itemCount': 1 }}
        ]).exec(function (err, response){
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

