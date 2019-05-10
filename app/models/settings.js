/**
 * Created by konrad.sobon on 2019-05-02.
 */
var mongoose = require( 'mongoose' );

var UserLocationSources = Object.freeze({
    MachineName: 'MachineName'
});

var ProjectInfoSources = Object.freeze({
    FilePath: 'FilePath',
    //TODO: Add ProjectInfo so that we allow user to extract name, number, location 
    //from Revit's Project Info class.
});

var projectInfoSchema = new mongoose.Schema(
    {
        source: {
            type: String,
            enum: Object.values(ProjectInfoSources)
        },
        projectName: {
            type: Map,
            of: mongoose.Schema.Types.Mixed
        },
        projectNumber: {
            type: Map,
            of: mongoose.Schema.Types.Mixed
        },
        projectLocation: {
            type: Map,
            of: mongoose.Schema.Types.Mixed
        }
    },
    { _id: false }
);

var userLocationSchema = new mongoose.Schema(
    {
        source: {
            type: String,
            enum: Object.values(UserLocationSources)
        },
        pattern: String,
        match: Number,
        group: Number
    },
    { _id: false }
);

var officeSchema = new mongoose.Schema(
    {
        name: String,
        code: [String]
    },
    { _id: false }
);

var settingsSchema = new mongoose.Schema(
    {
        // (Konrad) We treat name as a "read only" field.
        name: {
            type: String,
            default: 'Settings',
            set: function () { return 'Settings'; }
        },
        offices: {
            type: [officeSchema],
            default: [
                { name: 'All', code: ['All'] },
                { name: 'New York', code: ['NY'] },
            ]
        },
        states: {
            type: [String],
            default: [
                'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California',
                'Colorado', 'Connecticut', 'Delaware', 'District Of Columbia',
                'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana',
                'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland',
                'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri',
                'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey',
                'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio',
                'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina',
                'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia',
                'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'
            ]
        },
        localPathRgx: {
            type: [String],
            default: ['^(C:\\\\Users\\\\ksobon)']
        },
        userLocation: {
            type: userLocationSchema,
            default: {
                source: 'MachineName',
                pattern: '-(\\w+)-',
                match: 1,
                group: 1
            }
        },
        projectInfo: {
            type: projectInfoSchema,
            default: {
                source: 'FilePath',
                projectName: {
                    local: { pattern: '', match: 1, group: 1 },
                    revitServer: { pattern: '', match: 1, group: 1 },
                    bimThreeSixty: { pattern: '', match: 1, group: 1 }
                    //TODO: If we add ProjectInfo as the source we can use the following schema:
                    //param: name: '' where 'name' is the name of the parameter that holds the info. 
                },
                projectNumber: {
                    local: { pattern: '', match: 1, group: 1 },
                    revitServer: { pattern: '', match: 1, group: 1 },
                    bimThreeSixty: { pattern: '', match: 1, group: 1 }
                },
                projectLocation: {
                    local: { pattern: '', match: 1, group: 1 },
                    revitServer: { pattern: '', match: 1, group: 1 },
                    bimThreeSixty: { pattern: '', match: 1, group: 1 }
                }
            }
        }
    }
);

/**
 * Static function for either finding the settings instance or creating a new one.
 * There should always be just one for Mission Control, and we can get it by name
 * since name is set to be read only. 
 */
settingsSchema.statics.findOneOrCreate = function findOneOrCreate(condition, callback) {
    var self = this;
    self.findOne(condition, function(err, result) {
        return result ? callback(err, result) : self.create(condition, function(err, result) { return callback(err, result); });
    });
};

Object.assign(settingsSchema.statics, UserLocationSources);

mongoose.model( 'Settings', settingsSchema );