var rootPath = process.cwd();

var express = require('express'),
	router = express.Router(),
	mongoDb = require(rootPath + '/db/mongodb'),
    passport = require('passport'),
    User = require(rootPath + '/models/user'),
    Clothe = require(rootPath + '/models/clothe'),
    imagesManager = require(rootPath + '/libs/imagesManager'),
    ObjectId = require('mongoose').Types.ObjectId;
/*
router.get('/:username', function(req, res){
    var query = User.findOne();
    query.where('username', req.param('username'));
    query.exec(function (err, user) {
        if (err) { res.send(500, err); }
        res.send(user.getToSend());
    });
});*/

router.get('/', passport.authenticate(['facebook-token', 'bearer'], { session: false }) , function(req, res){
    var query = User.findOne();
    query.where('username', req.user.username);
    query.exec(function (err, user) {
        if (err) { res.send(500, err); }
        if (!user){
            res.send(req.user);
        } else {
            res.send(user);
        }
    });
});

router.put('/updateImages', passport.authenticate(['facebook-token', 'bearer'], { session: false }) , function(req, res){
    Clothe.find({}, function(err, clothes){
        if(err) {
           res.send(500, err);
        } else {
            for (var i = 0; i < clothes.length; i++){
                imagesManager.writeImage(clothes[i]);
            }
            
            res.send("Clothes updated : " + clothes.length); 
        }
    });
});



router.post('/', passport.authenticate(['facebook-token', 'bearer'], { session: false }), function(req, res){
		var user = req.body;
		
		var userToSave = User(user);
		userToSave.save(function(err){
			console.log(err);
        	if(err){
           		res.send(400, err);
       	 	} else {
            	res.send({ user: userToSave});
            }
    	});
		
	})
	.put('/', passport.authenticate(['facebook-token', 'bearer'], { session: false }),function(req, res){
        var query = User.findOne();
        query.where('username', req.user.username);
        query.exec(function (err, user) {
            if (err) { res.send(500, err); }
            var newUser = req.body;
            
            user.email = typeof newUser.email !== 'undefined' ? newUser.email : user.email; 
            user.username = typeof newUser.username !== 'undefined' ? newUser.username : user.username;
            user.displayName = typeof newUser.displayName !== 'undefined' ? newUser.displayName : user.displayName;
            user.firstName = typeof newUser.firstName !== 'undefined' ? newUser.firstName : user.firstName;
            user.lastName = typeof newUser.lastName !== 'undefined' ? newUser.lastName : user.lastName;
            user.styles = typeof newUser.styles !== 'undefined' ? newUser.styles : user.styles;
            user.tempUnit = typeof newUser.tempUnit !== 'undefined' ? newUser.tempUnit : user.tempUnit;
            user.gender = typeof newUser.gender !== 'undefined' ? newUser.gender : user.gender;
            user.picture = typeof newUser.picture !== 'undefined' ? newUser.picture : user.picture;
            user.fb_id = typeof newUser.fb_id !== 'undefined' ? newUser.fb_id : user.fb_id;
            user.fb_token = typeof newUser.fb_token !== 'undefined' ? newUser.fb_token : user.fb_token;
            user.notification =  typeof newUser.notification !== 'undefined' ? newUser.notification : user.notification;
            
            user.save(function(err) {
                if (err) {
                    res.send(500, err);
                }
                else {
                    res.send(user.getToSend());
                }
            });
            
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