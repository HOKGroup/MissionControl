/**
 * Created by konrad.sobon on 2018-05-16.
 */
const mongoose = require('mongoose')

const groupsSchema = new mongoose.Schema(
    {
        centralPath: String,
        groupStats: [{
            createdOn: { type: Date, default: Date.now() },
            groups: [{
                name: { type: String, default: '' },
                type: { type: String, default: '' },
                memberCount: { type: Number, default: 0 },
                instances: [{
                    createdBy: { type: String, default: '' },
                    ownerViewId: { type: Number, default: 0 },
                    level: { type: String, default: '' }
                }]
            }]
        }]
    }
)

groupsSchema.index({'centralPath': 'text'})
const Groups = mongoose.model( 'Groups', groupsSchema )
module.exports = Groups