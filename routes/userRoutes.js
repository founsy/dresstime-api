var rootPath = process.cwd();

var express = require('express'),
	router = express.Router(),
	mongoDb = require(rootPath + '/db/mongodb'),
    passport = require('passport');

router.get('/:username', passport.authenticate('bearer', { session: false }) , function(req, res){
	mongoDb.getUser(req.param('username'))
  		.then(function (result){ //case in which user already exists in db
    		res.send(result);
  	}).fail(function (error){
  		res.send(500, error);
  	});
});


router.post('/', passport.authenticate('bearer', { session: false }), function(req, res){
		var user = req.body;
		mongoDb.insertUser(user)
  		.then(function (result){ //case in which user already exists in db
    		res.send(result);
  		}).fail(function (error){
  			res.send(500, error);
  		});		
	})
	.put(function(req, res){
		var user = req.body;
		mongoDb.updateUser(user)
  		.then(function (result){ //case in which user already exists in db
    		res.send(result);
  		}).fail(function (error){
  			res.send(500, error);
  		});
	})
	.delete(function(req, res){
		var user = req.body;
		mongoDb.deleteUser(user)
  		.then(function (result){ //case in which user already exists in db
    		res.send(result);
  		}).fail(function (error){
  			res.send(500, error);
  		});
	});

module.exports = router;