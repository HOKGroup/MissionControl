/**
 * Created by konrad.sobon on 2018-04-24.
 */
const mongoose = require('mongoose')

const linksSchema = new mongoose.Schema(
    {
        centralPath: String,
        linkStats: [{
            totalImportedDwg: Number, //total number of ImportInstance objects
            importedDwgFiles:[{
                name: String,
                elementId: Number,
                instances: Number,
                isViewSpecific: Boolean,
                isLinked: Boolean}],
            unusedLinkedImages: Number, //all ImageTypes that were not used
            totalDwgStyles: Number,//all Styles with "dwg" in name
            totalImportedStyles: Number,//all Styles under "Imports in Families"
            totalLinkedModels: Number,//all CADLinkType + all RevitLinkType objects
            totalLinkedDwg: Number,//all CADLinkType objects
            createdOn: Date
        }]
    }
)

linksSchema.index({'centralPath': 'text'})
const Links = mongoose.model( 'Links', linksSchema )
module.exports = Links