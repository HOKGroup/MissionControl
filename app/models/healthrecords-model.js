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
    totalImportedDwg: Number,
    importedDwgFiles:[{
        name: String,
        elementId: Number,
        instances: Number,
        isViewSpecific: Boolean,
        isLinked: Boolean}],
    unusedLinkedImages: Number,
    totalDwgStyles: Number,
    totalImportedStyles: Number,
    totalLinkedModels: Number,
    totalLinkedDwg: Number,
    createdOn: Date
});

// var familyStatsSchema = new mongoose.Schema({
//     suspectFamilies: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'Families'
//     },
//     // suspectFamilies: [{
//     //     name: String,
//     //     size: String,
//     //     sizeValue: Number,
//     //     instances: Number,
//     //     elementId: Number,
//     //     arrayCount: {type: Number, default: 0},
//     //     refPlaneCount: {type: Number, default: 0},
//     //     voidCount: {type: Number, default: 0},
//     //     nestedFamilyCount: {type: Number, default: 0},
//     //     parametersCount: {type: Number, default: 0}
//     // }],
//     totalFamilies: Number,
//     unusedFamilies: Number,
//     oversizedFamilies: Number,
//     inPlaceFamilies: Number,
//     createdBy: String,
//     createdOn: Date
// });

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

