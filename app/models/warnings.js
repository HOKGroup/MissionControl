/**
 * Created by konrad.sobon on 2018-08-16.
 */
var mongoose = require( 'mongoose' );

var warningsSchema = new mongoose.Schema(
    {
        centralPath: String,
        failingElements: [String],
        descriptionText: String,
        createdBy: String,
        createdAt: Date,
        closedBy: String,
        closedAt: Date,
        isOpen: Boolean,
        updatedAt: Date,
        uniqueId: String
    },
    {
        timestamps: true
    }
);

warningsSchema.index({'centralPath': 'text'});
var Warnings = mongoose.model( 'Warnings', warningsSchema );