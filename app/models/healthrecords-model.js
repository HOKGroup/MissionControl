var mongoose = require("mongoose");

var healthCheckSchema = new mongoose.Schema({
    centralPath: String,
    // onOpened: [worksetEventSchema],
    // onSynched: [worksetEventSchema],
    // itemCount : [worksetItemSchema],
    // viewStats: [viewStatsSchema],
    // styleStats: [styleStatsSchema],
    // linkStats: [linksStatsSchema],
    familyStats: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Families'
    }
    // openTimes: [eventTimeSchema],
    // synchTimes: [eventTimeSchema],
    // modelSizes: [eventTimeSchema]
});

healthCheckSchema.index({'centralPath': 'text'});

mongoose.model('HealthRecords', healthCheckSchema);

