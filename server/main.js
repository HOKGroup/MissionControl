//server.json
//
//main entry point for a cloud-based DTM tool database application
//implemented as a node.js
//REST API driven mongoDB web server.
//
//Copyright 2018 by Jinsol Kim, Konrad K Sobon, HOK

require('dotenv').config()

const fs = require('fs')
const http = require('http')
const https = require('https')
const express = require('express')
const session = require('express-session')
const MemoryStore = require('memorystore')(session)
const cool = require('cool-ascii-faces')
const mongoose = require('mongoose')
const { Server } = require('socket.io')
const morgan = require('morgan')
const path = require('path')

const global = require('./controller/socket/global')
const winston = require('./config/winston')
const authRouter = require('./auth/authRoutes')
const isAuthenticated = require('./auth/authMiddleware')

const app = express()
const isProd = process.env.NODE_ENV === 'production'

app.use(session({
    secret: process.env.EXPRESS_SESSION_SECRET,
    store: new MemoryStore({
        checkPeriod: 86400000 // prune expired entries every 24h
    }),
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 86400000,
        httpOnly: false,
        secure: true
    }
}))

mongoose.connect(process.env.DB_HOST)

const db = mongoose.connection
db.on('error', function () {
    const msg = 'unable to connect to database at '
    throw new Error(msg + process.env.DB_HOST)
})

// set logging with morgan
app.use(morgan('combined', { stream: winston.stream }))
app.use(express.json({ limit: '15mb' }))
app.use(express.urlencoded({ extended: true, limit: '15mb' }))

// set the static files location /public/img will be /img for users
app.use(express.static(path.join(__dirname, '../public'), { index: false }))

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')

require('./routes')(app)
app.use('/auth', authRouter)

app.get('/', isAuthenticated, function (_request, response) {
    response.sendFile(path.join(__dirname, '../server/index.html'))
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
    winston.error(`${err.status || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`)

    // render the error page
    res.status(err.status || 500)
    res.render('error')
})

app.set('port', process.env.MC_PORT_HTTP || 8081)
const server = http.createServer(app)
if (isProd) {
    const certificate = fs.readFileSync(`./server/config/${process.env.CERT_FILENAME ?? 'certificate.pfx'}`)
    const key = fs.readFileSync(`./server/config/${process.env.KEY_FILENAME ?? 'certificate.key'}`)
    const credentials = { cert: certificate, key }
    const httpsServer = https.createServer(credentials, app)
    httpsServer.listen(process.env.MC_PORT_HTTPS || 443)
    global.io = new Server(httpsServer, { allowEIO3: true })
} else {
    global.io = new Server(server, { allowEIO3: true })
}

// Drop socet connections, no longer being used
global.io.on('connection', (socket) => {
    socket.disconnect(true)
})
global.io.on('disconnect', (_socket) => {
    console.log('Server socket disconnected!')
})

global.io.on('error', (err) => {
    console.log(err)
})


server.listen(
    app.get('port'),
    () => {
        const version = process.env.npm_package_version
        const port = server.address().port
        console.log(`HOK Mission Control server v${version} listening on port ${port} with hosted mongo db.`)
    }
)
