/**
 * Created by konrad.sobon on 2018-09-13.
 */
var mongoose = require( 'mongoose' )

var schema = new mongoose.Schema(
    {
        user: {type: String, default: 'Unknown'},
        machine: {type: String, default: ''}
    },
    {
        timestamps: true
    }
)

schema.index({'user': 'text'})
var Users = mongoose.model( 'Users', schema )