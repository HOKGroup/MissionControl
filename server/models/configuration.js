const mongoose = require('mongoose')

const configSchema = new mongoose.Schema(
    {
        name: String,
        files: [{centralPath: String}], //revit projects
        sheetDatabase: String, //sheet database
        sharedParamMonitor: {
            monitorId: String,
            monitorName: String,
            description: String,
            addInName: String,
            filePath: String,
            isMonitorOn: Boolean
        }, // shared param file path monitor
        updaters: [{
            updaterId: String,
            updaterName: String,
            description: String,
            addInId: String,
            addInName: String,
            isUpdaterOn: Boolean,
            categoryTriggers: [{
                categoryName: String,
                description: String,
                isEnabled: Boolean,
                locked: Boolean,
                modifiedBy: String,
                modified: Date
            }],
            userOverrides: {
                familyNameCheck: {
                    description: String,
                    values: [String]
                },
                dimensionValueCheck: {
                    description: String,
                    values: [String]
                }
            }

        }]
    },
    { timestamps: true }
)

configSchema.index({'files.centralPath': 'text'})
const Configuration = mongoose.model( 'Configuration', configSchema )
module.exports = Configuration

