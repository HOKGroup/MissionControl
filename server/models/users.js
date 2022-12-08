/**
 * Created by konrad.sobon on 2018-09-13.
 */
const mongoose = require('mongoose')

const schema = new mongoose.Schema(
    {
        user: {type: String, default: 'Unknown'},
        machine: {type: String, default: ''}
    },
    {
        timestamps: true
    }
)

schema.index({'user': 'text'})
const Users = mongoose.model( 'Users', schema )
module.exports = Users