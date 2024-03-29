const project = require('./models/project')
const configuration = require('./models/configuration')
const triggerrecords = require('./models/trigger-records-model')
const addins = require('./models/addins-model')
const families = require('./models/families-model')
const sheets = require('./models/sheets-model')
const worksets = require('./models/worksets')
const styles = require('./models/styles-model')
const links = require('./models/links-model')
const views = require('./models/views-model')
const groups = require('./models/groups-model')
const warnings = require('./models/warnings')
const zombieLogs = require('./models/zombie-logs-model')
const filePaths = require('./models/filepaths')
const models = require('./models/models')
const users = require('./models/users')
const settings = require('./models/settings')
// eslint-disable-next-line no-unused-vars
const MongooseModels = {
    project,
    configuration,
    triggerrecords,
    addins,
    families,
    sheets,
    worksets,
    styles,
    links,
    views,
    groups,
    warnings,
    zombieLogs,
    filePaths,
    models,
    users,
    settings
}
const auth = require('./auth/azure-ad')

module.exports = function(app) {
    const settings = require('./controller/settings')
    app.get('/api/v2/settings', settings.get)
    app.put('/api/v2/settings/:id', auth.protected, settings.update)

    const projects = require('./controller/projects')
    app.get('/api/v2/projects/sort', projects.findAndSort)
    app.get('/api/v2/projects/:id', projects.findById)
    app.get('/api/v2/projects/configid/:configid', projects.findByConfigurationId)
    app.get('/api/v2/projects/:id/populateconfigurations', projects.findByIdPopulateConfigurations)
    app.get('/api/v2/projects/populatesheets/:id', projects.populateSheets)
    app.post('/api/v2/projects', projects.add)
    app.put('/api/v2/projects/:id', projects.update)
    app.put('/api/v2/projects/:id/addconfig/:configid', projects.addConfiguration)
    app.put('/api/v2/projects/:id/addworkset', projects.addWorkset)
    app.put('/api/v2/projects/:id/addfamilies', projects.addFamilies)
    app.put('/api/v2/projects/:id/addstyle', projects.addStyle)
    app.put('/api/v2/projects/:id/addmodel', projects.addModel)
    app.put('/api/v2/projects/:id/addlink', projects.addLink)
    app.put('/api/v2/projects/:id/addview', projects.addView)
    app.put('/api/v2/projects/:id/addsheet', projects.addSheet)
    app.put('/api/v2/projects/:id/addgroup', projects.addGroup)
    app.put('/api/v2/projects/:id/addtriggerrecord', projects.addTriggerRecord)
    app.put('/api/v2/projects/:id/deleteconfig/:configid', projects.deleteConfiguration)
    app.post('/api/v2/projects/:id/deletetriggerrecords', projects.deleteTriggerRecords)
    app.delete('/api/v2/projects/:id', projects.delete)
    app.post('/api/v2/projects/datatable', projects.datatable)

    const config = require('./controller/configurations')
    app.get('/api/v2/configurations/centralpath/:uri*', config.findByCentralPath)
    app.put('/api/v2/configurations/:id', auth.protected, config.update)
    app.put('/api/v2/configurations/:id/updatefilepath', config.updateFilePath)
    app.post('/api/v2/configurations', config.add)
    app.post('/api/v2/configurations/deletemany', config.deleteMany)
    app.post('/api/v2/configurations/:id/addfile', config.addFile)
    app.post('/api/v2/configurations/:id/deletefile', config.deleteFile)
    app.post('/api/v2/configurations/getmany', config.getMany)
    app.delete('/api/v2/configurations/:id', config.delete)
    app.post('/api/v2/configurations/datatable', config.datatable)

    const triggerrecords = require('./controller/trigger-records-controller')
    app.get('/api/v2/triggerrecords/centralpath/:uri*', triggerrecords.findByCentralPath)
    app.put('/api/v2/triggerrecords/:id/updatefilepath', triggerrecords.updateFilePath)
    app.post('/api/v2/triggerrecords/findmanybycentralpath', triggerrecords.findManyByCentralPathDates)
    app.post('/api/v2/triggerrecords', triggerrecords.add)
    app.post('/api/v2/triggerrecords/:id/add', triggerrecords.postTriggerRecord)
    app.post('/api/v2/triggerrecords/deletemany', triggerrecords.deleteMany)

    const addins = require('./controller/addins-controller')
    app.get('/api/v2/addins/:year', addins.aggregateByYear)
    app.get('/api/v2/addins/:year/addinmanager', addins.addinManagerDetails)
    app.post('/api/v2/addins', addins.add)

    const zombieLogs = require('./controller/zombie-logs-controller')
    app.get('/api/v2/zombielogs', zombieLogs.get)
    app.post('/api/v2/zombielogs', zombieLogs.add)
    app.post('/api/v2/zombielogs/filter', zombieLogs.getByDate)

    const families = require('./controller/families-controller')
    app.get('/api/v2/families/centralpath/:uri*', families.findByCentralPath)
    app.put('/api/v2/families/:id', families.update)
    app.put('/api/v2/families/:id/updatefilepath', families.updateFilePath)
    app.post('/api/v2/families', families.add)
    app.post('/api/v2/families/:id/family/:name', families.addTask)
    app.post('/api/v2/families/:id/family/:name/updatetask/:taskid', families.updateTask)
    app.post('/api/v2/families/:id/family/:name/deletemany', families.deleteMultipleTasks)
    app.post('/api/v2/families/familystats', families.getFamilyStats)

    const sheets = require('./controller/sheets-controller')
    app.get('/api/v2/sheets/centralpath/:uri*', sheets.findByCentralPath)
    app.put('/api/v2/sheets/:id/updatefilepath', sheets.updateFilePath)
    app.post('/api/v2/sheets', sheets.add)
    app.post('/api/v2/sheets/:id', sheets.update)
    app.post('/api/v2/sheets/:id/addsheettask', sheets.addSheetTask)
    app.post('/api/v2/sheets/:id/addsheets', sheets.addSheets)
    app.post('/api/v2/sheets/:id/approvenewsheet', sheets.approveNewSheets)
    app.post('/api/v2/sheets/:id/deletenewsheet', sheets.deleteNewSheet)
    app.post('/api/v2/sheets/:id/deletetasks', sheets.deleteTasks)
    app.post('/api/v2/sheets/:id/updatetasks', sheets.updateSheetTask)

    const styles = require('./controller/styles-controller')
    app.post('/api/v2/styles', styles.add)
    app.post('/api/v2/styles/:id/stylestats', styles.styleStats)
    app.put('/api/v2/styles/:id/updatefilepath', styles.updateFilePath)
    app.post('/api/v2/styles/stylestats', styles.getStyleStats)

    const links = require('./controller/links-controller')
    app.post('/api/v2/links', links.add)
    app.post('/api/v2/links/:id/linkstats', links.linkStats)
    app.put('/api/v2/links/:id/updatefilepath', links.updateFilePath)
    app.post('/api/v2/links/linkstats', links.getLinkStats)

    const worksets = require('./controller/worksets')
    app.post('/api/v2/worksets/onsynched', worksets.addOnSynched)
    app.post('/api/v2/worksets/onopened', worksets.addOnOpened)
    app.post('/api/v2/worksets/itemcount', worksets.addItemsCount)
    app.post('/api/v2/worksets/getworksetsdata', worksets.getWorksetsData)
    app.put('/api/v2/worksets/updatefilepath', worksets.updateFilePath)

    const models = require('./controller/models')
    app.post('/api/v2/model/opentimes', models.addOpenTime)
    app.get('/api/v2/model/opentimes/usernames/:uri*', models.getUserNamesByCentralPath)
    app.post('/api/v2/model/synchtimes', models.addSynchTime)
    app.post('/api/v2/model/modelsizes', models.addModelSize)
    app.post('/api/v2/model/getall', models.getAll)
    app.post('/api/v2/model/getbydate', models.getByDate)
    app.post('/api/v2/model/getmodelsdata', models.getModelsData)
    app.put('/api/v2/model/updatefilepath', models.updateFilePath)

    const views = require('./controller/views-controller')
    app.get('/api/v2/views/centralpath/:uri*', views.findByCentralPath)
    app.post('/api/v2/views', views.add)
    app.post('/api/v2/views/:id/viewstats', views.viewStats)
    app.put('/api/v2/views/:id/updatefilepath', views.updateFilePath)
    app.post('/api/v2/views/viewstats', views.getViewStats)

    const groups = require('./controller/groups-controller')
    app.post('/api/v2/groups', groups.add)
    app.post('/api/v2/groups/:id/groupstats', groups.groupStats)
    app.put('/api/v2/groups/:id/updatefilepath', groups.updateFilePath)
    app.post('/api/v2/groups/groupstats', groups.getGroupStats)

    const warnings = require('./controller/warnings')
    app.post('/api/v2/warnings/update', warnings.update)
    app.post('/api/v2/warnings/add', warnings.add)
    app.get('/api/v2/warnings/centralpath/:uri*/opencount', warnings.getOpenCountByCentralPath)
    app.get('/api/v2/warnings/centralpath/:uri*/open', warnings.getOpen)
    app.get('/api/v2/warnings/centralpath/:uri*/timeline', warnings.getTimelineByCentralPath)
    app.get('/api/v2/warnings/centralpath/:uri*', warnings.getByCentralPath)
    app.post('/api/v2/warnings/daterange', warnings.getWarningStats)
    app.put('/api/v2/warnings/updatefilepath', warnings.updateFilePath)
    app.post('/api/v2/warnings/datatable', warnings.datatable)

    const filepaths = require('./controller/filepaths')
    app.get('/api/v2/filepaths', filepaths.getAll)
    app.get('/api/v2/filepaths/:id', filepaths.findById)
    app.post('/api/v2/filepaths/add', filepaths.add)
    app.post('/api/v2/filepaths/addmany', filepaths.addMany)
    app.put('/api/v2/filepaths/add', filepaths.addToProject)
    app.put('/api/v2/filepaths/remove', filepaths.removeFromProject)
    app.put('/api/v2/filepaths/removemany', filepaths.removeManyFromProject)
    app.put('/api/v2/filepaths/change', filepaths.changeFilePath)
    app.put('/api/v2/filepaths/:id/disable', filepaths.disable)
    app.put('/api/v2/filepaths/:id/update', filepaths.update)
    app.post('/api/v2/filepaths/datatable', filepaths.datatable)

    const users = require('./controller/users')
    app.post('/api/v2/users/add', users.add)
    app.get('/api/v2/users', users.getAll)
}