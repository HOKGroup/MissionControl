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

var sheetTaskSchema = new mongoose.Schema({
    name: String,
    number: String,
    uniqueId: String,
    revisionNumber: String, // Unique Id matching one of the Revisions
    isSelected: Boolean,
    identifier: String, // Unique identifier for sheet across models. CentralPath + UniqueId

    assignedTo: String,
    message: String,
    comments: String,
    submittedBy: String,
    completedBy: String,
    submittedOn: Date,
    completedOn: Date
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
        sheetsChanges: [sheetTaskSchema],
        revisions: [revisionItemSchema]
    }
);

sheetsSchema.index({"centralPath": "text"});
sheetsSchema.index({'sheets.identifier': 'text'});
sheetsSchema.index({'sheetsChanges.identifier': 'text'});

var Sheets = mongoose.model( 'Sheets', sheetsSchema );