var mongoose = require( 'mongoose' );
var Schema = mongoose.Schema;

var configSchema = new Schema(
  { 
    name      : String,
    files	:[{   centralPath:String }], //revit projects
	sheetDatabase : String, //sheet database
	updaters  :
	[{
		updaterId: String, 
		updaterName:String,
		description:String,
		addInId : String,
		addInName : String,
		isUpdaterOn : Boolean,
		categoryTriggers:
		[{
			categoryName      : String,
			description		: String,
			isEnabled        : Boolean,
			locked			:Boolean,
			modifiedBy        : String,  
			modified        : Date
		}]
	}]
  },
  {
	  timestamps: true
  });

configSchema.index({'files.centralPath': 'text'});

var Configuration = mongoose.model( 'Configuration', configSchema );
/*
var configuration = new Configuration({
	name: 'first configuration'
});

configuration.save(function(error){
	if(error)
	{
		console.log(error);
	}
});
*/

