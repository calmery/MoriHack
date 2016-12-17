const path = require( 'path' ),
      fs   = require( 'fs' )

module.exports = {
    
    getAbsolutePath: ( ...args ) => path.resolve( path.join.apply( this, [].slice.call( args ) ) ),
    
    exists: ( filePath ) => {
        try {
            fs.statSync( this.getAbsolutePath( filePath ) )
            return true
        } catch( error ){
            return false
        }
    }
    
}