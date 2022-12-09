/**
 * @param {{configid:string}} HTTP request param for configuration id.
 */
const mongoose = require('mongoose')
const Project = mongoose.model('Project')

const ProjectService = {
    /**
     * Retrieves all Projects from MongoDB and sorts by Project Number
     * @param req
     * @param res
     */
    findAndSort : function(req, res){
        Project.find({})
            .sort({ number: 1 })
            .exec(function (err, response){
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
     * Creates new Project in MongoDB.
     * @param req
     * @param res
     */
    add : function(req, res){
        Project
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
     * Retrieves project by its Id.
     * @param req
     * @param res
     */
    findById: function(req, res){
        const id = req.params.id
        Project
            .findById(id)
            .exec(function (err, response){
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
     * Retrieves Project by Configuration Id. Used by .NET side to check into MC.
     * @param req
     * @param res
     */
    findByConfigurationId : function(req, res){
        const id = req.params.configid
        Project.find({ 'configurations': id }, function (err, response){
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
     * Removes Project.
     * @param req
     * @param res
     */
    delete : function(req, res){
        const id = req.params.id
        Project
            .remove({ '_id': id }, function (err, response){
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
     * Updates Project in a MongoDB.
     * @param req
     * @param res
     */
    update : function(req, res) {
        const id = req.params.id
        Project
            .updateOne(
                { '_id': id },
                req.body,
                { upsert: true }, function (err, response){
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
     * Removes Configuration Id reference from project.Configurations collection.
     * @param req
     * @param res
     */
    deleteConfiguration: function(req, res){
        const projectId = req.params.id
        const configId = req.params.configid
        Project
            .updateOne(
                { '_id': projectId},
                { $pull: { 'configurations': configId }},function (err, response){
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
     * Removes trigger record references when trigger records are deleted.
     * @param req
     * @param res
     */
    deleteTriggerRecords: function (req, res) {
        const projectId = req.params.id
        const ids = req.body.map(function (item) {
            return mongoose.Types.ObjectId(item)
        })
        Project
            .updateOne(
                { '_id': projectId },
                { $pull: { 'triggerRecords': { $in: ids }}}, function (err, response){
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
     * Adds configuration reference to Configurations Collection.
     * @param req
     * @param res
     */
    addConfiguration : function(req, res){
        const projectId = req.params.id
        const configId = req.params.configid
        Project
            .updateOne(
                { '_id': projectId},
                { $push:{ 'configurations': configId }}, function (err, response){
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
     * Adds Workset id reference to Project.worksetStats collection.
     * @param req
     * @param res
     */
    addWorkset : function(req, res){
        const projectId = req.params.id
        const worksetId = mongoose.Types.ObjectId(req.body['id'])
        Project
            .updateOne(
                { '_id': projectId},
                { $push:{ 'worksetStats': worksetId }}, function (err, response){
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
     * Adds Family id reference to Project.familyStats collection.
     * @param req
     * @param res
     */
    addFamilies: function (req, res) {
        const projectId = req.params.id
        const familiesId = mongoose.Types.ObjectId(req.body['id'])
        Project
            .updateOne(
                { '_id': projectId},
                { $push:{ 'familyStats': familiesId }}, function (err, response){
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
     * Adds Style id reference to Project.styleStats collection.
     * @param req
     * @param res
     */
    addStyle: function (req, res) {
        const projectId = req.params.id
        const stylesId = mongoose.Types.ObjectId(req.body['id'])
        Project
            .updateOne(
                { '_id': projectId},
                { $push:{ 'styleStats': stylesId }}, function (err, response){
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
     * Adds Link id reference to Project.linkStats collection.
     * @param req
     * @param res
     */
    addLink: function (req, res) {
        const projectId = req.params.id
        const linksId = mongoose.Types.ObjectId(req.body['id'])
        Project
            .updateOne(
                { '_id': projectId},
                { $push:{ 'linkStats': linksId }}, function (err, response){
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
     * Adds View id reference to Project.viewStats collection.
     * @param req
     * @param res
     */
    addView: function (req, res) {
        const projectId = req.params.id
        const linksId = mongoose.Types.ObjectId(req.body['id'])
        Project
            .updateOne(
                { '_id': projectId},
                { $push:{ 'viewStats': linksId }}, function (err, response){
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
     * Adds Model id reference to Project.modelStats collection.
     * @param req
     * @param res
     */
    addModel: function (req, res) {
        const projectId = req.params.id
        const modelsId = mongoose.Types.ObjectId(req.body['id'])
        Project
            .updateOne(
                { '_id': projectId},
                { $push:{ 'modelStats': modelsId }}, function (err, response){
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
     * Adds Sheets id reference to Project.sheets collection.
     * @param req
     * @param res
     */
    addSheet : function(req, res){
        const projectId = req.params.id
        const sheetsId = mongoose.Types.ObjectId(req.body['id'])
        Project
            .updateOne(
                { '_id': projectId },
                { $push:{ 'sheets': sheetsId }}, function (err, response){
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
     * Adds Sheets id reference to Project.sheets collection.
     * @param req
     * @param res
     */
    addGroup : function(req, res){
        const projectId = req.params.id
        const groupsId = mongoose.Types.ObjectId(req.body['id'])
        Project
            .updateOne(
                { '_id': projectId },
                { $push:{ 'groupStats': groupsId }}, function (err, response){
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
     * Adds Trigger Records id reference to Project.triggerRecords collection.
     * @param req
     * @param res
     */
    addTriggerRecord : function(req, res){
        const projectId = req.params.id
        const trId = mongoose.Types.ObjectId(req.body['id'])
        Project
            .updateOne(
                { '_id': projectId },
                { $push:{ 'triggerRecords': trId }}, function (err, response){
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
     * Retrieves a project matching id and populates Configurations collection.
     * @param req
     * @param res
     */
    findByIdPopulateConfigurations : function (req, res) {
        const id = req.params.id
        Project
            .findById(id)
            .populate({ path: 'configurations'})
            .exec(function (err, response){
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
     * Retrieves a project matching id and populates Sheets collection.
     * @param req
     * @param res
     */
    populateSheets : function (req, res) {
        const id = req.params.id
        Project
            .findById(id)
            .populate({ path: 'sheets'})
            .exec(function (err, response){
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
     * DataTables allow for server side processing. This method processes
     * File Paths table requests. Request come in following format:
     * {
     *     draw: '1', // used for page redraws. indicates which page to set the table to.
     *     columns: [], // info about columns specified in the table
     *     order: [], // column specific ordering
     *     start: '0' // index for start of data
     *     length: '15', // number of objects to be drawn on the page, end index == start + length
     *     search: {value: '', regex: 'false'} // search criteria
     *     projectId: '' //once a Project is selected we will get an Id here to return it
     *                  otherwise it will be an empty string, and we return all Projects.
     *     projectNumber: '' //user can choose to search for project by its number.
     * }
     * @param req
     * @param res
     */
    datatable: function (req, res) {
        // (Konrad) Process filters that can be applied directly to MongoDB search query
        const projectId = req.body['projectId']
        const projectNumber = req.body['projectNumber']
        const query = {}
        if (projectId !== '') query['_id'] = projectId
        if (projectNumber !== '') query['number'] = projectNumber

        Project.find(query, function (err, response){
            const start = parseInt(req.body['start'])
            const length = parseInt(req.body['length'])
            const searched = req.body['search'].value !== ''
            const order = req.body['order'][0].dir
            const column = req.body['order'][0].column

            // (Konrad) By default table is sorted in asc order by centralPath property.
            response.sort(function (a, b) {
                switch (column){
                case '0': //version
                    if (order === 'asc') return (a.number).localeCompare(b.number)
                    else return (b.number).localeCompare(a.number)
                case '1': //office
                    if (order === 'asc') return (a.name).localeCompare(b.name)
                    else return (b.name).localeCompare(a.name)
                case '2': //centralPath
                default:
                    if (order === 'asc') return (a.office).localeCompare(b.office)
                    else return (b.office).localeCompare(a.office)
                }
            })

            // (Konrad) Filter the results collection by search value if one was set.
            let filtered = []
            if (searched){
                filtered = response.filter(function (item) {
                    return item.number.indexOf(req.body['search'].value) !== -1 ||
                        item.name.indexOf(req.body['search'].value) !== -1 ||
                        item.office.indexOf(req.body['search'].value) !== -1
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

module.exports = ProjectService
