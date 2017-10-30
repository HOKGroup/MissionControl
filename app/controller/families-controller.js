/**
 * @param {{ taskid: string }} Task Id
 * @param {{ name: string }} Family Name
 */

var mongoose = require('mongoose');
var global = require('./socket/global');
var Families = mongoose.model('Families');

module.exports.findAll = function(req, res){
    Families
        .find()
        .exec(function(err, data){
            if(err){
                res.status(500).json(err);
            } else {
                res.status(200).json(data)
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
            res.status(response.status).json(response.message);
        });
};

module.exports.add = function(req, res){
    Families
        .create(req.body, function(err, familyData){
            if(err) {
                res.status(400).json(err);
            } else {
                res.status(201).json(familyData);
            }
        });
};

module.exports.update = function(req, res) {
    var id = req.params.id;

    Families
        .update({_id: id}, req.body, {upsert: true}, function (err, result){
            if(err) {
                res.status(400).json(err);
            } else {
                res.status(202).json(result);
            }
        });
};

module.exports.findById = function(req, res){
    var id = req.params.id;

    Families
        .findOne({ '_id': id },function(err, result) {
            if(err) {
                res.status(400).json(err);
            } else {
                res.status(202).json(result);
            }
        });
};

module.exports.addTask = function(req, res) {
    var id = req.params.id;

    Families
        .findOneAndUpdate(
            {_id: id, 'families.name': req.params.name},
            {$push: {'families.$.tasks': req.body}},
            {'new': true}) // returns newly updated collection
        .exec(function(err, data){
            if(err){
                res.status(500).json(err);
            } else {
                global.io.sockets.emit('familyTask_added', { 'body': data, 'familyName': req.params.name });
                res.json(data)
            }
        });
};

// (Konrad) For the time being as of 3.4.9 MongoDB release
// we cannot update objects inside of nested arrays with a single call
// That change is coming with MongoDB 3.5.12 https://jira.mongodb.org/browse/SERVER-831
module.exports.updateTask = function (req, res) {
    var id = req.params.id;
    var taskId = mongoose.Types.ObjectId(req.params.taskid);

    Families
        .update(
            { _id: id, 'families.name': req.params.name},
            { $pull: {'families.$.tasks': { _id: taskId}}}, function(err){
                if(err) {
                    res.status(500).json(err);
                } else {
                    Families
                        .findOneAndUpdate(
                            {_id: id, 'families.name': req.params.name}, // use fam name here since it's unique
                            {$push: {'families.$.tasks': req.body}},
                            {'new': true}) // returns newly updated collection
                        .exec(function(err, data){
                            if(err){
                                res.status(500).json(err);
                            } else {
                                global.io.sockets.emit('familyTask_updated', {
                                    'body': data,
                                    'familyName': req.params.name,
                                    'oldTaskId': req.params.taskid});
                                res.status(202).json(data)
                            }
                        });
                }
            }
        );
};

// (Konrad) Not used
// module.exports.deleteTask = function (req, res) {
//     var id = req.params.id;
//     var famName = req.params.name;
//     var taskId = mongoose.Types.ObjectId(req.params.taskid);
//
//     Families
//         .update(
//             { _id: id, 'families.name': famName},
//             { $pull: {'families.$.tasks': { _id: taskId}}}, function(err, result){
//                 if(err) {
//                     res.status(400).json(err);
//                 } else {
//                     res.status(202).json(result);
//                 }
//             }
//         )
// };

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
                    res.status(400).json(err);
                } else {
                    global.io.sockets.emit('task_deleted', req.body);
                    res.status(202).json(result);
                }
            }
        )
};

// // TODO: I really need to figure out to make a single call and update multiple objects.
// module.exports.updateOne = function (req, res) {
//     var id = req.params.id;
//     var family = req.body['key'];
//
//     Families
//         .update(
//             {_id: id, 'families._id': mongoose.Types.ObjectId(family.Id)},
//             {$set: {
//                 'families.$.name': family.name,
//                 'families.$.isNameVerified': family.isNameVerified
//             }},
//             { upsert: true }, function(err, result){
//                 if(err) {
//                     res.status(400).json(err);
//                 } else {
//                     res.status(202).json(result);
//                 }
//             }
//         );
// };

module.exports.updateMultipleFamilies1 = function (req, res) {
    var id = req.params.id;
    var bulkOps = [];

    // var famId = {};
    // var family = {};

    // var ordered = Families.collection.initializeUnorderedBulkOp();

    for(var key in req.body) {
        if(req.body.hasOwnProperty(key)){
            // for (var i=0; i<req.body[key].length; i++){
            //     family = req.body[key][i];
            //     famId = mongoose.Types.ObjectId(family.Id);
            // }
            bulkOps = req.body[key].map(function(item){
                return {
                    'updateOne': {
                        'filter': {'_id': id, 'families._id': mongoose.Types.ObjectId(item.Id)},
                        'update': {'$set': {'families.$.name': item.name}}
                    }
                }
            })
            // for (var i=0; i<req.body[key].length; i++){
            //     var item = req.body[key][i];
            //     ordered.find(
            //         {'_id': mongoose.Types.ObjectId(item.Id)})
            //         .updateOne(
            //             {$set: {'name': item.name}})
            // }
        }
    }

    // ordered.execute(function(err, result){
    //     if(err){
    //         res.status(400).json(err);
    //     } else {
    //         res.status(202).json(result);
    //     }
    // });

    Families.collection
        .bulkWrite(
            bulkOps, function(err, result){
                if(err) {
                    res.status(400).json(err);
                } else {
                    res.status(202).json(result);
                }
            })

    // Families
    //     .update(
    //         {_id: id, 'families._id': famId},
    //         {$set: {'families.$.name': family.name}}, function(err, result){
    //             if(err) {
    //                 res
    //                     .status(400)
    //                     .json(err);
    //             } else {
    //                 res
    //                     .status(202)
    //                     .json(result);
    //             }
    //         }
    //     )


};