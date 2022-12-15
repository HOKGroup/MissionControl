const mongoose = require('mongoose')

const addinsSchema = new mongoose.Schema(
    {
        pluginName: String,
        user: String,
        revitVersion: String,
        office: String,
        createdOn: Date,
        detailInfo: [
            {
                name: String,
                value: String
            }
        ]
    }
)

addinsSchema.index({'revitVersion': 'text'})
const Addins = mongoose.model('Addins', addinsSchema)
module.exports = Addins