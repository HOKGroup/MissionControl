/**
 * Created by konrad.sobon on 2018-09-10.
 */
var mongoose = require( 'mongoose' );

var openSynchSchema = new mongoose.Schema(
    {
        centralPath: String,
        user: String,
        opened: Number,
        closed: Number,
        createdOn: Date
    }
);

var itemCountSchema = new mongoose.Schema(
    {
        centralPath: String,
        user: String,
        createdOn: Date,
        worksets: [{
            name: String,
            count: Number
        }]
    }
);

openSynchSchema.index({'centralPath': 'text'});
itemCountSchema.index({'centralPath': 'text'});
var OnOpeneds = mongoose.model( 'OnOpeneds', openSynchSchema );
var OnSyncheds = mongoose.model( 'OnSyncheds', openSynchSchema );
var ItemCounts = mongoose.model( 'ItemCounts', itemCountSchema );