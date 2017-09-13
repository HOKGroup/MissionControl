var mongoose = require( 'mongoose' );

var projectFileSchema = new mongoose.Schema(
   { 
    centralPath: String
  }
);

var ProjectFile = mongoose.model( 'ProjectFile', projectFileSchema );