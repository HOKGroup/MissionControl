var mongoose = require('mongoose');
var global = require('./socket/global');

Configuration = mongoose.model('Configuration');

ConfigurationService = {

  findAll : function(req, res){
    Configuration.find({},function(err, results) {
      return res.send(results);
    });
  },

  findById : function(req, res){
    var id = req.params.id;
    Configuration.findOne({'_id':id},function(err, result) {
      return res.send(result);
    });
  },

  findByFilePath : function(req, res){
    var filepath = req.params.filepath; 
    Configuration.find({'files.centralPath':filepath},function(err, result) {
      return res.send(result);
    });
  },
  
  findByEncodedURI : function(req, res){
    var uri = req.params.uri; 
	var decodedUri = decodeURIComponent(uri);
	Configuration.find({$text:{$search: decodedUri}}, { score : { $meta: "textScore" } })
	.sort({ score : { $meta : 'textScore' } }).limit(5)
	.exec(function(err, result){
		if(err){console.log(err);}
		return res.send(result);
	});
  },

  findByUpdaterId : function(req, res){
    var id = req.params.id;
	var updaterid = req.params.updaterid;
    Configuration.find({'_id':id,'updaters.updaterId':updaterid},function(err, result) {
      return res.send(result);
    });
  },
  
 /*  populateById : function(req, res){
    var id = req.params.id;
    Project.findOne({'_id':id})
	.populate({ path: 'files'})
	.exec(function(err, result) {
		 if (err) return console.log(err);
      return res.send(result);
    });
  }, */
  
   add : function(req, res) {
    Configuration.create(req.body, function (err, result) {
      if (err) return console.log(err);
	  //global.io.sockets.emit('add_configuration', req.body);
      return res.send(result);
    });
  },
  

  update : function(req, res) {
    var id = req.params.id;
    //console.log(req.body);
    console.log('Updating ' + id);
    Configuration.update({"_id":id}, req.body, {upsert:true},
      function (err, numberAffected) {
        if (err) return console.log(err);
        console.log('Updated %s instances', numberAffected.toString());
		//global.io.sockets.emit('update_configuration', req.body);
        return res.sendStatus(202);
    });
  },

  delete : function(req, res){
    var id = req.params.id;
    Configuration.remove({'_id':id},function(result) {
      return res.send(result);
    });
  }

  };

module.exports = ConfigurationService;