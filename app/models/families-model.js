var mongoose = require("mongoose");

var familiesSchema = new mongoose.Schema({
    centralPath: String,
    totalFamilies: Number,
    unusedFamilies: Number,
    oversizedFamilies: Number,
    inPlaceFamilies: Number,
    createdBy: String,
    createdOn: Date,
    families: [{
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
        isFailingChecks: Boolean,
        isDeleted: Boolean,
        tasks: [{
            name: String,
            assignedTo: String,
            message: String,
            submittedOn: Date,
            completedOn: Date,
            submittedBy: String,
            completedBy: String,
            isSelected: Boolean
        }]
    }]
});

familiesSchema.index({"centralPath": "text"});
familiesSchema.index({'families.tasks.assignedTo': 'text'});

mongoose.model('Families', familiesSchema);