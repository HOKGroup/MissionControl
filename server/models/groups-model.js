/**
 * Created by konrad.sobon on 2018-05-16.
 */
var mongoose = require( 'mongoose' )

var groupsSchema = new mongoose.Schema(
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
var Groups = mongoose.model( 'Groups', groupsSchema )