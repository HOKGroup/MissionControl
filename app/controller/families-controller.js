/**
 * @param {{taskid:string}}
 */

var mongoose = require('mongoose');
var Families = mongoose.model('Families');

module.exports.findAll = function(req, res){
    Families
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

module.exports.findByEncodedURI = function(req, res){
    var uri = req.params.uri;
    var decodedUri = decodeURIComponent(uri);

    Families
        .find(
            { $text: { $search: decodedUri }},
            { score: { $meta: "textScore" } })
        .sort(
            { score: { $meta: 'textScore' } })
        .limit(5)
        .lean()
        .exec(function(err, result){
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
            res
                .status(response.status)
                .json(response.message);
        });
};

module.exports.add = function(req, res){
    Families
        .create(req.body, function(err, familyData){
            if(err) {
                res
                    .status(400)
                    .json(err);
            } else {
                res
                    .status(201)
                    .json(familyData);
            }
        });
};

module.exports.update = function(req, res) {
    var id = req.params.id;

    Families
        .update({_id: id}, req.body, {upsert: true}, function (err, result){
            if(err) {
                res
                    .status(400)
                    .json(err);
            } else {
                res
                    .status(202)
                    .json(result);
            }
        });
};

module.exports.findById = function(req, res){
    var id = req.params.id;

    Families
        .findOne({ '_id': id },function(err, result) {
            if(err) {
                res
                    .status(400)
                    .json(err);
            } else {
                res
                    .status(202)
                    .json(result);
            }
        });
};

module.exports.addTask = function(req, res) {
    var id = req.params.id;
    var famName = req.params.name;

    Families
        .findOneAndUpdate(
            {_id: id, 'families.name': famName},
            {$push: {'families.$.tasks': req.body}},
            {'new': true}) // returns newly updated collection
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

module.exports.deleteTask = function (req, res) {
    var id = req.params.id;
    var famName = req.params.name;
    var taskId = mongoose.Types.ObjectId(req.params.taskid);

    Families
        .update(
            { _id: id, 'families.name': famName},
            { $pull: {'families.$.tasks': { _id: taskId}}}, function(err, result){
                if(err) {
                    res
                        .status(400)
                        .json(err);
                } else {
                    res
                        .status(202)
                        .json(result);
                }
            }
        )
};

module.exports.deleteMultipleTasks = function (req, res) {
    var id = req.params.id;
    var famName = req.params.name;
    var taskIds = [];
    for(var key in req.body) {
        if(req.body.hasOwnProperty(key)){
            taskIds.push(mongoose.Types.ObjectId(req.body[key]));
        }
    }

    Families
        .update(
            { _id: id, 'families.name': famName},
            { $pull: {'families.$.tasks': { _id: { $in: taskIds}}}}, function(err, result){
                if(err) {
                    res
                        .status(400)
                        .json(err);
                } else {
                    res
                        .status(202)
                        .json(result);
                }
            }
        )
};

// (Konrad) For the time being as of 3.4.9 MongoDB release
// we cannot update objects inside of nested arrays with a single call
// That change is coming with MongoDB 3.5.12 https://jira.mongodb.org/browse/SERVER-831
module.exports.updateTask = function (req, res) {
    var id = req.params.id;
    var famName = req.params.name;
    var taskId = mongoose.Types.ObjectId(req.params.taskid);

    Families
        .update(
            { _id: id, 'families.name': famName},
            { $pull: {'families.$.tasks': { _id: taskId}}}, function(err){
                if(err) {
                    res
                        .status(400)
                        .json(err);
                } else {
                Families
                    .findOneAndUpdate(
                        {_id: id, 'families.name': famName},
                        {$push: {'families.$.tasks': req.body}},
                        {'new': true}) // returns newly updated collection
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
                }
            }
        );
};