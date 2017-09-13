var mongoose = require('mongoose');
var global = require('./socket/global');

ProjectFile = mongoose.model('ProjectFile');

ProjectFileService = {

  findAll : function(req, res){
    ProjectFile.find({},function(err, results) {
      return res.send(results);
    });
  },

  findById : function(req, res){
    var id = req.params.id;
    ProjectFile.findOne({'_id':id},function(err, result) {
      return res.send(result);
    });
  },

  findByCentralPath : function(req, res){
    var filePath = req.params.centralpath;
    ProjectFile.find({'centralPath':filePath},function(err, result) {
      return res.send(result);
    });
  },
  
   add : function(req, res) {
    ProjectFile.create(req.body, function (err, result) {
      if (err) return console.log(err);
      return res.send(result);
    });
  },
  

  update : function(req, res) {
    var id = req.params.id;
    console.log('Updating ' + id);
    ProjectFile.update({"_id":id}, req.body, {upsert:true},
      function (err, numberAffected) {
        if (err) return console.log(err);
        return res.sendStatus(202);
    });
  },

  delete : function(req, res){
    var id = req.params.id;
    ProjectFile.remove({'_id':id},function(result) {
      return res.send(result);
    });
  }

  };

module.exports = ProjectFileService;