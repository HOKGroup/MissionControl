/**
 * @param {{configid:string}} HTTP request param for configuration id.
 */
var mongoose = require('mongoose');
Project = mongoose.model('Project');

ProjectService = {
    /**
     * Retrieves all Projects from MongoDB and sorts by Project Number
     * @param req
     * @param res
     */
    findAndSort : function(req, res){
        Project.find({})
            .sort({ number: 1 })
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
    },

    /**
     * Creates new Project in MongoDB.
     * @param req
     * @param res
     */
    add : function(req, res){
        Project
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
     * Retrieves project by its Id.
     * @param req
     * @param res
     */
    findById: function(req, res){
        var id = req.params.id;
        Project
            .findById(id)
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
    },

    /**
     * Retrieves Project by Configuration Id. Used by .NET side to check into MC.
     * @param req
     * @param res
     */
    findByConfigurationId : function(req, res){
        var id = req.params.configid;
        Project.find({ 'configurations': id }, function (err, response){
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
     * Removes Project.
     * @param req
     * @param res
     */
    delete : function(req, res){
        var id = req.params.id;
        Project
            .remove({ '_id': id }, function (err, response){
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
     * Updates Project in a MongoDB.
     * @param req
     * @param res
     */
    update : function(req, res) {
        var id = req.params.id;
        Project
            .update(
                { '_id': id },
                req.body,
                { upsert: true }, function (err, response){
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
     * Removes Configuration Id reference from project.Configurations collection.
     * @param req
     * @param res
     */
    deleteConfiguration: function(req, res){
        var projectId = req.params.id;
        var configId = req.params.configid;
        Project
            .update(
                { '_id': projectId},
                { $pull: { 'configurations': configId }},function (err, response){
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
     * Removes trigger record references when trigger records are deleted.
     * @param req
     * @param res
     */
    deleteTriggerRecords: function (req, res) {
        var projectId = req.params.id;
        var ids = req.body.map(function (item) {
            return mongoose.Types.ObjectId(item);
        });
        Project
            .update(
                { '_id': projectId },
                { $pull: { 'triggerRecords': { $in: ids }}}, function (err, response){
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
     * Adds configuration reference to Configurations Collection.
     * @param req
     * @param res
     */
    addConfiguration : function(req, res){
        var projectId = req.params.id;
        var configId = req.params.configid;
        Project
            .update(
                { '_id': projectId},
                { $push:{ 'configurations': configId }}, function (err, response){
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
     * Adds Workset id reference to Project.worksetStats collection.
     * @param req
     * @param res
     */
    addWorkset : function(req, res){
        var projectId = req.params.id;
        var worksetId = mongoose.Types.ObjectId(req.body['id']);
        Project
            .update(
                { '_id': projectId},
                { $push:{ 'worksetStats': worksetId }}, function (err, response){
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
     * Adds Family id reference to Project.familyStats collection.
     * @param req
     * @param res
     */
    addFamilies: function (req, res) {
        var projectId = req.params.id;
        var familiesId = mongoose.Types.ObjectId(req.body['id']);
        Project
            .update(
                { '_id': projectId},
                { $push:{ 'familyStats': familiesId }}, function (err, response){
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
     * Adds Style id reference to Project.styleStats collection.
     * @param req
     * @param res
     */
    addStyle: function (req, res) {
        var projectId = req.params.id;
        var stylesId = mongoose.Types.ObjectId(req.body['id']);
        Project
            .update(
                { '_id': projectId},
                { $push:{ 'styleStats': stylesId }}, function (err, response){
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
     * Adds Link id reference to Project.linkStats collection.
     * @param req
     * @param res
     */
    addLink: function (req, res) {
        var projectId = req.params.id;
        var linksId = mongoose.Types.ObjectId(req.body['id']);
        Project
            .update(
                { '_id': projectId},
                { $push:{ 'linkStats': linksId }}, function (err, response){
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
     * Adds View id reference to Project.viewStats collection.
     * @param req
     * @param res
     */
    addView: function (req, res) {
        var projectId = req.params.id;
        var linksId = mongoose.Types.ObjectId(req.body['id']);
        Project
            .update(
                { '_id': projectId},
                { $push:{ 'viewStats': linksId }}, function (err, response){
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
     * Adds Model id reference to Project.modelStats collection.
     * @param req
     * @param res
     */
    addModel: function (req, res) {
        var projectId = req.params.id;
        var modelsId = mongoose.Types.ObjectId(req.body['id']);
        Project
            .update(
                { '_id': projectId},
                { $push:{ 'modelStats': modelsId }}, function (err, response){
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
     * Adds Sheets id reference to Project.sheets collection.
     * @param req
     * @param res
     */
    addSheet : function(req, res){
        var projectId = req.params.id;
        var sheetsId = mongoose.Types.ObjectId(req.body['id']);
        Project
            .update(
                { '_id': projectId },
                { $push:{ 'sheets': sheetsId }}, function (err, response){
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
     * Adds Sheets id reference to Project.sheets collection.
     * @param req
     * @param res
     */
    addGroup : function(req, res){
        var projectId = req.params.id;
        var groupsId = mongoose.Types.ObjectId(req.body['id']);
        Project
            .update(
                { '_id': projectId },
                { $push:{ 'groupStats': groupsId }}, function (err, response){
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
     * Adds Trigger Records id reference to Project.triggerRecords collection.
     * @param req
     * @param res
     */
    addTriggerRecord : function(req, res){
        var projectId = req.params.id;
        var trId = mongoose.Types.ObjectId(req.body['id']);
        Project
            .update(
                { '_id': projectId },
                { $push:{ 'triggerRecords': trId }}, function (err, response){
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
     * Retrieves a project matching id and populates Configurations collection.
     * @param req
     * @param res
     */
    findByIdPopulateConfigurations : function (req, res) {
        var id = req.params.id;
        Project
            .findById(id)
            .populate({ path: 'configurations'})
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
    },

    /**
     * Retrieves a project matching id and populates Sheets collection.
     * @param req
     * @param res
     */
    populateSheets : function (req, res) {
        var id = req.params.id;
        Project
            .findById(id)
            .populate({ path: 'sheets'})
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

module.exports = ProjectService;