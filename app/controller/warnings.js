/**
 * Created by konrad.sobon on 2018-08-16.
 */
/**
 * @param {{ existingWarningIds: [string] }} Existing Warning Ids
 * @param {{ newWarnings: [object] }} New Warning Objects
 * @param {{ centralPath: string }} File Path
 */
var mongoose = require('mongoose');
var Warnings = mongoose.model('Warnings');

WarningsService = {
    add: function(req, res){
        Warnings.update(
            {'centralPath': req.body.centralPath, 'isOpen': true, 'uniqueId': {$nin: req.body.existingWarningIds}},
            {$set: {'isOpen': false, 'closedBy': req.body.closedBy, 'closedAt': Date.now()}},
            {multi: true}, function (err, response){
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
                Warnings.insertMany(req.body.newWarnings, function (err, response) {
                    if (err){
                        result.status = 500;
                        result.message = err;
                    } else if (!response){
                        result.status = 404;
                        result.message = err;
                    }
                    res.status(result.status).json(result.message);
                })
            });
    }
};

module.exports = WarningsService;