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
},{ _id: false });

var addressSchema = new mongoose.Schema({
    formattedAddress: { type: String, default: '' },
    street1: { type: String, default: '' },
    street2: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    country: { type: String, default: '' },
    zipCode: { type: String, default: '' },
    placeId: { type: String, default: '' }
}, { _id: false });

var projectSchema = new mongoose.Schema({
        number: String,
        name: String,
        office: String,
        address: {type: addressSchema, default: function () {
            return {
                formattedAddress: '',
                street1: '',
                street2: '',
                city: '',
                state: '',
                country: '',
                zipCode: '',
                placeId: ''
            };
        }},
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