/**
 * Created by konrad.sobon on 2018-09-06.
 */
const mongoose = require('mongoose')

const schema = new mongoose.Schema(
    {
        centralPath: { type: String, default: '' },
        value: { type: Number, default: 0 },
        user: { type: String, default: '' },
        createdOn: { type: Date, default: Date.now() }
    }
)

schema.index({'centralPath': 'text'})
const OpenTimes = mongoose.model( 'OpenTimes', schema )
const SynchTimes = mongoose.model( 'SynchTimes', schema )
const ModelSizes = mongoose.model( 'ModelSizes', schema )
module.exports = { OpenTimes, SynchTimes, ModelSizes }