/**
 * Created by konrad.sobon on 2018-08-16.
 */
/**
 * @param {{ existingWarningIds: [string] }} Existing Warning Ids
 * @param {{ newWarnings: [object] }} New Warning Objects
 * @param {{ centralPath: string }} File Path
 */
const mongoose = require('mongoose')
const global = require('./socket/global')
const Warnings = mongoose.model('Warnings')

const WarningsService = {
    /**
     * Method used to only create new warnings if they don't exist.
     * @param req
     * @param res
     */
    add: function(req, res){
        Warnings.bulkWrite(
            req.body.map(function (item) {
                return {
                    'updateOne': {
                        filter: {'centralPath': item.centralPath, 'uniqueId': item.uniqueId},
                        update: {
                            $set: {
                                'updatedAt': Date.now()
                            },
                            $setOnInsert: {
                                'createdBy': 'Unknown', // override this to unknown
                                'createdAt': Date.now(),
                                'descriptionText': item.descriptionText,
                                'closedBy': item.closedBy,
                                'closedAt': item.closedAt,
                                'isOpen': item.isOpen,
                                'failingElements': item.failingElements,
                                '__v': 0
                            }
                        },
                        upsert: true
                    }
                }
            }), function (err, response) {
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
            }
        )
    },

    /**
     * Method used to make updates to existing warnings or create new ones.
     * @param req
     * @param res
     */
    update: function(req, res){
        Warnings.updateMany(
            {'centralPath': req.body.centralPath, 'isOpen': true, 'uniqueId': {$nin: req.body.existingWarningIds}},
            {$set: {'isOpen': false, 'closedBy': req.body.closedBy, 'closedAt': Date.now()}},
            {multi: true}, function (err, response){
                const result = {
                    status: 201,
                    message: response
                }
                Warnings.insertMany(req.body.newWarnings, function (err, response) {
                    if (err){
                        result.status = 500
                        result.message = err
                    } else if (!response){
                        result.status = 404
                        result.message = err
                    }
                    res.status(result.status).json(result.message)
                })
            })
    },

    /**
     * Retrieves all open warnings by central path.
     * @param req
     * @param res
     */
    getOpen: function(req, res) {
        const rgx = global.utilities.uriToString(req.params.uri)
        Warnings.find({$and: [{'centralPath': rgx}, {'isOpen': true}]}, function (err, response) {
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
     * Retrieves the count of open warnings by central path.
     * @param req
     * @param res
     */
    getOpenCountByCentralPath: function (req, res) {
        const rgx = global.utilities.uriToString(req.params.uri)
        Warnings.count({$and: [{'centralPath': rgx}, {'isOpen': true}]}, function (err, response) {
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
     * Retrieves all warnings by central path.
     * @param req
     * @param res
     */
    getByCentralPath: function (req, res) {
        const rgx = global.utilities.uriToString(req.params.uri)
        Warnings.find({'centralPath': rgx}).exec(function (err, response) {
            const result = {
                status: 200,
                message: response
            }
            if (err){
                result.status = 500
                result.message = err
            } else if (response.length === 0){
                result.status = 404
                result.message = err
            }
            res.status(result.status).json(result.message)
        })
    },

    /**
     * Retrieves 
     * @param req
     * @param res
     */
    getTimelineByCentralPath: async function (req, res) {
        const rgx = global.utilities.uriToString(req.params.uri)
        const result = { status: 200, message: '' }
        try {
            const aggQuery =  [
                { 
                    $match: { centralPath: rgx }
                }, 
                { 
                    $project: { createdAt: 1.0, closedAt: 1.0, isOpen: 1.0 }
                }, 
                { 
                    $addFields: { 
                        createDate: { 
                            $dateToString: { 
                                format: '%Y-%m-%d',
                                date: '$createdAt'
                            }
                        }, 
                        closeDate: { 
                            $dateToString: { 
                                format: '%Y-%m-%d', 
                                date: '$closedAt'
                            }
                        }
                    }
                }, 
                { 
                    $group: { _id: '$createDate', added: { $sum: 1.0 } }
                }
            ]
            const createdWarnings = await Warnings.aggregate(aggQuery)
            aggQuery.pop()
            aggQuery.push({ $group: { _id: '$closeDate', removed: { $sum: -1.0 }}})
            const closedWarnings = await Warnings.aggregate(aggQuery)
            const createdEntries = createdWarnings.map(x => [x._id, {date: x._id, added: x.added, removed: 0 }])
            const warnings = Object.fromEntries(createdEntries)
            closedWarnings.forEach((item) => {
                if (warnings[item._id]) {
                    warnings[item._id]['removed'] = item.removed
                } else {
                    warnings[item._id] = { date: item._id, removed: item.removed, added: 0 }
                }
            })
            delete warnings['0001-01-01']

            result.status = 200
            result.message = Object.values(warnings)
        } catch (err) {
            result.status = 500
            result.message = err
            console.error(err)
        }

        res.status(result.status).json(result.message)
    },

    /**
     * Retrieves latest entry in the Groups Stats array.
     * @param req
     * @param res
     */
    getWarningStats: function (req, res) {
        const from = new Date(req.body.from)
        const to = new Date(req.body.to)
        Warnings.find(
            {'centralPath': req.body.centralPath, 'createdAt': {$gte: from, $lte: to}}, function (err, response){
                const result = {
                    status: 201,
                    message: response
                }
                if (err){
                    result.status = 500
                    result.message = err
                } else if (response.length === 0){
                    result.status = 404
                    result.message = err
                }
                res.status(result.status).json(result.message)
            }
        )
    },

    /**
     *
     * @param req
     * @param res
     */
    updateFilePath: function (req, res) {
        const before = req.body.before.replace(/\\/g, '\\').toLowerCase()
        const after = req.body.after.replace(/\\/g, '\\').toLowerCase()
        Warnings.updateMany(
            { 'centralPath': before },
            { $set: { 'centralPath': after }},
            { multi: true }, function (err, response){
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
            }
        )
    },

    /**
     * DataTables allow for server side processing. This method processes
     * Warnings table requests. Request come in following format:
     * {
     *     draw: '1', // used for page redraws. indicates which page to set the table to.
     *     columns: [], // info about columns specified in the table
     *     order: [], // column specific ordering
     *     start: '0' // index for start of data
     *     length: '15', // number of objects to be drawn on the page, end index == start + length
     *     search: {value: '', regex: 'false'} // search criteria
     * }
     * @param req
     * @param res
     */
    datatable: function (req, res) {
        const centralPath = req.body['centralPath']

        Warnings.find({ 'centralPath': centralPath, 'isOpen': true }, function (err, response){
            const start = parseInt(req.body['start'])
            const length = parseInt(req.body['length'])
            const searched = req.body['search'].value !== ''
            const order = req.body['order'][0].dir
            const column = req.body['order'][0].column

            // (Konrad) By default table is sorted in asc order by createdAt property.
            response.sort(function (a, b) {
                switch (column){
                case '0': //createdAt
                    if (order === 'asc'){
                        return new Date(b.createdAt) - new Date(a.createdAt)
                    } else {
                        return new Date(a.createdAt) - new Date(b.createdAt)
                    }
                case '1': //createdBy
                    if (order === 'asc'){
                        return (a.createdBy).localeCompare(b.createdBy)
                    } else {
                        return (b.createdBy).localeCompare(a.createdBy)
                    }
                case '2': //message
                    if (order === 'asc'){
                        return (a.descriptionText).localeCompare(b.descriptionText)
                    } else {
                        return (b.descriptionText).localeCompare(a.descriptionText)
                    }
                }
            })

            // (Konrad) Filter the results collection by search value if one was set.
            // We are going to check both columns here: CreatedBy and Message
            let filtered = []
            if (searched){
                filtered = response.filter(function (item) {
                    return item.descriptionText.indexOf(req.body['search'].value) !== -1 ||
                        item.createdBy.indexOf(req.body['search'].value) !== -1
                })
            }

            // (Konrad) Update 'end'. It might be that start + length is more than total length
            // of the array so we must adjust that.
            let end = start + length
            if (end > response.length) end = response.length
            if (searched && filtered.length < end){
                end = filtered.length
            }

            // (Konrad) Slice the final collection by start/end.
            let data
            if (searched) {
                data = filtered.slice(start, end)
            } else {
                data = response.slice(start, end)
            }

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

module.exports = WarningsService