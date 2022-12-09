/**
 * Created by konrad.sobon on 2018-09-10.
 */
const mongoose = require('mongoose')
const OnOpeneds = mongoose.model('OnOpeneds')
const OnSyncheds = mongoose.model('OnSyncheds')
const ItemCounts = mongoose.model('ItemCounts')

module.exports = {

    /**
     * Pushes workset info for Open events into array.
     * @param req
     * @param res
     */
    addOnOpened: function (req, res) {
        OnOpeneds.create(req.body, function (err, response){
            const result = {
                status: 201,
                message: response
            }
            if (err){
                result.status = 500
                result.message = err
            } else if (!response){
                result.status = 404
                result.message = err
            }
            res.status(result.status).json(result.message)
        })
    },

    /**
     * Pushes workset info for Open events into array.
     * @param req
     * @param res
     */
    addOnSynched: function (req, res) {
        OnSyncheds.create(req.body, function (err, response){
            const result = {
                status: 201,
                message: response
            }
            if (err){
                result.status = 500
                result.message = err
            } else if (!response){
                result.status = 404
                result.message = err
            }
            res.status(result.status).json(result.message)
        })
    },

    /**
     * Pushes workset info for Open events into array.
     * @param req
     * @param res
     */
    addItemsCount: function (req, res) {
        ItemCounts.create(req.body, function (err, response){
            const result = {
                status: 201,
                message: response
            }
            if (err){
                result.status = 500
                result.message = err
            } else if (!response){
                result.status = 404
                result.message = err
            }
            res.status(result.status).json(result.message)
        })
    },

    /**
     * Updates the centralPath value. Used by the Configurations tool.
     * @param req
     * @param res
     */
    updateFilePath: function (req, res) {
        const before = req.body.before.replace(/\\/g, '\\').toLowerCase()
        const after = req.body.after.replace(/\\/g, '\\').toLowerCase()
        OnOpeneds.updateMany(
            { 'centralPath': before },
            { $set: { 'centralPath' : after }},
            { multi: true }, function (_err, _response){
                OnSyncheds.updateMany(
                    { 'centralPath': before },
                    { $set: { 'centralPath' : after }},
                    { multi: true }, function (_err, _response){
                        ItemCounts.updateMany(
                            { 'centralPath': before },
                            { $set: { 'centralPath' : after }},
                            { multi: true }, function (err, response){
                                const result = {
                                    status: 201,
                                    message: response
                                }
                                if (err){
                                    result.status = 500
                                    result.message = err
                                } else if (!response){
                                    result.status = 404
                                    result.message = err
                                }
                                res.status(result.status).json(result.message)
                            })
                    })
            })
    },

    /**
     *
     * @param req
     * @param res
     */
    getWorksetsData: function(req, res){
        const limit = 200
        let pipeline = []
        const from = new Date(req.body.from)
        const to = new Date(req.body.to)

        if (!req.body.from || !req.body.to){
            pipeline = [
                { $match: { 'centralPath': req.body.centralPath }},
                { $sort: { '_id': -1 }},
                { $limit: limit }
            ]
        } else {
            pipeline = [
                { $match: { $and: [
                    { 'centralPath': req.body.centralPath },
                    { 'createdOn': { $gte: from, $lte: to }}
                ]}}
            ]
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
            const result = {
                status: 201,
                message: response
            }
            if (err) {
                result.status = 500
                result.message = err
            } else if (!response) {
                result.status = 404
                result.message = err
            }
            res.status(result.status).json(result.message)
        })
    }
}

