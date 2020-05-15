const TIMER     = require( './timer' );
const LOGGER    = require( './logger' );
const MJPAGE    = require( 'mathjax-node-page' ).mjpage;
const SRE       = require( 'speech-rule-engine' );
      SRE.setupEngine( { locale: 'en', domain: 'mathspeak' } );

module.exports = {

    promisesAll: async ( hash ) => {
        const promises = Object.keys( hash ).map( async key => ( { [ key ]: await hash[ key ] } ) );
        const resolved = await Promise.all( promises );

        return resolved.reduce( ( hash, part ) => ( { ...hash, ...part } ), {} );
    },

    processRequest: async( req, res ) => {

        try {
            var promises = {};

            for ( var key in req.body.html ) {
                req.body.html[ key ] = req.body.html[ key ]
                    .replace( "\\(", "$" )
                    .replace( "\\)", "$" )
                    .replace( "\\[", "$$$$" )
                    .replace( "\\]", "$$$$" );
                promises[ key ] = module.exports.mjpageconversion( req.body.html[ key ], req.body.language );
            }
        } catch ( error ) {
            LOGGER.logfile.log( { level: 'error', message: error } );
            res.status( 500 ).send( {
                html: null,
                timeMS: TIMER.end( req.body.starttime ),
                errorCode: 1,
                errorMsg: 'an error occured in processRequest()'
            } );
            return;
        }

        module.exports.promisesAll( promises ).then( ( result ) => {

            var output = {};

            for ( var i in result ) {
                output[ i ] = { content: result[ i ].content || null, errorMsg: result[ i ].error || null };
            }

            res.status( 201 ).send( {
                html: output,
                timeMS: TIMER.end( req.body.starttime ),
                errorCode: null,
                errorMsg: null
            } );
            return;

        } ).catch( ( error ) => {
            LOGGER.logfile.log( { level: 'error', message: error } );
            res.status( 500 ).send( {
                html: null,
                timeMS: TIMER.end( req.body.starttime ),
                errorCode: 1,
                errorMsg: 'an error occured in processRequest()'
            } );
            return;
        });
    },

    mjpageconversion: async( html, language ) => {

        return new Promise( ( resolve, reject ) => {

            MJPAGE( html, {
                format: [ "TeX" ],
                fragment: true,
                cssInline: false,
                linebreaks: true,
                singleDollars: true,
                speakText: false,
                extensions: 'TeX/mhchem.js, TeX/AMSmath.js, TeX/AMSsymbols.js',
                errorHandler: ( id, wrapperNode, sourceFormula, sourceFormat, errors ) => {
                    reject( errors );
                }
            }, {
                mml: true,
                svg: true
            },
            ( result ) => {
                resolve( { content: result } );
            } )
            .on( 'afterConversion', ( parsedFormula ) => {
                try {
                    if (language == 'de') {
                        SRE.setupEngine( { locale: 'de', domain: 'mathspeak' } );
                    } else {
                        SRE.setupEngine( { locale: 'en', domain: 'mathspeak' } );
                    }

                    var speaktext = SRE.toSpeech( parsedFormula.outputFormula.mml );
                    if ( speaktext ) {
                        parsedFormula.node.innerHTML = 
                        '<p aria-hidden="false" class="sr-only pLatexText">' + speaktext + '</p>' +
                        parsedFormula.outputFormula.svg +
                        '<span class="mathMLFormula" aria-hidden="true">' +  parsedFormula.outputFormula.mml + '</span>';
                    }

                    var title = parsedFormula.node.getElementsByTagName( "title" )[ 0 ];
                    if ( title ) {
                        title.parentNode.removeChild( title );
                    }

                    var svg = parsedFormula.node.getElementsByTagName( "svg" )[ 0 ];
                    if ( svg ) {
                        svg.removeAttribute( 'aria-labelledby' );
                        svg.setAttribute( 'aria-label', 'Latex Formula' );
                        svg.setAttribute( 'aria-hidden', 'true' );
                        svg.style.maxWidth = "100%";
                    }
                } catch ( error ) {
                    reject( [ 'an error occured in afterConversion()' ] );
                }
            } );
        } )
        .catch( ( error ) => {

            if (error instanceof Error) {
                LOGGER.logfile.log( { level: 'error', message: error } );
                error = [ 'an error occured in mjpageconversion()' ];
            }

            return { error: error };
        } );
    }
}