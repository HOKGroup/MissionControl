/**
 * Created by konrad.sobon on 2018-04-24.
 */
var mongoose = require('mongoose');
var Styles = mongoose.model('Styles');

StylesService = {
    /**
     * Finds Worksets collection by central path.
     * @param req
     * @param res
     */
    findByCentralPath: function(req, res){
        // (Konrad) Since we cannot pass file path with "\" they were replaced with illegal pipe char "|".
        // (Konrad) RSN and BIM 360 paths will have forward slashes instead of back slashes.
        var rgx;
        if(req.params.uri.includes('RSN:') || req.params.uri.includes('BIM 360:')){
            rgx = req.params.uri.replace(/\|/g, "/").toLowerCase();
        } else {
            rgx = req.params.uri.replace(/\|/g, "\\").toLowerCase();
        }
        Styles
            .find(
                { "centralPath": rgx }, function (err, response){
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
                })
    },

    /**
     *
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
                    'styleStats': { $slice: ['$styleStats', -1]}
                }}]
            ).exec(function (err, response){
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

module.exports = StylesService;