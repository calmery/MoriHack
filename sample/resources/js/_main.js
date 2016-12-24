/* ----- ThreeJS Settings ----- */

THREE.ImageUtils.crossOrigin = '*'

/* ----- Scene ----- */

var scene = new THREE.Scene()

/* ----- Renderer ----- */

var renderer = new THREE.WebGLRenderer( { alpha: true } )
renderer.setSize( window.innerWidth, window.innerHeight )
document.getElementById( 'container' ).appendChild( renderer.domElement )

/* ----- Camera ----- */

camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 40 * 1000 )
camera.position.set( -50, -50, -500 )

/* ----- Add to scene ----- */

scene.add( camera )

/* ----- Ground ----- */

var targetTile = createCoordinate( 32.21612, 130.753719 ) // 32.830532, 130.696494 )

var difference = ( function( targetTile ){
    
    var tileToLatLon = function( tx, ty, zoom ){
        var numOfTiles = Math.pow( 2, zoom ),
            x = tx / numOfTiles,
            y = ty / numOfTiles,
            lon = ( x - ( 1 / 2 ) ) / ( 1 / 360 ),
            latRadians = ( y - ( 1 / 2 ) ) / - ( 1 / ( 2 * Math.PI ) ),
            lat = ( 2 * Math.atan( Math.exp( latRadians ) ) - Math.PI / 2 ) / Math.PI * 180
        return [lat, lon]
    }
    
    var latLon = tileToLatLon( targetTile.tileCoordinate.x, targetTile.tileCoordinate.y, targetTile.tileCoordinate.z ),
        tile = createCoordinate( latLon[0], latLon[1] )

    return {
        x: targetTile.pixelCoordinate.x - tile.pixelCoordinate.x,
        y: targetTile.pixelCoordinate.y - tile.pixelCoordinate.y
    }

} )( targetTile )





var essentialTile = ( function( targetTile, difference ){

    let tx = targetTile.tileCoordinate.x,
        ty = targetTile.tileCoordinate.y

    let tiles = [ [], [] ],
        differenceFromBase = {}

    // A
    if( difference.x <= 128 && difference.y <= 128 ){

        tiles[0][0] = { x: -1, y: -1 }
        tiles[0][1] = { x:  0, y: -1 }
        tiles[1][0] = { x: -1, y:  0 }
        tiles[1][1] = { x:  0, y:  0 }
        
        differenceFromBase.x = 256 + difference.x
        differenceFromBase.y = 256 + difference.y

        // B
    } else if( difference.x > 128 && difference.y <= 128 ){

        tiles[0][0] = { x:  0, y: -1 }
        tiles[0][1] = { x:  1, y: -1 }
        tiles[1][0] = { x:  0, y:  0 }
        tiles[1][1] = { x:  1, y:  0 }
        
        differenceFromBase.x = difference.x
        differenceFromBase.y = 256 + difference.y

        // C
    } else if( difference.x <= 128 && difference.y > 128 ){

        tiles[0][0] = { x: -1, y:  0 }
        tiles[0][1] = { x:  0, y:  0 }
        tiles[1][0] = { x: -1, y:  1 }
        tiles[1][1] = { x:  0, y:  1 }
        
        differenceFromBase.x = 256 + difference.x
        differenceFromBase.y = difference.y

        // D
    } else if( difference.x > 128 && difference.y > 128 ){

        tiles[0][0] = { x:  0, y:  0 }
        tiles[0][1] = { x:  1, y:  0 }
        tiles[1][0] = { x:  0, y:  1 }
        tiles[1][1] = { x:  1, y:  1 }
        
        differenceFromBase.x = difference.x
        differenceFromBase.y = difference.y

    }

    return {
        tiles: tiles,
        difference: differenceFromBase
    }

} )( targetTile, difference )

var createUrl = function( tileObj ){
    var t = targetTile.tileCoordinate
    return 'http://cyberjapandata.gsi.go.jp/xyz/dem/14/' + ( t.x + tileObj.x ) + '/' + ( t.y + tileObj.y ) + '.txt'
}


var t = targetTile.tileCoordinate
var texture = [ [], [] ]

for( var y=0; y<2; y++ ){
    for( var x=0; x<2; x++ ){
        texture[y][x] = 'http://cyberjapandata.gsi.go.jp/xyz/relief/14/' + ( t.x + essentialTile.tiles[y][x].x ) + '/' + ( t.y + essentialTile.tiles[y][x].y ) + '.png'
    }
}

window.onload = function(){
    
    // 92 111 201
    var canvas = document.getElementById('image')
    canvas.width = 512
    canvas.height = 512

    var ctx = canvas.getContext('2d')

    var img0 = new Image()
    var img1 = new Image()
    var img2 = new Image()
    var img3 = new Image()

    img0.setAttribute('crossOrigin', 'anonymous');
    img1.setAttribute('crossOrigin', 'anonymous');
    img2.setAttribute('crossOrigin', 'anonymous');
    img3.setAttribute('crossOrigin', 'anonymous');

    img0.src = texture[0][0]
    img1.src = texture[0][1]
    img2.src = texture[1][0]
    img3.src = texture[1][1]

    img0.onload = function(){ ctx.drawImage(img0, 0, 0) }
    img1.onload = function(){ ctx.drawImage(img1, 256, 0) }
    img2.onload = function(){ ctx.drawImage(img2, 0, 256) }
    img3.onload = function(){ ctx.drawImage(img3, 256, 256) }

    var canvas2 = document.getElementById('back')
    canvas2.width = 256
    canvas2.height = 256

    var ctx2 = canvas2.getContext('2d')

    var png, img
    setTimeout( function(){
        png = canvas.toDataURL()
        img = new Image()
        img.src = png
        img.onload = function(){
            //64 83 256
            ctx2.drawImage( img, 64, 83, 256, 256, 0, 0, 256, 256 )
            
            var image = document.createElement( 'img' );
            image.src = canvas2.toDataURL();
            
            $.when(

                $.get( createUrl( essentialTile.tiles[0][0] ) ),
                $.get( createUrl( essentialTile.tiles[0][1] ) ),
                $.get( createUrl( essentialTile.tiles[1][0] ) ),
                $.get( createUrl( essentialTile.tiles[1][1] ) )

            ).done( function( t1, t2, t3, t4 ){


                var args = [].slice.call( arguments )

                for( var i=0; i<args.length; i++ ){
                    args[i] = args[i][0]
                    args[i] = args[i].substring( 0, args[i].length-1 ).split( '\n' ).map( function( row ){
                        return row.split( ',' ).map( function( height ){
                            return parseFloat( height ) || -1
                        } )
                    } )
                }

                var tileData = [ 
                    [ args[0], args[1] ],
                    [ args[2], args[3] ]
                ]

                var tile = []

                for( var i=0; i<2; i++ ){
                    for( var y=0; y<256; y++ )
                        tile.push( tileData[i][0][y].concat( tileData[i][1][y] ) )
                        }

                var sliceStartX = essentialTile.difference.x - 127,
                    sliceStartY = essentialTile.difference.y - 127

                var sliceWidth = 256

                console.log( sliceStartX, sliceStartY, sliceWidth )

                var finalTile = []
                for( var y=sliceStartY; y<sliceStartY+sliceWidth; y++ ){
                    finalTile.push( tile[y].slice( sliceStartX, sliceStartX + sliceWidth ) )
                }

                tile = finalTile


                var geometry = new THREE.BoxGeometry( 1, 1, 1000 )
                var material = new THREE.MeshLambertMaterial( { color: 0xffffff } )
                var cube = new THREE.Mesh( geometry, material )
                cube.position.set( 256/2, 256/2, -20 )
                scene.add( cube )


                var animate,
                    controls = new THREE.TrackballControls( camera, renderer.domElement ),
                    xLength = tile[0].length,
                    yLength = tile.length

                var geometry = new THREE.PlaneGeometry( 0, 0, xLength-1, yLength-1 )
                for( var y=0; y<yLength; y++ ){
                    for( var x=0; x<xLength; x++ ){
                        geometry.vertices[x + (y * xLength)] = {
                            x: x,
                            y: y,
                            z: tile[y][x]
                        }
                    }
                }

             
                    ground = new THREE.Mesh( geometry, new THREE.MeshBasicMaterial(  ) )

                    ground.scale.z = -1
                    ground.rotation.x = 0 * Math.PI / 180
                    ground.position.set( 0, 0, 0 )
                    
                    ground.material.map = new THREE.Texture( image );
                ground.material.map.needsUpdate = true;

                    scene.add( ground )
                

                requestAnimationFrame( animate = function(){
                    requestAnimationFrame( animate )
                    controls.update()
                    return renderer.render( scene, camera )
                } )





            } )
            
            
        }
    }, 1000 )
    
    
    
}


/*
$.when(
    
    $.get( createUrl( essentialTile.tiles[0][0] ) ),
    $.get( createUrl( essentialTile.tiles[0][1] ) ),
    $.get( createUrl( essentialTile.tiles[1][0] ) ),
    $.get( createUrl( essentialTile.tiles[1][1] ) )
    
).done( function( t1, t2, t3, t4 ){
    
    
    var args = [].slice.call( arguments )
    
    for( var i=0; i<args.length; i++ ){
        args[i] = args[i][0]
        args[i] = args[i].substring( 0, args[i].length-1 ).split( '\n' ).map( function( row ){
            return row.split( ',' ).map( function( height ){
                return parseFloat( height ) || -1
            } )
        } )
    }
    
    var tileData = [ 
        [ args[0], args[1] ],
        [ args[2], args[3] ]
    ]
    
    var tile = []
    
    for( var i=0; i<2; i++ ){
        for( var y=0; y<256; y++ )
            tile.push( tileData[i][0][y].concat( tileData[i][1][y] ) )
    }
    
    var sliceStartX = essentialTile.difference.x - 99,
        sliceStartY = essentialTile.difference.y - 99
    
    var sliceWidth = 201
    
    var finalTile = []
    for( var y=sliceStartY; y<sliceStartY+sliceWidth; y++ ){
        finalTile.push( tile[y].slice( sliceStartX, sliceStartX + sliceWidth ) )
    }
    
    tile = finalTile
    
    
    var geometry = new THREE.BoxGeometry( 1, 1, 1000 )
    var material = new THREE.MeshLambertMaterial( { color: 0xffffff } )
    var cube = new THREE.Mesh( geometry, material )
    cube.position.set( 101, 101, -20 )
    scene.add( cube )
    

    var animate,
        controls = new THREE.TrackballControls( camera, renderer.domElement ),
        xLength = tile[0].length,
        yLength = tile.length

    var geometry = new THREE.PlaneGeometry( 0, 0, xLength-1, yLength-1 )
    for( var y=0; y<yLength; y++ ){
        for( var x=0; x<xLength; x++ ){
            geometry.vertices[x + (y * xLength)] = {
                x: x,
                y: y,
                z: tile[y][x]
            }
        }
    }
    
    ground = new THREE.Mesh( geometry )
    
    ground.scale.z = -1
    ground.rotation.x = 0 * Math.PI / 180
    ground.position.set( 0, 0, 0 )

    scene.add( ground )
    
    var light = new THREE.DirectionalLight(0xffffff);
    light.position.set( 100, 100, 100 )
    scene.add( light );
    
    light.castShadow = true;
    ground.receiveShadow = true
    renderer.shadowMapEnabled = true


    requestAnimationFrame( animate = function(){
        requestAnimationFrame( animate )
        controls.update()
        return renderer.render( scene, camera )
    } )
    
    

    
    
} )

*/