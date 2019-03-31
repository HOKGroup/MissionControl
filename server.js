//server.json
//
//main entry point for a cloud-based DTM tool database application
//implemented as a node.js
//REST API driven mongoDB web server.
//
//Copyright 2018 by Jinsol Kim, Konrad K Sobon, Alberto Tono HOK

var pkg = require('./package.json');
var cool = require('cool-ascii-faces');
var express = require('express');
var mongoose = require( 'mongoose' );
var bodyParser = require( 'body-parser' );
var methodOverride = require('method-override');
var io = require('socket.io');
var global = require('./app/controller/socket/global');
var morgan = require('morgan');
var winston = require('./config/winston');
var path = require('path');
var app = express();

var mongo_uri = 'mongodb://localhost:27017/missioncontrol';
mongoose.connect(mongo_uri, { useNewUrlParser: true });
mongoose.set('useCreateIndex', true);

var db = mongoose.connection;
db.on( 'error', function () {
  var msg = 'unable to connect to database at ';
  throw new Error( msg + mongo_uri );
});

// set logging with morgan
app.use(morgan('combined', { stream: winston.stream }));
app.use(bodyParser.json({ limit: '15mb' }) );
app.use(bodyParser.urlencoded({ extended: true, limit: '15mb' }) );
app.use(methodOverride('X-HTTP-Method-Override')); 

// set the static files location /public/img will be /img for users
app.use(express.static(__dirname + '/public'));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

require('./app/routes')(app);
app.get('/', function( request, response ) {
  response.sendfile('./public/index.html');
});

app.get('/cool', function(request, response) {
  response.send(cool());
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // add this line to include winston logging
    winston.error((err.status || 500) + ' - ' + err.message + ' - ' + req.originalUrl + ' - ' + req.method + ' - ' + req.ip);

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

app.set('port', process.env.PORT || 8080 );

var server = app.listen(
    app.get('port'),
    function() {
        console.log( 'HOK Mission Control server '
                + pkg.version
                + ' listening at port '
                + server.address().port + ' with '
                + 'hosted mongo db.');
        global.io = io(server);
        global.io.on('connection', function (socket) {
            socket.on('room', function (room) {
                socket.join(room);
                console.log('Client has joined the room!');
            });
            socket.once('disconnect', function (client) {
                console.log('Client has left the room!');
            });
        });
        global.io.on('disconnect', function (socket) {
            console.log('Server socket disconnected!');
        });

      global.io.on('error', function (err) {
          console.log(err);
      });
  }
);