var mongoose = require('mongoose');
var global = require('./socket/global');

Project = mongoose.model('Project');

ProjectService = {

  findAll : function(req, res){
    Project.find({},function(err, results) {
      return res.send(results);
    });
  },
	
  findAndSort : function(req, res){
	  var property = req.params.property;
    Project.find({}).sort({number:1}).exec(function(err, results) {
      return res.send(results);
    });
  },
  
  findById : function(req, res){
    var id = req.params.id;
    Project.findOne({'_id':id},function(err, result) {
      return res.send(result);
    });
  },
  
  populateById : function(req, res){
    var id = req.params.id;
    Project.findOne({'_id':id})
	.populate('configurations')
	.exec(function(err, result) {
		 if (err) return console.log(err);
      return res.send(result);
    });
  },
  
   findByConfigurationId : function(req, res){
    var id = req.params.configid;
    Project.find({'configurations._id':id},function(err, result) {
      return res.send(result);
    });
  },
  
  findByOffice : function(req, res){
    var office_name = req.params.office;
    Project.find({'office':office_name},function(err, result) {
      return res.send(result);
    });
  },
  
  add : function(req, res) {
    Project.create(req.body, function (err, project) {
      if (err) return console.log(err);
	  global.io.sockets.emit('add_project', req.body);
      return res.send(project);
    });
  },

  update : function(req, res) {
    var id = req.params.id;
    //console.log(req.body);
    console.log('Updating ' + id);
    Project.update({"_id":id}, req.body, {upsert:true},
      function (err, numberAffected) {
        if (err) return console.log(err);
        console.log('Updated %s instances', numberAffected.toString());
		global.io.sockets.emit('update_project', req.body);
        return res.sendStatus(202);
    });
  },

  delete : function(req, res){
    var id = req.params.id;
    Project.remove({'_id':id},function(result) {
      return res.send(result);
    });
  }

  };

module.exports = ProjectService;