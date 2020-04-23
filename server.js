const EXPRESS       = require( 'express' );
const APP           = EXPRESS();
const HTTP          = require( 'http' ).Server( APP );
const HELMET        = require( 'helmet' );
const BODYPARSER    = require( 'body-parser' );

const TIMER         = require( './modules/timer' );
const ACCESSOR      = require( './modules/accessor' );
const PROCESSOR     = require( './modules/processor' );
const VALIDATOR     = require( './modules/validator' );

APP.use( HELMET() );
APP.use( BODYPARSER.json( { limit: "50mb" } ) );
APP.use( BODYPARSER.urlencoded( {
    limit: "50mb",
    extended: true,
    parameterLimit: 50000 } ) );

HTTP.listen( process.env.PORT || 3000, () => {
    console.log( '===============' );
    console.log( 'Service started' );
    console.log( '===============' );
} );

process.on( 'uncaughtException', ( error ) => {
    console.log( error )
} );

// =============================================================
// Routing.
// =============================================================

APP.use( ( error, req, res, next ) => {
    if ( error instanceof SyntaxError ) {
        res.status( 400 ).send( {
            html: null,
            errorCode: 2,
            errorMsg: 'Request includes invalid JSON syntax'
        } );
        return;
    } else {
        next();
    }
} );

APP.get( '/', TIMER.start, ( req, res ) => {
    res.status( 200 ).send( {
        timeMS: TIMER.end( req.body.starttime ),
        routes: [
            '/process',
            '/hello'
        ],
        errorCode: null,
        errorMsg: null
    } );
    return;
} );

APP.get( '/hello', ( _req, res ) => {
    res.status( 200 ).send( 'hello' );
    return;
} );

APP.get( '*', TIMER.start, ( req, res ) => {
    res.status( 404 ).send( {
        html: null,
        timeMS: TIMER.end( req.body.starttime ),
        errorCode: 2,
        errorMsg: 'no such route'
    } );
    return;
} );

APP.post( '/process', TIMER.start, ACCESSOR.verifyApiKey, VALIDATOR.validate, ( req, res ) => {
    PROCESSOR.processRequest( req, res );
    return;
} );

APP.post( '*', TIMER.start, ( req, res ) => {
    res.status( 404 ).send( {
        html: null,
        timeMS: TIMER.end( req.body.starttime ),
        errorCode: 2,
        errorMsg: 'no such route'
    } );
    return;
} );
