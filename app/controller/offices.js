var mongoose = require('mongoose');
var global = require('./socket/global');

Office = mongoose.model('Office');

OfficeService = {

  findAll : function(req, res){
    Office.find({},function(err, results) {
      return res.send(results);
    });
  },

  findById : function(req, res){
    var id = req.params.id;
    Office.findOne({'_id':id}, function(err, result) {
      return res.send(result);
    });
  },

  add : function(req, res) {
    Office.create(req.body, function (err, office) {
      if (err) return console.log(err);
	  global.io.sockets.emit('add_office', req.body);
      return res.send(office);
    });
  },

  update : function(req, res) {
    var id = req.params.id;
    //console.log(req.body);
    console.log('Updating ' + id);
    Office.update({"_id":id}, req.body, {upsert:true},
      function (err, numberAffected) {
        if (err) return console.log(err);
        console.log('Updated %s instances', numberAffected.toString());
		global.io.sockets.emit('update_office', req.body);
        return res.sendStatus(202);
    });
  },

  delete : function(req, res){
    var id = req.params.id;
    Office.remove({'_id':id},function(result) {
      return res.send(result);
    });
  }

  };

module.exports = OfficeService;