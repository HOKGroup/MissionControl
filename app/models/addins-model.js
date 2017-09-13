var mongoose = require("mongoose");

var usageLogSchema = new mongoose.Schema({
    pluginName: String,
    user: String,
    revitVersion: String,
    executionTime: Number,
    createdOn: Date
});

var addinsSchema = new mongoose.Schema({
    usageLogs: [usageLogSchema]
});

mongoose.model('Addins', addinsSchema);