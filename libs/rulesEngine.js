/*******************************************/
/*     DressTime Rules Engine              */
/*******************************************/

/*
	Example litteral condition :
	  if weather is beautiful & hot then
	     I want to put :
	        a jacket and a (tshirt or polo) and a pants
	        or a shirt and a trousers
	        or jumper-fin and (a tshirt or shirt-sleeve) and a trousers
	        
	        
	=>  [
		  { "clothe_subtype" : ["jacket", "tshirt||polo"],
		  	"clothe_type"    : ["pants"]
		  },
		  { "clothe_subtype" : ["shirt", "trousers"] },
		  { "clothe_subtype" : ["jumper-fin", "tshirt||shirt-sleeve", "trousers"] }  
	    ]
	    
	=> La premiere rules du tableau de rules:
	     Retournera une liste filtrer pour chaque partie de la condition
	        * 1 liste contenant les jackets
	        * 1 liste contenant les tshirt & polo
	        * 1 liste avec tous les vetements de types pants
*/

var rulesTest = [ { "clothe_subtype" : ["jacket", "tshirt||polo"], "clothe_type" : ["pants"] },
		          { "clothe_subtype" : ["shirt", "trousers"] },
		          { "clothe_subtype" : ["jumper-fin", "tshirt||shirt-sleeve", "trousers"] }  
	           ];



//Temp * Weather
var casualRules = [
    ["", "1", "2", "3", "4", "5"],
    ["1", "", "", "", [{ "clothe_subtype" : ["jacket", "tshirt||polo"], "clothe_type" : ["pants"] },{ "clothe_subtype" : ["shirt", "trousers"] },{ "clothe_subtype" : ["jumper-fin", "tshirt||shirt-sleeve", "trousers"] }], [{ "clothe_subtype" : ["jacket", "tshirt||polo"], "clothe_type" : ["pants"] },{ "clothe_subtype" : ["shirt", "trousers"] },{ "clothe_subtype" : ["tshirt"], "clothe_type" : ["pants"] },{ "clothe_subtype" : ["jumper-fin", "tshirt||shirt-sleeve"], "clothe_type" : ["pants"] }]],
    ["2", "", "", "", [{ "clothe_subtype" : ["jacket", "tshirt||polo"], "clothe_type" : ["pants"] },{ "clothe_subtype" : ["shirt", "trousers"] },{ "clothe_subtype" : ["jumper-fin", "tshirt||shirt-sleeve"], "clothe_type" : ["pants"] }], ""],
    ["3", "", "", "", "", ""],
    ["4", "", "", "", "", ""],
    ["5", "", "", "", "", ""]
];


function getMatrixRules(style, weatherGroup, tempEval){
    var rules = casualRules[weatherGroup][tempEval];
    console.log(rules);
    if (rules === ""){
        return [{ "clothe_subtype" : ["tshirt"], "clothe_type" : ["pants"] }, { "clothe_type" : ["maille", "top", "pants"]}];
    } else {
        return rules;
    }
}

//1 sun   
//2	cloud
//3	rain
//4	wind
//5	snow
function getWeatherGroup(code){
	//1 sun   [31, 32, 33, 34, 36]
	//2	cloud [20, 21, 22, 26, 27, 28, 29, 30, 44]
	//3	rain  [1, 2, 3, 4, 6, 9, 11, 12, 17, 35, 37, 38, 39, 40, 45, 47]
	//4	wind  [0, 19, 23, 24]
	//5	snow  [5, 7, 8, 10, 13, 14, 15, 16, 18, 41, 42, 43, 46]	
	var sun = [31, 32, 33, 34, 36];
	var cloud = [20, 21, 22, 26, 27, 28, 29, 30, 44];
	var rain = [1, 2, 3, 4, 6, 9, 11, 12, 17, 35, 37, 38, 39, 40, 45, 47];
	var wind = [0, 19, 23, 24];
	var snow = [5, 7, 8, 10, 13, 14, 15, 16, 18, 41, 42, 43, 46];
	var intCode = parseInt(code);
	console.log(cloud.indexOf(intCode));
	if (sun.indexOf(intCode) > -1)
		return 1;
	else if (cloud.indexOf(intCode) > -1)
		return 2;
	else if (rain.indexOf(intCode) > -1)
		return 3;
	else if (wind.indexOf(intCode) > -1)
		return 4;
	else if (snow.indexOf(intCode) > -1)
		return 5;
	else
		return -1;
};

// 1 - very cold (< 5)
// 2 - cold (<10)
// 3 - medium (< 17)
// 4 - hot (<24)
// 5 - very hot (> 24)
function getTemperatureEval(low, high){
    if (high < 5){
        return 1;
    } else if (high < 10){
        return 2;
    } else if (high < 17){
        return 3;
    } else if (high < 24){
        return 4;
    } else {
        return 5;
    }
}

function buildCondition(property, condition){
	var jsCondition = ""
	if (condition.indexOf('||')){
		var results = condition.split('||')
		for (var i=0; i < results.length; i++){
			if (jsCondition !== "")
				jsCondition += " || ";
				
			jsCondition += "'" + property + "'.indexOf('" + results[i] + "') > -1";
		}
	}
	return jsCondition
};

function executeRule(listSource, rule){
    var arrayList = [];
	
	for (var property in rule){
		for (var i in rule[property]){
			    if (listSource instanceof Array){
        			arrayList.push(listSource.filter(function(x){
        				var condition = buildCondition(x[property], rule[property][i])
            			return eval(condition)
        			}));
    		}	
		
		}
	}	
	return arrayList;
};

/********************************************/
/* Return an array of an array with lists   */
/*             filtered by combination      */
/********************************************/
exports.execute = function(listSource, rules){
	var result = [];
	
	for (var i=0; i < rules.length; i++){
        result.push(executeRule(listSource, rules[i]));
    }
    return result;
};

exports.getRules = function(weatherCode, low, high, styles) {
    var weatherGroup = getWeatherGroup(weatherCode);
    var tempEval = getTemperatureEval(low, high);
    
    return getMatrixRules(styles, weatherGroup, tempEval);

}