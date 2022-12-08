/**
 * Created by konrad.sobon on 2018-09-06.
 */
const utils = require('./socket/global').utilities
const mongoose = require('mongoose')
const OpenTimes = mongoose.model('OpenTimes')
const SynchTimes = mongoose.model('SynchTimes')
const ModelSizes = mongoose.model('ModelSizes')

module.exports = {
    /**
     *
     * @param req
     * @param res
     */
    addOpenTime: function(req, res){
        OpenTimes.create(req.body, function (err, response){
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
     *
     * @param req
     * @param res
     */
    addSynchTime: function(req, res){
        SynchTimes.create(req.body, function (err, response){
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
     *
     * @param req
     * @param res
     */
    addModelSize: function(req, res){
        ModelSizes.create(req.body, function (err, response){
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
     * Retrieves user names from openTimes collection. It is used by Sheets Tools
     * to get a list of all users that work on the given model.
     * @param req
     * @param res
     */
    getUserNamesByCentralPath: function (req, res) {
        const rgx = utils.uriToString(req.params.uri)
        OpenTimes
            .find(
                { 'centralPath': rgx},
                { 'user': 1 }, function (err, response){
                    const result = {
                        status: 200,
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
                }
            )
    },

    /**
     * Updates the centralPath value. Used by the Configurations tool.
     * @param req
     * @param res
     */
    updateFilePath: function (req, res) {
        const before = req.body.before.replace(/\\/g, '\\').toLowerCase()
        const after = req.body.after.replace(/\\/g, '\\').toLowerCase()
        OpenTimes.update(
            { 'centralPath': before },
            { $set: { 'centralPath' : after }},
            { multi: true }, function (_err, _response){
                SynchTimes.update(
                    { 'centralPath': before },
                    { $set: { 'centralPath': after }},
                    { multi: true }, function (_err, _response) {
                        ModelSizes.update(
                            { 'centralPath': before },
                            { $set: { 'centralPath': after }},
                            { multi: true }, function (err, response) {
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
    getModelsData: function(req, res){
        const limit = 200
        let pipeline = []
        const from = new Date(req.body.from)
        const to = new Date(req.body.to)

        if (!req.body.from || !req.body.to){
            pipeline = [
                { $match: { 'centralPath': req.body.centralPath }},
                { $sort: { 'createdOn': -1 }}, // latest
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

        OpenTimes.aggregate([
            { $facet: {
                'opentimes': pipeline,
                'synchtimes': [
                    { $limit: 1 },
                    { $lookup: {
                        from: 'synchtimes',
                        pipeline: pipeline,
                        as: 'synchtimes'
                    }},
                    { $unwind: '$synchtimes' },
                    { $replaceRoot: { newRoot: '$synchtimes' }}
                ],
                'modelsizes': [
                    { $limit: 1 },
                    { $lookup: {
                        from: 'modelsizes',
                        pipeline: pipeline,
                        as: 'modelsizes'
                    }},
                    { $unwind: '$modelsizes' },
                    { $replaceRoot: { newRoot: '$modelsizes' }}
                ],
                'onopened': [
                    { $limit: 1 },
                    { $lookup: {
                        from: 'onopeneds',
                        pipeline: pipeline,
                        as: 'onopened'
                    }},
                    { $unwind: '$onopened' },
                    { $replaceRoot: { newRoot: '$onopened' }}
                ],
                'onsynched': [
                    { $limit: 1 },
                    { $lookup: {
                        from: 'onsyncheds',
                        pipeline: pipeline,
                        as: 'onsynched'
                    }},
                    { $unwind: '$onsynched' },
                    { $replaceRoot: { newRoot: '$onsynched' }}
                ]
            }},
            { $project: {
                'opentimes': { $reverseArray: '$opentimes' },
                'synchtimes': { $reverseArray: '$synchtimes' },
                'modelsizes': { $reverseArray: '$modelsizes' },
                'onopened': { $reverseArray: '$onopened' },
                'onsynched': { $reverseArray: '$onsynched' }}}
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
    },

    /**
     *
     * @param req
     * @param res
     */
    getByDate: function (req, res) {
        const from = new Date(req.body.from)
        const to = new Date(req.body.to)
        OpenTimes
            .aggregate([
                { $facet: {
                    'opentimes': [
                        { $match: { $and: [
                            { 'centralPath': { $in: req.body.centralPaths }},
                            { 'createdOn': { $gte: from, $lte: to }}
                        ]}}
                    ],
                    'synchtimes': [
                        { $limit: 1 },
                        { $lookup: {
                            from: 'synchtimes',
                            pipeline: [
                                { $match: { $and: [
                                    { 'centralPath': { $in: req.body.centralPaths }},
                                    { 'createdOn': { $gte: from, $lte: to }}
                                ]}}
                            ],
                            as: 'synchtimes'
                        }},
                        { $unwind: '$synchtimes' },
                        { $replaceRoot: { newRoot: '$synchtimes' }}
                    ]
                }},
                { $project: { 'opentimes': 1, 'synchtimes': 1 }}
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
    },

    /**
     *
     * @param req
     * @param res
     */
    getAll: function (req, res) {
        OpenTimes
            .aggregate([
                { $facet: {
                    'opentimes': [
                        { $match: { 'centralPath': { $in: req.body.centralPaths }}}
                    ],
                    'synchtimes': [
                        { $limit: 1 },
                        { $lookup: {
                            from: 'synchtimes',
                            pipeline: [
                                { $match: { 'centralPath': { $in: req.body.centralPaths }}}
                            ],
                            as: 'synchtimes'
                        }},
                        { $unwind: '$synchtimes' },
                        { $replaceRoot: { newRoot: '$synchtimes' }}
                    ]
                }},
                { $project: { 'opentimes': 1, 'synchtimes': 1 }}
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