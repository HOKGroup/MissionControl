/**
 * Created by konrad.sobon on 2018-04-24.
 */
const mongoose = require('mongoose')

const viewsSchema = new mongoose.Schema(
    {
        centralPath: String,
        viewStats: [{
            totalViews: Number,
            totalSheets: Number,
            totalSchedules: Number,
            viewsOnSheet: Number,
            viewsOnSheetWithTemplate: Number,
            schedulesOnSheet: Number,
            unclippedViews: Number,
            createdOn: Date
        }]
    }
)

viewsSchema.index({'centralPath': 'text'})
const Views = mongoose.model( 'Views', viewsSchema )
module.exports = Views