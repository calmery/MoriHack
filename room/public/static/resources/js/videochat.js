navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia

var localStream,
    connectedCall 

var peer = new Peer( { 
    key: 'b0133f7e-ef15-42fa-ae2a-92771f4d9e85', 
    debug: 3
} )

peer.on( 'open', function(){
    console.log( peer.id )
} )

peer.on( 'call', function( call ){
    console.log( call )
    connectedCall = call
    call.answer( localStream )
    console.log( '\n\n\n\n\n\n\n\n\nasdasd\n\n\n\n\n' )
    call.on( 'stream', function( stream ){
        var url = URL.createObjectURL( stream )
        document.getElementById( 'peerVideo' ).src = url
    } )
} )

navigator.getUserMedia( {
    audio: true, 
    video: true
}, function( stream ){
    console.log( '\n\n\n\n\n\n\n\n\nasdasdasdasd\n\n\n\n\n' )
    localStream = stream
}, function(){ 
    console.log( 'Error' ) 
} )

function startCall( peerId ){
    
    var peer_id = peerId
    var call = peer.call( peer_id, localStream )
    call.on( 'stream', function( stream ){
        console.log( '\n\n\n\n\n\n\n\n\nasdasd\n\n\n\n\n' )
        var url = URL.createObjectURL( stream )
        document.getElementById( 'peerVideo' ).src = url
    } )

}

function endCall(){
    connectedCall.close()
}