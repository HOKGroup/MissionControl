/**
 * Created by konrad.sobon on 2018-01-09.
 */
var mongoose = require( 'mongoose' );

var vrSchema = new mongoose.Schema(
    {
        project: mongoose.Schema.Types.ObjectId
    }
);

var Vrs = mongoose.model( 'Vrs', vrSchema );