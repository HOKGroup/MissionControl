/**
 * Created by konrad.sobon on 2018-01-09.
 */
var mongoose = require( 'mongoose' );

var vrSchema = new mongoose.Schema(
    {
        project: mongoose.Schema.Types.ObjectId,
        images: [{
            data: String,
            dataSize: Number,
            lastModified: Date,
            name: String,
            size: Number,
            type: String,
            displayName: String, //name shown in the App UI
            description: String //image description for the App UI
        }]
    }
);

var Vrs = mongoose.model( 'Vrs', vrSchema );