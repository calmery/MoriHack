var getMyLocation = new Promise( function( resolve, reject ){

    navigator.geolocation.getCurrentPosition( function( position ){

        var data = position.coords

        var lat = data.latitude,
            lng = data.longitude

        resolve( { lat: lat, lng: lng } )

    }, function( error ){

        reject( error )

    }, {
        enableHighAccuracy: false,
        timeout           : 8000,
        maximumAge        : 2000,
    } )

} )