/**
 * Created by konrad.sobon on 2018-07-27.
 */
const mongoose = require('mongoose')

const zombieLogsSchema = new mongoose.Schema(
    {
        message: {type: String, default: ''},
        createdAt: {type: Date, default: Date.now()},
        version: {type: String, default: ''},
        level: {type: String, default: ''},
        machine: {type: String, default: ''},
        exception: {type: String, default: ''},
        source: {type: String, default: ''}
    }
)

zombieLogsSchema.index({'machine': 'text'})
const ZombieLogs = mongoose.model( 'ZombieLogs', zombieLogsSchema )
module.exports = ZombieLogs