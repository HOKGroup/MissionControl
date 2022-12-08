/**
 * Created by konrad.sobon on 2018-04-24.
 */
const mongoose = require('mongoose')
const Links = mongoose.model('Links')

const LinksService = {
    /**
     * Creates Links Document.
     * @param req
     * @param res
     */
    add: function(req, res){
        Links
            .create(req.body, function (err, response){
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
     * Pushes Links info into an array
     * @param req
     * @param res
     */
    linkStats: function (req, res) {
        const id = req.params.id
        Links
            .update(
                { '_id': id },
                { '$push': { 'linkStats': req.body}}, function (err, response){
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
        Links
            .update(
                { 'centralPath': before },
                { '$set': { 'centralPath' : after }}, function (err, response){
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
     * Retrieves latest entry in the Link Stats array.
     * @param req
     * @param res
     */
    getLinkStats: function (req, res) {
        const limit = -200
        let pipeline = []
        const from = new Date(req.body.from)
        const to = new Date(req.body.to)

        if (!req.body.from || !req.body.to){
            pipeline = {
                'linkStats': { $slice: ['$linkStats', limit]},
                '_id': 1,
                'centralPath': 1
            }
        } else {
            pipeline = {
                'linkStats': { $filter: {
                    input: '$linkStats',
                    as: 'item',
                    cond: { $and: [
                        { $gte: ['$$item.createdOn', from]},
                        { $lte: ['$$item.createdOn', to]}
                    ]}}
                },
                '_id': 1,
                'centralPath': 1
            }
        }

        Links.aggregate([
            { $match: { 'centralPath': req.body.centralPath }},
            { $project: pipeline }
        ]).exec(function (err, response){
            const result = {
                status: 201,
                message: response[0]
            }
            if (err){
                result.status = 500
                result.message = err
            } else if (!response[0]){
                result.status = 404
                result.message = err
            }
            res.status(result.status).json(result.message)
        })
    }
}

module.exports = LinksService