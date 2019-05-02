var mongoose = require('mongoose');
var Settings = mongoose.model('Settings');

SettingsService = {
/**
     * Retrieves the Settings file from the DB. 
     * @param req
     * @param res
     */
    get : function(req, res){
        Settings.findOneOrCreate({name: 'Settings'}, function (err, response){
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
    },
};

module.exports = SettingsService;