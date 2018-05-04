/**
 * Created by konrad.sobon on 2018-04-24.
 */
var mongoose = require('mongoose');
var Styles = mongoose.model('Styles');

StylesService = {
    /**
     * Creates Styles Dcoument.
     * @param req
     * @param res
     */
    add: function(req, res){
        Styles
            .create(req.body, function (err, response){
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
     * Pushes Style info into an array
     * @param req
     * @param res
     */
    styleStats: function (req, res) {
        var id = req.params.id;
        Styles
            .update(
                { '_id': id },
                { '$push': { 'styleStats': req.body}}, function (err, response){
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
        Styles
            .update(
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
     * Retrieves latest entry in the Link Stats array. Since 'slice' cannot
     * be combined with select we have to exclude all other arrays.
     * https://stackoverflow.com/questions/7670073/how-to-combine-both-slice-and-select-returned-keys-operation-in-function-update
     * @param req
     * @param res
     */
    getStyleStats: function (req, res) {
        Styles
            .aggregate([
                { $match: { 'centralPath': req.body.centralPath }},
                { $project: {
                    'styleStats': { $slice: ['$styleStats', -1]},
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

module.exports = StylesService;