/**
 * Created by konrad.sobon on 2018-07-27.
 */
var mongoose = require('mongoose');
var ZombieLogs = mongoose.model('ZombieLogs');

ZombieLogsService = {
    /**
     * Creates a Log entry for ZombieService.
     * @param req
     * @param res
     */
    add: function(req, res){
        ZombieLogs
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

    get : function(req, res){
        ZombieLogs
            .find({})
            .limit(500)
            .exec(function (err, response){
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

module.exports = ZombieLogsService;