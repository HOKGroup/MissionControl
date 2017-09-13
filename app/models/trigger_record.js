var mongoose = require( 'mongoose' );

var triggerRecordSchema = new mongoose.Schema(
  { 
	configId: mongoose.Schema.Types.ObjectId,
	centralPath: String,
    updaterId: String,
	categoryName: String,
	elementUniqueId: String,
	edited: Date,
	editedBy: String
	}
);

module.exports = mongoose.model( 'TriggerRecord', triggerRecordSchema );