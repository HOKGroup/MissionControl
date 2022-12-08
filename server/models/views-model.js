/**
 * Created by konrad.sobon on 2018-04-24.
 */
var mongoose = require( 'mongoose' )

var viewsSchema = new mongoose.Schema(
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
var Views = mongoose.model( 'Views', viewsSchema )