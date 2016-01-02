var express = require('express');
var router = express.Router();
var http = require('http');
var passport = require('passport');
var async = require('async'),
    fuzzylogic = require('fuzzylogic');

var rootPath = process.cwd();

var styleEngine = require(rootPath + '/libs/styleEngine'),
    contextEngine = require(rootPath + '/libs/rulesEngine'),
    persoEngine = require(rootPath + '/libs/persoEngine'),
    weatherService = require(rootPath + '/libs/weatherService'),
    ObjectId = require('mongoose').Types.ObjectId; 

var Clothe = require(rootPath + '/models/clothe'),
    Outfit = require(rootPath + '/models/outfit');

function check1ArrayIsEmpty(arrayOfCombination){
    for (var j = 0; j<arrayOfCombination.length; j++){
        if (arrayOfCombination[j].length === 0) return true;
    }
    return false;
}

// Return a list of 4 outfits as different as possible
function randomOutfits(outfits, numberOfCombination){
    var result = [], combinationInsert = new Array(numberOfCombination), lastCombination = 0, index = 0;
    //Init array
    for (var i = 0; i < combinationInsert.length; i++) combinationInsert[i] = 0;
    
    function checkSimilar(outfit){
        for (var j =0; j < result.length; j++){
            console.log('TODO');   
        }    
    }
    
    for(var i = 0; i < outfits.length; i++){
        if (lastCombination !== outfits[i].outfit.length || combinationInsert[index] < 1){
            lastCombination = outfits[i].outfit.length;
            result.push(outfits[i]);
            
            combinationInsert[index]++;
            if (combinationInsert > 1){
                index++;
            }
        }            
    }
}

function bestOutfits(outfits, style){
    var best1 = null, best2 = null;
    
    for (var i=0; i < outfits.length; i++){
        if (best1 === null || best1.matchingRate < outfits[i].matchingRate){
            best1 = outfits[i];
        
        } 
        if (best2 === null || (best1.matchingRate > outfits[i].matchingRate && best2.matchingRate < outfits[i].matchingRate)) {
            best2 = outfits[i];
        } 
    }
    
    if (best1 === null && best2 !== null) {
        best2["style"] = style
        return [best2];
    } if (best1 !== null && best2 === null) {
        best1["style"] = style
        return [best1];
    } else {
        best1["style"] = style
        best2["style"] = style
        return [best1, best2];
    }
}

function top2Outfits(outfits, style){
    var result = [];
    
    for (var i=0; i < outfits.length && i < 2; i++){
        var outfit = outfits[i];
        outfit["style"] = style;
        result.push(outfit)
    }
    
    return result;
}

function sortOutfits(outfit1, outfit2) {
    var diffRate = 0;
    
    for (var i = 0; i < outfit1.outfit.length; i++){
        for (var j = 0; j < outfit2.outfit.length; j++){
            if (outfit1.outfit[i].clothe_id !== outfit2.outfit[j].clothe_id && outfit1.outfit[i].clothe_type === outfit2.outfit[j].clothe_type){
                diffRate += 100/outfit2.outfit.length;
            }
        }
    }

    if (diffRate === 100 && outfit1.matchingRate > outfit2.matchingRate){
        return -1
    } else if (diffRate === 100 && outfit2.matchingRate >= outfit1.matchingRate){
        return 1
    } else {
        return 0
    }
}

function updateClothesColor(clothes){
    for (var i = 0; i < clothes.length; i++){
        console.log(clothes[i].clothe_colors);
        Clothe.update({clothe_id: clothes[i].clothe_id}, {$set: {'clothe_litteralColor': clothes[i].clothe_colors}}, {upsert: true}, function(err){console.log(err);});
    }

}

function removeClotheAlreadyUse(outfits, arrayOfCombinations){
    if (outfits.length === 0) return arrayOfCombinations;
    
    for (var i = 0; i < arrayOfCombinations.length; i++){
        if (arrayOfCombinations[i].length > 4){
            for (var j = 0; j < outfits.length; j++){
                for (var k=0; k < outfits[j].outfit.length; k++){
                    arrayOfCombinations[i] = arrayOfCombinations[i].filter(function (el) {
                        return el.clothe_id !== outfits[j].outfit[k].clothe_id;
                    });
                }
            }
        }
    }
    return arrayOfCombinations;
}

function removeClothes(user, types, arrayOfCombinations, callback){
    var j = arrayOfCombinations.length;
    for (var i = 0; i < arrayOfCombinations.length; i++){
        persoEngine.execute(user, types[i], arrayOfCombinations[i], function(result){
            j--;
            arrayOfCombinations[i] = result;
            
            if (j == 0){
                callback();
            }
        });
    }
}

function notEnoughOutfit(arrayOfCombinations){
    var result = [];
    for(var i=0; i < arrayOfCombinations.length; i++){
        var outfit = {}
        if (arrayOfCombinations[i].length > 0){
            outfit["style"] = ""
            outfit["outfit"] = []
            outfit["outfit"].push(arrayOfCombinations[i])
            result.push(outfit)
            break;
        }
    }
    return result
}

function rmImages(clothes){
    for (var i = 0; i < clothes.length; i++){
        clothes[i].clothe_image = undefined;
    }
    return clothes;
}


function retrieveWeather(lat, long, timezone, callback){
    weatherService.getWheather(lat, long, timezone, function(err, weather){
        callback(err, weather);
    });
}

function retrieveOutfitOfTheDay(req, callback){
    persoEngine.getOutfits(req.user, function(outfits){
        if (outfits.length > 100){
            callback(null, outfits);
        } else {
            Clothe.find({clothe_userid: new ObjectId(req.user._id)}, function(err, clothes){
            if(err) {
                 callback(err, null);
            } else {
                console.log("--->   v2.1 : ");
                
                var clothes = clothes;
                var styles = [req.user.atWorkStyle, req.user.relaxStyle, req.user.onPartyStyle];
                var sex = req.user.gender;
   
                var rules = [];
                if (req.user.gender == "M"){
                    rules = [ 
                        { "clothe_type" : ["maille", "top", "pants"] }
                    ];
                } else {
                    rules = [ 
                        { "clothe_type" : ["maille", "top", "pants"] },
                        { "clothe_type" : ["maille", "dress"] }
                    ];
                }

                var arrayOfCombinations = [], outfits = [];

                async.series([
                    //Remove all clothes already propose a certain amount of time this week.
                    function(callbackClothes){
                        persoEngine.apply(req.user, clothes, function(err, clothesFiltered){
                            //Get an array of array of prefiltered list of clothe depending of rules
                            arrayOfCombinations = contextEngine.execute(clothesFiltered, rules);
                            console.log("----------------------------------- " + clothesFiltered.length);
                            callbackClothes(null);
                        });
                    },    
                    function(callbackOutfit){
                        async.eachSeries(styles, function(style, endCallback){
                            async.eachSeries(arrayOfCombinations, function(item, callback){
                                item = removeClotheAlreadyUse(outfits, item);
                                if (!check1ArrayIsEmpty(item)) {
                                    var temp = styleEngine.calculateOutfits(style, sex, item, 40)
                                    temp.sort(sortOutfits)
                                    
                                    var selectedOutfits = top2Outfits(temp, style);
                                    outfits = outfits.concat(selectedOutfits);
                                    callback();
                                } else {
                                    callback();
                                }
                            }, function(err){
                                 endCallback();
                            });
                        }, function(err){
                            //Save current suggestion outfits
                            persoEngine.saveOutfits(req.user, outfits);
                            callbackOutfit(null, outfits);
                        });
                        
                    }
                ], function(err, outfits){
                    callback(null, outfits[1]);
                });
            }
            });
        }            
    });
}


router.post('/', passport.authenticate(['facebook-token', 'bearer'], { session: false }) , function(req, res) {
    if (typeof req.body !== 'undefined' && typeof req.body.styles !== 'undefined' && typeof req.body.dressing !== 'undefined' && typeof req.body.weather !== 'undefined') {
        var clothes = req.body.dressing;
		var styles = req.body.styles;
		var sex = req.body.sex;
        var weather = req.body.weather;
        updateClothesColor(clothes);
        
        for (var j=0; j < styles.length; j++){
            //Get Rules from Context (Weather, Temperature)
            //var rules = contextEngine.getRules(weather.code, weather.low, weather.high, styles[i]);
            
            var rules = [ 
                { "clothe_type" : ["maille", "top", "pants"] },
                { "clothe_type" : ["maille", "dress"] }
	       ];
            
            //Get an array of array of prefiltered list of clothe depending of rules
            var arrayOfCombinations = contextEngine.execute(clothes, rules);

            console.log("----------------------------------- " + arrayOfCombinations.length);
            var outfits = [], numberOfCombination = 0;

            //For each combination calculate outfits
            for (var i = 0; i < arrayOfCombinations.length; i++){
        
                //Check if all list of clothes are not empty.
                if (!check1ArrayIsEmpty(arrayOfCombinations[i])) {
                    var temp = styleEngine.calculateOutfits(styles[i], sex, arrayOfCombinations[i], 40)
                    console.log("Number Outfits " + temp.length + " " + styles[i]);
                    outfits = outfits.concat(bestOutfits(temp, styles[i]));
                    numberOfCombination++;
                }
            }
        }
        console.log("--->Nbr results : " + outfits.length);
		res.send(outfits);
	} else {
		res.send(500,"Server Error"); return;
	}
});

router.post('/v2/', passport.authenticate(['facebook-token', 'bearer'], { session: false }) , function(req, res) {
    
    if (typeof req.body !== 'undefined' && typeof req.body.weather !== 'undefined') {
        Clothe.find({clothe_userid: new ObjectId(req.user._id)}, function(err, clothes){
            if(err) {
                res.send(500, err);
            } else {
                console.log("--->   v2 : ");
                var clothes = clothes;
                console.log(req.body.styles);
                var styles = req.body.styles !== undefined ?  req.body.styles : [req.user.atWorkStyle, req.user.relaxStyle];
                var sex = req.user.gender;
                var weather = req.body.weather;
                
                var outfits = [];
                var rules = ""
                if (req.user.gender == "M"){
                    rules = [ 
                        { "clothe_type" : ["maille", "top", "pants"] }
                    ];
                } else {
                    rules = [ 
                        { "clothe_type" : ["maille", "top", "pants"] },
                        { "clothe_type" : ["maille", "dress"] }
                    ];
                }

                //Get an array of array of prefiltered list of clothe depending of rules
                var arrayOfCombinations = contextEngine.execute(clothes, rules);
                console.log("----------------------------------- " + arrayOfCombinations.length);

              /*  //For each combination calculate outfits
                for (var i = 0; i < arrayOfCombinations.length; i++){
                    //Check if all list of clothes are not empty.
                    //arrayOfCombinations = removeClotheAlreadyUse(outfits, arrayOfCombinations);
                    persoEngine.execute(req.user, rules[i].clothe_type, arrayOfCombinations[i], function(combinationFiltered){
                        if (!check1ArrayIsEmpty(combinationFiltered)) {
                            for (var j=0; j < styles.length; j++){
                                var temp = styleEngine.calculateOutfits(styles[i], sex, combinationFiltered, 0)
                                temp.sort(sortOutfits)
                                console.log("Number Outfits " + temp.length + " " + styles[j]);
                                var selectedOutfits = top2Outfits(temp, styles[j]);
                                persoEngine.saveOutfits(req.user, selectedOutfits);
                                outfits = outfits.concat(selectedOutfits);
                            }
                        }
                    });
                } */
                async.each(styles, function(style, endCallback){
                    async.each(arrayOfCombinations, function(item, callback){
                        console.log(style);
                        persoEngine.execute(req.user, item, function(combinationFiltered){
                            if (!check1ArrayIsEmpty(combinationFiltered)) {
                                var temp = styleEngine.calculateOutfits(style, sex, combinationFiltered, 0)
                                temp.sort(sortOutfits)
                                console.log("Number Outfits " + temp.length + " " + style);
                                var selectedOutfits = top2Outfits(temp, style);
                                persoEngine.saveOutfits(req.user, selectedOutfits);
                                outfits = outfits.concat(selectedOutfits);
                                callback();
                            }
                        });
                    }, 
                    function (err){
                        endCallback();
                               
                    });
                }, function (err){
                    res.send(outfits);
                });
                 
                
            }
        });
	} else {
		res.send(500,"Server Error"); 
        return;
	}
});

router.get('/v2.1/', passport.authenticate(['facebook-token', 'bearer'], { session: false }) , function(req, res) {
    console.log("------------ v2.1");
    async.parallel({
        weather : function(callback){
            retrieveWeather(req.query.lat, req.query.long, req.query.timezone, function(err, weather){
                callback(null, weather);
            });
        },    
        outfits : function(callback){
            retrieveOutfitOfTheDay(req, function(err, outfits){
                callback(err, outfits);
            });
        }
    },function (err, results){
        res.send(results);    
    });
});

router.get('/test', function (req, res){
    var styleCalc = function(stylized) {
        var probabNotGood          = fuzzylogic.trapezoid(stylized, 0, 10, 30, 40);
        var probabGood      = fuzzylogic.trapezoid(stylized, 30, 40, 70, 80);
        var probabVeryGood     = fuzzylogic.trapezoid(stylized, 70, 80, 100, 110);
        
        console.log('------ Stylized: ' + stylized);
        
        console.log('Not good: '       + probabNotGood);
        console.log('Good: '   + probabGood);
        console.log('Very Good: '  + probabVeryGood);
    };
    
    for (var i = 0; i <= 100; i = i+5){
        styleCalc(i);
    }
    
    res.send("ok");
});

/**********************************************************/
/*
        Save the outfit of the day

**********************************************************/
router.post('/OOTD', passport.authenticate(['facebook-token', 'bearer'], { session: false }) , function(req, res) {
    //GET 
    /*{
        style = "",
        clothes = [clothe_id, clothe_id...]
    }*/
    var user = req.user;
    var outfit = req.body;
    req.body["userid"] = req.user._id
    console.log(new Outfit(req.body));
    /*
    var newOutfit = new Outfit({userid: user._id, clothes : refClothes, style : outfits[i].style, matchingRate: outfits[i].matchingRate});
        newOutfit.save(function (err) {
            if (err) return callbackResult(err);
            //return callbackResult(null, newOutfit);
    }); */
});

//Return 1 Outfits by Style
router.post('/today', passport.authenticate('bearer', { session: false }) , function(req, res) {
    if (typeof req.body !== 'undefined' && typeof req.body.dressing !== 'undefined' && typeof req.body.weather !== 'undefined') {
        var clothes = req.body.dressing;
		var sex = req.body.sex;
        var styles = ["business", "casual", "sportwear", "fashion"]
        var weather = req.body.weather;
        
		var outfits = [], result = [];
        for (var i = 0; i < styles.length; i++){
             var rules = contextEngine.getRules(weather.code, weather.low, weather.high, styles[i]);
            var arrayOfCombinations = contextEngine.execute(clothes, rules);
            for (var j = 0; j < arrayOfCombinations.length; j++){
                if (!check1ArrayIsEmpty(arrayOfCombinations[j])) {
                    var temp = styleEngine.calculateOutfits(styles[i], sex, arrayOfCombinations[j]);
                    if (temp.length > 0){
                        outfits.push({style: styles[i], outfit: temp[0].outfit, matchingRate: temp[0].matchingRate});
                        break;
                    }
                }
            }
        }
		res.send(outfits);
	} else {
		res.send(500,"Server Error"); return;
	}
});


module.exports = router;