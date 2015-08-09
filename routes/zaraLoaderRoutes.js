var express = require('express');
var router = express.Router();
var http = require('http');
var passport = require('passport');

var rootPath = process.cwd();

var db = require(rootPath + '/db/databases');

var outfiteCalculator = require(rootPath + '/libs/outfiteEngine');
var newCalculator = require(rootPath + '/libs/newOutfiteEngine');
var zaraPartner = require(rootPath + '/libs/zaraPartner');
var mongodb = require(rootPath + '/db/mongodb.js');
var data = require(rootPath + '/db/data');


router.get('/', passport.authenticate('bearer', { session: false }), function(req, res) {
    //res.setHeader('Content-Type', 'text/plain');
    //res.end('Vous êtes à l\'accueil');
    db.getRecords("Grey", function(err, results) {
    	if(err) { res.send(500,"Server Error"); return;}
   	 	// Respond with results as JSON
    	res.send(results);
 	});
});

router.post('/zaraloader', passport.authenticate('bearer', { session: false }), function(req, res) {
	//http://www.zara.com/itxrest/1/catalog/store/10703/category/'+categorieId+'/product
	zaraPartner.retrieveProducts();
	res.send("Success");
});

router.post('/outfitsLoading', passport.authenticate('bearer', { session: false }) , function(req, res) {
	var sex = 1;
    db.getClothes(sex, function(err, results) {
    	if(err) { res.send(500,"Server Error"); return;}
    	console.log("Start outfits");
    	
    	if (typeof req.body !== 'undefined' && typeof req.body.style !== 'undefined') {
			var style = req.body.style;
			
			// Respond with results as JSON
			var mailleList = results.filter(function(x){return x.clothe_type === "maille"}); 
			var topList = results.filter(function(x){return x.clothe_type === "top"}); 
			var pantsList = results.filter(function(x){return x.clothe_type === "pants"}); 

			var outfits = [];
			outfits = outfiteCalculator.calculateOutfits(style, mailleList, topList, pantsList, false);
			console.log(outfits.length);
			mongodb.removeOutfitsCollection(style, function(err, results) {
					mongodb.saveOutfitsCollection(style, outfits, function(err, results) {
						if(err) { console.log(results); res.send("Server Error"); return;}
						// Respond with results as JSON
						res.send(results);
					});
			});
		}
 	});
});

router.post('/myoutfits', passport.authenticate('bearer', { session: false }) , function(req, res) {
    console.log(req.body);
    if (typeof req.body !== 'undefined' && typeof req.body.style !== 'undefined' && typeof req.body.dressing !== 'undefined') {
        var clothes = req.body.dressing;
		var style = req.body.style;
		var sex = req.body.sex;
        
		// Respond with results as JSON
		var mailleList = clothes.filter(function(x){return x.clothe_type === "maille"}); 
		var topList = clothes.filter(function(x){return x.clothe_type === "top"}); 
		var pantsList = clothes.filter(function(x){return x.clothe_type === "pants"}); 

		var outfits = [];
        if (sex.toUpperCase() === "M"){
            console.log("Men");
            outfits = outfiteCalculator.calculateOutfits(style, mailleList, topList, pantsList, true);
        } else if (sex.toUpperCase() === "F") {
            console.log("Women");
            outfits = newCalculator.calculateOutfits(style, sex, clothes, ["maille", "top", "pants"]);
        }
		res.send(outfits);
	} else {
		res.send(500,"Server Error"); return;
	}
});

router.get('/outfits', passport.authenticate('bearer', { session: false }) , function(req, res) {
	var query = require('url').parse(req.url,true).query;
	var options = {limit: 10, skip: 10};
	
	if (typeof query !== 'undefined' && typeof query.limit !== 'undefined')
		options.limit = query.limit;
	if (typeof query !== 'undefined' && typeof query.skip !== 'undefined')
		options.skip = query.skip;
	
	mongodb.getOutfitsCollection(options, function(results){
		console.log(results.length);
		res.send(results);
	});
});

router.post('/outfits', passport.authenticate('bearer', { session: false }) , function(req, res) {
	var body = '';
	console.log(req.body);
	var options = {limit: 10, skip: getRandomArbitrary(0, 5)};
	/* {
		weather: { code: "30", date: "", day: "", high: "", low:"", text: "" },
		city : "",
		sex : "",
		style: ""	
	} */
	var value = -1;
	if (typeof req.body !== 'undefined' && typeof req.body.weather !== 'undefined')
		value = data.getWeatherGroup(req.body.weather.code);
	if (typeof req.body !== 'undefined' && typeof req.body.style !== 'undefined') {
		var style = req.body.style;		
		console.log(value);
		mongodb.getOutfitsCollection(style, options, function(results){
			console.log(results.length);
			res.send({ outfits : results, weather : value === 1 ? "sun" : value === 2 ? "cloud" : value === 3 ? "rain" : value === 4 ? "wind" : value === 5 ? "sun" : "bad code"});
		});
	}
});

// Returns a random number between min (inclusive) and max (exclusive)
function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}

module.exports = router;