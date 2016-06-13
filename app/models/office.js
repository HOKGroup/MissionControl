var mongoose = require( 'mongoose' );
var Schema = mongoose.Schema;

var officeSchema = new Schema(
  { 
    _id      : String, /*abbreviation*/
    name        : String, /*full location*/
	img        : Buffer
  }
);

var Office = mongoose.model( 'Office', officeSchema );
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