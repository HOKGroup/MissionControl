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

var linksStatsSchema = new mongoose.Schema({
    totalImportedDwg: Number, //total number of ImportInstance objects
    importedDwgFiles:[{
        name: String,
        elementId: Number,
        instances: Number,
        isViewSpecific: Boolean,
        isLinked: Boolean}],
    unusedLinkedImages: Number, //all ImageTypes that were not used
    totalDwgStyles: Number,//all Styles with "dwg" in name
    totalImportedStyles: Number,//all Styles under "Imports in Families"
    totalLinkedModels: Number,//all CADLinkType + all RevitLinkType objects
    totalLinkedDwg: Number,//all CADLinkType objects
    createdOn: Date
});

var eventTimeSchema = new mongoose.Schema({
    value: Number,
    createdOn: Date
});

var sessionLogSchema = new mongoose.Schema({
    user: String,
    from: Date,
    to: Date,
    synched: [Date],
    createdOn: Date
});

var healthCheckSchema = new mongoose.Schema({
    centralPath: String,
    onOpened: [worksetEventSchema],
    onSynched: [worksetEventSchema],
    itemCount : [worksetItemSchema],
    viewStats: [viewStatsSchema],
    linkStats: [linksStatsSchema],
    familyStats: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Families'
    },
    openTimes: [eventTimeSchema],
    synchTimes: [eventTimeSchema],
    modelSizes: [eventTimeSchema],
    sessionLogs: [sessionLogSchema]
});

healthCheckSchema.index({'centralPath': 'text'});

mongoose.model('HealthRecords', healthCheckSchema);

