var mongoose = require( 'mongoose' );
var Configuration = require('./configuration');
var Office = require('./office');
var Schema = mongoose.Schema;

var projectSchema = new Schema(
  { 
    number      : String,
    name        : String,
	office        :String,
	configurations	:[{type:Schema.Types.ObjectId, ref:'Configuration'}]
  }
);

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