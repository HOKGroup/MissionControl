var mongoose = require('mongoose');

var addinsSchema = new mongoose.Schema(
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
);

addinsSchema.index({'revitVersion': 'text'});
mongoose.model('Addins', addinsSchema);