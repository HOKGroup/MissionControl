/**
 * @param {{ updaterid: string }} Updater Id
 */
var mongoose = require('mongoose');

Configuration = mongoose.model('Configuration');

module.exports.findAll = function(req, res){
    Configuration.find({},function(err, results) {
        return res.send(results);
    });
};

module.exports.findById = function(req, res){
    var id = req.params.id;
    Configuration.findOne({'_id':id},function(err, result) {
        return res.send(result);
    });
};

module.exports.findByUpdaterId = function(req, res){
    var id = req.params.id;
    var updaterid = req.params.updaterid;
    Configuration.find({'_id':id,'updaters.updaterId':updaterid},function(err, result) {
        return res.send(result);
    });
};

module.exports.add = function(req, res) {
    Configuration.create(req.body, function (err, result) {
            if(err) {
                res.status(400).json(err);
            } else {
                res.status(201).json(result);
            }
        });
};

/**
 * Updates given Configuration by Id.
 * @param req
 * @param res
 */
module.exports.update = function(req, res) {
    var id = req.params.id;
    Configuration.update(
        { "_id":id }, req.body, { upsert: true }, function (err, result) {
            if(err) res.status(501).json(err);
            else res.status(202).json(result);
        });
};

module.exports.delete = function(req, res){
    var id = req.params.id;
    Configuration.remove({'_id':id},function(result) {
        global.io.sockets.emit('delete_configuration', id);
        return res.send(result);
    });
};

/**
 * Removes many configurations by their ids.
 * @param req
 * @param res
 */
module.exports.deleteMany = function (req, res) {
    var ids = req.body.map(function (id){
        return mongoose.Types.ObjectId(id);
    });
    Configuration
        .remove({'_id': { $in: ids }}, function (err, response){
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
};

/**
 * Retrieves Configuration by its Central Path.
 * @param req
 * @param res
 */
module.exports.findByCentralPath  = function(req, res){
    // (Konrad) Since we cannot pass file path with "\" they were replaced with illegal pipe char "|".
    // (Konrad) RSN and A360 paths will have forward slashes instead of back slashes.
    var rgx;
    if(req.params.uri.includes('RSN:') || req.params.uri.includes('BIM 360:')){
        rgx = req.params.uri.replace(/\|/g, "/").toLowerCase();
    } else {
        rgx = req.params.uri.replace(/\|/g, "\\").toLowerCase();
    }

    Configuration.find(
        {'files.centralPath': rgx}, function (err, result) {
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
    )
};

/**
 * Updates file path value for given configuration.
 * @param req
 * @param res
 */
module.exports.updateFilePath = function (req, res) {
    var id = req.params.id;
    Configuration
        .update(
            {'_id': id, 'files.centralPath': req.body.before.toLowerCase()},
            {'$set': {'files.$.centralPath' : req.body.after.toLowerCase()}}, function (err, result) {
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
        )
};