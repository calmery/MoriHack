const express = require( 'express' ),
      http    = require( 'http' ),
      fs      = require( 'fs' ),
      ejs     = require( 'ejs' )

const common = require( './common' )

const app    = express(),
      server = http.Server( app )

app.use( express.static( common.getAbsolutePath( __dirname, '../public/static' ) ) )

/***** Routing *****/

const sendResponse = ( request, response, staticTemplatePath ) => {
    var template = fs.readFileSync( common.getAbsolutePath( __dirname, '..', 'public', 
            staticTemplatePath ? staticTemplatePath : ( request._parsedOriginalUrl.href + '.ejs' ) 
        ), 'utf-8' )
    
    response.writeHead( 200, { 'Content-Type': 'text/html' } )
    response.write( ejs.render( template, {} ) )
    response.end()
}

let routes = {
    
    '/': ( request, response ) => {
        sendResponse( request, response, 'index.ejs' )
    }
    
}

for( var route in routes )
    app.get( route, routes[route] )

/***** Run *****/

server.listen( 3000 )

/***** Export *****/

module.exports.server = server