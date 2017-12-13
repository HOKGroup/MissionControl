/**
 * Created by konrad.sobon on 2017-10-23.
 */
/**
 * @param {{ uniqueid: string }} Unique id for Sheet
 */
var mongoose = require('mongoose');
var global = require('./socket/global');
var Sheets = mongoose.model('Sheets');

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
                    console.log("File Path wasn't found in any Families Collections");
                }
                res.status(response.status).json(response.message);
            }
        )
};

/**
 * Method used to submit sheet task/changes.
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
        return x.identifier === req.body.identifier;
    });
    delete req.body._id; // make sure that _id is re-generated
    sheet.tasks.push(req.body);

    doc.save(function (err, sheetsUpdated) {
        if(err){
            res.status(500).json(err);
        } else {
            global.io.sockets.emit('sheetTask_added', { 'body': sheetsUpdated, 'identifier': req.body.identifier });
            res.status(200).json(sheetsUpdated);
        }
    });
};

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
    // req.body is always an array
    var sheet = doc.sheets.find(function (x) {
        return x.identifier === req.body[0].identifier;
    });

    var deleted = [];
    req.body.forEach(function (item) {
        var taskIndex = sheet.tasks.findIndex(function (x) {
            return x._id.toString() === item._id.toString();
        });
        if(taskIndex !== -1){
            sheet.tasks.splice(taskIndex, 1);
            deleted.push(item._id.toString());
        }
    });

    doc.save(function (err, sheetsUpdated) {
        if(err){
            res.status(500).json(err);
        } else {
            global.io.sockets.emit('sheetTask_deleted', {'identifier': req.body[0].identifier, "deleted": deleted });
            res.status(200).json(sheetsUpdated);
        }
    });
};

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
    var sheet = doc.sheets.find(function(x){
        return x.identifier === req.body.identifier;
    });
    var index = sheet.tasks.findIndex(function(x){
        return x._id.toString() === req.body._id.toString();
    });
    if(index !== -1){
        sheet.tasks[index] = req.body;
    }

    doc.save(function (err, sheetsUpdated) {
        if(err){
            res.status(500).json(err);
        } else {
            global.io.sockets.emit('sheetTask_updated', { 'body': sheetsUpdated, 'identifier': req.body.identifier, '_id': req.body._id.toString()});
            res.status(200).json(sheetsUpdated);
        }
    });
};


/**
 * Removes approved Sheet from staging, and updates collection.
 * @param req
 * @param res
 * @param objects
 */
var approveSheetChanges = function (req, res, objects) {
    var index = objects.sheets.findIndex(function (item) {
        return item.identifier === req.body.identifier;
    });

    if(index !== -1){
        // (Konrad) Update all SheetItem properties
        objects.sheets[index].name = req.body.name;
        objects.sheets[index].number = req.body.number;
    }

    var index2 = objects.sheetsChanges.findIndex(function (item) {
        return item.identifier === req.body.identifier;
    });

    if(index2 !== -1){
        objects.sheetsChanges.splice(index2, 1);
    }

    objects.save(function (err, sheetsUpdated) {
        if(err){
            res.status(500).json(err);
        } else {
            console.log("sheetTask_approved");
            global.io.sockets.emit('sheetTask_approved', { 'body': sheetsUpdated, 'identifier': req.body.identifier });
            res.status(200).json(sheetsUpdated);
        }
    });
};

module.exports.approveChanges = function (req, res) {
    Sheets
        .findById(req.params.id)
        .select('sheets sheetsChanges')
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
                approveSheetChanges(req, res, doc);
            } else {
                res
                    .status(response.status)
                    .json(response.message);
            }
        });
};

var approveCreateNewSheet = function (req, res, objects) {
    // (Konrad) This body won't have an identifier that will match sheetChanges. We can use number/name instead.
    var index = objects.sheetsChanges.findIndex(function (item) {
        return item.identifier === '' && item.name === req.body.name && item.number === req.body.number;
    });
    if(index !== -1){
        objects.sheetsChanges.splice(index, 1);
    }

    // (Konrad) Now we can add new sheet to sheets collection
    objects.sheets.push(req.body);

    objects.save(function (err, sheetsUpdated) {
        if(err){
            res.status(500).json(err);
        } else {
            console.log("sheetTask_approved");
            global.io.sockets.emit('sheetTask_approved', { 'body': sheetsUpdated, 'identifier': req.body.identifier });
            res.status(200).json(sheetsUpdated);
        }
    });
};

module.exports.approveNewSheets = function (req, res) {
    Sheets
        .findById(req.params.id)
        .select('sheets sheetsChanges')
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
                res
                    .status(response.status)
                    .json(response.message);
            }
        });
};

module.exports.deleteChanges = function (req, res) {
    Sheets
        .findOneAndUpdate(
            { _id: req.params.id },
            { $pull: { 'sheetsChanges': { 'identifier': req.body.identifier }}},
            { new: true})
        .exec(function(err, data){
            if(err){
                res.status(500).json(err);
            } else {
                global.io.sockets.emit('sheetTask_deleted', { 'identifier': req.body.identifier });
                res.status(202).json(data)
            }
        });
};

var createSheets = function (req, res, sheets) {
    req.body.forEach(function(item){
        // multiple sheet edit
        // TODO: Is it necessary to create new object here? Doesn't item already have all the required properties?
        var newObject = {
            name: item.name,
            number: item.number,
            revisionNumber: item.revisionNumber,
            uniqueId: item.uniqueId,
            identifier: item.identifier,
            assignedTo: item.assignedTo,
            message: item.message,
            isDeleted: item.isDeleted
        };

        var index = sheets.sheetsChanges.findIndex(function(x){
            if(item.identifier.length === 0) return false;
            else return x.identifier === item.identifier;
        });

        if(index !== -1){
            sheets.sheetsChanges[index].name = item.name;
            sheets.sheetsChanges[index].number = item.number;
            sheets.sheetsChanges[index].revisionNumber = item.revisionNumber;
            sheets.sheetsChanges[index].identifier = item.identifier;
            sheets.sheetsChanges[index].assignedTo = item.assignedTo;
            sheets.sheetsChanges[index].message = item.message;
            sheets.sheetsChanges[index].isDeleted = item.isDeleted;
        } else {
            sheets.sheetsChanges.push(newObject)
        }
    });

    sheets.save(function (err, sheetsUpdated) {
        if(err){
            res.status(500).json(err);
        } else {
            global.io.sockets.emit('sheetTask_sheetAdded', { 'body': sheetsUpdated});
            res.status(200).json(sheetsUpdated);
        }
    });
};

module.exports.addSheets = function (req, res) {
    Sheets
        .findById(req.params.id)
        .select('sheetsChanges')
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
                createSheets(req, res, doc);
            } else {
                res
                    .status(response.status)
                    .json(response.message);
            }
        });
};

var removeNewSheet = function (req, res, objects) {
    // (Konrad) This body won't have an identifier that will match sheetChanges. We can use number/name instead.
    var index = objects.sheetsChanges.findIndex(function (item) {
        return item.identifier === '' && item.number === req.body.number && item.name === req.body.name;
    });
    if(index !== -1){
        objects.sheetsChanges.splice(index, 1);
    }

    objects.save(function (err, sheetsUpdated) {
        if(err){
            res.status(500).json(err);
        } else {
            // TODO: We need to emit a message here.
            // global.io.sockets.emit('sheetTask_sheetAdded', { 'body': sheetsUpdated});
            res.status(200).json(sheetsUpdated);
        }
    });
};

module.exports.deleteNewSheet = function (req, res) {
    Sheets
        .findById(req.params.id)
        .select('sheetsChanges')
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
                removeNewSheet(req, res, doc);
            } else {
                res
                    .status(response.status)
                    .json(response.message);
            }
        });
};

module.exports.update = function(req, res) {
    var id = req.params.id;

    Sheets
        .update({_id: id}, req.body, {upsert: true}, function (err, result){
            if(err) {
                res.status(400).json(err);
            } else {
                res.status(202).json(result);
            }
        });
};