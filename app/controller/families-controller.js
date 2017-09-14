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