const express = require( './libs/express' )

const socketIo = require( 'socket.io' ),
      io       = socketIo( express.server )

const debug = console.log

/* *** Socket.io *** */

let room = {}

io.sockets.on( 'connection', ( socket ) => {
    
    /* *** Helper *** */

    const emit = ( key, content ) => {
        io.sockets.to( socket.id ).emit( key, content )
    }
    const emitToRoom = ( roomId, key, content ) => {
        io.to( roomId ).emit( key, content )
    }
    const emitError = ( content ) => {
        emit( 'error', content )
    }
    
    /* *** Connect event *** */
    
    debug( 'Connected : ' + socket.id )
    
    socket.on( 'disconnect', () => {
        debug( 'Disconnected : ' + socket.id )
        if( room[socket.id] ){
            socket.leave( room[socket.id].roomId )
            delete room[socket.id]
        }
    } )
    
    /* *** Room event *** */
    
    socket.on( 'join', ( config ) => {
        room[socket.id] = {
            roomId: config.roomId,
            name: config.name
        }
        socket.join( config.roomId )
        emit( 'joined', { roomId: config.roomId } )
        debug( 'Joined (' + config.roomId + ') : ' + config.name + '@' + socket.id )
    } )
    
    socket.on( 'leave', ( config ) => {
        if( room[socket.id] ){
            socket.leave( room[socket.id].roomId )
            debug( 'Leaved (' + room[socket.id].roomId + ') : ' + room[socket.id].name + '@' + socket.id )
            delete room[socket.id]
            emit( 'leaved', {} )
        } else emitError( 'You haven\'t joined.' )
    } )
    
    /* *** Chat event *** */
    
    socket.on( 'message', ( message ) => {
        debug( 'Message from ' + room[socket.id].name + '@' + socket.id + ' to ' + room[socket.id].roomId )
        debug( '| ' + message.replace( /\n/g, '\n| ' ) )
        emitToRoom( room[socket.id].roomId, 'message', {
            from: socket.id,
            name: room[socket.id].name,
            message: message
        } )
    } )

} )