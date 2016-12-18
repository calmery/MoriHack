function main( obj ){
    
    console.log( obj )

    /* *** ThreeJS *** */

    THREE.ImageUtils.crossOrigin = '*'

    /* *** Scene *** */

    var scene = new THREE.Scene()

    /* *** Renderer *** */

    var renderer = new THREE.WebGLRenderer( { alpha: true } )
    renderer.setSize( window.innerWidth, window.innerHeight )
    document.getElementById( 'container' ).appendChild( renderer.domElement )

    /* *** Camera *** */

    var camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.1, 1000 )
    camera.position.set( 0, -500, 100 )

    /* *** Ground *** */

    var position = {
        lat: obj.lat, 
        lng: obj.lng
    }

    var targetTile = createCoordinate( position.lat, position.lng )

    var difference = ( function( targetTile ){

        var t = targetTile.tileCoordinate,
            p = targetTile.pixelCoordinate

        var tileToLatLng = function( tx, ty, zoom ){
            var numOfTiles = Math.pow( 2, zoom ),
                x = tx / numOfTiles,
                y = ty / numOfTiles,
                latRadians = ( y - ( 1 / 2 ) ) / - ( 1 / ( 2 * Math.PI ) )
            return {
                lat: ( 2 * Math.atan( Math.exp( latRadians ) ) - Math.PI / 2 ) / Math.PI * 180, 
                lng: ( x - ( 1 / 2 ) ) / ( 1 / 360 )
            }
        }

        var latLng = tileToLatLng( t.x, t.y, t.z ),
            tile = createCoordinate( latLng.lat, latLng.lng )

        return {
            x: p.x - tile.pixelCoordinate.x,
            y: p.y - tile.pixelCoordinate.y
        }

    } )( targetTile )

    var essentialTile = ( function( targetTile, difference ){

        var tx = targetTile.tileCoordinate.x,
            ty = targetTile.tileCoordinate.y

        var tiles = [ [], [] ],
            differenceFromBase = {}

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

    var getTileDataUrl = function( tileObject ){
        var t = targetTile.tileCoordinate
        return 'http://cyberjapandata.gsi.go.jp/xyz/dem/14/' + ( t.x + tileObject.x ) + '/' + ( t.y + tileObject.y ) + '.txt'
    },
    getTileTextureUrl = function( tileObject ){
        var t = targetTile.tileCoordinate
        return 'http://cyberjapandata.gsi.go.jp/xyz/relief/14/' + ( t.x + tileObject.x ) + '/' + ( t.y + tileObject.y ) + '.png'
    }

    var sliceStartX = essentialTile.difference.x - 127,
        sliceStartY = essentialTile.difference.y - 127

    var sliceWidth = 256

    var displace = {
        x: 256 / 2,
        y: 256 / 2
    }

    /* *** Texture *** */

    /*
     * <canvas id="textureBase"></canvas>
     * <canvas id="texture"></canvas>
     */

    var textureBaseCanvas = document.getElementById( 'textureBase' ),
        textureCanvas     = document.getElementById( 'texture' )

    textureBaseCanvas.width = textureBaseCanvas.height = 512
    textureCanvas.width = textureCanvas.height = 256

    var textureBaseCtx = textureBaseCanvas.getContext( '2d' ),
        textureCtx     = textureCanvas.getContext( '2d' )

    var texture, 
        textureLoaded = 0

    var createTexture = function(){
        textureLoaded += 1
        if( textureLoaded >= 4 ){

            var png = new Image()
            png.src = textureBaseCanvas.toDataURL()

            png.onload = function(){
                textureCtx.drawImage( png, sliceStartX, sliceStartY, sliceWidth, sliceWidth, 0, 0, sliceWidth, sliceWidth )
                texture = document.createElement( 'img' )
                texture.src = textureCanvas.toDataURL()
                createGround( texture )
            }

        }
    }

    var texture00 = new Image(),
        texture01 = new Image(),
        texture10 = new Image(),
        texture11 = new Image()

    texture00.setAttribute( 'crossOrigin', 'anonymous' )
    texture01.setAttribute( 'crossOrigin', 'anonymous' )
    texture10.setAttribute( 'crossOrigin', 'anonymous' )
    texture11.setAttribute( 'crossOrigin', 'anonymous' )

    texture00.src = getTileTextureUrl( essentialTile.tiles[0][0] )
    texture01.src = getTileTextureUrl( essentialTile.tiles[0][1] )
    texture10.src = getTileTextureUrl( essentialTile.tiles[1][0] )
    texture11.src = getTileTextureUrl( essentialTile.tiles[1][1] )

    texture00.onload = function(){ textureBaseCtx.drawImage( texture00,   0,   0 ); createTexture() }
    texture01.onload = function(){ textureBaseCtx.drawImage( texture01, 256,   0 ); createTexture() }
    texture10.onload = function(){ textureBaseCtx.drawImage( texture10,   0, 256 ); createTexture() }
    texture11.onload = function(){ textureBaseCtx.drawImage( texture11, 256, 256 ); createTexture() }
    
    var exportTile
    function createGround( texture ){

        $.when(

            $.get( getTileDataUrl( essentialTile.tiles[0][0] ) ),
            $.get( getTileDataUrl( essentialTile.tiles[0][1] ) ),
            $.get( getTileDataUrl( essentialTile.tiles[1][0] ) ),
            $.get( getTileDataUrl( essentialTile.tiles[1][1] ) )

        ).done( function(){

            var args = [].slice.call( arguments )

            for( var i=0; i<args.length; i++ ){
                args[i] = args[i][0]
                args[i] = args[i].substring( 0, args[i].length-1 ).split( '\n' ).map( function( row ){
                    return row.split( ',' ).map( function( height ){
                        return parseFloat( height*0.5 ) || -1
                    } )
                } )
            }

            var tileData = [ 
                [ args[0], args[1] ],
                [ args[2], args[3] ]
            ]

            var tile  = [],
                _tile = []

            for( var i=0; i<2; i++ ){
                for( var y=0; y<256; y++ ){
                    _tile.push( tileData[i][0][y].concat( tileData[i][1][y] ) )
                }
            }

            for( var y=sliceStartY; y<sliceStartY+sliceWidth; y++ ){
                tile.push( _tile[y].slice( sliceStartX, sliceStartX + sliceWidth ) )
            }

            var animate,
                controls,
                xLength = tile[0].length,
                yLength = tile.length

            exportTile = tile

            var geometry = new THREE.PlaneGeometry( 0, 0, xLength-1, yLength-1 )
            for( var y=0; y<yLength; y++ ){
                for( var x=0; x<xLength; x++ ){
                    geometry.vertices[x + ( y * xLength )] = {
                        x: x,
                        y: y,
                        z: tile[y][x]
                    }
                }
            }

            ground = new THREE.Mesh( geometry, new THREE.MeshBasicMaterial() )

            ground.scale.z = -1
            ground.rotation.x = Math.PI / 2
            ground.position.set( -displace.x, -125, -displace.y )

            ground.material.map = new THREE.Texture( texture )
            ground.material.map.needsUpdate = true

            /* *** Add to scene *** */

            scene.add( camera )
            scene.add( ground )

            /* *** Animation *** */

            // OrbitControls
            controls = new THREE.OrbitControls( camera, renderer.domElement )
            controls.userPan = false
            controls.userPanSpeed = 0.0
            controls.maxDistance = 5000.0
            controls.maxPolarAngle = Math.PI * 0.495
            controls.rotateUp( Math.PI * 0.38 )
            controls.autoRotate = true //true:自動回転する,false:自動回転しない
            controls.autoRotateSpeed = -2.0 //自動回転する時の速度

            requestAnimationFrame( animate = function(){
                requestAnimationFrame( animate )
                controls.update()
                return renderer.render( scene, camera )
            } )

        } )

    }
    
    function createHuman( lat, lng ){

        // 32.215249, 130.753247
        var now = createCoordinate( lat, lng )

        var x = targetTile.pixelCoordinate.x - now.pixelCoordinate.x
        var y = targetTile.pixelCoordinate.y - now.pixelCoordinate.y

        /*
        var loader = new THREE.JSONLoader()
        loader.load( 'people.json', function ( geometry, materials ){
            var faceMaterial = new THREE.MeshFaceMaterial( materials )
            mesh = new THREE.Mesh( geometry, faceMaterial )
            mesh.position.set( -x, exportTile[displace.y-y][displace.x-x]-125, -y )
            mesh.rotation.x = Math.PI / 2
            mesh.scale.set( 1, 1, 1 )
            scene.add( mesh )
        } )
        */
        
        var total_frame = 180;//トータルフレーム
        var last_frame = null;
        var current_frame = 1;
        
        loader = new THREE.JSONLoader();
        loader.load( 'bone5.json', function ( geometry, materials ) { //第１引数はジオメトリー、第２引数はマテリアルが自動的に取得）

            //全てのマテリアルのモーフターゲットの値をtrueにする
            for (var i = 0, l = materials.length; i < l; i++) {
                materials[i].morphTargets = true;
            }
            //モーフアニメーションメッシュ生成
            var mesh = new THREE.MorphAnimMesh(geometry, new THREE.MeshFaceMaterial(materials));

            mesh.position.set( -x, exportTile[displace.y-y][displace.x-x]-125+3, -y )
            mesh.scale.set( 1, 1, 1 );
            scene.add( mesh );

            //アニメーション
            ( function renderLoop(){
                requestAnimationFrame( renderLoop )
                
                last_frame = current_frame
                current_frame++
                if (121 <= current_frame) {
                    current_frame = 0;
                }
                
                mesh.morphTargetInfluences[last_frame] = 0
                mesh.morphTargetInfluences[current_frame] = 1

                renderer.render( scene, camera )
            } )()
        } )

    }
    
    function createCloud(){
        var total_frame = 250;//トータルフレーム
        var last_frame = null;
        var current_frame = 1;

        loader = new THREE.JSONLoader();
        loader.load( 'cloud4.json', function ( geometry, materials ) { //第１引数はジオメトリー、第２引数はマテリアルが自動的に取得）

            //全てのマテリアルのモーフターゲットの値をtrueにする
            for (var i = 0, l = materials.length; i < l; i++) {
                materials[i].morphTargets = true;
            }
            //モーフアニメーションメッシュ生成
            var cloud4 = new THREE.MorphAnimMesh(geometry, new THREE.MeshFaceMaterial(materials));

            cloud4.position.set( 0, 150, 0 )
            cloud4.scale.set( 15, 15, 15 );
            scene.add( cloud4 );

            //アニメーション
            ( function renderLoop(){
                requestAnimationFrame( renderLoop )

                last_frame = current_frame
                current_frame++
                if (total_frame <= current_frame) {
                    current_frame = 0;
                }

                cloud4.morphTargetInfluences[last_frame] = 0
                cloud4.morphTargetInfluences[current_frame] = 1

                renderer.render( scene, camera )
            } )()
        } )
        
        loader.load( 'cloud2.json', function ( geometry, materials ) { //第１引数はジオメトリー、第２引数はマテリアルが自動的に取得）

            //全てのマテリアルのモーフターゲットの値をtrueにする
            for (var i = 0, l = materials.length; i < l; i++) {
                materials[i].morphTargets = true;
            }
            //モーフアニメーションメッシュ生成
            var cloud2 = new THREE.MorphAnimMesh(geometry, new THREE.MeshFaceMaterial(materials));

            cloud2.position.set( 0, 125, 0 )
            cloud2.scale.set( 15, 15, 15 );
            scene.add( cloud2 );

            //アニメーション
            ( function renderLoop(){
                requestAnimationFrame( renderLoop )

                last_frame = current_frame
                current_frame++
                if (total_frame <= current_frame) {
                    current_frame = 0;
                }

                cloud2.morphTargetInfluences[last_frame] = 0
                cloud2.morphTargetInfluences[current_frame] = 1

                renderer.render( scene, camera )
            } )()
        } )
        
        loader.load( 'cloud3.json', function ( geometry, materials ) { //第１引数はジオメトリー、第２引数はマテリアルが自動的に取得）

            //全てのマテリアルのモーフターゲットの値をtrueにする
            for (var i = 0, l = materials.length; i < l; i++) {
                materials[i].morphTargets = true;
            }
            //モーフアニメーションメッシュ生成
            var cloud3 = new THREE.MorphAnimMesh(geometry, new THREE.MeshFaceMaterial(materials));

            cloud3.position.set( 0, 100, 0 )
            cloud3.scale.set( 15, 15, 15 );
            scene.add( cloud3 );

            //アニメーション
            ( function renderLoop(){
                requestAnimationFrame( renderLoop )

                last_frame = current_frame
                current_frame++
                if (total_frame <= current_frame) {
                    current_frame = 0;
                }

                cloud3.morphTargetInfluences[last_frame] = 0
                cloud3.morphTargetInfluences[current_frame] = 1

                renderer.render( scene, camera )
            } )()
        } )

    }

    function createCube( lat, lng ){

        // 32.215249, 130.753247
        var now = createCoordinate( lat, lng )

        var x = targetTile.pixelCoordinate.x - now.pixelCoordinate.x
        var y = targetTile.pixelCoordinate.y - now.pixelCoordinate.y

        var geometry = new THREE.BoxGeometry( 1*100, 1*100, 1*100 )
        var material = new THREE.MeshLambertMaterial( { color: 0xffffff } )
        var cube = new THREE.Mesh( geometry, material )
        cube.scale.set( 0.01, 0.01, 0.01 )
        cube.rotation.x = Math.PI / 2
        cube.position.set( -x, exportTile[displace.y-y][displace.x-x]-125, -y )
        scene.add( cube )

    }
    
    window.createHuman = createHuman
    window.createCube = createCube
    window.createCloud = createCloud
    
}