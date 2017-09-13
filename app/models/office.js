var mongoose = require( 'mongoose' );

var officeSchema = new mongoose.Schema(
  { 
    _id: String, /*abbreviation*/
    name: String, /*full location*/
	img: Buffer
  }
);

var Office = mongoose.model( 'Office', officeSchema );