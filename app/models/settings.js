/**
 * Created by konrad.sobon on 2019-05-02.
 */
var mongoose = require( 'mongoose' );

var officeSchema = new mongoose.Schema(
    {
        name: String,
        code: [String]
    },
    {
        _id: false
    }
);

var settingsSchema = new mongoose.Schema(
    {
        // (Konrad) We treat name as a "read only" field.
        name: {
            type: String,
            default: 'Settings',
            set: function () { return 'Settings'; }
        },
        httpAddress: {
            type: String,
            default: 'http://missioncontrol.hok.com'
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

mongoose.model( 'Settings', settingsSchema );