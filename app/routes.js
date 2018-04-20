var project = require('./models/project');
var configuration = require('./models/configuration');
var triggerrecord = require('./models/trigger_record');
var healthReport = require('./models/healthrecords-model');
var addins = require('./models/addins-model');
var families = require('./models/families-model');
var sheets = require('./models/sheets-model');

 module.exports = function(app) {
     var projects = require('./controller/projects');
     app.get('/api/v1/projects', projects.findAll);
     app.get('/api/v1/projects/sort', projects.findAndSort); //OK
     app.get('/api/v1/projects/:id', projects.findById); //OK
     app.get('/api/v1/projects/populate/:id', projects.populateById);
     app.get('/api/v1/projects/populatesheets/:id', projects.populateSheets);
     app.post('/api/v1/projects', projects.add); //OK
     app.put('/api/v1/projects/:id', projects.update); //OK
     app.put('/api/v1/projects/:id/addconfig/:configid', projects.addConfiguration); //OK
     app.put('/api/v1/projects/:id/addhealthrecord/:healthrecordid', projects.addHealthRecord);
     app.put('/api/v1/projects/:id/addsheets/:sheetsid', projects.addSheets);
     app.put('/api/v1/projects/:id/deleteconfig/:configid', projects.deleteConfiguration); //OK
     app.delete('/api/v1/projects/:id', projects.delete); //OK

     var config = require('./controller/configurations');
     app.get('/api/v1/configurations', config.findAll);
     app.get('/api/v1/configurations/:id', config.findById);
     app.put('/api/v1/configurations/:id', config.update);
     app.get('/api/v1/configurations/centralpath/:uri*', config.findByCentralPath);
     app.post('/api/v1/configurations', config.add); //OK
     app.delete('/api/v1/configurations/:id', config.delete); //OK
     app.post('/api/v1/configurations/deletemany', config.deleteMany); //OK
     app.post('/api/v1/configurations/:id/addfile', config.addFile); //OK
     app.post('/api/v1/configurations/:id/deletefile', config.deleteFile); //OK
     app.post('/api/v1/configurations/getmany', config.getMany); //OK
     app.put('/api/v1/configurations/:id/updatefilepath', config.updateFilePath);

     var triggerrecords = require('./controller/triggerrecords');
     app.get('/api/v1/triggerrecords', triggerrecords.findAll);
     app.get('/api/v1/triggerrecords/:id', triggerrecords.findById);
     app.get('/api/v1/triggerrecords/centralpath/:centralpath*', triggerrecords.findByCentralPath);
     app.get('/api/v1/triggerrecords/updaterid/:updaterid', triggerrecords.findByUpdaterId);
     app.get('/api/v1/triggerrecords/uniqueid/:uniqueid', triggerrecords.findByUniqueId);
     app.get('/api/v1/triggerrecords/configid/:configid', triggerrecords.findByConfigId);
     app.post('/api/v1/triggerrecords', triggerrecords.add);
     app.put('/api/v1/triggerrecords/:id', triggerrecords.update);
     app.delete('/api/v1/triggerrecords/:id', triggerrecords.delete);
     app.delete('/api/v1/triggerrecords/config/:configid', triggerrecords.deleteAllForConfig);
     app.delete('/api/v1/triggerrecords/centralpath/:centralpath', triggerrecords.deleteAllForFile);
     app.put('/api/v1/triggerrecords/:id/updatefilepath', triggerrecords.updateFilePath);

     var healthReport = require('./controller/healthrecords-controller');
     app.get('/api/v1/healthrecords', healthReport.findAll);
     app.get('/api/v1/healthrecords/:id', healthReport.findById);
     app.get('/api/v1/healthrecords/centralpath/:uri*', healthReport.findByCentralPath);
     app.post('/api/v1/healthrecords', healthReport.add);
     app.post('/api/v1/healthrecords/names', healthReport.getNames); //it's a post b/c I need to feed [id]
     app.post('/api/v1/healthrecords/:id/onsynched', healthReport.onSynched);
     app.post('/api/v1/healthrecords/:id/onopened', healthReport.onOpened);
     app.post('/api/v1/healthrecords/:id/itemcount', healthReport.postItemCount);
     app.get('/api/v1/healthrecords/:id/stylestats', healthReport.getStyleStats);
     app.post('/api/v1/healthrecords/:id/stylestats', healthReport.styleStats);
     app.get('/api/v1/healthrecords/:id/viewstats', healthReport.getViewStats);
     app.post('/api/v1/healthrecords/:id/viewstats', healthReport.viewStats);
     app.get('/api/v1/healthrecords/:id/linkstats', healthReport.getLinkStats);
     app.post('/api/v1/healthrecords/:id/linkstats', healthReport.postLinkStats);
     app.get('/api/v1/healthrecords/:id/modelstats', healthReport.getModelStats);
     app.post('/api/v1/healthrecords/:id/modelsize', healthReport.postModelSize);
     app.post('/api/v1/healthrecords/:id/modelopentime', healthReport.postModelOpenTime);
     app.post('/api/v1/healthrecords/:id/modelsynchtime', healthReport.postModelSynchTime);
     app.get('/api/v1/healthrecords/:id/worksetstats', healthReport.getWorksetStats);
     app.get('/api/v1/healthrecords/:id/familystats', healthReport.getFamilyStats);
     app.post('/api/v1/healthrecords/:id/familystats', healthReport.postFamilyStats);
     app.put('/api/v1/healthrecords/:id/addfamilies', healthReport.addFamilies);
     app.put('/api/v1/healthrecords/:id/updatefilepath', healthReport.updateFilePath);
     app.get('/api/v1/healthrecords/usernames/:uri*', healthReport.getUserNamesByCentralPath);

     var addins = require('./controller/addins-controller');
     app.get('/api/v1/addins', addins.findAll);
     app.post('/api/v1/addins', addins.add);
     app.post('/api/v1/addins/:id/addlog', addins.addLog);

     var families = require('./controller/families-controller');
     app.get('/api/v1/families', families.findAll);
     app.post('/api/v1/families', families.add);
     app.get('/api/v1/families/:id', families.findById);
     app.get('/api/v1/families/centralpath/:uri*', families.findByCentralPath);
     app.put('/api/v1/families/:id', families.update);
     app.post('/api/v1/families/:id/family/:name', families.addTask);
     app.post('/api/v1/families/:id/family/:name/updatetask/:taskid', families.updateTask);
     app.post('/api/v1/families/:id/family/:name/deletemany', families.deleteMultipleTasks);
     app.put('/api/v1/families/:id/updatefilepath', families.updateFilePath);

     var sheets = require('./controller/sheets-controller');
     app.get('/api/v1/sheets', sheets.findAll);
     app.post('/api/v1/sheets', sheets.add);
     app.get('/api/v1/sheets/centralpath/:uri*', sheets.findByCentralPath);
     app.post('/api/v1/sheets/:id', sheets.update);
     app.post('/api/v1/sheets/:id/addsheettask', sheets.addSheetTask);
     app.post('/api/v1/sheets/:id/addsheets', sheets.addSheets);
     app.post('/api/v1/sheets/:id/approvenewsheet', sheets.approveNewSheets);
     app.post('/api/v1/sheets/:id/deletenewsheet', sheets.deleteNewSheet);
     app.post('/api/v1/sheets/:id/deletetasks', sheets.deleteTasks);
     app.post('/api/v1/sheets/:id/updatetasks', sheets.updateSheetTask);
     app.put('/api/v1/sheets/:id/updatefilepath', sheets.updateFilePath);
  };