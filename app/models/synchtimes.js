/**
 * Created by konrad.sobon on 2018-09-06.
 */
var mongoose = require( 'mongoose' );

var schema = new mongoose.Schema(
    {
        centralPath: { type: String, default: "" },
        value: { type: Number, default: 0 },
        user: { type: String, default: "" },
        createdOn: { type: Date, default: Date.now() }
    }
);

schema.index({"centralPath": "text"});
var SynchTimes = mongoose.model( 'SynchTimes', schema );