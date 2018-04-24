var mongoose = require("mongoose");

var worksetEventSchema = new mongoose.Schema({
    user: String,
    opened: Number,
    closed: Number,
    createdOn: Date
});

var worksetItemSchema = new mongoose.Schema({
    worksets: [{
        name: String,
        count: Number}]
});

var viewStatsSchema = new mongoose.Schema({
    totalViews: Number,
    totalSheets: Number,
    totalSchedules: Number,
    viewsOnSheet: Number,
    viewsOnSheetWithTemplate: Number,
    schedulesOnSheet: Number,
    unclippedViews: Number,
    createdOn: Date
});

var eventTimeSchema = new mongoose.Schema({
    value: Number,
    user: String,
    createdOn: Date
});

var healthCheckSchema = new mongoose.Schema({
    centralPath: String,
    onOpened: [worksetEventSchema],
    onSynched: [worksetEventSchema],
    itemCount : [worksetItemSchema],
    viewStats: [viewStatsSchema],
    // styleStats: [styleStatsSchema],
    // linkStats: [linksStatsSchema],
    familyStats: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Families'
    },
    openTimes: [eventTimeSchema],
    synchTimes: [eventTimeSchema],
    modelSizes: [eventTimeSchema]
});

healthCheckSchema.index({'centralPath': 'text'});

mongoose.model('HealthRecords', healthCheckSchema);

