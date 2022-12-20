/**
 * Created by konrad.sobon on 2018-07-27.
 */
const mongoose = require('mongoose')
const ZombieLogs = mongoose.model('ZombieLogs')

const ZombieLogsService = {
    /**
     * Creates a Log entry for ZombieService.
     * @param req
     * @param res
     */
    add: function(req, res){
        ZombieLogs
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
     *
     * @param req
     * @param res
     */
    get : function(req, res){
        ZombieLogs
            .find({})
            .sort({'_id': -1})
            .limit(500)
            .exec(function (err, response){
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
            })
    },

    /**
     *
     * @param req
     * @param res
     */
    getByDate : function(req, res){
        const from = new Date(req.body.from)
        const to = new Date(req.body.to)
        const office = req.body.office
        if (office.name === 'All'){
            ZombieLogs
                .find(
                    {'createdAt': {'$gte': from, '$lte': to}}
                )
                .exec(function (err, response){
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
        } else {
            const regex = []
            office.code.forEach(function (item) {
                const ex = new RegExp('^' + item, 'i')
                regex.push(ex)
            })
            ZombieLogs
                .find(
                    {'createdAt': {'$gte': from, '$lte': to}, 'machine': {'$in': regex}}
                )
                .exec(function (err, response){
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
        }
    }
}

module.exports = ZombieLogsService