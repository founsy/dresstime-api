var express = require('express'),
	router = express.Router(),
    passport = require('passport'),
    http = require('http');


var appId = "77775d8069b7d87e421e7c1ec4f84bcc"
// "http://api.openweathermap.org/data/2.5/weather?lat=\(position.coordinate.latitude)&lon=\(position.coordinate.longitude)&APPID=\(appId)&units=\(unit)"
// "http://api.openweathermap.org/data/2.5/forecast/?lat=\(position.coordinate.latitude)&lon=\(position.coordinate.longitude)&APPID=\(appId)&units=\(unit)"

function getCurrentWeather(unit, lat, long, callback){
    var optionsget = {
        host : 'api.openweathermap.org',
        path : '/data/2.5/weather?lat='+ lat + '&lon='+ long + '&APPID=' + appId + '&units='+ unit, // the rest of the url with parameters if needed
        method : 'GET' // do GET
    };
    
    var finalData = "";
    
    // do the GET request
    var reqGet = http.request(optionsget, function(res) {
        console.log("statusCode: ", res.statusCode);
        // uncomment it for header details
        //  console.log("headers: ", res.headers);
        res.on('data', function(data) {
            finalData += data.toString();
        });
        
        res.on("end", function() {
            callback(JSON.parse(finalData));
        });
    });

    reqGet.end();
    reqGet.on('error', function(e) {
        res.send(500, 'Error');
    });
}

function getForecastWeather(unit, lat, long, callback){
    var optionsget = {
        host : 'api.openweathermap.org',
        path : '/data/2.5/forecast?lat='+ lat + '&lon='+ long + '&APPID=' + appId + '&units='+ unit, // the rest of the url with parameters if needed
        method : 'GET' // do GET
    };
    
    var finalData = "";
    
    var reqGet = http.request(optionsget, function(res) {
        console.log("statusCode: ", res.statusCode);
        // uncomment it for header details
        //  console.log("headers: ", res.headers);
        res.on('data', function(data) {
            finalData += data.toString();
        });
        
        res.on("end", function() {
            callback(JSON.parse(finalData));
        });
    });

    reqGet.end();
    reqGet.on('error', function(e) {
        res.send(500, 'Error');
    });
}

function codeToFont(code){
    for (var i=0; i < transcodeValue.length; i++){
        if (transcodeValue[i][0] == code){
            return transcodeValue[i][2]
        }
    }
    return "."
}

function wrapToWeather(object, time){
    var weather = {};
    if (typeof object !== 'undefined'){
        var hour = new Date().getHours()
        if (typeof object["dt_txt"] !== "undefined"){
            hour = new Date(object["dt_txt"]).getHours();
        }
        
        weather["hour"] = hour;
        weather["time"] = time;
        weather["temp"] = object["main"]["temp"];
        weather["tempMin"] = object["main"]["temp_min"];
        weather["tempMax"] = object["main"]["temp_max"];
        weather["code"] = object["weather"][0]["id"];
        weather["icon"] = codeToFont(object["weather"][0]["id"]);
        
    }
    if (typeof object["name"] !== 'undefined'){
        weather["city"] = object["name"];
    }
    return weather;
}

//Return array of weather
function wrapListWeather(current, forecast) {
    var list = []
    list.push(wrapToWeather(current, "Now"))
    var data = getTimeFrame()
    console.log(data);
    var time = "", i = 0
    for (var j = 0; j < forecast["list"].length; j++){
        var forecastItem = forecast["list"][j];
        var hour = getHour(forecastItem["dt_txt"]);

        if (hour == data[i]){
            if (data[i] == 9) {
                time = "Morning"
            } else if (data[i] == 15) {
                time = "Afternoon"
            } else if (data[i] == 21) {
                time = "Tonight"
            }
            var weather = wrapToWeather(forecastItem, time);

            if (typeof forecast["city"]["name"] !== 'undefined'){
                weather["city"] = forecast["city"]["name"]
            }
            list.push(weather)
            i++;
            if (i>1) {
                break;
            }
        }
    }
    return list
}

function getHour(dateStr){
    //TODO - Manage Local DateTime
    var date = new Date(dateStr)
    return date.getHours()
}

function getTimeFrame(){
     //TODO - Manage Local DateTime
    var date = new Date()
    var hour = date.getHours()

    if (hour >= 0 && hour < 12){
        //Afternoon(15h) & Tonight(21h)
        return [15, 21]
    } else if (hour >= 12 && hour < 18) {
        //Tonight(21h) & Tomorrow Morning (9h)
        return [21, 9]
    } else if (hour >= 18) {
        //Tomorrow Morning (9h) and Tomorrow Afternoon(15h)
         return [9, 15]
    }
    return nil
}

router.get('/', passport.authenticate('bearer', { session: false }), function(req, res){
    
    var lat = req.query.lat;
    var long = req.query.long;
    if (typeof lat !== 'undefined' && typeof long !== 'undefined'){
        getCurrentWeather('metric', lat, long, function(currentWeather){
            getForecastWeather('metric', lat, long, function(forecastWeather) {
                res.send(wrapListWeather(currentWeather, forecastWeather));    
            });
        });
    }
});

module.exports = router;

var transcodeValue = [
        [200,"thunderstorm with light rain","S","S"  ],
        [201,"thunderstorm with rain","Q","Q"  ],
        [202,"thunderstorm with heavy rain","Q","Q"  ],
        [210,"light thunderstorm","Y","X"  ],
        [211,"thunderstorm","Y","Y"  ],
        [212,"heavy thunderstorm","Y","Y"  ],
        [221,"ragged thunderstorm","Y","Y"  ],
        [230,"thunderstorm with light drizzle","S","S"  ],
        [231,"thunderstorm with drizzle","S","S"  ],
        [232,"thunderstorm with heavy drizzle","Q","Q"  ],
        [300,"light intensity drizzle","M","M"  ],
        [301,"drizzle","M","M"  ],
        [302,"heavy intensity drizzle","M","M"  ],
        [310,"light intensity drizzle rain","M","M"  ],
        [311,"drizzle rain","U","U"  ],
        [312,"heavy intensity drizzle rain","U","U"  ],
        [313,"shower rain and drizzle","U","U"  ],
        [314,"heavy shower rain and drizzle","O","O"  ],
        [321,"shower drizzle","O","O"  ],
        [500,"light rain","M","M"  ],
        [501,"moderate rain","M","M"  ],
        [502,"heavy intensity rain","U","U"  ],
        [503,"very heavy rain","U","U"  ],
        [504,"extreme rain","U","U"  ],
        [511,"freezing rain","U","U"  ],
        [520,"light intensity shower rain","O","O"  ],
        [521,"shower rain","O","O"  ],
        [522,"heavy intensity shower rain","O","O"  ],
        [531,"ragged shower rain","O","O"  ],
        [600,"light snow","I","I"  ],
        [601,"snow","I","I"  ],
        [602,"heavy snow","I","I"  ],
        [611,"sleet","I","I"  ],
        [612,"shower sleet","I","I"  ],
        [615,"light rain and snow","I","I"  ],
        [616,"rain and snow","I","I"  ],
        [620,"light shower snow","I","I"  ],
        [621,"shower snow","I","I"  ],
        [622,"heavy shower snow","I","I"  ],
        [701,"mist","Z","Z"  ],
        [711,"smoke","Z","Z"  ],
        [721,"haze","Z","Z"  ],
        [731,"sand, dust whirls","Z","Z"  ],
        [741,"fog","Z","Z"  ],
        [751,"sand","Z","Z"  ],
        [761,"dust","Z","Z"  ],
        [762,"volcanic ash","Z","Z"  ],
        [771,"squalls","Z","Z"  ],
        [781,"tornado","Z","Z"  ],
        [800,"clear sky","1","1"  ],
        [801,"few clouds","2","2"  ],
        [802,"scattered clouds","A","A"  ],
        [803,"broken clouds","3","3"  ],
        [804,"overcast clouds","G","G"  ],
        [900,"tornado","Q","Q"  ],
        [901,"tropical storm","Q","Q"  ],
        [902,"hurricane","Q","Q"  ],
        [903,"cold","6","6"  ],
        [904,"hot","1","1"  ],
        [905,"windy","E","E"  ],
        [906,"hail","O","O"  ],
        [951,"calm","B","B"  ],
        [952,"light breeze","D","D"  ],
        [953,"gentle breeze","D","D"  ],
        [954,"moderate breeze","D","D"  ],
        [955,"fresh breeze","D","D"  ],
        [956,"strong breeze","D","D"  ],
        [957,"high wind, near gale","E","E"  ],
        [958,"gale","E","E"  ],
        [959,"severe gale","E","E"  ],
        [960,"storm","E","E"  ],
        [961,"violent storm","E","E"  ],
        [962,"hurricane","E","E"  ]
    ]
    

var currentMock = {
    "coord":{
        "lon":-6.27,
        "lat":53.34
    },
    "weather":[
               {
               "id":803,
               "main":"Clouds",
               "description":"broken clouds",
               "icon":"04n"
               }
               ],
    "base":"stations",
    "main":{
        "temp":12.33,
        "pressure":1019,
        "humidity":71,
        "temp_min":11.67,
        "temp_max":13
    },
    "visibility":10000,
    "wind":{
        "speed":3.1,
        "deg":110
    },
    "clouds":{
        "all":75
    },
    "dt":1444499373,
    "sys":{
        "type":1,
        "id":5237,
        "message":0.0086,
        "country":"IE",
        "sunrise":1444459401,
        "sunset":1444498776
    },
    "id":2964574,
    "name":"Paris",
    "cod":200
};

var forecastMock = {
    "cod": "200",
    "message": 0.002,
    "city": {
        "id": 2964574,
        "name": "Paris",
        "coord": {
            "lon": -6.26719,
            "lat": 53.34399
        },
        "country": "IE",
        "population": 0
    },
    "cnt": 37,
    "list": [{
             "dt": 1444381200,
             "main": {
             "temp": 15,
             "temp_min": 12.31,
             "temp_max": 15,
             "pressure": 1021.39,
             "sea_level": 1034.08,
             "grnd_level": 1021.39,
             "humidity": 87,
             "temp_kf": 2.69
             },
             "weather": [{
                         "id": 500,
                         "main": "Rain",
                         "description": "light rain",
                         "icon": "10d"
                         }],
             "clouds": {
             "all": 80
             },
             "wind": {
             "speed": 4.16,
             "deg": 194.005
             },
             "rain": {
             "3h": 0.165
             },
             "sys": {
             "pod": "d"
             },
             "dt_txt": "2015-10-09 09:00:00"
             }, {
             "dt": 1444392000,
             "main": {
             "temp": 16.89,
             "temp_min": 14.74,
             "temp_max": 16.89,
             "pressure": 1021.96,
             "sea_level": 1034.54,
             "grnd_level": 1021.96,
             "humidity": 81,
             "temp_kf": 2.15
             },
             "weather": [{
                         "id": 804,
                         "main": "Clouds",
                         "description": "overcast clouds",
                         "icon": "04d"
                         }],
             "clouds": {
             "all": 88
             },
             "wind": {
             "speed": 4.53,
             "deg": 197.507
             },
             "rain": {
             "3h": 0
             },
             "sys": {
             "pod": "d"
             },
             "dt_txt": "2015-10-09 12:00:00"
             }, {
             "dt": 1444402800,
             "main": {
             "temp": 16.57,
             "temp_min": 14.95,
             "temp_max": 16.57,
             "pressure": 1021.83,
             "sea_level": 1034.37,
             "grnd_level": 1021.83,
             "humidity": 73,
             "temp_kf": 1.61
             },
             "weather": [{
                         "id": 804,
                         "main": "Clouds",
                         "description": "overcast clouds",
                         "icon": "04d"
                         }],
             "clouds": {
             "all": 92
             },
             "wind": {
             "speed": 4.01,
             "deg": 202.001
             },
             "rain": {
             "3h": 0
             },
             "sys": {
             "pod": "d"
             },
             "dt_txt": "2015-10-09 15:00:00"
             }, {
             "dt": 1444413600,
             "main": {
             "temp": 14.21,
             "temp_min": 13.13,
             "temp_max": 14.21,
             "pressure": 1022.72,
             "sea_level": 1035.23,
             "grnd_level": 1022.72,
             "humidity": 79,
             "temp_kf": 1.08
             },
             "weather": [{
                         "id": 500,
                         "main": "Rain",
                         "description": "light rain",
                         "icon": "10n"
                         }],
             "clouds": {
             "all": 92
             },
             "wind": {
             "speed": 2.62,
             "deg": 199.001
             },
             "rain": {
             "3h": 0.17
             },
             "sys": {
             "pod": "n"
             },
             "dt_txt": "2015-10-09 18:00:00"
             }, {
             "dt": 1444424400,
             "main": {
             "temp": 11.52,
             "temp_min": 10.98,
             "temp_max": 11.52,
             "pressure": 1023.7,
             "sea_level": 1036.25,
             "grnd_level": 1023.7,
             "humidity": 91,
             "temp_kf": 0.54
             },
             "weather": [{
                         "id": 500,
                         "main": "Rain",
                         "description": "light rain",
                         "icon": "10n"
                         }],
             "clouds": {
             "all": 92
             },
             "wind": {
             "speed": 1.67,
             "deg": 175.5
             },
             "rain": {
             "3h": 0.18
             },
             "sys": {
             "pod": "n"
             },
             "dt_txt": "2015-10-09 21:00:00"
             }, {
             "dt": 1444435200,
             "main": {
             "temp": 10.23,
             "temp_min": 10.23,
             "temp_max": 10.23,
             "pressure": 1024.38,
             "sea_level": 1037.02,
             "grnd_level": 1024.38,
             "humidity": 95
             },
             "weather": [{
                         "id": 500,
                         "main": "Rain",
                         "description": "light rain",
                         "icon": "10n"
                         }],
             "clouds": {
             "all": 92
             },
             "wind": {
             "speed": 1.77,
             "deg": 159.501
             },
             "rain": {
             "3h": 0.59
             },
             "sys": {
             "pod": "n"
             },
             "dt_txt": "2015-10-10 00:00:00"
             }, {
             "dt": 1444446000,
             "main": {
             "temp": 8.96,
             "temp_min": 8.96,
             "temp_max": 8.96,
             "pressure": 1023.97,
             "sea_level": 1036.73,
             "grnd_level": 1023.97,
             "humidity": 95
             },
             "weather": [{
                         "id": 500,
                         "main": "Rain",
                         "description": "light rain",
                         "icon": "10n"
                         }],
             "clouds": {
             "all": 88
             },
             "wind": {
             "speed": 1.36,
             "deg": 96.0005
             },
             "rain": {
             "3h": 0.05
             },
             "sys": {
             "pod": "n"
             },
             "dt_txt": "2015-10-10 03:00:00"
             }, {
             "dt": 1444456800,
             "main": {
             "temp": 8.56,
             "temp_min": 8.56,
             "temp_max": 8.56,
             "pressure": 1023.83,
             "sea_level": 1036.58,
             "grnd_level": 1023.83,
             "humidity": 94
             },
             "weather": [{
                         "id": 804,
                         "main": "Clouds",
                         "description": "overcast clouds",
                         "icon": "04n"
                         }],
             "clouds": {
             "all": 88
             },
             "wind": {
             "speed": 1.41,
             "deg": 78.0025
             },
             "rain": {
             "3h": 0
             },
             "sys": {
             "pod": "n"
             },
             "dt_txt": "2015-10-10 06:00:00"
             }, {
             "dt": 1444467600,
             "main": {
             "temp": 11.56,
             "temp_min": 11.56,
             "temp_max": 11.56,
             "pressure": 1024.22,
             "sea_level": 1036.94,
             "grnd_level": 1024.22,
             "humidity": 97
             },
             "weather": [{
                         "id": 500,
                         "main": "Rain",
                         "description": "light rain",
                         "icon": "10d"
                         }],
             "clouds": {
             "all": 92
             },
             "wind": {
             "speed": 2.11,
             "deg": 110.012
             },
             "rain": {
             "3h": 0.01
             },
             "sys": {
             "pod": "d"
             },
             "dt_txt": "2015-10-10 09:00:00"
             }, {
             "dt": 1444478400,
             "main": {
             "temp": 13.89,
             "temp_min": 13.89,
             "temp_max": 13.89,
             "pressure": 1024.29,
             "sea_level": 1036.96,
             "grnd_level": 1024.29,
             "humidity": 91
             },
             "weather": [{
                         "id": 804,
                         "main": "Clouds",
                         "description": "overcast clouds",
                         "icon": "04d"
                         }],
             "clouds": {
             "all": 92
             },
             "wind": {
             "speed": 2.86,
             "deg": 124.504
             },
             "rain": {
             "3h": 0
             },
             "sys": {
             "pod": "d"
             },
             "dt_txt": "2015-10-10 12:00:00"
             }, {
             "dt": 1444489200,
             "main": {
             "temp": 13.88,
             "temp_min": 13.88,
             "temp_max": 13.88,
             "pressure": 1023.42,
             "sea_level": 1036.08,
             "grnd_level": 1023.42,
             "humidity": 81
             },
             "weather": [{
                         "id": 804,
                         "main": "Clouds",
                         "description": "overcast clouds",
                         "icon": "04d"
                         }],
             "clouds": {
             "all": 88
             },
             "wind": {
             "speed": 3.22,
             "deg": 140.5
             },
             "rain": {
             "3h": 0
             },
             "sys": {
             "pod": "d"
             },
             "dt_txt": "2015-10-10 15:00:00"
             }, {
             "dt": 1444500000,
             "main": {
             "temp": 12.08,
             "temp_min": 12.08,
             "temp_max": 12.08,
             "pressure": 1023.21,
             "sea_level": 1035.91,
             "grnd_level": 1023.21,
             "humidity": 76
             },
             "weather": [{
                         "id": 804,
                         "main": "Clouds",
                         "description": "overcast clouds",
                         "icon": "04n"
                         }],
             "clouds": {
             "all": 92
             },
             "wind": {
             "speed": 2.31,
             "deg": 125.001
             },
             "rain": {
             "3h": 0
             },
             "sys": {
             "pod": "n"
             },
             "dt_txt": "2015-10-10 18:00:00"
             }, {
             "dt": 1444510800,
             "main": {
             "temp": 9.79,
             "temp_min": 9.79,
             "temp_max": 9.79,
             "pressure": 1023.56,
             "sea_level": 1036.22,
             "grnd_level": 1023.56,
             "humidity": 83
             },
             "weather": [{
                         "id": 804,
                         "main": "Clouds",
                         "description": "overcast clouds",
                         "icon": "04n"
                         }],
             "clouds": {
             "all": 88
             },
             "wind": {
             "speed": 2.07,
             "deg": 105.503
             },
             "rain": {
             "3h": 0
             },
             "sys": {
             "pod": "n"
             },
             "dt_txt": "2015-10-10 21:00:00"
             }, {
             "dt": 1444521600,
             "main": {
             "temp": 8.67,
             "temp_min": 8.67,
             "temp_max": 8.67,
             "pressure": 1023.18,
             "sea_level": 1035.87,
             "grnd_level": 1023.18,
             "humidity": 90
             },
             "weather": [{
                         "id": 804,
                         "main": "Clouds",
                         "description": "overcast clouds",
                         "icon": "04n"
                         }],
             "clouds": {
             "all": 88
             },
             "wind": {
             "speed": 1.71,
             "deg": 85.5002
             },
             "rain": {
             "3h": 0
             },
             "sys": {
             "pod": "n"
             },
             "dt_txt": "2015-10-11 00:00:00"
             }, {
             "dt": 1444532400,
             "main": {
             "temp": 8.33,
             "temp_min": 8.33,
             "temp_max": 8.33,
             "pressure": 1022.73,
             "sea_level": 1035.61,
             "grnd_level": 1022.73,
             "humidity": 91
             },
             "weather": [{
                         "id": 804,
                         "main": "Clouds",
                         "description": "overcast clouds",
                         "icon": "04n"
                         }],
             "clouds": {
             "all": 88
             },
             "wind": {
             "speed": 1.41,
             "deg": 100.004
             },
             "rain": {
             "3h": 0
             },
             "sys": {
             "pod": "n"
             },
             "dt_txt": "2015-10-11 03:00:00"
             }, {
             "dt": 1444543200,
             "main": {
             "temp": 8.7,
             "temp_min": 8.7,
             "temp_max": 8.7,
             "pressure": 1022.67,
             "sea_level": 1035.33,
             "grnd_level": 1022.67,
             "humidity": 90
             },
             "weather": [{
                         "id": 804,
                         "main": "Clouds",
                         "description": "overcast clouds",
                         "icon": "04n"
                         }],
             "clouds": {
             "all": 92
             },
             "wind": {
             "speed": 2.06,
             "deg": 121.003
             },
             "rain": {
             "3h": 0
             },
             "sys": {
             "pod": "n"
             },
             "dt_txt": "2015-10-11 06:00:00"
             }, {
             "dt": 1444554000,
             "main": {
             "temp": 10.29,
             "temp_min": 10.29,
             "temp_max": 10.29,
             "pressure": 1023.14,
             "sea_level": 1035.99,
             "grnd_level": 1023.14,
             "humidity": 91
             },
             "weather": [{
                         "id": 804,
                         "main": "Clouds",
                         "description": "overcast clouds",
                         "icon": "04d"
                         }],
             "clouds": {
             "all": 92
             },
             "wind": {
             "speed": 1.46,
             "deg": 126.502
             },
             "rain": {
             "3h": 0
             },
             "sys": {
             "pod": "d"
             },
             "dt_txt": "2015-10-11 09:00:00"
             }, {
             "dt": 1444564800,
             "main": {
             "temp": 13.49,
             "temp_min": 13.49,
             "temp_max": 13.49,
             "pressure": 1023.45,
             "sea_level": 1036.15,
             "grnd_level": 1023.45,
             "humidity": 86
             },
             "weather": [{
                         "id": 803,
                         "main": "Clouds",
                         "description": "broken clouds",
                         "icon": "04d"
                         }],
             "clouds": {
             "all": 76
             },
             "wind": {
             "speed": 2.01,
             "deg": 172.002
             },
             "rain": {
             "3h": 0
             },
             "sys": {
             "pod": "d"
             },
             "dt_txt": "2015-10-11 12:00:00"
             }, {
             "dt": 1444575600,
             "main": {
             "temp": 13.71,
             "temp_min": 13.71,
             "temp_max": 13.71,
             "pressure": 1022.94,
             "sea_level": 1035.56,
             "grnd_level": 1022.94,
             "humidity": 80
             },
             "weather": [{
                         "id": 804,
                         "main": "Clouds",
                         "description": "overcast clouds",
                         "icon": "04d"
                         }],
             "clouds": {
             "all": 88
             },
             "wind": {
             "speed": 1.68,
             "deg": 216.006
             },
             "rain": {
             "3h": 0
             },
             "sys": {
             "pod": "d"
             },
             "dt_txt": "2015-10-11 15:00:00"
             }, {
             "dt": 1444586400,
             "main": {
             "temp": 12.47,
             "temp_min": 12.47,
             "temp_max": 12.47,
             "pressure": 1023.61,
             "sea_level": 1036.17,
             "grnd_level": 1023.61,
             "humidity": 79
             },
             "weather": [{
                         "id": 804,
                         "main": "Clouds",
                         "description": "overcast clouds",
                         "icon": "04n"
                         }],
             "clouds": {
             "all": 92
             },
             "wind": {
             "speed": 1.53,
             "deg": 264.501
             },
             "rain": {
             "3h": 0
             },
             "sys": {
             "pod": "n"
             },
             "dt_txt": "2015-10-11 18:00:00"
             }, {
             "dt": 1444597200,
             "main": {
             "temp": 8.82,
             "temp_min": 8.82,
             "temp_max": 8.82,
             "pressure": 1024.31,
             "sea_level": 1037.2,
             "grnd_level": 1024.31,
             "humidity": 92
             },
             "weather": [{
                         "id": 500,
                         "main": "Rain",
                         "description": "light rain",
                         "icon": "10n"
                         }],
             "clouds": {
             "all": 12
             },
             "wind": {
             "speed": 1.18,
             "deg": 260.003
             },
             "rain": {
             "3h": 0.01
             },
             "sys": {
             "pod": "n"
             },
             "dt_txt": "2015-10-11 21:00:00"
             }, {
             "dt": 1444608000,
             "main": {
             "temp": 6.79,
             "temp_min": 6.79,
             "temp_max": 6.79,
             "pressure": 1024.91,
             "sea_level": 1037.79,
             "grnd_level": 1024.91,
             "humidity": 89
             },
             "weather": [{
                         "id": 500,
                         "main": "Rain",
                         "description": "light rain",
                         "icon": "10n"
                         }],
             "clouds": {
             "all": 68
             },
             "wind": {
             "speed": 1.32,
             "deg": 266.001
             },
             "rain": {
             "3h": 0.08
             },
             "sys": {
             "pod": "n"
             },
             "dt_txt": "2015-10-12 00:00:00"
             }, {
             "dt": 1444618800,
             "main": {
             "temp": 8.32,
             "temp_min": 8.32,
             "temp_max": 8.32,
             "pressure": 1025.45,
             "sea_level": 1038.28,
             "grnd_level": 1025.45,
             "humidity": 95
             },
             "weather": [{
                         "id": 500,
                         "main": "Rain",
                         "description": "light rain",
                         "icon": "10n"
                         }],
             "clouds": {
             "all": 92
             },
             "wind": {
             "speed": 1.42,
             "deg": 220.004
             },
             "rain": {
             "3h": 0.37
             },
             "sys": {
             "pod": "n"
             },
             "dt_txt": "2015-10-12 03:00:00"
             }, {
             "dt": 1444629600,
             "main": {
             "temp": 9.43,
             "temp_min": 9.43,
             "temp_max": 9.43,
             "pressure": 1026.22,
             "sea_level": 1039.03,
             "grnd_level": 1026.22,
             "humidity": 99
             },
             "weather": [{
                         "id": 500,
                         "main": "Rain",
                         "description": "light rain",
                         "icon": "10n"
                         }],
             "clouds": {
             "all": 92
             },
             "wind": {
             "speed": 3.21,
             "deg": 350.502
             },
             "rain": {
             "3h": 0.32
             },
             "sys": {
             "pod": "n"
             },
             "dt_txt": "2015-10-12 06:00:00"
             }, {
             "dt": 1444640400,
             "main": {
             "temp": 9.59,
             "temp_min": 9.59,
             "temp_max": 9.59,
             "pressure": 1027.97,
             "sea_level": 1040.68,
             "grnd_level": 1027.97,
             "humidity": 97
             },
             "weather": [{
                         "id": 500,
                         "main": "Rain",
                         "description": "light rain",
                         "icon": "10d"
                         }],
             "clouds": {
             "all": 32
             },
             "wind": {
             "speed": 4.65,
             "deg": 7.50729
             },
             "rain": {
             "3h": 0.25
             },
             "sys": {
             "pod": "d"
             },
             "dt_txt": "2015-10-12 09:00:00"
             }, {
             "dt": 1444651200,
             "main": {
             "temp": 12.34,
             "temp_min": 12.34,
             "temp_max": 12.34,
             "pressure": 1028.68,
             "sea_level": 1041.42,
             "grnd_level": 1028.68,
             "humidity": 89
             },
             "weather": [{
                         "id": 800,
                         "main": "Clear",
                         "description": "sky is clear",
                         "icon": "02d"
                         }],
             "clouds": {
             "all": 8
             },
             "wind": {
             "speed": 4.46,
             "deg": 14.0026
             },
             "rain": {
             "3h": 0
             },
             "sys": {
             "pod": "d"
             },
             "dt_txt": "2015-10-12 12:00:00"
             }, {
             "dt": 1444662000,
             "main": {
             "temp": 12.82,
             "temp_min": 12.82,
             "temp_max": 12.82,
             "pressure": 1028.55,
             "sea_level": 1041.3,
             "grnd_level": 1028.55,
             "humidity": 77
             },
             "weather": [{
                         "id": 802,
                         "main": "Clouds",
                         "description": "scattered clouds",
                         "icon": "03d"
                         }],
             "clouds": {
             "all": 32
             },
             "wind": {
             "speed": 4.35,
             "deg": 20.002
             },
             "rain": {
             "3h": 0
             },
             "sys": {
             "pod": "d"
             },
             "dt_txt": "2015-10-12 15:00:00"
             }, {
             "dt": 1444672800,
             "main": {
             "temp": 10.9,
             "temp_min": 10.9,
             "temp_max": 10.9,
             "pressure": 1029.38,
             "sea_level": 1042.21,
             "grnd_level": 1029.38,
             "humidity": 75
             },
             "weather": [{
                         "id": 500,
                         "main": "Rain",
                         "description": "light rain",
                         "icon": "10n"
                         }],
             "clouds": {
             "all": 64
             },
             "wind": {
             "speed": 3.72,
             "deg": 19.5004
             },
             "rain": {
             "3h": 0.03
             },
             "sys": {
             "pod": "n"
             },
             "dt_txt": "2015-10-12 18:00:00"
             }, {
             "dt": 1444683600,
             "main": {
             "temp": 7.79,
             "temp_min": 7.79,
             "temp_max": 7.79,
             "pressure": 1030.56,
             "sea_level": 1043.37,
             "grnd_level": 1030.56,
             "humidity": 84
             },
             "weather": [{
                         "id": 500,
                         "main": "Rain",
                         "description": "light rain",
                         "icon": "10n"
                         }],
             "clouds": {
             "all": 8
             },
             "wind": {
             "speed": 3.77,
             "deg": 16.5009
             },
             "rain": {
             "3h": 0.01
             },
             "sys": {
             "pod": "n"
             },
             "dt_txt": "2015-10-12 21:00:00"
             }, {
             "dt": 1444694400,
             "main": {
             "temp": 6.02,
             "temp_min": 6.02,
             "temp_max": 6.02,
             "pressure": 1030.9,
             "sea_level": 1043.85,
             "grnd_level": 1030.9,
             "humidity": 90
             },
             "weather": [{
                         "id": 802,
                         "main": "Clouds",
                         "description": "scattered clouds",
                         "icon": "03n"
                         }],
             "clouds": {
             "all": 44
             },
             "wind": {
             "speed": 3.21,
             "deg": 13.5054
             },
             "rain": {
             "3h": 0
             },
             "sys": {
             "pod": "n"
             },
             "dt_txt": "2015-10-13 00:00:00"
             }, {
             "dt": 1444705200,
             "main": {
             "temp": 5.59,
             "temp_min": 5.59,
             "temp_max": 5.59,
             "pressure": 1030.93,
             "sea_level": 1043.86,
             "grnd_level": 1030.93,
             "humidity": 89
             },
             "weather": [{
                         "id": 802,
                         "main": "Clouds",
                         "description": "scattered clouds",
                         "icon": "03n"
                         }],
             "clouds": {
             "all": 36
             },
             "wind": {
             "speed": 1.63,
             "deg": 3.5
             },
             "rain": {
             "3h": 0
             },
             "sys": {
             "pod": "n"
             },
             "dt_txt": "2015-10-13 03:00:00"
             }, {
             "dt": 1444716000,
             "main": {
             "temp": 3.45,
             "temp_min": 3.45,
             "temp_max": 3.45,
             "pressure": 1030.58,
             "sea_level": 1043.57,
             "grnd_level": 1030.58,
             "humidity": 84
             },
             "weather": [{
                         "id": 800,
                         "main": "Clear",
                         "description": "sky is clear",
                         "icon": "01n"
                         }],
             "clouds": {
             "all": 0
             },
             "wind": {
             "speed": 1.47,
             "deg": 46.5019
             },
             "rain": {
             "3h": 0
             },
             "sys": {
             "pod": "n"
             },
             "dt_txt": "2015-10-13 06:00:00"
             }, {
             "dt": 1444726800,
             "main": {
             "temp": 8.91,
             "temp_min": 8.91,
             "temp_max": 8.91,
             "pressure": 1031.12,
             "sea_level": 1044,
             "grnd_level": 1031.12,
             "humidity": 82
             },
             "weather": [{
                         "id": 800,
                         "main": "Clear",
                         "description": "sky is clear",
                         "icon": "01d"
                         }],
             "clouds": {
             "all": 0
             },
             "wind": {
             "speed": 2.38,
             "deg": 97.0061
             },
             "rain": {
             "3h": 0
             },
             "sys": {
             "pod": "d"
             },
             "dt_txt": "2015-10-13 09:00:00"
             }, {
             "dt": 1444737600,
             "main": {
             "temp": 12.9,
             "temp_min": 12.9,
             "temp_max": 12.9,
             "pressure": 1031.31,
             "sea_level": 1044.08,
             "grnd_level": 1031.31,
             "humidity": 79
             },
             "weather": [{
                         "id": 800,
                         "main": "Clear",
                         "description": "sky is clear",
                         "icon": "02d"
                         }],
             "clouds": {
             "all": 8
             },
             "wind": {
             "speed": 3.8,
             "deg": 132.5
             },
             "rain": {
             "3h": 0
             },
             "sys": {
             "pod": "d"
             },
             "dt_txt": "2015-10-13 12:00:00"
             }, {
             "dt": 1444748400,
             "main": {
             "temp": 13,
             "temp_min": 13,
             "temp_max": 13,
             "pressure": 1030.13,
             "sea_level": 1042.78,
             "grnd_level": 1030.13,
             "humidity": 70
             },
             "weather": [{
                         "id": 800,
                         "main": "Clear",
                         "description": "sky is clear",
                         "icon": "02d"
                         }],
             "clouds": {
             "all": 8
             },
             "wind": {
             "speed": 4.12,
             "deg": 144.001
             },
             "rain": {
             "3h": 0
             },
             "sys": {
             "pod": "d"
             },
             "dt_txt": "2015-10-13 15:00:00"
             }, {
             "dt": 1444759200,
             "main": {
             "temp": 9,
             "temp_min": 9,
             "temp_max": 9,
             "pressure": 1029.53,
             "sea_level": 1042.45,
             "grnd_level": 1029.53,
             "humidity": 72
             },
             "weather": [{
                         "id": 802,
                         "main": "Clouds",
                         "description": "scattered clouds",
                         "icon": "03n"
                         }],
             "clouds": {
             "all": 36
             },
             "wind": {
             "speed": 2.82,
             "deg": 135.501
             },
             "rain": {
             "3h": 0
             },
             "sys": {
             "pod": "n"
             },
             "dt_txt": "2015-10-13 18:00:00"
             }, {
             "dt": 1444770000,
             "main": {
             "temp": 5.89,
             "temp_min": 5.89,
             "temp_max": 5.89,
             "pressure": 1029.93,
             "sea_level": 1042.79,
             "grnd_level": 1029.93,
             "humidity": 90
             },
             "weather": [{
                         "id": 802,
                         "main": "Clouds",
                         "description": "scattered clouds",
                         "icon": "03n"
                         }],
             "clouds": {
             "all": 36
             },
             "wind": {
             "speed": 2.85,
             "deg": 147.002
             },
             "rain": {
             "3h": 0
             },
             "sys": {
             "pod": "n"
             },
             "dt_txt": "2015-10-13 21:00:00"
             }]
};