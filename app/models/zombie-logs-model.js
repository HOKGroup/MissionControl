/**
 * Created by konrad.sobon on 2018-07-27.
 */
var mongoose = require( 'mongoose' );

var zombieLogsSchema = new mongoose.Schema(
    {
        message: {type: String, default: ''},
        createdAt: {type: Date, default: Date.now()},
        version: {type: String, default: ''},
        level: {type: String, default: ''},
        machine: {type: String, default: ''},
        exception: {type: String, default: ''},
        source: {type: String, default: ''}
    }
);

zombieLogsSchema.index({'machine': 'text'});
var ZombieLogs = mongoose.model( 'ZombieLogs', zombieLogsSchema );