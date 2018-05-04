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
     // app.get('/api/v1/projects', projects.findAll);
     app.get('/api/v1/projects/sort', projects.findAndSort); //OK
     app.get('/api/v1/projects/:id', projects.findById); //OK
     app.get('/api/v1/projects/configid/:configid', projects.findByConfigurationId); //OK
     app.get('/api/v1/projects/:id/populateconfigurations', projects.findByIdPopulateConfigurations); //OK
     app.get('/api/v1/projects/populatesheets/:id', projects.populateSheets); //OK
     app.post('/api/v1/projects', projects.add); //OK
     app.put('/api/v1/projects/:id', projects.update); //OK
     app.put('/api/v1/projects/:id/addconfig/:configid', projects.addConfiguration); //OK
     app.put('/api/v1/projects/:id/addworkset', projects.addWorkset); //OK
     app.put('/api/v1/projects/:id/addfamilies', projects.addFamilies); //OK
     app.put('/api/v1/projects/:id/addstyle', projects.addStyle); //OK
     app.put('/api/v1/projects/:id/addmodel', projects.addModel); //OK
     app.put('/api/v1/projects/:id/addlink', projects.addLink); //OK
     app.put('/api/v1/projects/:id/addview', projects.addView); //OK
     app.put('/api/v1/projects/:id/addsheet', projects.addSheet); //OK
     app.put('/api/v1/projects/:id/addtriggerrecord', projects.addTriggerRecord); //OK
     app.put('/api/v1/projects/:id/deleteconfig/:configid', projects.deleteConfiguration); //OK
     app.delete('/api/v1/projects/:id', projects.delete); //OK

     var config = require('./controller/configurations');
     app.get('/api/v1/configurations', config.findAll);
     app.get('/api/v1/configurations/:id', config.findById);
     app.put('/api/v1/configurations/:id', config.update);
     app.get('/api/v1/configurations/centralpath/:uri*', config.findByCentralPath); //OK
     app.post('/api/v1/configurations', config.add); //OK
     app.delete('/api/v1/configurations/:id', config.delete); //OK
     app.post('/api/v1/configurations/deletemany', config.deleteMany); //OK
     app.post('/api/v1/configurations/:id/addfile', config.addFile); //OK
     app.post('/api/v1/configurations/:id/deletefile', config.deleteFile); //OK
     app.post('/api/v1/configurations/getmany', config.getMany); //OK
     app.put('/api/v1/configurations/:id/updatefilepath', config.updateFilePath); //OK

     var triggerrecords = require('./controller/trigger-records-controller');
     app.get('/api/v1/triggerrecords', triggerrecords.findAll);
     app.get('/api/v1/triggerrecords/:id', triggerrecords.findById);
     app.post('/api/v1/triggerrecords/findmanybycentralpath', triggerrecords.findManyByCentralPathDates); //OK
     app.get('/api/v1/triggerrecords/centralpath/:uri*', triggerrecords.findByCentralPath); //OK
     app.get('/api/v1/triggerrecords/updaterid/:updaterid', triggerrecords.findByUpdaterId);
     app.get('/api/v1/triggerrecords/uniqueid/:uniqueid', triggerrecords.findByUniqueId);
     app.get('/api/v1/triggerrecords/configid/:configid', triggerrecords.findByConfigId);
     app.post('/api/v1/triggerrecords', triggerrecords.add); //OK
     app.post('/api/v1/triggerrecords/:id/add', triggerrecords.postTriggerRecord); //OK
     app.put('/api/v1/triggerrecords/:id', triggerrecords.update);
     app.delete('/api/v1/triggerrecords/:id', triggerrecords.delete);
     app.delete('/api/v1/triggerrecords/config/:configid', triggerrecords.deleteAllForConfig);
     app.delete('/api/v1/triggerrecords/centralpath/:centralpath', triggerrecords.deleteAllForFile);
     app.put('/api/v1/triggerrecords/:id/updatefilepath', triggerrecords.updateFilePath); //OK

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
     // app.get('/api/v1/worksets/centralpath/:uri*', worksets.findByCentralPath); //OK
     app.post('/api/v1/worksets', worksets.add); //OK
     app.post('/api/v1/worksets/:id/itemcount', worksets.postItemCount); //OK
     app.post('/api/v1/worksets/:id/onopened', worksets.onOpened); //OK
     app.post('/api/v1/worksets/:id/onsynched', worksets.onSynched); //OK
     app.put('/api/v1/worksets/:id/updatefilepath', worksets.updateFilePath); //OK
     app.post('/api/v1/worksets/worksetstats', worksets.getWorksetStats); //OK

     var styles = require('./controller/styles-controller');
     // app.get('/api/v1/styles/centralpath/:uri*', styles.findByCentralPath); //OK
     app.post('/api/v1/styles', styles.add); //OK
     app.post('/api/v1/styles/:id/stylestats', styles.styleStats); //OK
     app.put('/api/v1/styles/:id/updatefilepath', styles.updateFilePath); //OK
     app.post('/api/v1/styles/stylestats', styles.getStyleStats); //OK

     var links = require('./controller/links-controller');
     // app.get('/api/v1/links/centralpath/:uri*', links.findByCentralPath); //OK
     app.post('/api/v1/links', links.add); //OK
     app.post('/api/v1/links/:id/linkstats', links.linkStats); //OK
     app.put('/api/v1/links/:id/updatefilepath', links.updateFilePath); //OK
     app.post('/api/v1/links/linkstats', links.getLinkStats); //OK

     var models = require('./controller/models-controller');
     // app.get('/api/v1/models/centralpath/:uri*', models.findByCentralPath); //OK
     app.post('/api/v1/models', models.add); //OK
     app.post('/api/v1/models/:id/modelsize', models.postModelSize); //OK
     app.post('/api/v1/models/:id/modelopentime', models.postModelOpenTime); //OK
     app.post('/api/v1/models/:id/modelsynchtime', models.postModelSynchTime); //OK
     app.put('/api/v1/models/:id/updatefilepath', models.updateFilePath); //OK
     app.post('/api/v1/models/modelstats', models.getModelStats); //OK
     app.get('/api/v1/models/usernames/:uri*', models.getUserNamesByCentralPath); //OK

     var views = require('./controller/views-controller');
     app.get('/api/v1/views/centralpath/:uri*', views.findByCentralPath); //OK
     app.post('/api/v1/views', views.add); //OK
     app.post('/api/v1/views/:id/viewstats', views.viewStats); //OK
     app.put('/api/v1/views/:id/updatefilepath', views.updateFilePath); //OK
     app.post('/api/v1/views/viewstats', views.getViewStats); //OK
  };