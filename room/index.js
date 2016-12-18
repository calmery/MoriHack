const express = require( './libs/express' )

const socketIo = require( 'socket.io' ),
      io       = socketIo( express.server )

const debug = console.log

/* *** Socket.io *** */

let room = {},
    member = {},
    roomInfo = {}

io.sockets.on( 'connection', ( socket ) => {
    
    /* *** Helper *** */

    const emit = ( key, content, id ) => {
        io.sockets.to( id ? id : socket.id ).emit( key, content )
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
            member[room[socket.id].roomId].splice( member[room[socket.id].roomId].indexOf( socket.id ), 1 ) 
            if( member[room[socket.id].roomId].length === 0 ){
                delete roomInfo[room[socket.id].roomId]
            }
        }
    } )
    
    /* *** Call System *** */
    
    socket.on( 'callRequest', function( request ){
        var myRoomId = room[socket.id].roomId
        
        var _target, isTarget = false, target
        for( var i=0; i<member[myRoomId].length; i++ ){
            _target = room[member[myRoomId][i]]
            if( request.target === _target.name ){
                isTarget = true
                target = member[myRoomId][i]
                break
            }
        }
        
        if( isTarget ){
            emit( 'callRequest', {
                name: room[socket.id].name,
                peer: request.peer
            }, target )
        } else emitError( 'Not found' )
    } )
    
    
    
    socket.on( 'receivedCallRequest', function( request ){
        var myRoomId = room[socket.id].roomId
        
        var _target, isTarget = false, target
        for( var i=0; i<member[myRoomId].length; i++ ){
            _target = room[member[myRoomId][i]]
            if( request.target === _target.name ){
                isTarget = true
                target = member[myRoomId][i]
                break
            }
        }
        
        if( isTarget ){
            emit( 'receivedCallRequest', {
                name: room[socket.id].name,
                peer: request.peer
            }, target )
        } else emitError( 'Not found' )
    } )
    
    
    
    socket.on( 'cancelledCallRequest', function( request ){
        var myRoomId = room[socket.id].roomId

        var _target, isTarget = false, target
        for( var i=0; i<member[myRoomId].length; i++ ){
            _target = room[member[myRoomId][i]]
            if( request.target === _target.name ){
                isTarget = true
                target = member[myRoomId][i]
                break
            }
        }
        
        if( isTarget ){
            emit( 'cancelledCallRequest', {
                name: room[socket.id].name
            }, target )
        } else emitError( 'Not found' )
    } )
    
    
    
    /* *** Room event *** */

    socket.on( 'createRoom' , function( config ){
        console.log( config )
        if( !member[config.roomId] ){
            member[config.roomId] = []
            roomInfo[config.roomId] = {
                lat: config.position.lat,
                lng: config.position.lng
            }
            debug( 'Room : ' + config.roomId )
            debug( 'Position : ' + config.position.lat + ',' + config.position.lng )
        } else emitError( 'Already exist' )
    } )

    socket.on( 'join', ( config ) => {
        if( member[config.roomId] !== undefined ){
            room[socket.id] = {
                roomId: config.roomId,
                name: config.name
            }
            member[config.roomId].push( socket.id )
            socket.join( config.roomId )
            emit( 'joined', { roomId: config.roomId, position: roomInfo[config.roomId] } )
            debug( 'Joined (' + config.roomId + ') : ' + config.name + '@' + socket.id )
        } else emitError( config.roomId + ' doesn\'t exist' )
    } )
    
    socket.on( 'leave', ( config ) => {
        if( room[socket.id] ){
            socket.leave( room[socket.id].roomId )
            debug( 'Leaved (' + room[socket.id].roomId + ') : ' + room[socket.id].name + '@' + socket.id )
            member[room[socket.id].roomId].splice( member[room[socket.id].roomId].indexOf( socket.id ), 1 ) 
            emit( 'leaved', {} )
            if( member[room[socket.id].roomId].length === 0 ){
                delete roomInfo[room[socket.id].roomId]
            }
            delete room[socket.id]
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