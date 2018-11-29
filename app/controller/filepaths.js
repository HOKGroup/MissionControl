/**
 * Created by konrad.sobon on 2018-08-30.
 */
var mongoose = require('mongoose');
var FilePaths = mongoose.model('FilePaths');

FilePathsService = {
    /**
     *
     * @param req
     * @param res
     */
    add: function(req, res){
        // (Konrad) We are skipping 'projectId' and 'isDisabled' to avoid overriding them
        // every time a file is opened. These are set from the UI in the web.
        FilePaths.updateOne(
            { 'centralPath': req.body.centralPath },
            { $set: {
                'centralPath': req.body.centralPath,
                'revitVersion': req.body.revitVersion,
                'projectNumber': req.body.projectNumber,
                'projectName': req.body.projectName,
                'fileLocation': req.body.fileLocation
            }},
            { upsert: true }, function (err, response){
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
    addMany: function(req, res){
        FilePaths.bulkWrite(
            req.body.map(function (item) {
                return {
                    'updateOne': {
                        filter: { 'centralPath': item.centralPath },
                        update: { $set: {
                            'centralPath': item.centralPath,
                            'projectId': item.projectId
                        }},
                        upsert: true
                    }
                };
            }), function (err, response) {
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
    addToProject: function (req, res) {
        FilePaths.updateOne(
            { 'centralPath': req.body.centralPath },
            { $set: { 'centralPath': req.body.centralPath, 'projectId': req.body.projectId }},
            { upsert: true }, function (err, response) {
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
    removeFromProject: function (req, res) {
        FilePaths.updateOne(
            { 'centralPath': req.body.centralPath },
            { $unset: { 'projectId': '' }}, function (err, response) {
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
    removeManyFromProject: function (req, res) {
        FilePaths.bulkWrite(
            req.body.map(function (item) {
                return {
                    'updateOne': {
                        filter: { 'centralPath': item.centralPath },
                        update: { $unset: {
                            'projectId': ''
                        }}
                    }
                };
            }), function (err, response) {
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
     * Updates File Path of the object. If existing file path was updated to a new file path,
     * that already exist in the model, but that file path is not used in a configuration, that,
     * file path will be removed so that we don't have duplicates. It's not possible to change
     * file path to a new file path that is already used in a Configuration so that will never be
     * an issue.
     * @param req
     * @param res
     */
    changeFilePath: function (req, res) {
        FilePaths.updateOne(
            { 'centralPath': req.body.before },
            { $set: { 'centralPath': req.body.after }}, function (err, response) {
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

                FilePaths.deleteOne(
                    { 'centralPath': req.body.after, 'projectId': null }, function (err, response) {
                        if (err){
                            result.status = 500;
                            result.message = err;
                        } else if (!response){
                            result.status = 404;
                            result.message = err;
                        }
                        res.status(result.status).json(result.message);
                    });
            });
    },

    /**
     *
     * @param req
     * @param res
     */
    getAll: function (req, res) {
        var filter = {};
        if (req.query.unassigned === 'true') {
            filter = { 'projectId': null, 'isDisabled': false };
        }
        FilePaths.find(filter, function (err, response){
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
    findById: function(req, res){
        var id = req.params.id;
        FilePaths.findById(id).exec(function (err, response){
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
     * Removes given file path object from DB.
     * @param req
     * @param res
     */
    disable: function (req, res) {
        var id = mongoose.Types.ObjectId(req.params.id);
        var bool = Boolean(!req.body.isDisabled);
        FilePaths.updateOne(
            { '_id': id },
            { $set: { 'isDisabled': bool }}, function (err, response){
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
     * DataTables allow for server side processing. This method processes
     * File Paths table requests. Request come in following format:
     * {
     *     draw: '1', // used for page redraws. indicates which page to set the table to.
     *     columns: [], // info about columns specified in the table
     *     order: [], // column specific ordering
     *     start: '0' // index for start of data
     *     length: '15', // number of objects to be drawn on the page, end index == start + length
     *     search: {value: '', regex: 'false'} // search criteria
     *     revitVersion: 'All' // string value for version of Revit that this file path was created with
     *     office: {name: 'All', code: ['ATL, NY']} // json object with name and array of codes to match in a query
     *     fileType:
     *     disabled:
     *     unassigned:
     * }
     * @param req
     * @param res
     */
    datatable: function (req, res) {
        // (Konrad) Process filters that can be applied directly to MongoDB search query
        var revitVersion = req.body['revitVersion'];
        var office = req.body['office'];
        var disabled = req.body['disabled'];
        var unassigned = req.body['unassigned'];
        var fileType = req.body['fileType'];
        var query = {};

        // (Konrad) Always check if disabled.
        query['isDisabled'] = disabled !== 'false';

        // (Konrad) Additional filters.
        if (revitVersion !== 'All') query['revitVersion'] = revitVersion;
        if (office['name'] !== 'All') query['fileLocation'] = { $in: office['code'].map(function (i) { return i.toLowerCase(); }) };
        if (unassigned === 'true') query['projectId'] = null;

        // (Konrad) If we use aggregate here, then we can check for values being null. This matters because not
        // all users would have the latest version of the plug-in on Revit side, and some values published to
        // the database could be null.
        FilePaths.aggregate([
            { $match: query },
            { $project: {
                _id: 1,
                centralPath: 1,
                projectId: 1,
                isDisabled: 1,
                revitVersion: { $ifNull: ['$revitVersion', ''] },
                fileLocation: { $ifNull: ['$fileLocation', ''] },
                projectName: { $ifNull: ['$projectName', ''] },
                projectNumber: { $ifNull: ['$projectNumber', ''] }
            }}
        ]).exec(function (err, response){
            var start = parseInt(req.body['start']);
            var length = parseInt(req.body['length']);
            var searched = req.body['search'].value !== '';
            var typeFiltered = fileType !== 'All';
            var order = req.body['order'][0].dir;
            var column = req.body['order'][0].column;

            // (Konrad) By default table is sorted in asc order by centralPath property.
            response.sort(function (a, b) {
                switch(column){
                    case '0': //version
                        if (order === 'asc') return (a.revitVersion).localeCompare(b.revitVersion);
                        else return (b.revitVersion).localeCompare(a.revitVersion);
                    case '1': //office
                        if (order === 'asc') return (a.fileLocation).localeCompare(b.fileLocation);
                        else return (b.fileLocation).localeCompare(a.fileLocation);
                    case '2': //centralPath
                    default:
                        if (order === 'asc') return (a.centralPath).localeCompare(b.centralPath);
                        else return (b.centralPath).localeCompare(a.centralPath);
                }
            });

            // (Konrad) Filter the results collection by search value if one was set.
            var filtered = [];
            if (searched){
                filtered = response.filter(function (item) {
                    return item.centralPath.indexOf(req.body['search'].value) !== -1 ||
                            item.revitVersion.indexOf(req.body['search'].value) !== -1 ||
                            item.fileLocation.indexOf(req.body['search'].value) !== -1;
                });
            }

            // (Dan) Filter the results collection by file type if one was set.
            if (typeFiltered) {
                var dataToFilter = searched ? filtered : response; 
                filtered =  dataToFilter.filter(function(item){
                    var filePath = item.centralPath.toLowerCase();
                    switch(fileType){
                        case 'Local': 
                            return filePath.lastIndexOf('\\\\group\\hok\\', 0) === 0;
                        case 'BIM 360':
                            return filePath.lastIndexOf('bim 360://', 0) === 0;
                        case 'Revit Server':
                            return filePath.lastIndexOf('rsn://', 0) === 0;
                        default: // Do not filter
                            return true;
                    }
                });
            }

            // (Konrad) Update 'end'. It might be that start + length is more than total length
            // of the array so we must adjust that.
            var end = start + length;
            if (end > response.length) end = response.length;
            if ((searched || typeFiltered) && filtered.length < end) end = filtered.length;

            // (Konrad) Slice the final collection by start/end.
            var data;
            if (searched || typeFiltered) data = filtered.slice(start, end);
            else data = response.slice(start, end);

            var result = {
                status: 201,
                message: {
                    draw: req.body['draw'],
                    recordsTotal: response.length,
                    recordsFiltered: filtered.length > 0 ? filtered.length : response.length,
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
        });
    }
};

module.exports = FilePathsService;
