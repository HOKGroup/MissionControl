var mongoose = require( 'mongoose' );

var Schema = mongoose.Schema;

var triggerRecordSchema = new Schema(
  { 
	configId      : Schema.Types.ObjectId,
	centralPath	:String,
    updaterId        : String,
	categoryName        : String, 
	elementUniqueId	: String,
	edited        : Date,
	editedBy : String
	}
);

module.exports = mongoose.model( 'TriggerRecord', triggerRecordSchema );