var express = require('express');
var router = express.Router();
var http = require('http');
var passport = require('passport');

var rootPath = process.cwd();

var styleEngine = require(rootPath + '/libs/styleEngine');
var contextEngine = require(rootPath + '/libs/rulesEngine');

var Clothe = require(rootPath + '/models/clothe');

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

function updateClothesColor(clothes){
    for (var i = 0; i < clothes.length; i++){
        console.log(clothes[i].clothe_colors);
        Clothe.update({clothe_id: clothes[i].clothe_id}, {$set: {'clothe_litteralColor': clothes[i].clothe_colors}}, {upsert: true}, function(err){console.log(err);});
    }

}


router.post('/', passport.authenticate('bearer', { session: false }) , function(req, res) {
    if (typeof req.body !== 'undefined' && typeof req.body.styles !== 'undefined' && typeof req.body.dressing !== 'undefined' && typeof req.body.weather !== 'undefined') {
        var clothes = req.body.dressing;
		var styles = req.body.styles;
		var sex = req.body.sex;
        var weather = req.body.weather;
        updateClothesColor(clothes);
        
        for (var j=0; j < styles.length; j++){
            //Get Rules from Context (Weather, Temperature)
            var rules = contextEngine.getRules(weather.code, weather.low, weather.high, styles[i]);
            //Get an array of array of prefiltered list of clothe depending of rules
            var arrayOfCombinations = contextEngine.execute(clothes, rules);

            console.log("----------------------------------- " + arrayOfCombinations.length);
            var outfits = [], numberOfCombination = 0;

            //For each combination calculate outfits
            for (var i = 0; i < arrayOfCombinations.length; i++){
                console.log("Calculate Outfits " + arrayOfCombinations[i].length + " " + styles[i]);
                //Check if all list of clothes are not empty.
                if (!check1ArrayIsEmpty(arrayOfCombinations[i])) {
                    var temp = styleEngine.calculateOutfits(styles[i], sex, arrayOfCombinations[i])
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