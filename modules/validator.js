const TIMER = require( './timer' );
const LOGGER = require( './logger' );

module.exports = {

    validate: async( req, res, next ) => {
        try {
            if ( !req.body ) {
                res.status( 400 ).send( {
                    html: null,
                    timeMS: TIMER.end( req.body.starttime ),
                    errorCode: 2,
                    errorMsg: 'request has no body'
                } );
                return;
            }

            if ( !req.body.language ) {
                res.status( 400 ).send( {
                    html: null,
                    timeMS: TIMER.end( req.body.starttime ),
                    errorCode: 2,
                    errorMsg: 'request has no language attribute and/or value in body'
                } );
                return;
            }

            if ( ![ 'de', 'en' ].includes( req.body.language ) ) {
                res.status( 400 ).send( {
                    html: null,
                    timeMS: TIMER.end( req.body.starttime ),
                    errorCode: 2,
                    errorMsg: 'selected language is not valid'
                } );
                return;
            }

            if ( !req.body.html ) {
                res.status( 400 ).send( {
                    html: null,
                    timeMS: TIMER.end( req.body.starttime ),
                    errorCode: 2,
                    errorMsg: 'request has no html attribute and/or value in body'
                } );
                return;
            }

            if ( req.body.html.length == 0 ) {
                res.status( 400 ).send( {
                    html: null,
                    timeMS: TIMER.end( req.body.starttime ),
                    errorCode: 2,
                    errorMsg: 'request html value is empty'
                } );
                return;
            }

            next();
            return;

        } catch ( error ) {
            LOGGER.logfile.log( { level: 'error', message: error } );
            res.status( 500 ).send( {
                html: null,
                timeMS: TIMER.end( req.body.starttime ),
                errorCode: 2,
                errorMsg: 'an error occured during validation'
            } );
            return;
        }
    }
}