const EXPRESS       = require( 'express' );
const APP           = EXPRESS();
const HELMET        = require( 'helmet' );
const BODYPARSER    = require( 'body-parser' );
const TIMEOUT       = require( 'connect-timeout' );

const TIMER         = require( './modules/timer' );
const ACCESSOR      = require( './modules/accessor' );
const PROCESSOR     = require( './modules/processor' );
const VALIDATOR     = require( './modules/validator' );

const mstimeout     = 15000;
// =============================================================
// Middleware layers.
// =============================================================

APP.use( TIMEOUT( mstimeout ) );

APP.use( HELMET() );

APP.use( BODYPARSER.json( { limit: "50mb" } ) );

APP.use( BODYPARSER.urlencoded( {
    limit: "50mb",
    extended: true,
    parameterLimit: 50000
} ) );

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

process.on( 'uncaughtException', ( error ) => {
    console.log( error )
} );

// =============================================================
// App listening to port.
// =============================================================

APP.listen( process.env.PORT || 3000, () => {
    console.log( '===============' );
    console.log( 'Service started' );
    console.log( '===============' );
} );

// =============================================================
// Routes.
// =============================================================

APP.get( '/', TIMER.start, ( req, res ) => {
    req.clearTimeout();
    req.setTimeout( mstimeout );
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

APP.get( '/hello', ( req, res ) => {
    req.clearTimeout();
    req.setTimeout( mstimeout );
    res.status( 200 ).send( 'hello' );
    return;
} );

APP.get( '*', TIMER.start, ( req, res ) => {
    req.clearTimeout();
    req.setTimeout( mstimeout );
    res.status( 404 ).send( {
        html: null,
        timeMS: TIMER.end( req.body.starttime ),
        errorCode: 2,
        errorMsg: 'no such route'
    } );
    return;
} );

APP.post( '/process', TIMER.start, ACCESSOR.verifyApiKey, VALIDATOR.validate, ( req, res ) => {
    req.clearTimeout();
    req.setTimeout( mstimeout );
    PROCESSOR.processRequest( req, res );
    return;
} );

APP.post( '*', TIMER.start, ( req, res ) => {
    req.clearTimeout();
    req.setTimeout( mstimeout );
    res.status( 404 ).send( {
        html: null,
        timeMS: TIMER.end( req.body.starttime ),
        errorCode: 2,
        errorMsg: 'no such route'
    } );
    return;
} );