var http = require('http');

module.exports = function getPosition() {

    if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      
      function(position) {
        alert( "latitude: " + position.coords.latitude + "\nlongitude: " + position.coords.longitude );
      },
        navigator.geolocation.getCurrentPosition(function(position) {
        navigator.geolocation.getCurrentPosition(
            function(position) {
                alart("緯度:" + position.coords.latitude + ",経度" + position.coords.longitude + "標高" + position.coords.altitude);
            },
            function(error) {
                switch (error.code) {
                    case 1: //PERMISSION_DENIED
                        alert("位置情報の利用が許可されていません");
                        break;
                    case 2: //POSITION_UNAVAILABLE
                        alert("現在位置が取得できませんでした");
                        break;
                    case 3: //TIMEOUT
                        alert("タイムアウトになりました");
                        break;
                    default:
                        alert("その他のエラー(エラーコード:" + error.code + ")");
                        break;
                }
            }
        );
    },
)}