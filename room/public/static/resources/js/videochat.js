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
    connectedCall = call
    call.answer( localStream )
    call.on( 'stream', function( stream ){
        var url = URL.createObjectURL( stream )
        document.getElementById( 'peerVideo' ).src = url
        document.getElementById( 'peerVideo' ).style.display = 'block'
    } )
} )

var callStart, callEnd
onload = function(){

    navigator.getUserMedia( {
        audio: true, 
        video: true
    }, function( stream ){
        localStream = stream
        // var url = URL.createObjectURL( stream )
        // document.getElementById( 'my-video' ).src = url
    }, function(){ 
        console.log( 'Error' ) 
    } )

    callStart = function( peerId ){
        var peer_id = peerId
        var call = peer.call( peer_id, localStream )
        call.on( 'stream', function( stream ){
            var url = URL.createObjectURL( stream )
            document.getElementById( 'peerVideo' ).src = url
            document.getElementById( 'peerVideo' ).style.display = 'block'
        } )
    }

    callEnd = function(){
        connectedCall.close()
        document.getElementById( 'callArea' ).style.display = 'none'
        document.getElementById( 'peerVideo' ).style.display = 'none'
    }
}