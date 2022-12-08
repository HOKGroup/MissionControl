/**
 * @param {{ updaterid: string }} Updater Id
 */
const mongoose = require('mongoose')
const Configuration = mongoose.model('Configuration')

const ConfigurationService = {
    /**
     * Retrieves Configuration by its Central Path.
     * @param req
     * @param res
     */
    findByCentralPath: function(req, res){
        // (Konrad) Since we cannot pass file path with "\" they were replaced with illegal pipe char "|".
        // (Konrad) RSN and A360 paths will have forward slashes instead of back slashes.
        const isRevitServer = req.params.uri.match(/rsn:/i)
        const isBim360 = req.params.uri.match(/bim 360:/i)
        let rgx
        if (isRevitServer || isBim360){
            rgx = req.params.uri.replace(/\|/g, '/').toLowerCase()
        } else {
            rgx = req.params.uri.replace(/\|/g, '\\').toLowerCase()
        }

        Configuration
            .find({ 'files.centralPath': rgx }, function (err, response){
                const result = {
                    status: 200,
                    message: response
                }
                if (err){
                    result.status = 500
                    result.message = err
                } else if (!response){
                    result.status = 404
                    result.message = err
                }
                res.status(result.status).json(result.message)
            })
    },

    /**
     * Creates new Configuration document.
     * @param req
     * @param res
     */
    add: function(req, res) {
        Configuration
            .create(req.body, function (err, response){
                const result = {
                    status: 201,
                    message: response
                }
                if (err){
                    result.status = 500
                    result.message = err
                } else if (!response){
                    result.status = 404
                    result.message = err
                }
                res.status(result.status).json(result.message)
            })
    },

    /**
     * Updates given Configuration by Id.
     * @param req
     * @param res
     */
    update: function(req, res) {
        const id = req.params.id
        Configuration
            .update(
                { '_id': id }, req.body, { upsert: true }, function (err, response){
                    const result = {
                        status: 201,
                        message: response
                    }
                    if (err){
                        result.status = 500
                        result.message = err
                    } else if (!response){
                        result.status = 404
                        result.message = err
                    }
                    res.status(result.status).json(result.message)
                })
    },

    /**
     * Removes entire configuration from the DB.
     * @param req
     * @param res
     */
    delete: function(req, res){
        const id = req.params.id
        Configuration
            .remove({ '_id': id }, function (err, response){
                const result = {
                    status: 204,
                    message: response
                }
                if (err){
                    result.status = 500
                    result.message = err
                } else if (!response){
                    result.status = 404
                    result.message = err
                }
                res.status(result.status).json(result.message)
            })
    },

    /**
     * Removes many configurations by their ids.
     * @param req
     * @param res
     */
    deleteMany: function (req, res) {
        const ids = req.body.map(function (id){
            return mongoose.Types.ObjectId(id)
        })
        Configuration
            .remove({'_id': { $in: ids }}, function (err, response){
                const result = {
                    status: 201,
                    message: response
                }
                if (err){
                    result.status = 500
                    result.message = err
                } else if (!response){
                    result.status = 404
                    result.message = err
                }
                res.status(result.status).json(result.message)
            })
    },

    /**
     * Retrieves many Configurations by their Ids.
     * @param req
     * @param res
     */
    getMany: function (req, res) {
        const ids = req.body.map(function (id){
            return mongoose.Types.ObjectId(id)
        })
        Configuration
            .find({'_id': { $in: ids }}, function (err, response){
                const result = {
                    status: 200,
                    message: response
                }
                if (err){
                    result.status = 500
                    result.message = err
                } else if (!response){
                    result.status = 404
                    result.message = err
                }
                res.status(result.status).json(result.message)
            })
    },

    /**
     * Updates file path value for given configuration.
     * @param req
     * @param res
     */
    updateFilePath: function (req, res) {
        const id = req.params.id
        Configuration
            .update(
                {'_id': id, 'files.centralPath': req.body.before.toLowerCase()},
                {'$set': {'files.$.centralPath' : req.body.after.toLowerCase()}}, function (err, response){
                    const result = {
                        status: 201,
                        message: response
                    }
                    if (err){
                        result.status = 500
                        result.message = err
                    } else if (!response){
                        result.status = 404
                        result.message = err
                    }
                    res.status(result.status).json(result.message)
                })
    },

    /**
     * Adds new file to the Configuration.
     * @param req
     * @param res
     */
    addFile: function (req, res) {
        const id = req.params.id
        Configuration
            .update(
                { '_id': id },
                { $push: { 'files': req.body }}, function (err, response){
                    const result = {
                        status: 202,
                        message: response
                    }
                    if (err){
                        result.status = 500
                        result.message = err
                    } else if (!response){
                        result.status = 404
                        result.message = err
                    }
                    res.status(result.status).json(result.message)
                })
    },

    /**
     * Deletes file from the Configuration.
     * @param req
     * @param res
     */
    deleteFile: function (req, res) {
        const id = req.params.id
        Configuration
            .update(
                { '_id': id },
                { $pull: { 'files': {'centralPath': req.body.centralPath.toLowerCase()}}}, function (err, response){
                    const result = {
                        status: 202,
                        message: response
                    }
                    if (err){
                        result.status = 500
                        result.message = err
                    } else if (!response){
                        result.status = 404
                        result.message = err
                    }
                    res.status(result.status).json(result.message)
                })
    },

    /**
     * DataTables allow for server side processing. This method processes
     * File Paths table requests. Request come in following format:
     * {
     *     draw: '1', // used for page redraws. indicates which page to set the table to.
     *     columns: [], // info about columns specified in the table
     *     order: [], // column specific ordering
     *     start: '0' // index for start of data
     *     length: '15', // number of objects to be drawn on the page, end index == start + length
     *     search: {value: '', regex: 'false'} // search criteria
     *     configurationId: '' or [''] // if project was selected we will get an array here and we
     *                      need to return multiple configurations. Once a single Configuration is
     *                      selected we will just get a single string with its id.
     * }
     * @param req
     * @param res
     */
    datatable: function (req, res) {
        // (Konrad) Process filters that can be applied directly to MongoDB search query
        const configurationId = req.body['configurationId']
        const query = {}
        if (Array.isArray(configurationId)) query['_id'] = { $in: configurationId }
        else if (configurationId !== '') query['_id'] = configurationId
        else return

        Configuration.find(query, function (err, response){
            const start = parseInt(req.body['start'])
            const length = parseInt(req.body['length'])
            const searched = req.body['search'].value !== ''
            const order = req.body['order'][0].dir

            // (Konrad) By default table is sorted in asc order by centralPath property.
            response.sort(function (a, b) {
                if (order === 'asc') return (a.name).localeCompare(b.name)
                else return (b.name).localeCompare(a.name)
            })

            // (Konrad) Filter the results collection by search value if one was set.
            let filtered = []
            if (searched){
                filtered = response.filter(function (item) {
                    return item.name.indexOf(req.body['search'].value) !== -1
                })
            }

            // (Konrad) Update 'end'. It might be that start + length is more than total length
            // of the array so we must adjust that.
            let end = start + length
            if (end > response.length) end = response.length
            if (searched && filtered.length < end) end = filtered.length

            // (Konrad) Slice the final collection by start/end.
            let data
            if (searched) data = filtered.slice(start, end)
            else data = response.slice(start, end)

            const result = {
                status: 201,
                message: {
                    draw: req.body['draw'],
                    recordsTotal: response.length,
                    recordsFiltered: filtered.length > 0 ? filtered.length : response.length,
                    data: data
                }
            }
            if (err){
                result.status = 500
                result.message = err
            } else if (!response){
                result.status = 404
                result.message = err
            }
            res.status(result.status).json(result.message)
        })
    }
}

module.exports = ConfigurationService