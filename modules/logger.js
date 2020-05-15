const { createLogger, format, transports } = require('winston');
const { combine, timestamp, simple } = format;

module.exports = {

    logfile: createLogger( {
        level: 'info',
        format: combine(
            timestamp( { format: 'YYYY-MM-DD HH:mm:ss' } ),
            simple(),
        ),
        defaultMeta: { service: 'user-service' },
        transports: [
            new transports.File( { filename: 'logs/error.log', level: 'error' } ),
            new transports.File( { filename: 'logs/combined.log', timestamp: true } )
        ]
    } )
}