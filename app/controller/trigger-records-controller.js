var mongoose = require('mongoose');
TriggerRecord = mongoose.model('TriggerRecord');

TriggerRecordService = {
    /**
     * Finds Trigger Record Document by central path. This is used pretty much just to get the _id
     * since it will be used on the .NET side to post new Trigger Record. No need to retrieve entire
     * document.
     * @param req
     * @param res
     */
    findByCentralPath: function(req, res){
        // (Konrad) Since we cannot pass file path with "\" they were replaced with illegal pipe char "|".
        // (Konrad) RSN and BIM 360 paths will have forward slashes instead of back slashes.
        var rgx;
        if(req.params.uri.includes('RSN:') || req.params.uri.includes('BIM 360:')){
            rgx = req.params.uri.replace(/\|/g, "/").toLowerCase();
        } else {
            rgx = req.params.uri.replace(/\|/g, "\\").toLowerCase();
        }
        TriggerRecord
            .find({ "centralPath": rgx })
            .select('_id centralPath')
            .exec(function (err, response){
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
            })
    },

    /**
     * Creates new Trigger Record Document.
     * @param req
     * @param res
     */
    add : function(req, res) {
        TriggerRecord
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
     * Adds new Trigger Record to array.
     * @param req
     * @param res
     */
    postTriggerRecord: function (req, res) {
        var id = req.params.id;
        TriggerRecord
            .update(
                { '_id': id },
                { $push: { 'triggerRecords': req.body }}, function (err, response){
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
     * Retrieves all Trigger Record Documents by Central Path and filters values by date.
     * @param req
     * @param res
     */
    findManyByCentralPathDates: function (req, res) {
        var from = new Date(req.body.from);
        var to = new Date(req.body.to);
        TriggerRecord
            .aggregate([
                { $match: { 'centralPath': { $in: req.body.paths }}},
                { $project: {
                    'triggerRecords': { $filter: {
                        input: '$triggerRecords',
                        as: 'item',
                        cond: { $and: [
                            { $gte: ['$$item.createdOn', from]},
                            { $lte: ['$$item.createdOn', to]}
                        ]}
                    }},
                    'centralPath': 1
                }}]
            ).exec( function (err, response){
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
    },

    /**
     * Updates file path value when Configuration is changed.
     * @param req
     * @param res
     */
    updateFilePath: function(req, res){
        var before = req.body.before.replace(/\\/g, "\\").toLowerCase();
        var after = req.body.after.replace(/\\/g, "\\").toLowerCase();
        TriggerRecord
            .update(
                { 'centralPath': before },
                { '$set': {'centralPath' : after }}, function (err, response){
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

  findAll : function(req, res){
    TriggerRecord.find({},function(err, results) {
      return res.send(results);
    });
  },

  findById : function(req, res){
    var id = req.params.id;
    TriggerRecord.findOne({'_id':id},function(err, result) {
      return res.send(result);
    });
  },
  
    findByUpdaterId : function(req, res){
    var id = req.params.updaterid;
    TriggerRecord.find({'updaterId':id},function(err, result) {
      return res.send(result);
    });
  },

    /**
     * Get all editing records by Configuration Id and date range.
     * @param req
     * @param res
     */
    findByConfigId : function(req, res){
    var configid = req.params.configid;
    var from = new Date(req.query.from);
    var to = new Date(req.query.to);
    if(from && to){
        TriggerRecord
            .find({
                'configId': configid,
                'edited': {'$gte': from, '$lte': to}}, function (err, result) {
            if(err) return console.log(err);
            return res.send(result);
        })
    } else {
        TriggerRecord
            .find({'configId':configid})
            .sort('-edited')
            .exec(function(err, result) {
                if(err) return console.log(err);
                return res.send(result);
            });
    }},

  findByUniqueId : function(req, res){
    var id = req.params.uniqueid;
    TriggerRecord.find({'elementUniqueId':id},function(err, result) {
      return res.send(result);
    });
  },

  update : function(req, res) {
    var id = req.params.id;
    console.log('Updating ' + id);
    TriggerRecord.update({"_id":id}, req.body, {upsert:true},
      function (err, numberAffected) {
        if (err) return console.log(err);
        console.log('Updated %s instances', numberAffected.toString());
        return res.sendStatus(202);
    });
  },

  delete : function(req, res){
    var id = req.params.id;
    TriggerRecord.remove({'_id':id},function(result) {
      return res.send(result);
    });
  },
  
   deleteAllForConfig : function(req, res){
    var id = req.params.configid;
    TriggerRecord.remove({'configId':id},function(err, results) {
      return res.send(results);
    });
  },
  
  deleteAllForFile : function(req, res){
    var path = req.params.centralpath;
    TriggerRecord.remove({'centralpath':path},function(err, results) {
      return res.send(results);
    });
  }
  };

module.exports = TriggerRecordService;