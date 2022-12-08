/**
 * Created by konrad.sobon on 2018-09-10.
 */
const mongoose = require('mongoose')

const openSynchSchema = new mongoose.Schema(
    {
        centralPath: String,
        user: String,
        opened: Number,
        closed: Number,
        createdOn: Date
    }
)

const itemCountSchema = new mongoose.Schema(
    {
        centralPath: String,
        user: String,
        createdOn: Date,
        worksets: [{
            name: String,
            count: Number
        }]
    }
)

openSynchSchema.index({'centralPath': 'text'})
itemCountSchema.index({'centralPath': 'text'})
const OnOpeneds = mongoose.model( 'OnOpeneds', openSynchSchema )
const OnSyncheds = mongoose.model( 'OnSyncheds', openSynchSchema )
const ItemCounts = mongoose.model( 'ItemCounts', itemCountSchema )
module.exports = { OnOpeneds, OnSyncheds, ItemCounts }