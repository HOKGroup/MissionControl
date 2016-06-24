var project = require('./models/project');
var configuration = require('./models/configuration');
 //var projectFile = require('./models/project_file');
 //var projectUpdater = require('./models/project_updater');
 //var categoryTrigger = require('./models/category_trigger');
var triggerRecord = require('./models/trigger_record');
 
 module.exports = function(app) {
		
	var projects = require('./controller/projects');
	app.get('/api/v1/projects', projects.findAll);
	app.get('/api/v1/projects/sort', projects.findAndSort);
    app.get('/api/v1/projects/:id', projects.findById);
	app.get('/api/v1/projects/populate/:id', projects.populateById);
	app.get('/api/v1/projects/configid/:configid', projects.findByConfigurationId);
	app.get('/api/v1/projects/office/:office', projects.findByOffice);
    app.post('/api/v1/projects', projects.add);
    app.put('/api/v1/projects/:id', projects.update);
    app.delete('/api/v1/projects/:id', projects.delete);
	
	var config = require('./controller/configurations');
	app.get('/api/v1/configurations', config.findAll);
    app.get('/api/v1/configurations/:id', config.findById);
	app.get('/api/v1/configurations/filepath/:filepath', config.findByFilePath);
	app.get('/api/v1/configurations/:id/updaterid/:updaterid', config.findByUpdaterId);
    app.post('/api/v1/configurations', config.add);
    app.put('/api/v1/configurations/:id', config.update);
    app.delete('/api/v1/configurations/:id', config.delete);
	
	/*
	var projectfiles = require('./controller/projectfiles');
	app.get('/api/v1/projectfiles', projectfiles.findAll);
    app.get('/api/v1/projectfiles/:id', projectfiles.findById);
	app.get('/api/v1/projectfiles/centralpath/:centralpath*', projectfiles.findByCentralPath);
    app.post('/api/v1/projectfiles', projectfiles.add);
    app.put('/api/v1/projectfiles/:id', projectfiles.update);
    app.delete('/api/v1/projectfiles/:id', projectfiles.delete);

	var projectupdaters = require('./controller/projectupdaters');
	app.get('/api/v1/projectupdaters', projectupdaters.findAll);
    app.get('/api/v1/projectupdaters/:id', projectupdaters.findById);
	app.get('/api/v1/projectupdaters/updaterid/:updaterid', projectupdaters.findByUpdaterId);
    app.post('/api/v1/projectupdaters', projectupdaters.add);
    app.put('/api/v1/projectupdaters/:id', projectupdaters.update);
    app.delete('/api/v1/projectupdaters/:id', projectupdaters.delete);
	
	var categorytriggers = require('./controller/categorytriggers');
    app.get('/api/v1/categorytriggers', categorytriggers.findAll);
    app.get('/api/v1/categorytriggers/:id', categorytriggers.findById);
    app.post('/api/v1/categorytriggers', categorytriggers.add);
    app.put('/api/v1/categorytriggers/:id', categorytriggers.update);
    app.delete('/api/v1/categorytriggers/:id', categorytriggers.delete);
*/

	var triggerrecords = require('./controller/triggerrecords');
	app.get('/api/v1/triggerrecords', triggerrecords.findAll);
    app.get('/api/v1/triggerrecords/:id', triggerrecords.findById);
	app.get('/api/v1/triggerrecords/centralpath/:centralpath*', triggerrecords.findByFilePath);
	app.get('/api/v1/triggerrecords/updaterid/:updaterid', triggerrecords.findByUpdaterId);
	app.get('/api/v1/triggerrecords/uniqueid/:uniqueid', triggerrecords.findByUniqueId);
    app.post('/api/v1/triggerrecords', triggerrecords.add);
    app.put('/api/v1/triggerrecords/:id', triggerrecords.update);
    app.delete('/api/v1/triggerrecords/:id', triggerrecords.delete);
	app.delete('/api/v1/triggerrecords/config/:configid', triggerrecords.deleteAllForConfig);
	app.delete('/api/v1/triggerrecords/centralpath/:centralpath', triggerrecords.deleteAllForFile);
  }