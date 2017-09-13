//server.json
//
//main entry point for a cloud-based DTM tool database application
//implemented as a node.js
//REST API driven mongoDB web server.
//
//Copyright 2017 by Jinsol Kim, Konrad K Sobon, HOK

//node app uri = http://localhost/80

var pkg = require('./package.json');
var cool = require('cool-ascii-faces');
var express = require('express');
var mongoose = require( 'mongoose' );
var bodyParser = require( 'body-parser' );
var methodOverride = require('method-override');
var io = require('socket.io');
var global = require('./app/controller/socket/global');


var app = express();

var localMongo = true;

if(localMongo){
	//local database
	var mongo_uri = 'mongodb://localhost:27017/missioncontrol';
} else{
	var mongo_uri='mongodb://admin:admin@ds011495.mlab.com:11495/missioncontrol';
}

mongoose.connect(mongo_uri);
var db = mongoose.connection;
db.on( 'error', function () {
  var msg = 'unable to connect to database at ';
  throw new Error( msg + mongo_uri );
});

app.use( bodyParser.json({ limit: '15mb' }) );
app.use( bodyParser.urlencoded({ extended: true, limit: '15mb' }) );
app.use(methodOverride('X-HTTP-Method-Override')); 

// set the static files location /public/img will be /img for users
app.use(express.static(__dirname + '/public')); 

require('./app/routes')(app);

app.get( '/', function( request, response ) {
  response.sendfile('./public/index.html');
});

app.get('/cool', function(request, response) {
  response.send(cool());
});

app.set( 'port', process.env.PORT || 8080 );

var server = app.listen(
  app.get( 'port' ),
  function() {
    console.log( 'HOK Mission Control server '
                + pkg.version
                + ' listening at port '
                + server.address().port + ' with '
                + 'hosted mongo db.'); 
				
	global.io = io(server);

    global.io.on('connection', function(client){
      console.log('a client connected to the socket');
    });	
}
);


