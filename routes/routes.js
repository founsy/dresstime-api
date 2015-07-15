var rootPath = process.cwd();

var express = require('express');
var router = express.Router();
var db = require(rootPath + '/db/databases');


//displays our signup page
router.get('/auth/signin', function(req, res){
  res.render('signin');
});

router.get('/opencv', function(req, res){
	var cv = require('./opencv');
	cv.detectContour(function(result){
		res.send(result);
	});
});

router.get('/download', function(req, res){
	var fs = require('fs'),
    request = require('request');
    var imageUri, name;
	db.getColors(function(err, results) {
    	if(err) { res.send(500,"Server Error"); return;}
   	 	// Respond with results as JSON
   	 	console.log(results.length);
    	for (var i = 0; i < results.length; i++){
    		(function(imageUri, name){
    			request.head(imageUri, function(err, res, body){
    			request(imageUri).pipe(fs.createWriteStream("./images/" + name.replace('/', '-') + ".jpg")).on("close", function(){console.log("dsfjdhfjsdk")});
  				});	
  			})(results[i].clothe_image, results[i].clothe_colors);
    	}
    	res.send(results);
 	});
});

router.get('/downloadImages' , function(req, res){
	var fs = require('fs'),
    request = require('request'),
    path = require('path');
    var imageUri, name;
	db.getClothes(null,function(err, results) {
    	if(err) { res.send(500,"Server Error"); return;}
   	 	// Respond with results as JSON
   	 	console.log(results.length);
    	for (var i = 0; i < results.length; i++){
    		(function(imageUri){
    				request.head(imageUri, function(err, res, body){
    				var nameImage = path.basename(imageUri);
    				request(imageUri).pipe(fs.createWriteStream("./images/" + nameImage));
  				});	
  			})(results[i].clothe_image);
    	}
    	res.send(results);
 	});
});

module.exports = router;