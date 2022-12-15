/**
 * Created by konrad.sobon on 2018-09-13.
 */
const mongoose = require('mongoose')
const Users = mongoose.model('Users')

module.exports = {
    /**
     *
     * @param req
     * @param res
     */
    add: function (req, res) {
        Users.updateOne(
            { 'user': req.body.user },
            { $set: { 'machine': req.body.machine }},
            { upsert: true }, function (err, response) {
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
            }
        )
    },

    /**
     *
     * @param req
     * @param res
     */
    getAll: function (req, res) {
        Users.find({}, function (err, response) {
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
    }
}