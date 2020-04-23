const TIMER     = require( './timer' );
const MJPAGE    = require( 'mathjax-node-page' ).mjpage;
const SRE       = require( 'speech-rule-engine' );
      SRE.setupEngine( { locale: 'en', domain: 'mathspeak' } );

module.exports = {

    processRequest: async( req, res ) => {
        try {
            var promises = [];

            for ( var key in req.body.html ) {
                req.body.html[ key ] = req.body.html[ key ]
                    .replace( "\\(", "$" )
                    .replace( "\\)", "$" )
                    .replace( "\\[", "$$$$" )
                    .replace( "\\]", "$$$$" );

                promises.push( module.exports.mjpageconversion( req.body.html[ key ], req.body.language, key ) );
            }

            Promise.all(promises).then( ( result ) => {

                var output = req.body.html;

                for ( var key in output ) {
                    output[key] = { content: null, errorMsg: null };
                }

                for ( var i in result ) {
                    output[ result[i].key ] = { content: result[i].content || null, errorMsg: result[i].error || null };
                }

                res.status( 201 ).send( {
                    html: output,
                    timeMS: TIMER.end( req.body.starttime ),
                    errorCode: null,
                    errorMsg: null
                } );

                return;
            })
            .catch( ( error ) => {
                res.status( 500 ).send( {
                    html: null,
                    timeMS: TIMER.end( req.body.starttime ),
                    errorCode: 1,
                    errorMsg: 'an error occured in mjpageconversion()'
                } );

                return;
            } ) ;

        } catch ( error ) {
            console.log( error );
            res.status( 500 ).send( {
                html: null,
                timeMS: TIMER.end( req.body.starttime ),
                errorCode: 1,
                errorMsg: 'an error occured in processRequest()'
            } );
            return;
        }
    },

    mjpageconversion: async( html, language, key ) => {

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
                resolve( {
                    key: key,
                    content: result,
                    error: null
                } );
            } )
            .on( 'afterConversion', function( parsedFormula ) {

                try {
                    if (language == 'en') {
                        SRE.setupEngine( { locale: 'en', domain: 'mathspeak' } );
                    } else {
                        SRE.setupEngine( { locale: 'de', domain: 'mathspeak' } );
                    }

                    parsedFormula.node.innerHTML = '<p aria-hidden="false" class="sr-only pLatexText"> ' +
                                                    SRE.toSpeech( parsedFormula.outputFormula.mml ) +
                                                    '</p>' +
                                                    parsedFormula.outputFormula.svg +
                                                    '<span class="mathMLFormula" aria-hidden="true">' +
                                                    parsedFormula.outputFormula.mml +
                                                    '</span>';

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
                    reject( 'SVG rendered but an error occured during "afterConversion"' )
                }
            } );
        } )
        .catch( ( error ) => {
            return {
                key: key,
                content: null,
                error: error
            };
        } );
    }
}