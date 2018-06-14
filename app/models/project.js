var mongoose = require( 'mongoose' );
var Configuration = require('./configuration');

var geoSchema = new mongoose.Schema({
    type:{
        type: String,
        required: true,
        enum: ['Point', 'MultiPoint', 'LineString', 'MultiLineString', 'Polygon', 'MultiPolygon']
    },
    coordinates:{
        type: Array
    }
},{_id: false});

var projectSchema = new mongoose.Schema({
        number: String,
        name: String,
        office: String,
        address:{
            formattedAddress: String,
            street1: String,
            street2: String,
            city: String,
            state: String,
            country: String,
            zipCode: String,
            placeId: String //google place ID
        },
        geoLocation: geoSchema, //type point
        geoPolygon: geoSchema, //type MultiPolygon
        configurations: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Configuration' }],
        triggerRecords: [{ type: mongoose.Schema.Types.ObjectId }],
        sheets: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Sheets' }],
        modelStats: [{ type: mongoose.Schema.Types.ObjectId }],
        linkStats: [{ type: mongoose.Schema.Types.ObjectId }],
        styleStats: [{ type: mongoose.Schema.Types.ObjectId }],
        familyStats: [{ type: mongoose.Schema.Types.ObjectId }],
        worksetStats: [{ type: mongoose.Schema.Types.ObjectId }],
        viewStats: [{ type: mongoose.Schema.Types.ObjectId }],
        groupStats: [{ type: mongoose.Schema.Types.ObjectId }]
    },
    {
        timestamps: true
    });

projectSchema.index({ geoLocation: '2dsphere'});
projectSchema.index({ geoPolygon: '2dsphere'});
var Project = mongoose.model( 'Project', projectSchema );