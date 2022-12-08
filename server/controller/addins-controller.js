const mongoose = require('mongoose')
const Addins = mongoose.model('Addins')

const AddinsService = {
    /**
     * 
     * @param req 
     * @param res 
     */
    aggregateByYear: function(req, res){
        const matchFilter = {
            $match: {
                'revitVersion': req.params.year
            }
        }
        let groupByColumn = '$pluginName'
        if (req.query.name) {
            matchFilter.$match['pluginName'] = req.query.name
            groupByColumn = '$user'
        }
        if (req.query.office) {
            const officeCodes = req.query.office.split('|')
            matchFilter.$match['office'] = { $in: officeCodes }
        }
        Addins
            .aggregate([
                matchFilter,
                { 
                    $group: { 
                        _id: groupByColumn,
                        office: { $max: '$office'},
                        count: { $sum: 1 }
                    }
                }
            ], function (err, response){
                const data = response.map(function(addin) { 
                    return {
                        name: addin['_id'],
                        office: addin['office'],
                        count: addin['count']
                    }
                })
                const result = {
                    status: 200,
                    message: data
                }
                if (err) {
                    result.status = 500
                    result.message = err
                } else if (!response) {
                    result.status = 404
                    result.message = err
                }
                res.status(result.status).json(result.message)
            })
    },

    /**
     *
     * @param req
     * @param res
     */
    addinManagerDetails: function(req, res) {
        const matchFilter = {
            'revitVersion' : req.params.year, 
            'pluginName' : 'AddinManager', 
            'detailInfo' : {
                $exists : true
            }, 
            'detailInfo.1' : {
                $exists : true
            }
        }
        if (req.query.office) {
            const officeCodes = req.query.office.split('|')
            matchFilter['office'] = { $in: officeCodes }
        }
        Addins
            .aggregate([
                { $match: matchFilter }, 
                { $sort: { 'createdOn' : -1 } }, 
                { 
                    $group: {
                        '_id' : '$user', 
                        'userData' : { $first : '$detailInfo' }, 
                        count: { $sum: 1 }
                    }
                }
            ], function(err, response) {
                const addinManagerDetails = {}
                response
                    .reduce(function (acc, item) { return acc.concat(item.userData) }, [])
                    .map(function (item) { { delete item._id; return item } })
                    .forEach(function (detailItem) {
                        if (detailItem.name in addinManagerDetails) {
                            switch (detailItem.value) {
                            case 'Never':
                                addinManagerDetails[detailItem.name].never += 1
                                break
                            case 'Always':
                                addinManagerDetails[detailItem.name].always += 1
                                break
                            case 'ThisSessionOnly':
                                addinManagerDetails[detailItem.name].thisSessionOnly += 1
                                break
                            }
                        } else {
                            const pluginDetail = {
                                name: detailItem.name,
                                never: 0,
                                always: 0,
                                thisSessionOnly: 0
                            }
                            switch (detailItem.value) {
                            case 'Never':
                                pluginDetail.never = 1
                                break
                            case 'Always':
                                pluginDetail.always = 1
                                break
                            case 'ThisSessionOnly':
                                pluginDetail.thisSessionOnly = 1
                                break
                            }
                            addinManagerDetails[detailItem.name] = pluginDetail

                        }
                    })
                const addinManagerStats = Object.keys(addinManagerDetails).map(function (item) {
                    return addinManagerDetails[item]
                })
                const result = {
                    status: 200,
                    message: addinManagerStats
                }
                if (err) {
                    result.status = 500
                    result.message = err
                } else if (!response) {
                    result.status = 404
                    result.message = err
                }
                res.status(result.status).json(result.message)
            })
    },

    /**
     *
     * @param req
     * @param res
     */
    add: function(req, res) {
        Addins
            .create(req.body, function (err, response) {
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
    }
}

module.exports = AddinsService