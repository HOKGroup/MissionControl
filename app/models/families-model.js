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
        isNameVerified: Boolean,
        size: String,
        isSizeVerified: Boolean,
        sizeValue: Number,
        instances: Number,
        isInstancesVerified: Boolean,
        elementId: Number,
        arrayCount: {type: Number, default: 0},
        isArrayCountVerified: Boolean,
        refPlaneCount: {type: Number, default: 0},
        isRefPlaneCountVerified: Boolean,
        voidCount: {type: Number, default: 0},
        isVoidCountVerified: Boolean,
        nestedFamilyCount: {type: Number, default: 0},
        isNestedFamilyCountVerified: Boolean,
        parametersCount: {type: Number, default: 0},
        isParametersCountVerified: Boolean,
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