/**
 * Created by konrad.sobon on 2018-08-30.
 */
var mongoose = require('mongoose');
var FilePaths = mongoose.model('FilePaths');

FilePathsService = {
    /**
     *
     * @param req
     * @param res
     */
    add: function(req, res){
        FilePaths
            .updateOne(
                { 'centralPath': req.body.centralPath },
                { $set: { 'centralPath': req.body.centralPath }},
                { upsert: true }, function (err, response){
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
     *
     * @param req
     * @param res
     */
    addMany: function(req, res){
        FilePaths
            .bulkWrite(
                req.body.map(function (item) {
                    return {
                        'updateOne': {
                            filter: { 'centralPath': item.centralPath },
                            update: { $set: {
                                'centralPath': item.centralPath,
                                'projectId': item.projectId
                            }},
                            upsert: true
                        }
                    };
                }), function (err, response) {
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
    addToProject: function (req, res) {
        FilePaths
            .updateOne(
                { 'centralPath': req.body.centralPath },
                { $set: { 'centralPath': req.body.centralPath, 'projectId': req.body.projectId }},
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
    removeFromProject: function (req, res) {
        FilePaths
            .updateOne(
                { 'centralPath': req.body.centralPath },
                { $unset: { 'projectId': '' }}, function (err, response) {
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
    removeManyFromProject: function (req, res) {
        FilePaths
            .bulkWrite(
                req.body.map(function (item) {
                    return {
                        'updateOne': {
                            filter: { 'centralPath': item.centralPath },
                            update: { $unset: {
                                'projectId': ''
                            }}
                        }
                    };
                }), function (err, response) {
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
    changeFilePath: function (req, res) {
        FilePaths
            .updateOne(
                { 'centralPath': req.body.before },
                { $set: { 'centralPath': req.body.after }}, function (err, response) {
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
    getAllUnassigned: function (req, res) {
        FilePaths
            .find({ 'projectId': null }, function (err, response){
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
    getAll: function (req, res) {
        FilePaths
            .find({}, function (err, response){
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

module.exports = FilePathsService;