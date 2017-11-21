var mongoose = require("mongoose");

var usageLogSchema = new mongoose.Schema({
    pluginName: String,
    user: String,
    revitVersion: String,
    office: String,
    createdOn: Date,
    detailInfo: [
        {
            name: String,
            value: String
        }
    ]
});

var addinsSchema = new mongoose.Schema({
    usageLogs: [usageLogSchema]
});

mongoose.model('Addins', addinsSchema);