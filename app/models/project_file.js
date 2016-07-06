var mongoose = require( 'mongoose' );
var Schema = mongoose.Schema;

var projectFileSchema = new Schema(
   { 
    centralPath      : String
  }
);
var ProjectFile = mongoose.model( 'ProjectFile', projectFileSchema );