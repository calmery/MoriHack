const createCoordinate = function( lat, lng ){
    const TILE_SIZE = 256
    return createInfoWindowContent( ( new google.maps.LatLng( lat, lng ) ), 14, TILE_SIZE )
}

const createInfoWindowContent = function( latLng, zoom, tileSize ){
    // Left shift.
    const scale = 1 << zoom
    
    // The mapping between latitude, longitude and pixels is defined by the web mercator projection.
    const worldCoordinate = ( function( latLng, tileSize ){
        // Truncating to 0.9999 effectively limits latitude to 89.189. This is about a third of a tile past the edge of the world tile.
        const siny = Math.min( 
            Math.max( ( Math.sin(latLng.lat() * Math.PI / 180) ), -0.9999 ), 
            0.9999
        )

        return new google.maps.Point(
            tileSize * ( 0.5 + latLng.lng() / 360 ),
            tileSize * ( 0.5 - Math.log( ( 1 + siny ) / ( 1 - siny ) ) / ( 4 * Math.PI ) )
        )
    } )( latLng, tileSize )

    const pixelCoordinate = new google.maps.Point(
        Math.floor( worldCoordinate.x * scale ),
        Math.floor( worldCoordinate.y * scale )
    )

    const tileCoordinate = new google.maps.Point(
        Math.floor( worldCoordinate.x * scale / tileSize ),
        Math.floor( worldCoordinate.y * scale / tileSize )
    )

    return {
        lat            : latLng.lat(),
        lng            : latLng.lng(),
        zoomLevel      : zoom,
        pixelCoordinate: {
            x: pixelCoordinate.x,
            y: pixelCoordinate.y
        },
        worldCoordinate: {
            x: worldCoordinate.x,
            y: worldCoordinate.y
        },
        tileCoordinate : {
            x: tileCoordinate.x,
            y: tileCoordinate.y,
            z: zoom
        }
    }
}