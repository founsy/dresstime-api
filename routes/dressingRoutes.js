var rootPath = process.cwd();

var express = require('express'),
	router = express.Router(),
    passport = require('passport'),
	mongoDb = require(rootPath + '/db/mongodb');

router.get('/:username', passport.authenticate('bearer', { session: false }) , function(req, res){
	mongoDb.getDressing(req.param('username'))
  		.then(function (result){ //case in which user already exists in db
    		res.send(result);
  	}).fail(function (error){
  		res.send(500, error);
  	});
});

router.get('/clothes/:username', passport.authenticate('bearer', { session: false }), function(req, res){
	mongoDb.getDressing(req.param('username'))
  		.then(function (result){ //case in which user already exists in db
            var clothesId = { list: [] };

            if (typeof result.dressing !== 'undefined' && result.dressing.length > 0){
                for (var i = 0; i < result.dressing.length; i++){
                    console.log(result.dressing[i].clothe_id);
                    clothesId.list.push({ id: result.dressing[i].clothe_id});
                }
                res.send(clothesId);
            } else {
    		  res.send(500, error);
            }
  	}).fail(function (error){
  		res.send(500, error);
  	});
});

router.get('/clothes/:username/:clotheid', passport.authenticate('bearer', { session: false }), function(req, res){
	mongoDb.getDressing(req.param('username'), req.param('clotheid'))
  		.then(function (result){ //case in which user already exists in db
        console.log(JSON.stringify(result));    
        var clothe = { clothe: result.dressing[0] };
        
            res.send(clothe);
  	}).fail(function (error){
  		res.send(500, error);
  	});
});

router.post('/', function(req, res){
		var user = req.body;
		mongoDb.insertDressing(user)
  		.then(function (result){ //case in which user already exists in db
    		res.send({ clothe: result});
  		}).fail(function (error){
  			res.send(500, error);
  		});		
	})

module.exports = router;