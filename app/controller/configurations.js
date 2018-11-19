/**
 * @param {{ updaterid: string }} Updater Id
 */
var mongoose = require('mongoose');
Configuration = mongoose.model('Configuration');

ConfigurationService = {
    /**
     * Retrieves Configuration by its Central Path.
     * @param req
     * @param res
     */
    findByCentralPath: function(req, res){
        // (Konrad) Since we cannot pass file path with "\" they were replaced with illegal pipe char "|".
        // (Konrad) RSN and A360 paths will have forward slashes instead of back slashes.
        var isRevitServer = req.params.uri.match(/rsn:/i);
        var isBim360 = req.params.uri.match(/bim 360:/i);
        var rgx;
        if(isRevitServer || isBim360){
            rgx = req.params.uri.replace(/\|/g, '/').toLowerCase();
        } else {
            rgx = req.params.uri.replace(/\|/g, '\\').toLowerCase();
        }

        Configuration
            .find({ 'files.centralPath': rgx }, function (err, response){
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
     * Creates new Configuration document.
     * @param req
     * @param res
     */
    add: function(req, res) {
        Configuration
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
     * Updates given Configuration by Id.
     * @param req
     * @param res
     */
    update: function(req, res) {
        var id = req.params.id;
        Configuration
            .update(
                { '_id': id }, req.body, { upsert: true }, function (err, response){
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
     * Removes entire configuration from the DB.
     * @param req
     * @param res
     */
    delete: function(req, res){
        var id = req.params.id;
        Configuration
            .remove({ '_id': id }, function (err, response){
                var result = {
                    status: 204,
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
     * Removes many configurations by their ids.
     * @param req
     * @param res
     */
    deleteMany: function (req, res) {
        var ids = req.body.map(function (id){
            return mongoose.Types.ObjectId(id);
        });
        Configuration
            .remove({'_id': { $in: ids }}, function (err, response){
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
     * Retrieves many Configurations by their Ids.
     * @param req
     * @param res
     */
    getMany: function (req, res) {
        var ids = req.body.map(function (id){
            return mongoose.Types.ObjectId(id);
        });
        Configuration
            .find({'_id': { $in: ids }}, function (err, response){
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
     * Updates file path value for given configuration.
     * @param req
     * @param res
     */
    updateFilePath: function (req, res) {
        var id = req.params.id;
        Configuration
            .update(
                {'_id': id, 'files.centralPath': req.body.before.toLowerCase()},
                {'$set': {'files.$.centralPath' : req.body.after.toLowerCase()}}, function (err, response){
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
     * Adds new file to the Configuration.
     * @param req
     * @param res
     */
    addFile: function (req, res) {
        var id = req.params.id;
        Configuration
            .update(
                { '_id': id },
                { $push: { 'files': req.body }}, function (err, response){
                    var result = {
                        status: 202,
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
     * Deletes file from the Configuration.
     * @param req
     * @param res
     */
    deleteFile: function (req, res) {
        var id = req.params.id;
        Configuration
            .update(
                { '_id': id },
                { $pull: { 'files': {'centralPath': req.body.centralPath.toLowerCase()}}}, function (err, response){
                    var result = {
                        status: 202,
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

module.exports = ConfigurationService;