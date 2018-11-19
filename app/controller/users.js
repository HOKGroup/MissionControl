/**
 * Created by konrad.sobon on 2018-09-13.
 */
var mongoose = require('mongoose');
var Users = mongoose.model('Users');

module.exports = {
    /**
     *
     * @param req
     * @param res
     */
    add: function (req, res) {
        Users.update(
            { 'user': req.body.user },
            { $set: { 'machine': req.body.machine }},
            { upsert: true }, function (err, response) {
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
     *
     * @param req
     * @param res
     */
    getAll: function (req, res) {
        Users.find({}, function (err, response) {
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
        });
    }
};