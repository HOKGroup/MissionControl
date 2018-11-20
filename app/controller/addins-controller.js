var mongoose = require('mongoose');
var Addins = mongoose.model('Addins');

AddinsService = {
    /**
     *
     * @param req
     * @param res
     */
    findAll: function(req, res){
        Addins
            .find()
            .exec(function(err, response){
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

    /**
     *
     * @param req
     * @param res
     */
    getByYear: function(req, res){
        Addins
            .find({'revitVersion': req.params.year}, function (err, response){
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

    /**
     * 
     * @param req 
     * @param res 
     */
    aggregateByYear: function(req, res){
        var matchFilter = {
            $match: {
                'revitVersion': req.params.year
            }
        };
        var groupByColumn = '$pluginName';
        if (req.query.name) {
            console.log(req.query.name);
            matchFilter.$match['pluginName'] = req.query.name;
            // Remove this, just for testing;
            groupByColumn = '$user';
        }
        Addins
            .aggregate([
                matchFilter,
                { 
                    $group: { 
                        _id: groupByColumn,
                        count: { $sum: 1 }
                    }
                }
            ], function (err, response){
                var data = response.map(function(addin) { 
                    addin['name'] = addin['_id']; 
                    return {name: addin['_id'],
                     count: addin['count']
                    };
                });
                var result = {
                    status: 200,
                    message: data
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
     *
     * @param req
     * @param res
     */
    add: function(req, res) {
        Addins
            .create(req.body, function (err, response) {
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
    }
};

module.exports = AddinsService;