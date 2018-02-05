var mongoose = require( 'mongoose' );

var sharedParamSchema = new mongoose.Schema({
    monitorId: String,
    monitorName: String,
    description: String,
    addInName: String,
    filePath: String,
    isMonitorOn: Boolean
});

var configSchema = new mongoose.Schema(
  {
	  name: String,
      files: [{centralPath: String}], //revit projects
	  sheetDatabase: String, //sheet database
      sharedParamMonitor: sharedParamSchema, // shared param file path monitor
	  updaters: [{
		  updaterId: String,
		  updaterName: String,
		  description: String,
		  addInId: String,
		  addInName: String,
		  isUpdaterOn: Boolean,
		  categoryTriggers: [{
			  categoryName: String,
			  description: String,
			  isEnabled: Boolean,
			  locked: Boolean,
			  modifiedBy: String,
			  modified: Date
		}]
      }]
  },
    { timestamps: true });

configSchema.index({'files.centralPath': 'text'});

var Configuration = mongoose.model( 'Configuration', configSchema );

