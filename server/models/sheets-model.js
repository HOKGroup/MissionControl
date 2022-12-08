/**
 * Created by konrad.sobon on 2017-10-23.
 */
var mongoose = require( 'mongoose' )

var sheetItemSchema = new mongoose.Schema({
    name: String,
    number: String,
    uniqueId: String,
    revisionNumber: String, // Unique Id matching one of the Revisions
    isSelected: Boolean, // used by UI since either sheetItem or sheetTask can be stored in UI they both need it
    isPlaceholder: Boolean,
    isDeleted: Boolean,
    collectionId: String, // id of the MongoDB collection for quicker retrieval
    centralPath: String,
    isNewSheet: Boolean,
    tasks: [{
        name: String,
        number: String,
        uniqueId: String,
        revisionNumber: String,
        isSelected: Boolean,
        isPlaceholder: Boolean,
        isDeleted: Boolean,
        collectionId: String, // id of the MongoDB collection for quicker retrieval
        centralPath: String,
        isNewSheet: Boolean,
        assignedTo: String,
        message: String,
        comments: String,
        submittedOn: Date,
        completedOn: Date,
        submittedBy: String,
        completedBy: String
    }]
})

var revisionItemSchema = new mongoose.Schema({
    description: String,
    sequence: Number,
    number: String,
    date: String,
    issuedTo: String,
    issuedBy: String,
    uniqueId: String
})


var sheetsSchema = new mongoose.Schema(
    {
        centralPath: String,
        sheets: [sheetItemSchema],
        revisions: [revisionItemSchema]
    }
)

sheetsSchema.index({'centralPath': 'text'})
var Sheets = mongoose.model( 'Sheets', sheetsSchema )