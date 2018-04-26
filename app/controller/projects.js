/**
 * @param {{healthrecordid:string}} HTTP request param for health record id.
 */
/**
 * @param {{configid:string}} HTTP request param for configuration id.
 */

var mongoose = require('mongoose');
var global = require('./socket/global');
Project = mongoose.model('Project');

ProjectService = {
    /**
     * Retrieves all Projects from MongoDB and sorts by Project Number
     * @param req
     * @param res
     */
    findAndSort : function(req, res){
        Project
            .find({})
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
                { "_id": id },
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
     *
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
     * Adds configuration reference to Configurations Collection.
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
     *
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
     *
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
     *
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
     *
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
     *
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
     *
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

    //TODO: Verify that we need these
    findAll : function(req, res){
    Project.find({},function(err, results) {
      return res.send(results);
    });
  },

    populateSheets : function (req, res) {
      var id = req.params.id;
      Project
          .findById(id)
          .populate({ path: 'sheets'})
          .exec(function (err, doc) {
              var response = {
                  status: 200,
                  message: doc
              };
              if(err){
                  response.status = 500;
                  response.message = err;
              } else if(!doc){
                  response.status = 404;
                  response.message = { "message": "Project Id not found " + id};
              }
              res
                  .status(response.status)
                  .json(response.message);
          });
  }
  };

module.exports = ProjectService;