var mongoose = require("mongoose");

var familiesSchema = new mongoose.Schema({
    centralPath: String,
    name: String,
    size: String,
    sizeValue: Number,
    instances: Number,
    elementId: Number,
    arrayCount: {type: Number, default: 0},
    refPlaneCount: {type: Number, default: 0},
    voidCount: {type: Number, default: 0},
    nestedFamilyCount: {type: Number, default: 0},
    parametersCount: {type: Number, default: 0},
    tasks: [{
        recipient: String,
        message: String,
        submittedOn: Date,
        completedOn: Date,
        submittedBy: String,
        completedBy: String
    }]
});

familiesSchema.index({"centralPath": "text"});
familiesSchema.index({'tasks.recipient': 'text'});

mongoose.model('Families', familiesSchema);