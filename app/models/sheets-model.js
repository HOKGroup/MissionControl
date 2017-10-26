/**
 * Created by konrad.sobon on 2017-10-23.
 */
var mongoose = require( 'mongoose' );

var sheetItemSchema = new mongoose.Schema({
    name: String,
    number: String,
    uniqueId: String,
    revisionNumber: String, // Unique Id matching one of the Revisions
    isSelected: Boolean,
    identifier: String // Unique identifier for sheet across models. CentralPath + UniqueId
});

var revisionItemSchema = new mongoose.Schema({
    description: String,
    sequence: Number,
    number: String,
    date: String,
    issuedTo: String,
    issuedBy: String,
    uniqueId: String
});


var sheetsSchema = new mongoose.Schema(
    {
        centralPath: String,
        sheets: [sheetItemSchema],
        sheetsChanges: [sheetItemSchema],
        revisions: [revisionItemSchema]
    }
);

sheetsSchema.index({'sheets.identifier': 'text'});
sheetsSchema.index({'sheetsChanges.identifier': 'text'});
sheetsSchema.index({'revisions.uniqueId': 'text'});

var Sheets = mongoose.model( 'Sheets', sheetsSchema );