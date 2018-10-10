/**
 * Created by konrad.sobon on 2018-08-30.
 */
var mongoose = require( 'mongoose' );

var schema = new mongoose.Schema(
    {
        centralPath: { type: String },
        projectId: { type: mongoose.Schema.Types.ObjectId, default: null },
        isDisabled: { type: Boolean, default: false },
        revitVersion: { type: String, default: 'Unknown' }
    }
);

schema.index({ 'centralPath': 'text' });
var FilePaths = mongoose.model( 'FilePaths', schema );