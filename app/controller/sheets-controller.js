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
 * Puts sheets with proposed changes into sheetChanges collection,
 * or updates them if they already exist.
 * @param req
 * @param res
 * @param sheets
 */
var updateObject = function (req, res, sheets) {
    if(!Array.isArray(req.body)){
        // single sheet edit
        var newObject = {
            name: req.body.name,
            number: req.body.number,
            revisionNumber: req.body.revisionNumber,
            uniqueId: req.body.uniqueId,
            identifier: req.body.identifier,
            assignedTo: req.body.assignedTo,
            message: req.body.message
        };

        if(sheets.sheetsChanges.length === 0){
            sheets.sheetsChanges.push(newObject);
        } else {
            var index = sheets.sheetsChanges.findIndex(function(item){
                return item.identifier === req.body.identifier;
            });
            if(index !== -1){
                sheets.sheetsChanges[index].name = req.body.name;
                sheets.sheetsChanges[index].number = req.body.number;
                sheets.sheetsChanges[index].revisionNumber = req.body.revisionNumber;
                sheets.sheetsChanges[index].identifier = req.body.identifier;
                sheets.sheetsChanges[index].assignedTo = req.body.assignedTo;
                sheets.sheetsChanges[index].message = req.body.message;
            } else {
                sheets.sheetsChanges.push(newObject)
            }
        }
    } else {
        req.body.forEach(function(item){
            // multiple sheet edit
            var newObject = {
                name: item.name,
                number: item.number,
                revisionNumber: item.revisionNumber,
                uniqueId: item.uniqueId,
                identifier: item.identifier,
                assignedTo: item.assignedTo,
                message: item.message
            };

            if(sheets.sheetsChanges.length === 0){
                sheets.sheetsChanges.push(newObject);
            } else {
                var index = sheets.sheetsChanges.findIndex(function(item){
                    return item.identifier === item.identifier;
                });
                if(index !== -1){
                    sheets.sheetsChanges[index].name = item.name;
                    sheets.sheetsChanges[index].number = item.number;
                    sheets.sheetsChanges[index].revisionNumber = item.revisionNumber;
                    sheets.sheetsChanges[index].identifier = item.identifier;
                    sheets.sheetsChanges[index].assignedTo = item.assignedTo;
                    sheets.sheetsChanges[index].message = item.message;
                } else {
                    sheets.sheetsChanges.push(newObject)
                }
            }
        });
    }

    sheets.save(function (err, sheetsUpdated) {
        if(err){
            res.status(500).json(err);
        } else {
            global.io.sockets.emit('sheetTask_updated', { 'body': sheetsUpdated, 'identifier': req.body.identifier });
            res.status(200).json(sheetsUpdated);
        }
    });
};

module.exports.updateChanges = function (req, res) {
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
                updateObject(req, res, doc);
            } else {
                res
                    .status(response.status)
                    .json(response.message);
            }
        });
};