/**
 * Created by konrad.sobon on 2018-04-24.
 */
const mongoose = require('mongoose')

const stylesSchema = new mongoose.Schema(
    {
        centralPath: String,
        styleStats: [{
            createdOn: Date,
            user: String,
            textStats: [{
                createdOn: Date,
                name: String,
                instances: Number,
                bold: Boolean,
                color: [Number],
                italic: Boolean,
                leaderArrowhead: String,
                lineWeight: Number,
                textFont: String,
                textSize: Number,
                textSizeString: String,
                underline: Boolean
            }],
            dimStats: [{
                createdOn: Date,
                name: String,
                instances: Number,
                usesProjectUnits: Boolean,
                bold: Boolean,
                color: [Number],
                italic: Boolean,
                leaderType: String,
                lineWeight: Number,
                textFont: String,
                textSize: Number,
                textSizeString: String,
                underline: Boolean,
                styleType: String
            }],
            dimSegmentStats: [{
                createdOn: Date,
                isOverriden: Boolean,
                value: Number,
                valueString: String,
                valueOverride: String,
                ownerViewId: Number,
                ownerViewType: String
            }]
        }]
    }
)

stylesSchema.index({'centralPath': 'text'})
const Styles = mongoose.model( 'Styles', stylesSchema )
module.exports = Styles