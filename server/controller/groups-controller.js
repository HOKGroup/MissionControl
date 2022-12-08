/**
 * Created by konrad.sobon on 2018-05-16.
 */
var mongoose = require('mongoose');
var Groups = mongoose.model('Groups');

module.exports = {
    /**
     * Creates Groups Document.
     * @param req
     * @param res
     */
    add: function(req, res){
        Groups.create(req.body, function (err, response){
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
     * Pushes Groups info into an array.
     * @param req
     * @param res
     */
    groupStats: function (req, res) {
        var id = req.params.id;
        Groups.update(
            { '_id': id },
            { '$push': { 'groupStats': req.body}}, function (err, response){
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
        var before = req.body.before.replace(/\\/g, '\\').toLowerCase();
        var after = req.body.after.replace(/\\/g, '\\').toLowerCase();
        Groups.update(
            { 'centralPath': before },
            { '$set': { 'centralPath' : after }}, function (err, response){
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
     * Retrieves latest entry in the Groups Stats array.
     * @param req
     * @param res
     */
    getGroupStats: function (req, res) {
        Groups.aggregate([
            { $match: { 'centralPath': req.body.centralPath }},
            { $project: {
                'groupStats': { $slice: ['$groupStats', -1]},
                '_id': 1,
                'centralPath': 1
            }}]
        ).exec(function (err, response){
            var result = {
                status: 201,
                message: response[0]
            };
            if (err){
                result.status = 500;
                result.message = err;
            } else if (!response[0]){
                result.status = 404;
                result.message = err;
            }
            res.status(result.status).json(result.message);
        });
    }
};