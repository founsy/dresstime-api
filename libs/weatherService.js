var appId = "77775d8069b7d87e421e7c1ec4f84bcc";
var http = require('http');

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


function getCurrentWeather(unit, lat, long, callback){
    var optionsget = {
        host : 'api.openweathermap.org',
        path : '/data/2.5/weather?lat='+ lat + '&lon='+ long + '&APPID=' + appId + '&units='+ unit, // the rest of the url with parameters if needed
        method : 'GET' // do GET
    };
    
    var finalData = "";
    
    // do the GET request
    var reqGet = http.request(optionsget, function(res) {
        res.on('data', function(data) {
            finalData += data.toString();
        });
        
        res.on("end", function() {
            callback(null, JSON.parse(finalData));
        });
    });

    reqGet.end();
    reqGet.on('error', function(e) {
        callback(new Error("Error retrieve current weather"));
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
        res.on('data', function(data) {
            finalData += data.toString();
        });
        
        res.on("end", function() {
            callback(null, JSON.parse(finalData));
        });
    });

    reqGet.end();
    reqGet.on('error', function(e) {
        res.send(new Error("Error retrieve forecast weather"));
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

function getLocalDateTime(timezone){
    var now = new Date();
    //Remove TimeZone
    var gmtTime = new Date(now.valueOf() + now.getTimezoneOffset() * 60000);
    var date = new Date(gmtTime.getTime() + parseInt(timezone) * 1000);
    
    return date;
}

function wrapToWeather(object, time, timezone){
    var weather = {};
    if (typeof object !== 'undefined'){
        var date = getLocalDateTime(timezone); 
        var hour = date.getHours()
        
        if (typeof object["dt_txt"] !== "undefined"){
            hour = new Date(object["dt_txt"]).getHours();
        }
        
        weather["hour"] = hour;
        weather["time"] = time;
        weather["temp"] = typeof object["main"]["temp"] !== "undefined" ? object["main"]["temp"] : 0;
        weather["tempMin"] = typeof object["main"]["temp_min"] !== "undefined" ? object["main"]["temp_min"] : 0;
        weather["tempMax"] = typeof object["main"]["temp_max"] !== "undefined" ? object["main"]["temp_max"] : 0;
        weather["code"] = object["weather"][0]["id"];
        weather["icon"] = codeToFont(object["weather"][0]["id"]);
        
    }
    if (typeof object["name"] !== 'undefined'){
        weather["city"] = object["name"];
    }
    return weather;
}

//Return array of weather
function wrapListWeather(current, forecast, timezone) {
    var list = []
    list.push(wrapToWeather(current, "Now", timezone))
    var data = getTimeFrame(timezone)

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
            var weather = wrapToWeather(forecastItem, time, timezone);

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

function getTimeFrame(timezone){
     //TODO - Manage Local DateTime
    var date = getLocalDateTime(timezone);
        
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
    return null
};

function getComments(lang, code){
    if (code >= 200 && code <= 232){ //Thunderstorm 
        return lang === "en" ? "I'm singing in the rain" : "Il peut il mouille, c'est la fête à la grenouille";
    } else  if (code >= 300 && code <= 321){ //Drizzle 
        return lang === "en" ? "I'm singing in the rain" : "Il peut il mouille, c'est la fête à la grenouille";
    } else  if (code >= 500  && code <= 531 ){ //Rain
        return lang === "en" ? "I'm singing in the rain" : "Il peut il mouille, c'est la fête à la grenouille";
    } else  if (code >= 600  && code <= 622  ){ //Snow  
        return lang === "en" ? "Snowball fight" : "On oublie pas le bonnet et les moufles!";
    } else  if (code >= 701  && code <= 781   ){ //Atmosphere    
        return lang === "en" ? "What a beautiful day!" : "Au dessus des nuages, le ciel est toujours bleu";
    } else if(code === 800){ //Sun 
        return lang === "en" ? "What a beautiful day!" : "Quelle belle journée!";
    } else if (code >= 801 && code <= 804){ //Clouds 
        return lang === "en" ? "What a beautiful day!" : "Au dessus des nuages, le ciel est toujours bleu";
    }
}

exports.getWheather = function(lat, long, timezone, lang, callback){
    if (typeof lat !== 'undefined' && typeof long !== 'undefined'){
        getCurrentWeather('metric', lat, long, function(errorCurrent, currentWeather){
            if (errorCurrent){
                return callback(errorCurrent)
            }
            var currentWeather = wrapToWeather(currentWeather, "Now", timezone);
            callback(null, {"current" : currentWeather, "comment" : getComments(lang, currentWeather.code)});
        });
    } else {
        callback('Not coordinate', null); 
    }
}