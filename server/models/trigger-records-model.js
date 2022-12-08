var mongoose = require( 'mongoose' )

var triggerRecordSchema = new mongoose.Schema(
    {
        centralPath: String,
        triggerRecords: [{
            updaterId: String,
            categoryName: String,
            elementUniqueId: String,
            createdOn: Date,
            user: String
        }]
    }
)

triggerRecordSchema.index({'centralPath': 'text'})
module.exports = mongoose.model( 'TriggerRecord', triggerRecordSchema )