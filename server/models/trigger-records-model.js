const mongoose = require('mongoose')

const triggerRecordSchema = new mongoose.Schema(
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
const TriggerRecord = mongoose.model( 'TriggerRecord', triggerRecordSchema )
module.exports = TriggerRecord