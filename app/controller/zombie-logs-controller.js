/**
 * Created by konrad.sobon on 2018-07-27.
 */
var mongoose = require('mongoose');
var ZombieLogs = mongoose.model('ZombieLogs');

ZombieLogsService = {
   /**
     * Extracts machine number from full machine name.
     * @param machine
     * @returns {*}
     */
    parseMachine: function(machine) {
        if(!machine) {
            return 'N/A';
        }

        var parts = machine.split('-');
        if(parts.length > 2) {
            return parts[1] + '-' + parts[2];
        }
        else {
            return parts[1];
        }
    },

    /**
     * Extracts location from machine name.
     * @param machine
     * @returns {string}
     */
    parseLocation: function(machine) {
        if(!machine) {
            return 'N/A';
        }

        var parts = machine.split('-');
        return parts[0];
    },

    /**
     * Creates a Log entry for ZombieService.
     * @param req
     * @param res
     */
    add: function(req, res){
        ZombieLogs
            .create(req.body, function (err, response){
                var result = {
                    status: 201,
                    message: response
                };
                if (err){
                    result.status = 500;
                    result.message = err;
                } else if (!response){
                    result.status = 404;
                    result.message = err;
                }
                res.status(result.status).json(result.message);
            });
    },

    /**
     *
     * @param req
     * @param res
     */
    get : function(req, res){
        ZombieLogs
            .find({})
            .sort({'_id': -1})
            .limit(500)
            .exec(function (err, response){
                var result = {
                    status: 200,
                    message: response
                };
                if (err){
                    result.status = 500;
                    result.message = err;
                } else if (!response){
                    result.status = 404;
                    result.message = err;
                }
                res.status(result.status).json(result.message);
            });
    },

    /**
     *
     * @param req
     * @param res
     */
    getByDate : function(req, res){
        var from = new Date(req.body.from);
        var to = new Date(req.body.to);
        var office = req.body.office;
        if (office.name === 'All'){
            ZombieLogs
                .find(
                    {'createdAt': {'$gte': from, '$lte': to}}
                )
                .exec(function (err, response){
                    var result = {
                        status: 201,
                        message: response
                    };
                    if (err){
                        result.status = 500;
                        result.message = err;
                    } else if (!response){
                        result.status = 404;
                        result.message = err;
                    }
                    res.status(result.status).json(result.message);
                });
        } else {
            var regex = [];
            office.code.forEach(function (item) {
                var ex = new RegExp('^' + item, 'i');
                regex.push(ex);
            });
            ZombieLogs
                .find(
                    {'createdAt': {'$gte': from, '$lte': to}, 'machine': {'$in': regex}}
                )
                .exec(function (err, response){
                    var result = {
                        status: 201,
                        message: response
                    };
                    if (err){
                        result.status = 500;
                        result.message = err;
                    } else if (!response){
                        result.status = 404;
                        result.message = err;
                    }
                    res.status(result.status).json(result.message);
                });
        }
    },

    datatable: function(req, res){
        var from = new Date(req.body.from);
        var to = new Date(req.body.to);
        var query = {'createdAt': {'$gte': from, '$lte': to}};
        var office = req.body.office;
        if (office.name !== 'All') {
            var regex = [];
            office.code.forEach(function (item) {
                var ex = new RegExp('^' + item, 'i');
                regex.push(ex);
            });
            query['machine'] = {'$in': regex };
        }
        var start = parseInt(req.body['start']);
        var length = parseInt(req.body['length']);
        var searched = req.body['search'].value !== '';
        var order = req.body['order'][0].dir;
        var column = req.body['order'][0].column;
        var totalRecords = 0;
        var filteredRecords = 0;
        var totalPromise = ZombieLogs.count({}, function (err, response) {
            totalRecords = response;
        });
        var filteredPromise = ZombieLogs.countDocuments(query, function (err, response) {
            filteredRecords = response;
        });
        Promise.all([totalPromise, filteredPromise]).then(function(values){
            ZombieLogs.find(query, function (err, response) {
                // (Dan) Add office field, parsed from machine name
                response.forEach(function(item) {
                    var location = item.machine === undefined ? 'N/A' : item.machine.split('-')[0];
                    item['office'] = location;
                });
                // (Dan) By default table is sorted in asc order by DateTime property.
                response.sort(function (a, b) {
                    switch(column){
                        case '0': // dateTime
                        default:
                            if (order === 'asc') return a.createdAt - b.createdAt;
                            else return b.createdAt - a.createdAt;
                        case '1': //office
                            if (order === 'asc') return (a.office).localeCompare(b.office);
                            else return (b.office).localeCompare(a.office);
                        case '2': //machine
                            if (order === 'asc') return (a.machine).localeCompare(b.machine);
                            else return (b.machine).localeCompare(a.machine);
                    }
                });

                // (Konrad) Filter the results collection by search value if one was set.
                var filtered = [];
                if (searched){
                    filtered = response.filter(function (item) {
                        return item.message.indexOf(req.body['search'].value) !== -1 ||
                            item.machine.indexOf(req.body['search'].value) !== -1 ||
                            item.office.indexOf(req.body['search'].value) !== -1;
                    });
                }

                // (Konrad) Update 'end'. It might be that start + length is more than total length
                // of the array so we must adjust that.
                var end = start + length;
                if (end > response.length) end = response.length;
                if(searched && filtered.length < end) end = filtered.length;

                // (Konrad) Slice the final collection by start/end.
                var data = searched ? filtered : response;
                // if (searched) data = filtered.slice(start, end);
                // else data = response.slice(start, end);
                var result = {
                    status: 201,
                    message: {
                        draw: req.body['draw'],
                        recordsTotal: totalRecords,
                        recordsFiltered: filteredRecords,
                        data: data
                    }
                };
                if (err){
                    result.status = 500;
                    result.message = err;
                } else if (!response){
                    result.status = 404;
                    result.message = err;
                }
                res.status(result.status).json(result.message);

            }).skip(parseInt(req.body.start)).limit(parseInt(req.body.length));
        });
    },




};

module.exports = ZombieLogsService;