/**
 * Created by konrad.sobon on 2017-10-23.
 */
/**
 * @param {{ uniqueid: string }} Unique id for Sheet
 */
var mongoose = require('mongoose');
var global = require('./socket/global');
var Sheets = mongoose.model('Sheets');

/**
 * Retrieves all sheets.
 * @param req
 * @param res
 */
module.exports.findAll = function(req, res){
    Sheets
        .find()
        .exec(function(err, data){
            if(err){
                res.status(500).json(err);
            } else {
                res.status(200).json(data)
            }
        });
};

/**
 * Creates a sheets collection.
 * @param req
 * @param res
 */
module.exports.add = function(req, res){
    Sheets
        .create(req.body, function(err, sheetsData){
            if(err) {
                res.status(400).json(err);
            } else {
                res.status(201).json(sheetsData);
            }
        });
};

/**
 * Finds sheet collection by central path.
 * @param req
 * @param res
 */
module.exports.findByCentralPath = function(req, res){
    //(Konrad) Since we cannot pass file path with "\" they were replaced with illegal pipe char "|".
    var uri = req.params.uri.replace(/\|/g, "\\\\");
    Sheets
        .find(
            {"centralPath": {'$regex': uri, '$options': 'i'}}, function (err, result) {
                var response = {
                    status: 200,
                    message: result
                };
                if(err){
                    response.status = 500;
                    response.message = err;
                } else if(!result){
                    console.log("File Path wasn't found in any Sheets Collections.");
                }
                res.status(response.status).json(response.message);
            }
        )
};

/**
 * Approves new sheet. Called from Client when sheet is created.
 * @param req
 * @param res
 */
module.exports.approveNewSheets = function (req, res) {
    Sheets
        .findById(req.params.id)
        .select('sheets')
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
                response.message = {"message": "SheetsChanges Id not found."}
            }
            if(doc){
                approveCreateNewSheet(req, res, doc);
            } else {
                res.status(response.status).json(response.message);
            }
        });
};

var approveCreateNewSheet = function (req, res, doc) {
    var sheetIndex = doc.sheets.findIndex(function (x) {
        return x._id.toString() === req.body.Element._id.toString();
    });
    var sheet;
    if(sheetIndex !== -1) sheet = doc.sheets[sheetIndex];

    var taskIndex = sheet.tasks.findIndex(function(x){
        return x._id.toString() === req.body.Task._id.toString();
    });
    if(taskIndex !== -1) {
        sheet.tasks[taskIndex] = req.body.Task; // update task
        var tasks = sheet.tasks; // pull out tasks
        req.body.Element.tasks = tasks; // pull all tasks into new object
        doc.sheets[sheetIndex] = req.body.Element; // update the doc with new sheet/tasks
    }

    doc.save(function (err, sheetsUpdated) {
        if(err){
            res.status(500).json(err);
        } else {
            global.io.sockets.emit('sheetTask_updated', {
                'body': sheetsUpdated,
                'identifier': req.body.Element.identifier,
                '_id': req.body.Task._id.toString()});
            res.status(200).json(sheetsUpdated);
        }
    });
};

/**
 * Updates the whole collection of sheets. Used at Synch to central.
 * @param req
 * @param res
 */
module.exports.update = function (req, res) {
    Sheets
        .findById(req.params.id)
        .select('sheets')
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
                response.message = {"message": "SheetsChanges Id not found."}
            }
            if(doc){
                updateAllSheets(req, res, doc);
            } else {
                res.status(response.status).json(response.message);
            }
        });
};

var updateAllSheets = function (req, res, doc) {
    doc.sheets = req.body.sheets;
    doc.revisions = req.body.revisions;

    doc.save(function (err, sheetsUpdated) {
        if(err){
            res.status(500).json(err);
        } else {
            res.status(200).json(sheetsUpdated);
        }
    });
};

/**
 * Submits new Sheet tasks.
 * @param req
 * @param res
 */
module.exports.addSheetTask = function (req, res) {
    Sheets
        .findById(req.params.id)
        .select('sheets')
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
                response.message = {"message": "Sheets Id not found."}
            }
            if(doc){
                addSheetTask(req, res, doc);
            } else {
                res.status(response.status).json(response.message);
            }
        });
};

var addSheetTask = function(req, res, doc){
    var sheet = doc.sheets.find(function(x){
        return x._id.toString() === req.body.sheetId.toString();
    });
    // (Konrad) We override the _id with a new one, so that we know exactly what
    // that new task is stored under, and can pass it along to client.
    var newId = mongoose.Types.ObjectId();
    req.body['_id'] = newId;
    sheet.tasks.push(req.body);

    doc.save(function (err, sheetsUpdated) {
        if(err){
            res.status(500).json(err);
        } else {
            global.io.sockets.emit('sheetTask_added', {
                'body': sheetsUpdated,
                'sheetId': req.body.sheetId.toString(),
                'taskId': newId.toString(),
                'collectionId': req.params.id
            });
            res.status(200).json(sheetsUpdated);
        }
    });
};

/**
 * Updates sheet tasks with any changes.
 * @param req
 * @param res
 */
module.exports.updateSheetTask = function (req, res) {
    Sheets
        .findById(req.params.id)
        .select('sheets')
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
                response.message = {"message": "Sheets Id not found."}
            }
            if(doc){
                updateSheetTask(req, res, doc);
            } else {
                res.status(response.status).json(response.message);
            }
        });
};

var updateSheetTask = function (req, res, doc) {
    var sheet = doc.sheets.find(function (x) {
        return x._id.toString() === req.body.sheetId.toString();
    });
    var index = sheet.tasks.findIndex(function(x){
        return x._id.toString() === req.body._id.toString();
    });
    if(index !== -1) sheet.tasks[index] = req.body;

    doc.save(function (err, sheetsUpdated) {
        if(err){
            res.status(500).json(err);
        } else {
            global.io.sockets.emit('sheetTask_updated', {
                'body': sheetsUpdated,
                'sheetId': req.body.sheetId.toString(),
                'taskId': req.body._id.toString(),
                'collectionId': req.params.id
            });
            res.status(200).json(sheetsUpdated);
        }
    });
};

/**
 * Deletes a sheet task.
 * @param req
 * @param res
 */
module.exports.deleteTasks = function (req, res) {
    Sheets
        .findById(req.params.id)
        .select('sheets')
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
                response.message = {"message": "Sheets Id not found."}
            }
            if(doc){
                deleteSheetTask(req, res, doc);
            } else {
                res.status(response.status).json(response.message);
            }
        });
};

var deleteSheetTask = function (req, res, doc) {
    var sheet = doc.sheets.find(function (x) {
        return x._id.toString() === req.body.sheetId.toString();
    });

    var deleted = [];
    req.body.deletedIds.forEach(function (id) {
        var taskIndex = sheet.tasks.findIndex(function (x) {
            return x._id.toString() === id.toString();
        });
        if(taskIndex !== -1){
            sheet.tasks.splice(taskIndex, 1);
            deleted.push(id.toString());
        }
    });

    doc.save(function (err, sheetsUpdated) {
        if(err){
            res.status(500).json(err);
        } else {
            global.io.sockets.emit('sheetTask_deleted', {
                'collectionId': req.params.id,
                'sheetId': req.body.sheetId.toString(),
                "deletedIds": deleted });
            res.status(200).json(sheetsUpdated);
        }
    });
};

/**
 * Removes new sheet.
 * @param req
 * @param res
 */
module.exports.deleteNewSheet = function (req, res) {
    Sheets
        .update(
            { _id: req.params.id},
            { $pull:{ 'sheets': { '_id': req.body.sheetId }}},
            function(err){
                if(err) {
                    console.log(err);
                    res.status(201).json(err);
                } else {
                    global.io.sockets.emit('sheetTask_sheetDeleted', {
                        'collectionId': req.params.id,
                        'sheetId': req.body.sheetId.toString(),
                        'deletedIds': req.body.deletedIds});
                    res.status(201).json(req.body.sheetId.toString());
                }
            });
};

/**
 * Adds new sheets to DB.
 * @param req
 * @param res
 */
module.exports.addSheets = function (req, res) {
    var ids = [];
    req.body.forEach(function (item) {
        var id = mongoose.Types.ObjectId();
        item['_id'] = id;
        ids.push(id.toString());
    });
    Sheets
        .findOneAndUpdate(
            {_id: req.params.id},
            {$push: {'sheets': {$each: req.body}}},
            {'new': true}) // returns newly updated collection
        .exec(function(err, data){
            if(err){
                res.status(500).json(err);
            } else {
                global.io.sockets.emit('sheetTask_sheetsAdded', {
                    'body': data,
                    'sheetIds': ids,
                    'collectionId': req.params.id
                });
                res.status(202).json({'data': data, 'newSheetIds': ids})
            }
        });
};

/**
 * Updates the centralPath value. Used by the Configurations tool.
 * @param req
 * @param res
 */
module.exports.updateFilePath = function (req, res) {
    var before = req.body.before.replace(/\\/g, "\\");
    var after = req.body.after.replace(/\\/g, "\\");
    Sheets
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