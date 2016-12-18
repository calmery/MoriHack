var http = require('http');
// var loc = require('../location/index.js');
// console.log(loc);
module.exports = function(lat,lng){
var units = 'metric';
var APIKEY = "41dd1296e48b5182399bc30c3adecd2f";
var lat = '35.6580681';
var lon = '139.7515992';

var URL = 'http://api.openweathermap.org/data/2.5/weather?lat='+ lat +'&lon='+ lon +'&appid=' + APIKEY + '&units=' + units;

http.get(URL, function(res) {
  var body = '';
  res.setEncoding('utf8');

  res.on('data', function(chunk) {
    body += chunk;
  });
  res.on('data', function(chunk) {
    res = JSON.parse(body);
    main = res.main;
    console.log('気温:' + main.temp + '度');
    console.log('湿度:' + main.humidity +'%');
    console.log('最高気温:' + main.temp_max + '度');
    console.log('最低気温:' + main.temp_min + '度');
    console.log('天気:' + res.weather[0].main);
  });
}).on('error', function(e) {
  console.log(e.message);
})

}
