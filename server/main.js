//server.json
//
//main entry point for a cloud-based DTM tool database application
//implemented as a node.js
//REST API driven mongoDB web server.
//
//Copyright 2018 by Jinsol Kim, Konrad K Sobon, HOK

require('dotenv').config()

const express = require('express')
const cool = require('cool-ascii-faces')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const { Server } = require('socket.io')
const morgan = require('morgan')
const path = require('path')

const global = require('./controller/socket/global')
const winston = require('./config/winston')

const app = express()

mongoose.connect(process.env.DB_HOST)

const db = mongoose.connection
db.on('error', function () {
    const msg = 'unable to connect to database at '
    throw new Error(msg + process.env.DB_HOST)
})

// set logging with morgan
app.use(morgan('combined', { stream: winston.stream }))
app.use(bodyParser.json({ limit: '15mb' }))
app.use(bodyParser.urlencoded({ extended: true, limit: '15mb' }))

// set the static files location /public/img will be /img for users
app.use(express.static(__dirname + '/public'))

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')

require('./routes')(app)
app.get('/', function (_request, response) {
    response.sendFile('./public/index.html')
})

app.get('/cool', function (_request, response) {
    response.send(cool())
})

// catch 404 and forward to error handler
app.use(function (_req, _res, next) {
    const err = new Error('Not Found')
    err.status = 404
    next(err)
})

// error handler
app.use(function (err, req, res, _next) {
    // set locals, only providing error in development
    res.locals.message = err.message
    res.locals.error = req.app.get('env') === 'development' ? err : {}

    // add this line to include winston logging
    winston.error((err.status || 500) + ' - ' + err.message + ' - ' + req.originalUrl + ' - ' + req.method + ' - ' + req.ip)

    // render the error page
    res.status(err.status || 500)
    res.render('error')
})

app.set('port', process.env.MC_PORT || 8080)

const server = app.listen(
    app.get('port'),
    function () {
        console.log('HOK Mission Control server '
            + process.env.npm_package_version
            + ' listening at port '
            + server.address().port + ' with '
            + 'hosted mongo db.')
        global.io = new Server(server, { allowEIO3: true })
        global.io.on('connection', (socket) => {
            socket.on('room', (room) => {
                socket.join(room)
                console.log('Client has joined the room!')
            })
            socket.once('disconnect', (_client) => {
                console.log('Client has left the room!')
            })
        })
        global.io.on('disconnect', (_socket) => {
            console.log('Server socket disconnected!')
        })

        global.io.on('error', (err) => {
            console.log(err)
        })
    }
)