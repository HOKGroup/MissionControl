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

/**
 * Retrieves health record by id.
 * @param req
 * @param res
 */
module.exports.findById = function(req, res){
    var id = req.params.id;
    HealthRecords
        .findOne({ '_id': id },function(err, result) {
            var response = {
                status: 200,
                message: result
            };
            if(err){
                response.status = 500;
                response.message = err;
            } else if(!result){
                console.log("Id was not found.");
            }
            res.status(response.status).json(response.message);
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
        rgx = req.params.uri.replace(/\|/g, "/").toLowerCase();
    } else {
        rgx = req.params.uri.replace(/\|/g, "\\").toLowerCase();
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

/**
 * Pushes workset info for Open events into array.
 * @param req
 * @param res
 */
module.exports.onOpened = function (req, res) {
    var id = req.params.id;
    HealthRecords.update(
        {'_id': id},
        {'$push': {'onOpened': req.body}},
        function(err, response){
            var result = {
                status: 201,
                message: response
            };
            if(err) {
                result.status = 500;
                result.message = err;
            } else {
                res.status(result.status).json(result.message);
            }
        });
};

/**
 * Pushes View info into array.
 * @param req
 * @param res
 */
module.exports.viewStats = function (req, res) {
    var id = req.params.id;
    HealthRecords.update(
        {'_id': id},
        {'$push': {'viewStats': req.body}},
        function(err, response){
            var result = {
                status: 201,
                message: response
            };
            if(err) {
                result.status = 500;
                result.message = err;
            } else {
                res.status(result.status).json(result.message);
            }
        });
};

/**
 * Pushes Style info into an array
 * @param req
 * @param res
 */
module.exports.styleStats = function (req, res) {
    var id = req.params.id;
    HealthRecords.update(
        {'_id': id},
        {'$push': {'styleStats': req.body}},
        function(err, response){
            var result = {
                status: 201,
                message: response
            };
            if(err) {
                result.status = 500;
                result.message = err;
            } else {
                result.message._id = id;
                res.status(result.status).json(result.message);
            }
        });
};

/**
 * Pushes Workset info for Synch events into an array.
 * @param req
 * @param res
 */
module.exports.onSynched = function (req, res) {
    var id = req.params.id;
    HealthRecords.update(
        {'_id': id},
        {'$push': {'onSynched': req.body}},
        function(err, response){
            var result = {
                status: 201,
                message: response
            };
            if(err) {
                result.status = 500;
                result.message = err;
            } else {
                res.status(result.status).json(result.message);
            }
        });
};


/**
 * Pushes Workset Item counts into an array.
 * @param req
 * @param res
 */
module.exports.postItemCount = function (req, res) {
    var id = req.params.id;
    HealthRecords.update(
        {'_id': id},
        {'$push': {'itemCount': req.body}},
        function(err, response){
            var result = {
                status: 201,
                message: response
            };
            if(err) {
                result.status = 500;
                result.message = err;
            } else {
                result.message._id = id;
                res.status(result.status).json(result.message);
            }
        });
};

/**
 * Pushes Link info into an array.
 * @param req
 * @param res
 */
module.exports.postLinkStats = function (req, res) {
    var id = req.params.id;
    HealthRecords.update(
        {'_id': id},
        {'$push': {'linkStats': req.body}},
        function(err, response){
            var result = {
                status: 201,
                message: response
            };
            if(err) {
                result.status = 500;
                result.message = err;
            } else {
                res.status(result.status).json(result.message);
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
    HealthRecords.update(
        {'_id': id},
        {'$push': {'openTimes': req.body}},
        function(err, response){
            var result = {
                status: 201,
                message: response
            };
            if(err) {
                result.status = 500;
                result.message = err;
            } else {
                res.status(result.status).json(result.message);
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
    HealthRecords.update(
        {'_id': id},
        {'$push': {'synchTimes': req.body}},
        function(err, response){
            var result = {
                status: 201,
                message: response
            };
            if(err) {
                result.status = 500;
                result.message = err;
            } else {
                res.status(result.status).json(result.message);
            }
        });
};

/**
 *
 * @param req
 * @param res
 */
module.exports.getWorksetStats = function (req, res) {
    var id = mongoose.Types.ObjectId(req.params.id);
    var from = new Date(req.query.from);
    var to = new Date(req.query.to);
    HealthRecords
        .aggregate(
            [
                { $match: { _id: id }},
                { $project: {
                    'onOpened': { $filter: {
                        input: '$onOpened',
                        as: 'item',
                        cond: { $and: [
                            { $gte: ['$$item.createdOn', from]},
                            { $lte: ['$$item.createdOn', to]}
                        ]}
                    }},
                    'onSynched': { $filter: {
                        input: '$onSynched',
                        as: 'item',
                        cond: { $and: [
                            { $gte: ['$$item.createdOn', from]},
                            { $lte: ['$$item.createdOn', to]}
                        ]}
                    }},
                    'itemCount': { $slice: ['$itemCount', -1]}
                }}
            ]
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
};

/**
 *
 * @param req
 * @param res
 */
module.exports.getViewStats = function (req, res) {
    var id = req.params.id;
    HealthRecords
        .find( {'_id': id })
        .select('viewStats')
        .exec(function (err, response){
            var result = {
                status: 200,
                message: response
            };
            if (err){
                response.status = 500;
                response.message = err;
            } else {
                res.status(result.status).json(result.message);
            }
        });
};

/**
 *
 * @param req
 * @param res
 */
module.exports.getStyleStats = function (req, res) {
    var id = req.params.id;
    HealthRecords
        .find(
            { '_id': id },
            { 'styleStats': { $slice: -1 },
                'viewStats': 0,
                'itemCount': 0,
                'modelSizes': 0,
                'sessionLogs': 0,
                'synchTimes': 0,
                'openTimes': 0,
                'linkStats': 0,
                'onSynched': 0,
                'onOpened': 0,
                'familyStats': 0
            })
        .exec(function (err, response){
            var result = {
                status: 200,
                message: response
            };
            if (err){
                response.status = 500;
                response.message = err;
            } else {
                res.status(result.status).json(result.message);
            }
        });
};

/**
 * Retrieves latest entry in the Link Stats array. Since 'slice' cannot
 * be combined with select we have to exclude all other arrays.
 * https://stackoverflow.com/questions/7670073/how-to-combine-both-slice-and-select-returned-keys-operation-in-function-update
 * @param req
 * @param res
 */
module.exports.getLinkStats = function (req, res) {
    var id = req.params.id;
    HealthRecords
        .find({ '_id': id })
        .select('linkStats')
        .exec(function (err, response){
            var result = {
                status: 200,
                message: response
            };
            if (err){
                response.status = 500;
                response.message = err;
            } else {
                res.status(result.status).json(result.message);
            }
        });
};

/**
 *
 * @param req
 * @param res
 */
module.exports.getFamilyStats = function (req, res) {
    var id = req.params.id;
    HealthRecords
        .find({ '_id': id })
        .select('familyStats centralPath')
        .exec(function (err, response){
            var result = {
                status: 200,
                message: response
            };
            if (err){
                response.status = 500;
                response.message = err;
            } else {
                res.status(result.status).json(result.message);
            }
        });
};

/**
 *
 * @param req
 * @param res
 */
module.exports.getModelStats = function (req, res) {
    var id = req.params.id;
    HealthRecords
        .findById(id)
        .select('modelSizes openTimes synchTimes')
        .exec(function (err, response){
            var result = {
                status: 200,
                message: response
            };
            if (err){
                response.status = 500;
                response.message = err;
            } else {
                res.status(result.status).json(result.message);
            }
        });
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

/**
 * Updates stored file path when Configuration is changed.
 * @param req
 * @param res
 */
module.exports.updateFilePath = function (req, res) {
    var before = req.body.before.replace(/\\/g, "\\").toLowerCase();
    var after = req.body.after.replace(/\\/g, "\\").toLowerCase();
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

/**
 * Retrieves central path names of all matching records.
 * @param req
 * @param res
 */
module.exports.getNames = function (req, res) {
    var ids = [];
    req.body.forEach(function (item) {
        ids.push(mongoose.Types.ObjectId(item))
    });
    HealthRecords
        .find({'_id': {'$in': ids}})
        .select('centralPath')
        .exec(function (err, result) {
            var response = {
                status: 200,
                message: result
            };
            if(err){
                response.status = 500;
                response.message = err;
            } else if(!result){
                console.log("");
            }
            res.status(response.status).json(response.message);
        });
};
