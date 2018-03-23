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

/**
 * Data Schema for Styles Stats
 */
var styleStatsSchema = new mongoose.Schema({
    createdOn: Date,
    user: String,
    textStats: [{
        createdOn: Date,
        name: String,
        instances: Number,
        bold: Boolean,
        color: [Number],
        italic: Boolean,
        leaderArrowhead: String,
        lineWeight: Number,
        textFont: String,
        textSize: Number,
        textSizeString: String,
        underline: Boolean
    }],
    dimStats: [{
        createdOn: Date,
        name: String,
        instances: Number,
        usesProjectUnits: Boolean,
        bold: Boolean,
        color: [Number],
        italic: Boolean,
        leaderType: String,
        lineWeight: Number,
        textFont: String,
        textSize: Number,
        textSizeString: String,
        underline: Boolean,
        styleType: String
    }],
    dimSegmentStats: [{
        createdOn: Date,
        isOverriden: Boolean,
        value: Number,
        valueString: String,
        valueOverride: String,
        isLocked: Boolean,
        ownerViewId: Number,
        ownerViewType: String
    }]
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
    user: String,
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
    styleStats: [styleStatsSchema],
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

