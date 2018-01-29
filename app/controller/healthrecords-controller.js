/**
 * @param {{logid:string}} HTTP request argument for session info update.
 */
/**
 * @param {{centralpath:string}}
 */
/**
 * @param {{familiesid:string}}
 */
var mongoose = require('mongoose');
var HealthRecords = mongoose.model('HealthRecords');
var global = require('./socket/global');

module.exports.findAll = function(req, res){
    HealthRecords
        .find()
        .exec(function(err, data){
            if(err){
                res
                    .status(500)
                    .json(err);
            } else {
                res
                    .json(data)
            }
        });
};

module.exports.findById = function(req, res){
    var id = req.params.id;
    HealthRecords
        .findOne({ '_id': id },function(err, result) {
        return res.send(result);
    });
};

/**
 * Returns Health Record collection that matches given central Path.
 * @param req
 * @param res
 */
module.exports.findByCentralPath = function (req, res) {
    // (Konrad) Since we cannot pass file path with "\" they were replaced with illegal pipe char "|".
    // (Konrad) RSN and A360 paths will have forward slashes instead of back slashes.
    var rgx;
    if(req.params.uri.includes('RSN:') || req.params.uri.includes('A360:')){
        rgx = req.params.uri.replace(/\|/g, "/");
    } else {
        rgx = req.params.uri.replace(/\|/g, "\\");
    }
    HealthRecords
        .find(
            {"centralPath": rgx}, function (err, result) {
                var response = {
                    status: 200,
                    message: result
                };
                if(err){
                    response.status = 500;
                    response.message = err;
                } else if(!result){
                    console.log("File Path wasn't found in any Health Records Collections.");
                }
                res.status(response.status).json(response.message);
            }
        )
};

module.exports.add = function(req, res){
    HealthRecords
        .create(req.body, function(err, healthrecord){
            if(err) {
                res
                    .status(400)
                    .json(err);
            } else {
                global.io.sockets.emit('add_healthrecord', req.body);
                res
                    .status(201)
                    .json(healthrecord);
            }
        });
};

var _addOpenedLog = function (req, res, healthrecord){
    healthrecord.onOpened.push({
        user: req.body.user,
        opened: parseInt(req.body.opened, 10),
        closed: parseInt(req.body.closed, 10),
        createdOn: Date.now()
    });

    healthrecord.save(function (err, healthrecordUpdated) {
        if(err){
            res
                .status(500)
                .json(err);
        } else {
            res
                .status(200)
                .json(healthrecordUpdated.onOpened[healthrecordUpdated.onOpened.length - 1]);
        }
    });
};

module.exports.onOpened = function (req, res) {
    var id = req.params.id;
    HealthRecords
        .findById(id)
        .select('onOpened')
        .exec(function (err, doc){
            var response = {
                status: 200,
                message: []
            };
            if (err){
                response.status = 500;
                response.message = err;
            } else if(!doc){
                response.status = 404;
                response.message = {"message": "Health Report Id not found."}
            }
            if(doc){
                _addOpenedLog(req, res, doc);
            } else {
                res
                    .status(response.status)
                    .json(response.message);
            }
        });
};

var _addViewStatsLog = function (req, res, healthrecord){
    healthrecord.viewStats.push({
        totalViews: parseInt(req.body.totalViews, 10),
        totalSheets: parseInt(req.body.totalSheets, 10),
        totalSchedules: parseInt(req.body.totalSchedules, 10),
        viewsOnSheet: parseInt(req.body.viewsOnSheet, 10),
        viewsOnSheetWithTemplate: parseInt(req.body.viewsOnSheetWithTemplate, 10),
        schedulesOnSheet: parseInt(req.body.schedulesOnSheet, 10),
        unclippedViews: parseInt(req.body.unclippedViews, 10),
        createdOn: Date.now()
    });

    healthrecord.save(function (err, healthrecordUpdated) {
        if(err){
            res
                .status(500)
                .json(err);
        } else {
            res
                .status(200)
                .json(healthrecordUpdated.viewStats[healthrecordUpdated.viewStats.length - 1]);
        }
    });
};

module.exports.viewStats = function (req, res) {
    var id = req.params.id;
    HealthRecords
        .findById(id)
        .select('viewStats')
        .exec(function (err, doc) {
            var response = {
                status: 200,
                message: []
            };
            if(err){
                response.status = 500;
                response.message = err;
            } else if(!doc){
                response.status = 404;
                response.message = {"message": "Health Report Id not found."}
            }
            if(doc){
                _addViewStatsLog(req, res, doc);
            } else {
                res
                    .status(response.status)
                    .json(response.message);
            }
        })
};


var _addSynchedLog = function (req, res, healthrecord){
    healthrecord.onSynched.push({
        user: req.body.user,
        opened: parseInt(req.body.opened, 10),
        closed: parseInt(req.body.closed, 10),
        createdOn: Date.now()
    });

    healthrecord.save(function (err, healthrecordUpdated) {
        if(err){
            res
                .status(500)
                .json(err);
        } else {
            res
                .status(200)
                .json(healthrecordUpdated.onSynched[healthrecordUpdated.onSynched.length - 1]);
        }
    });
};

module.exports.onSynched = function (req, res) {
    var id = req.params.id;
    HealthRecords
        .findById(id)
        .select('onSynched')
        .exec(function (err, doc){
            var response = {
                status: 200,
                message: []
            };
            if (err){
                response.status = 500;
                response.message = err;
            } else if(!doc){
                response.status = 404;
                response.message = {"message": "Workset Id not found."}
            }
            if(doc){
                _addSynchedLog(req, res, doc);
            } else {
                res
                    .status(response.status)
                    .json(response.message);
            }
        });
};

var addItemCount = function (req, res, healthrecord){
    healthrecord.itemCount.push({
        worksets : req.body.worksets});

    healthrecord.save(function (err, healthrecordUpdated) {
        if(err){
            res
                .status(500)
                .json(err);
        } else {
            res
                .status(200)
                .json(healthrecordUpdated.itemCount[healthrecordUpdated.itemCount.length - 1]);
        }
    });
};

module.exports.postItemCount = function (req, res) {
    var id = req.params.id;
    HealthRecords
        .findById(id)
        .select('itemCount')
        .exec(function (err, doc){
            var response = {
                status: 200,
                message: []
            };
            if (err){
                response.status = 500;
                response.message = err;
            } else if(!doc){
                response.status = 404;
                response.message = {"message": "Workset Id not found."}
            }
            if(doc){
                addItemCount(req, res, doc);
            } else {
                res
                    .status(response.status)
                    .json(response.message);
            }
        });
};

var _addLinkStats = function (req, res, healthReportData){
    healthReportData.linkStats.push({
        totalImportedDwg: parseInt(req.body.totalImportedDwg, 10),
        importedDwgFiles: req.body.importedDwgFiles,
        unusedLinkedImages: parseInt(req.body.unusedLinkedImages, 10),
        totalDwgStyles: parseInt(req.body.totalDwgStyles, 10),
        totalImportedStyles: parseInt(req.body.totalImportedStyles, 10),
        totalLinkedModels: parseInt(req.body.totalLinkedModels, 10),
        totalLinkedDwg: parseInt(req.body.totalLinkedDwg, 10),
        createdOn: Date.now()
    });

    healthReportData.save(function (err, dataUpdated) {
        if(err){
            res
                .status(500)
                .json(err);
        } else {
            res
                .status(200)
                .json(dataUpdated.linkStats[dataUpdated.linkStats.length - 1]);
        }
    });
};

module.exports.postLinkStats = function (req, res) {
    var id = req.params.id;
    HealthRecords
        .findById(id)
        .select('linkStats')
        .exec(function (err, doc){
            var response = {
                status: 200,
                message: []
            };
            if (err){
                response.status = 500;
                response.message = err;
            } else if(!doc){
                response.status = 404;
                response.message = {"message": "Workset Id not found."}
            }
            if(doc){
                _addLinkStats(req, res, doc);
            } else {
                res
                    .status(response.status)
                    .json(response.message);
            }
        });
};

var _addFamilyStats = function (req, res, healthReportData){
    healthReportData.familyStats.push({
        suspectFamilies: req.body.suspectFamilies,
        totalFamilies: parseInt(req.body.totalFamilies, 10),
        unusedFamilies: parseInt(req.body.unusedFamilies, 10),
        inPlaceFamilies: parseInt(req.body.inPlaceFamilies, 10),
        oversizedFamilies: parseInt(req.body.oversizedFamilies, 10),
        createdBy: req.body.createdBy,
        createdOn: Date.now()
    });

    healthReportData.save(function (err, dataUpdated) {
        if(err){
            res
                .status(500)
                .json(err);
        } else {
            res
                .status(200)
                .json(dataUpdated.familyStats[dataUpdated.familyStats.length - 1]);
        }
    });
};

module.exports.postFamilyStats = function (req, res) {
    var id = req.params.id;
    HealthRecords
        .findById(id)
        .select('familyStats')
        .exec(function (err, doc){
            var response = {
                status: 200,
                message: []
            };
            if (err){
                response.status = 500;
                response.message = err;
            } else if(!doc){
                response.status = 404;
                response.message = {"message": "Workset Id not found."}
            }
            if(doc){
                _addFamilyStats(req, res, doc);
            } else {
                res
                    .status(response.status)
                    .json(response.message);
            }
        });
};

/**
 * Posts model open times to Health Recors.
 * @param req
 * @param res
 */
module.exports.postModelSize = function (req, res) {
    var id = req.params.id;
    HealthRecords
        .findById(id)
        .select('modelSizes')
        .exec(function (err, doc){
            var response = {
                status: 200,
                message: []
            };
            if (err){
                response.status = 500;
                response.message = err;
            } else if(!doc){
                response.status = 404;
                response.message = {"message": "Workset Id not found."}
            }
            if(doc){
                _addModelSizeTime(req, res, doc);
            } else {
                res.status(response.status).json(response.message);
            }
        });
};

var _addModelSizeTime = function (req, res, healthReportData){
    healthReportData.modelSizes.push({
        value: parseInt(req.body.value, 10),
        user: req.body.user,
        createdOn: Date.now()
    });

    healthReportData.save(function (err, dataUpdated) {
        if(err){
            res.status(500).json(err);
        } else {
            res.status(200).json(dataUpdated.modelSizes[dataUpdated.modelSizes.length - 1]);
        }
    });
};

/**
 * Posts model open times to Health Record.
 * @param req
 * @param res
 */
module.exports.postModelOpenTime = function (req, res) {
    var id = req.params.id;
    HealthRecords
        .findById(id)
        .select('openTimes')
        .exec(function (err, doc){
            var response = {
                status: 200,
                message: []
            };
            if (err){
                response.status = 500;
                response.message = err;
            } else if(!doc){
                response.status = 404;
                response.message = {"message": "Workset Id not found."}
            }
            if(doc){
                _addModelOpenTime(req, res, doc);
            } else {
                res.status(response.status).json(response.message);
            }
        });
};

var _addModelOpenTime = function (req, res, healthReportData){
    healthReportData.openTimes.push({
        value: parseInt(req.body.value, 10),
        user: req.body.user,
        createdOn: Date.now()
    });

    healthReportData.save(function (err, dataUpdated) {
        if(err){
            res.status(500).json(err);
        } else {
            res.status(200).json(dataUpdated.openTimes[dataUpdated.openTimes.length - 1]);
        }
    });
};

/**
 * Posts model synch time to Health Report.
 * @param req
 * @param res
 */
module.exports.postModelSynchTime = function (req, res) {
    var id = req.params.id;
    HealthRecords
        .findById(id)
        .select('synchTimes')
        .exec(function (err, doc){
            var response = {
                status: 200,
                message: []
            };
            if (err){
                response.status = 500;
                response.message = err;
            } else if(!doc){
                response.status = 404;
                response.message = {"message": "Workset Id not found."}
            }
            if(doc){
                _addModelSynchTime(req, res, doc);
            } else {
                res.status(response.status).json(response.message);
            }
        });
};

var _addModelSynchTime = function (req, res, healthReportData){
    healthReportData.synchTimes.push({
        value: parseInt(req.body.value, 10),
        user: req.body.user,
        createdOn: Date.now()
    });

    healthReportData.save(function (err, dataUpdated) {
        if(err){
            res.status(500).json(err);
        } else {
            res.status(200).json(dataUpdated.synchTimes[dataUpdated.synchTimes.length - 1]);
        }
    });
};

/**
 * Posts Session Info data to Health Records.
 * TODO: This data is currently not used. Delete?
 * @param req
 * @param res
 */
module.exports.postModelSessionInfo = function (req, res) {
    var id = req.params.id;
    HealthRecords
        .findById(id)
        .select('sessionLogs')
        .exec(function (err, doc){
            var response = {
                status: 200,
                message: []
            };
            if (err){
                response.status = 500;
                response.message = err;
            } else if(!doc){
                response.status = 404;
                response.message = {"message": "Workset Id not found."}
            }
            if(doc){
                _addSessionLog(req, res, doc);
            } else {
                res.status(response.status).json(response.message);
            }
        });
};

var _addSessionLog = function (req, res, healthReportData){
    healthReportData.sessionLogs.push({
        user: req.body.user,
        from: req.body.from,
        to: req.body.to,
        synched: req.body.synched,
        createdOn: Date.now()
    });

    healthReportData.save(function (err, dataUpdated) {
        if(err){
            res.status(500).json(err);
        } else {
            res.status(200).json(dataUpdated.sessionLogs[dataUpdated.sessionLogs.length - 1]);
        }
    });
};


module.exports.getViewStats = function (req, res) {
    var id = req.params.id;
    HealthRecords
        .findById(id)
        .select('viewStats')
        .exec(function (err, doc){
            var response = {
                status: 200,
                message: []
            };
            if (err){
                response.status = 500;
                response.message = err;
            } else if(!doc){
                response.status = 404;
                response.message = {"message": "Workset Id not found."}
            }
            if(doc){
                res
                    .status(response.status)
                    .json(doc)
            } else {
                res
                    .status(response.status)
                    .json(response.message);
            }
        });
};

module.exports.getLinkStats = function (req, res) {
    var id = req.params.id;
    HealthRecords
        .findById(id)
        .select('linkStats')
        .exec(function (err, doc){
            var response = {
                status: 200,
                message: []
            };
            if (err){
                response.status = 500;
                response.message = err;
            } else if(!doc){
                response.status = 404;
                response.message = {"message": "Workset Id not found."}
            }
            if(doc){
                res
                    .status(response.status)
                    .json(doc)
            } else {
                res
                    .status(response.status)
                    .json(response.message);
            }
        });
};

module.exports.getFamilyStats = function (req, res) {
    var id = req.params.id;
    HealthRecords
        .findById(id)
        .select('familyStats')
        .exec(function (err, doc){
            var response = {
                status: 200,
                message: []
            };
            if (err){
                response.status = 500;
                response.message = err;
            } else if(!doc){
                response.status = 404;
                response.message = {"message": "Workset Id not found."}
            }
            if(doc){
                res
                    .status(response.status)
                    .json(doc)
            } else {
                res
                    .status(response.status)
                    .json(response.message);
            }
        });
};

module.exports.getModelStats = function (req, res) {
    var id = req.params.id;
    HealthRecords
        .findById(id)
        .select('modelSizes openTimes synchTimes sessionLogs')
        .exec(function (err, doc){
            var response = {
                status: 200,
                message: []
            };
            if (err){
                response.status = 500;
                response.message = err;
            } else if(!doc){
                response.status = 404;
                response.message = {"message": "Workset Id not found."}
            }
            if(doc){
                res
                    .status(response.status)
                    .json(doc)
            } else {
                res
                    .status(response.status)
                    .json(response.message);
            }
        });
};

module.exports.updateSynchedCollection = function (req, res) {
    var id = req.params.id;
    var logId = req.params.logid;
    var action; // query string that defines whether we are updating "to" or "synchTimes"

    if(req.query && req.query.action) {
        action = req.query.action;
    } else {
        res
            .status(400)
            .json({
                "message": "No action query supplied."
            });
    }

    HealthRecords
        .findById(id)
        .select("sessionLogs")
        .exec(function (err, doc) {
            var thisLog;
            var response = {
                status: 200,
                message: []
            };
            if (err) {
                response.status = 500;
                response.message = err;
            } else if(!doc) {
                response.status = 404;
                response.message = {
                    "message" : "Workset Id not found " + id
                };
            } else {
                // Get the session log
                thisLog = doc.sessionLogs.id(logId);

                // If the log doesn't exist Mongoose returns null
                if (!thisLog) {
                    response.status = 404;
                    response.message = {
                        "message": "Session LogId not found " + logId
                    };
                }
            }

            // we haven't hit a warning yet
            if(response.status !== 200){
                res
                    .status(response.status)
                    .json(response.message);
            } else {
                if(action === "putSynchTime"){
                    thisLog.synched.push(Date.now());
                } else {
                    thisLog.to = Date.now();
                }

                doc.save(function (err) {
                    if(err){
                        res
                            .status(500)
                            .json(err);
                    } else {
                        res
                            .status(204) // code for successful PUT
                            .json(); // should not return anything
                    }
                });
            }
        })
};

module.exports.addFamilies = function (req, res) {
    var healthRecordId = req.params.id;
    var familiesId = mongoose.Types.ObjectId(req.body.key);
    HealthRecords
        .update(
            { _id: healthRecordId},
            { $set:{ familyStats: familiesId }},
            function(err){
                if(err) {
                    console.log(err);
                    res
                        .status(201)
                        .json(err);
                } else {
                    res
                        .status(201)
                        .json();
                }
            });
};

module.exports.updateFilePath = function (req, res) {
    var before = req.body.before.replace(/\\/g, "\\");
    var after = req.body.after.replace(/\\/g, "\\");
    HealthRecords
        .update(
            {'centralPath': before},
            {'$set': {'centralPath' : after}}, function (err, result) {
                var response = {
                    status: 200,
                    message: result
                };
                if(err){
                    response.status = 500;
                    response.message = err;
                } else if(!result){
                    console.log("File Path wasn't found in any Configurations Collections");
                }
                res.status(response.status).json(response.message);
            }
        );
};
