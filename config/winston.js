/**
 * Created by konrad.sobon on 2018-10-03.
 */
var winston = require('winston');
var appRoot = require('app-root-path');
require('winston-daily-rotate-file');

var options = {
    // file: {
    //     level: 'info',
    //     filename: appRoot + '/logs/app.log',
    //     handleExceptions: true,
    //     json: true,
    //     maxsize: 5242880, // 5MB
    //     maxFiles: 5,
    //     colorize: false
    // },
    console: {
        format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
        ),
        level: 'debug',
        handleExceptions: true,
        json: false
    },
    rotate: {
        level: 'info',
        name: 'file',
        datePattern: 'YYYY-MM-DD-THH',
        filename: appRoot + '/logs/app.log',
        format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json()
        )
    }
};

var logger = winston.createLogger({
    transports: [
        new winston.transports.DailyRotateFile(options.rotate),
        new winston.transports.Console(options.console)
        // new winston.transports.File(options.file)
    ],
    exitOnError: false
});

logger.stream = {
    write: function(message, encoding){
        logger.info(message);
    }
};

module.exports = logger;