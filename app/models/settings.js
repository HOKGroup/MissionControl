/**
 * Created by konrad.sobon on 2019-05-02.
 */
var mongoose = require( 'mongoose' );

var settingsSchema = new mongoose.Schema(
    {
        // (Konrad) We treat name as a "read only" field.
        name: {
            type: String,
            default: 'Settings',
            set: function (val) { return 'Settings'; }
        },
        websiteLink: String
    }
);

settingsSchema.statics.findOneOrCreate = function findOneOrCreate(condition, callback) {
    var self = this;
    self.findOne(condition, function(err, result) {
        return result ? callback(err, result) : self.create(condition, function(err, result) { return callback(err, result); });
    });
};

mongoose.model( 'Settings', settingsSchema );