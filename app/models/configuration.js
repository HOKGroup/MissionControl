var mongoose = require( 'mongoose' );
var Schema = mongoose.Schema;

var configSchema = new Schema(
  { 
    name      : String,
    files	:[{ centralPath:String }],
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
			isEnabled        : Boolean,
			locked			:Boolean,
			modifiedBy        : String,  
			modified        : Date //time
		}]
	}]
  }
);

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

