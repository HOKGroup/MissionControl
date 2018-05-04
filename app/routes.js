var project = require('./models/project');
var configuration = require('./models/configuration');
var triggerrecords = require('./models/trigger-records-model');
var addins = require('./models/addins-model');
var families = require('./models/families-model');
var sheets = require('./models/sheets-model');
var worksets = require('./models/worksets-model');
var styles = require('./models/styles-model');
var links = require('./models/links-model');
var models = require('./models/models-model');
var views = require('./models/views-model');

 module.exports = function(app) {
     var projects = require('./controller/projects');
     app.get('/api/v1/projects/sort', projects.findAndSort);
     app.get('/api/v1/projects/:id', projects.findById);
     app.get('/api/v1/projects/configid/:configid', projects.findByConfigurationId);
     app.get('/api/v1/projects/:id/populateconfigurations', projects.findByIdPopulateConfigurations);
     app.get('/api/v1/projects/populatesheets/:id', projects.populateSheets);
     app.post('/api/v1/projects', projects.add);
     app.put('/api/v1/projects/:id', projects.update);
     app.put('/api/v1/projects/:id/addconfig/:configid', projects.addConfiguration);
     app.put('/api/v1/projects/:id/addworkset', projects.addWorkset);
     app.put('/api/v1/projects/:id/addfamilies', projects.addFamilies);
     app.put('/api/v1/projects/:id/addstyle', projects.addStyle);
     app.put('/api/v1/projects/:id/addmodel', projects.addModel);
     app.put('/api/v1/projects/:id/addlink', projects.addLink);
     app.put('/api/v1/projects/:id/addview', projects.addView);
     app.put('/api/v1/projects/:id/addsheet', projects.addSheet);
     app.put('/api/v1/projects/:id/addtriggerrecord', projects.addTriggerRecord);
     app.put('/api/v1/projects/:id/deleteconfig/:configid', projects.deleteConfiguration);
     app.post('/api/v1/projects/:id/deletetriggerrecords', projects.deleteTriggerRecords);
     app.delete('/api/v1/projects/:id', projects.delete);

     var config = require('./controller/configurations');
     app.get('/api/v1/configurations/centralpath/:uri*', config.findByCentralPath);
     app.put('/api/v1/configurations/:id', config.update);
     app.put('/api/v1/configurations/:id/updatefilepath', config.updateFilePath);
     app.post('/api/v1/configurations', config.add);
     app.post('/api/v1/configurations/deletemany', config.deleteMany);
     app.post('/api/v1/configurations/:id/addfile', config.addFile);
     app.post('/api/v1/configurations/:id/deletefile', config.deleteFile);
     app.post('/api/v1/configurations/getmany', config.getMany);
     app.delete('/api/v1/configurations/:id', config.delete);

     var triggerrecords = require('./controller/trigger-records-controller');
     app.get('/api/v1/triggerrecords/centralpath/:uri*', triggerrecords.findByCentralPath);
     app.put('/api/v1/triggerrecords/:id/updatefilepath', triggerrecords.updateFilePath);
     app.post('/api/v1/triggerrecords/findmanybycentralpath', triggerrecords.findManyByCentralPathDates);
     app.post('/api/v1/triggerrecords', triggerrecords.add);
     app.post('/api/v1/triggerrecords/:id/add', triggerrecords.postTriggerRecord);
     app.post('/api/v1/triggerrecords/deletemany', triggerrecords.deleteMany);

     //TODO: Refactor and cleanup Addins Page.
     var addins = require('./controller/addins-controller');
     app.get('/api/v1/addins', addins.findAll);
     app.post('/api/v1/addins', addins.add);
     app.post('/api/v1/addins/:id/addlog', addins.addLog);

     var families = require('./controller/families-controller');
     app.get('/api/v1/families', families.findAll);
     app.post('/api/v1/families', families.add);
     app.get('/api/v1/families/:id', families.findById);
     app.get('/api/v1/families/centralpath/:uri*', families.findByCentralPath); //OK
     app.put('/api/v1/families/:id', families.update); //OK
     app.post('/api/v1/families/:id/family/:name', families.addTask); //OK
     app.post('/api/v1/families/:id/family/:name/updatetask/:taskid', families.updateTask); //OK
     app.post('/api/v1/families/:id/family/:name/deletemany', families.deleteMultipleTasks); //OK
     app.put('/api/v1/families/:id/updatefilepath', families.updateFilePath); //OK
     app.post('/api/v1/families/familystats', families.getFamilyStats); //OK

     var sheets = require('./controller/sheets-controller');
     app.get('/api/v1/sheets', sheets.findAll);
     app.post('/api/v1/sheets', sheets.add); //OK
     app.get('/api/v1/sheets/centralpath/:uri*', sheets.findByCentralPath); //OK
     app.post('/api/v1/sheets/:id', sheets.update); //OK
     app.post('/api/v1/sheets/:id/addsheettask', sheets.addSheetTask);
     app.post('/api/v1/sheets/:id/addsheets', sheets.addSheets);
     app.post('/api/v1/sheets/:id/approvenewsheet', sheets.approveNewSheets); //OK
     app.post('/api/v1/sheets/:id/deletenewsheet', sheets.deleteNewSheet);
     app.post('/api/v1/sheets/:id/deletetasks', sheets.deleteTasks);
     app.post('/api/v1/sheets/:id/updatetasks', sheets.updateSheetTask); //OK
     app.put('/api/v1/sheets/:id/updatefilepath', sheets.updateFilePath); //OK

     var worksets = require('./controller/worksets-controller');
     app.post('/api/v1/worksets', worksets.add);
     app.post('/api/v1/worksets/:id/itemcount', worksets.postItemCount);
     app.post('/api/v1/worksets/:id/onopened', worksets.onOpened);
     app.post('/api/v1/worksets/:id/onsynched', worksets.onSynched);
     app.put('/api/v1/worksets/:id/updatefilepath', worksets.updateFilePath);
     app.post('/api/v1/worksets/worksetstats', worksets.getWorksetStats);

     var styles = require('./controller/styles-controller');
     app.post('/api/v1/styles', styles.add);
     app.post('/api/v1/styles/:id/stylestats', styles.styleStats);
     app.put('/api/v1/styles/:id/updatefilepath', styles.updateFilePath);
     app.post('/api/v1/styles/stylestats', styles.getStyleStats);

     var links = require('./controller/links-controller');
     app.post('/api/v1/links', links.add);
     app.post('/api/v1/links/:id/linkstats', links.linkStats);
     app.put('/api/v1/links/:id/updatefilepath', links.updateFilePath);
     app.post('/api/v1/links/linkstats', links.getLinkStats);

     var models = require('./controller/models-controller');
     app.post('/api/v1/models', models.add);
     app.post('/api/v1/models/:id/modelsize', models.postModelSize);
     app.post('/api/v1/models/:id/modelopentime', models.postModelOpenTime);
     app.post('/api/v1/models/:id/modelsynchtime', models.postModelSynchTime);
     app.put('/api/v1/models/:id/updatefilepath', models.updateFilePath);
     app.post('/api/v1/models/modelstats', models.getModelStats);
     app.get('/api/v1/models/usernames/:uri*', models.getUserNamesByCentralPath);

     var views = require('./controller/views-controller');
     app.get('/api/v1/views/centralpath/:uri*', views.findByCentralPath);
     app.post('/api/v1/views', views.add);
     app.post('/api/v1/views/:id/viewstats', views.viewStats);
     app.put('/api/v1/views/:id/updatefilepath', views.updateFilePath);
     app.post('/api/v1/views/viewstats', views.getViewStats);
  };