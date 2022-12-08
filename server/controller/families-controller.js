/**
 * @param {{ taskid: string }} Task Id
 * @param {{ name: string }} Family Name
 */
var mongoose = require('mongoose');
var global = require('./socket/global');
var Families = mongoose.model('Families');

FamiliesService = {
    /**
     * Finds sheet collection by central path.
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

        Families
            .find(
                {'centralPath': rgx}, function (err, result) {
                    var response = {
                        status: 200,
                        message: result
                    };
                    if(err){
                        response.status = 500;
                        response.message = err;
                    } else if(!result){
                        console.log('File Path wasn\'t found in any Sheets Collections.');
                    }
                    res.status(response.status).json(response.message);
                }
            );
    },

    /**
     * Updates Families document with new info.
     * @param req
     * @param res
     */
    update: function(req, res) {
        var id = req.params.id;
        Families
            .update({ '_id': id }, req.body, { upsert: true }, function (err, response){
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
     * Updates stored file path value when Configuration is changed.
     * @param req
     * @param res
     */
    updateFilePath: function(req, res){
        var before = req.body.before.replace(/\\/g, '\\').toLowerCase();
        var after = req.body.after.replace(/\\/g, '\\').toLowerCase();
        Families
            .update(
                { 'centralPath': before },
                { '$set': { 'centralPath' : after }}, function (err, response){
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
     * Creates new Families Document.
     * @param req
     * @param res
     */
    add: function(req, res){
        Families
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
     * Adds new task to Family.
     * @param req
     * @param res
     */
    addTask: function(req, res) {
        var id = req.params.id;

        // (Konrad) We override the _id with a new one, so that we know exactly what
        // that new task is stored under, and can pass it along to client.
        var newId = mongoose.Types.ObjectId();
        req.body['_id'] = newId;

        Families
            .findOneAndUpdate(
                {_id: id, 'families.name': req.params.name},
                {$push: {'families.$.tasks': req.body}},
                {'new': true}) // returns newly updated collection
            .exec(function(err, data){
                if(err){
                    res.status(500).json(err);
                } else {
                    // (Konrad) We can pre-filter on server side and minimize payload.
                    var task = data.families.find(function (item) {
                        return item.name === req.params.name;
                    }).tasks.find(function(item){
                        return item._id.toString() === newId.toString();
                    });

                    if(task !== null){
                        global.io.sockets.in(req.body.centralPath).emit('familyTask_added', {
                            'familyName': req.params.name,
                            'task': task
                        });
                    }

                    res.status(200).json(task);
                }
            });
    },

    /**
     * Updates family tasks.
     * @param req
     * @param res
     */
    updateTask: function (req, res) {
        Families
            .findById(req.params.id)
            .select('families')
            .exec(function (err, doc){
                var response = {
                    status: 201,
                    message: []
                };
                if (err){
                    response.status = 500;
                    response.message = err;
                } else if(!doc){
                    response.status = 404;
                    response.message = {'message': 'Families Id not found.'};
                }
                if(doc){
                    updateFamiliesTask(req, res, doc);
                } else {
                    res.status(response.status).json(response.message);
                }
            });
    },

    /**
     * Deletes tasks from family.
     * @param req
     * @param res
     */
    deleteMultipleTasks: function (req, res) {
        var id = req.params.id;
        var famName = req.params.name;
        var taskIds = [];
        for(var key in req.body.ids) {
            if(req.body.hasOwnProperty(key)){
                taskIds.push(mongoose.Types.ObjectId(req.body[key]));
            }
        }
        Families
            .update(
                { '_id': id, 'families.name': famName},
                { $pull: { 'families.$.tasks': { '_id': { $in: taskIds }}}}, function (err, response){
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
                    global.io.sockets.in(req.body.centralPath).emit('task_deleted', {
                        'deletedIds': req.body.ids,
                        'familyName': req.params.name });
                    res.status(result.status).json(result.message);
                }
            );
    },

    /**
     * Retrieves model stats data by central path.
     * It also aggregates data from worksets and
     * filters by provided date range.
     * @param req
     * @param res
     */
    getFamilyStats: function (req, res) {
        Families.aggregate([
            { $facet: {
                'families': [
                    { $match: { 'centralPath': req.body.centralPath }}
                ],
                'opentimes': [
                    { $limit: 1 },
                    { $lookup: {
                        from: 'opentimes',
                        pipeline: [
                            { $match: { 'centralPath': req.body.centralPath }}
                        ],
                        as: 'opentimes'
                    }},
                    { $unwind: '$opentimes' },
                    { $replaceRoot: { newRoot: '$opentimes' }}
                ]
            }},
            { $project: { 'opentimes.user': 1, 'families': 1 }}
        ]).exec(function (err, response){
            var result = {
                status: 201,
                message: response
            };
            if (err) {
                result.status = 500;
                result.message = err;
            } else if (!response) {
                result.status = 404;
                result.message = err;
            }
            res.status(result.status).json(result.message);
        });
    }
};

//region Utilities

/**
 * Method for updating Tasks. Used to Accept task or change assignee.
 * @param req
 * @param res
 * @param doc
 */
var updateFamiliesTask = function (req, res, doc) {
    var family = doc.families.find(function(item){
        return item.name === req.params.name;
    });

    var index = family.tasks.findIndex(function(item){
        return item._id.toString() === req.params.taskid.toString();
    });
    if(index !== -1) family.tasks[index] = req.body;

    doc.save(function (err, familiesUpdated) {
        if(err){
            res.status(500).json(err);
        } else {
            var task = familiesUpdated.families.find(function(item){
                return item.name === req.params.name;
            }).tasks.find(function(task){
                return task._id.toString() === req.params.taskid.toString();
            });

            global.io.sockets.in(req.body.centralPath).emit('familyTask_updated', {
                'familyName': req.params.name,
                'task': task
            });
            res.status(201).json(task);
        }
    });
};

//endregion

module.exports = FamiliesService;