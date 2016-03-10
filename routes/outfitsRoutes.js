/**
 * Module to manage all the routes about outfits
 * based url '/outfits/'
 * @module OutfitsRoute
 */

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

function getMoment(style, moments, numberOfOutfits){
    for (var item in moments){
        if (moments[item].style === style && moments[item].number < 2){
            moments[item].number++;
            console.log("----------" + item);
            return item;
        }
    }
}

function top2Outfits(outfits, number, style, moments){
    var result = [];
    for (var i=0; i < outfits.length && i < 2*number; i++){
        var outfit = outfits[i];
        outfit["style"] = style;
        outfit["moment"] = getMoment(style, moments, i);
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

function retrieveWeather(lat, long, timezone, lang, callback){
    weatherService.getWheather(lat, long, timezone, lang, function(err, weather){
        callback(err, weather);
    });
}

function retrieveOutfitOfTheDay(req, callback){
    persoEngine.getOutfits(req.user, function(outfits){
        if (outfits.length > 4){
            console.log('Retrieve outfits already calculated');
            return callback(null, outfits);
        } else {
            Clothe.find({clothe_userid: new ObjectId(req.user._id)}, function(err, clothes){
            if(err) {
                 callback(err, null);
            } else {
                var clothes = clothes;
                var styles = [req.user.atWorkStyle, req.user.relaxStyle, req.user.onPartyStyle];
                var moments = {"atWork" : { number: 0, style: req.user.atWorkStyle}, "relax": { number: 0, style: req.user.relaxStyle}, "onParty": { number: 0, style: req.user.onPartyStyle}};
                var objStyle = deduplicateStyle(styles);
                
                var sex = req.user.gender;
                console.log(objStyle);
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

                var arrayOfCombinations = [], outfits = [], i=0;

                async.series([
                    //Remove all clothes already propose a certain amount of time this week.
                    function(callbackClothes){
                        persoEngine.apply(req.user, clothes, function(err, clothesFiltered){
                            //Get an array of array of prefiltered list of clothe depending of rules
                            arrayOfCombinations = contextEngine.execute(clothesFiltered, rules);
                            return callbackClothes(null);
                        });
                    },    
                    function(callbackOutfit){
                        async.forEachOf(objStyle, function(number, style, endCallback){
                            async.eachSeries(arrayOfCombinations, function(item, callback){
                                console.log(style + " " + number);
                                item = removeClotheAlreadyUse(outfits, item);
                                if (!check1ArrayIsEmpty(item)) {
                                    var temp = styleEngine.calculateOutfits(style, sex, item, 40)
                                    temp.sort(sortOutfits)
                                    
                                    var selectedOutfits = top2Outfits(temp, number, style, moments);
                                    outfits = outfits.concat(selectedOutfits);
                                    callback();
                                } else {
                                    callback();
                                }
                            }, function(err){
                                return endCallback(null);
                            });
                        }, function(err){
                            //Save current suggestion outfits
                            persoEngine.saveOutfits(req.user, outfits, function(err, outfits){
                                console.log("saveOutfits");
                                return callbackOutfit(null, outfits);
                            });
                        });
                        
                    }
                ], function(err, results){
                    console.log("End");
                    return callback(null, results[1]);
                });
            }
            });
        }            
    });
}

function deduplicateStyle(styles){
    var objStyle = {};
    for (var i = 0; i < styles.length; i++){
        if (typeof objStyle[styles[i]] === 'undefined'){
            objStyle[styles[i]] = 1;
        } else {
            objStyle[styles[i]]++;
        }
    }
    return objStyle;
}

/**
* Get outfits route '/'
* @deprecated
*/
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

/**
* Get outfits route '/v2'
* @deprecated
*/
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

/**
* Get outfits route '/v2.1/'
* @param {Number} req.query.lat
* @param {Number} req.query.long
* @param {Number} req.query.timezone
* @returns {weather: Object, outfits: Array}
*/
router.get('/v2.1/', passport.authenticate(['facebook-token', 'bearer'], { session: false }) , function(req, res) {
    console.log("------------ v2.1");
    console.log( req.acceptsLanguages());
    var lang = req.acceptsLanguages().length > 0 ? req.acceptsLanguages()[0] : 'en';
    async.parallel({
       weather : function(callback){
            retrieveWeather(req.query.lat, req.query.long, req.query.timezone, lang, function(err, weather){
                return callback(null, weather);
            });
        }, 
        outfits : function(callback){
            retrieveOutfitOfTheDay(req, function(err, outfits){
                return callback(err, outfits);
            });
        }
    },function (err, results){
        console.log("send results");
        res.send(results);    
    });
});

/**
* Save the outfit of the day route '/OOTD'
* @param {Outfit} req.body - Outfit to save
*/
router.post('/OOTD', passport.authenticate(['facebook-token', 'bearer'], { session: false }) , function(req, res) {
    //POST 
    /*{
        style = "",
        clothes = [clothe_id, clothe_id...]
    }*/
    var user = req.user;
    var outfit = req.body;
    req.body["userid"] = req.user._id;
    
    
    //Check if an outfit exist for today
    var startDate = new Date(); // this is the starting date that looks like ISODate("2014-10-03T04:00:00.188Z")
    startDate.setSeconds(0);
    startDate.setHours(0);
    startDate.setMinutes(0);
    var query = { $and : [{userid: new ObjectId(user._id)}, { updated : { $gt: startDate}}, {isPutOn : true} ]};
    
    var clothes = req.body.clothes;
    outfit.clothes = [];
    console.log("Outfit " + outfit._id);
    //Check if outfit was a suggestion
    if (typeof outfit._id !== 'undefined' && outfit._id !== ""){ //Update outfit
        Outfit.findOneAndUpdate(query, {$set: {'isPutOn': false}}, {upsert: false}, function(err, result){
            async.each(clothes, 
                function(clothe, callback) {
                    Clothe.findOne({clothe_id : clothe.clothe_id}, function(err, clo){
                        outfit.clothes.push(clo);
                        callback();
                    });
                }, function(err){
                    Outfit.update({_id: outfit._id}, {$set: {'isPutOn': true}, clothes: outfit.clothes}, {upsert: true}, function(err){
                        console.log("Id present");
                        console.log(err);
                        if (err) return res.send(err);
                        res.send("Success");
                    });
                });
            });     
    } else {
        outfit.isPutOn = true;
    
        async.each(clothes, 
            function(clothe, callback) {
                Clothe.findOne({clothe_id : clothe.clothe_id}, function(err, clo){
                    outfit.clothes.push(clo);
                    callback();
                });
            }, function(err){
                Outfit.findOneAndUpdate(query, {$set: {'isPutOn': false, clothes: outfit.clothes}}, {upsert: false}, function(err, result){
                    console.log("new outfit");
                    console.log(outfit);
                    delete outfit._id;
                    var newOutfit = new Outfit(outfit);
                        newOutfit.save(function (err) {
                            console.log("no id present");
                            console.log(err);
                            if (err) return res.send(err);
                            res.send({isSuccess : true});
                        });
                    });
            }
        );
    }
});


router.get('/outfitsPutOn', passport.authenticate(['facebook-token', 'bearer'], { session: false }) , function(req, res){
    var startDate = new Date(new Date().setDate(new Date().getDate() - 30));
    startDate.setSeconds(0);
    startDate.setHours(0);
    startDate.setMinutes(0);
    
    var query = {
        $and : [{userid: new ObjectId(req.user._id)}, { updated : { $gt: startDate}}, {isPutOn : true} ]
    }
    Outfit
        .find(query)
        .populate('clothes')
        .exec(function(err, outfits){
            if(err) { return err; }
            res.send(outfits);
        });
});

module.exports = router;