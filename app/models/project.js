var mongoose = require( 'mongoose' );
var Configuration = require('./configuration');
var Office = require('./office');
var Schema = mongoose.Schema;

//var geoSchema = new Schema({ loc: { type: [Number], index: '2dsphere'}});
var geoSchema = new Schema({
	type:{
		type:String,
		required: true,
		enum:['Point', 'MultiPoint', 'LineString', 'MultiLineString', 'Polygon', 'MultiPolygon']
	}, 
	coordinates:{
		type:Array
	}
},{_id:false});

var projectSchema = new Schema(
  { 
    number      : String,
    name        : String,
	office        :String,
	address: {
		formattedAddress: String,
		street1:String,
		street2:String,
		city:String,
		state:String,
		country:String,
		zipCode:String,
		placeId:String, //google place ID
		//geoLocation:{ type:geoSchema }, //type point
		//geoPolygon:{ type:geoSchema } //type polygon
	},
	geoLocation:geoSchema, //type point
	geoPolygon:geoSchema, //type MultiPolygon
	configurations	:[{type:Schema.Types.ObjectId, ref:'Configuration'}]
  }
);
projectSchema.index({geoLocation:'2dsphere'});
projectSchema.index({geoPolygon:'2dsphere'});


var Project = mongoose.model( 'Project', projectSchema );
/*
var project = new Project({
	number:'00.00000.00',
	name: 'test project',
	office:'NY'
});

project.save(function(error){
	if(error)
	{
		console.log(error);
	}
});
*/