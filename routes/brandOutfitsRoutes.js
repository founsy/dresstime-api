var express = require('express');
var router = express.Router();
var http = require('http');
var passport = require('passport');

var rootPath = process.cwd();

var db = require(rootPath + '/db/databases');

var newCalculator = require(rootPath + '/libs/newOutfiteEngine');
var contextEngine = require(rootPath + '/libs/rulesEngine');
var shoppingEngine = require(rootPath + '/libs/shoppingEngine');

var data = require(rootPath + "/db/data");

function check1ArrayIsEmpty(arrayOfCombination){
    for (var j = 0; j<arrayOfCombination.length; j++){
        if (arrayOfCombination[j].length === 0) return true;
    }
    return false;
}

router.post('/byStyle'/*, passport.authenticate('bearer', { session: false })*/ , function(req, res) {
    if (typeof req.body !== 'undefined' && typeof req.body.sexe !== 'undefined' && typeof req.body.weather !== 'undefined' && typeof req.body.weather !== 'undefined') {
        var sexe = req.body.sexe === 'M' ? 1 : 0, weather = req.body.weather, style = req.body.style;
        var clothes = data.dressingMenCasual;
        
        //Get Rules from Context (Weather, Temperature)
        var rules = contextEngine.getRules(weather.code, weather.low, weather.high, style);
        //Get an array of array of prefiltered list of clothe depending of rules
        var arrayOfCombinations = contextEngine.execute(clothes, rules);
        var outfitsResult = [];
        for (var j = 0; j < arrayOfCombinations.length; j++){
            if (!check1ArrayIsEmpty(arrayOfCombinations[j])) {
                var temp = newCalculator.getOutfit('casual', sexe, arrayOfCombinations[j], 60);
                if (typeof temp !== 'undefined') {
                    var result = shoppingEngine.execute(temp.outfit);
                    console.log(result);
                    outfitsResult = outfitsResult.concat(result);
                }
            }
        }
        //var result = shoppingEngine.execute(outfitsResult);
        
        res.send(outfitsResult);
    } else {
		res.send(500,"Server Error"); return;
	}
});


router.post('/today'/*, passport.authenticate('bearer', { session: false })*/ , function(req, res) {
    if (typeof req.body !== 'undefined' && typeof req.body.sexe !== 'undefined' && typeof req.body.weather !== 'undefined') {
        var sexe = req.body.sexe === 'M' ? 1 : 0, weather = req.body.weather, style = req.body.style;
        var styles = ["business", "casual", "sportwear", "fashion"]
        db.getClothes(sexe, function(err, clothes) {
            if(err) { res.send(500,"Server Error"); return;}
            
            //Get Rules from Context (Weather, Temperature)
            var rules = contextEngine.getRules(weather.code, weather.low, weather.high, style);
            //Get an array of array of prefiltered list of clothe depending of rules
            var arrayOfCombinations = contextEngine.execute(clothes, rules);
            console.log("Combination "  + arrayOfCombinations.length);
            var outfitsResult = [], result = [];
            //for (var i = 0; i < styles.length; i++){
                var rules = contextEngine.getRules(weather.code, weather.low, weather.high, 'fashion');
                var arrayOfCombinations = contextEngine.execute(clothes, rules);
                for (var j = 0; j < arrayOfCombinations.length; j++){
                    if (!check1ArrayIsEmpty(arrayOfCombinations[j])) {
                        var temp = newCalculator.getOutfit('fashion', sexe, arrayOfCombinations[j], 90);
                        if (typeof temp !== undefined){
                            outfitsResult.push({style: 'fashion', outfit: temp.outfit, matchingRate: temp.matchingRate});
                            break;
                        }
                    }
                }
           // }
		  res.send(outfitsResult);
        });
    } else {
		res.send(500,"Server Error"); return;
	}
});

module.exports = router;