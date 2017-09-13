var mongoose = require('mongoose');
var Addins = mongoose.model('Addins');

module.exports.findAll = function(req, res){
    Addins
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

module.exports.add = function(req, res){
    Addins
        .create(req.body, function(err, usageLogs){
            if(err) {
                res
                    .status(400)
                    .json(err);
            } else {
                res
                    .status(201)
                    .json(usageLogs);
            }
        });
};

var _addAddinLog = function (req, res, addins){
    addins.usageLogs.push({
        pluginName: req.body.pluginName,
        user: req.body.user,
        revitVersion: req.body.revitVersion,
        executionTime: parseInt(req.body.executionTime, 10),
        createdOn: Date.now()
    });

    addins.save(function (err, addinsUpdated) {
        if(err){
            res
                .status(500)
                .json(err);
        } else {
            res
                .status(200)
                .json(addinsUpdated.usageLogs[addinsUpdated.usageLogs.length - 1]);
        }
    });
};

module.exports.addLog = function (req, res) {
    var id = req.params.id;
    Addins
        .findById(id)
        .select('usageLogs')
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
                response.message = {"message": "Addins Id not found."}
            }
            if(doc){
                _addAddinLog(req, res, doc);
            } else {
                res
                    .status(response.status)
                    .json(response.message);
            }
        });
};