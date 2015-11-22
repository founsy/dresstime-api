var rootPath = process.cwd();

var express = require('express'),
	router = express.Router(),
	mongoDb = require(rootPath + '/db/mongodb'),
    passport = require('passport'),
    User = require(rootPath + '/models/user');
/*
router.get('/:username', function(req, res){
    var query = User.findOne();
    query.where('username', req.param('username'));
    query.exec(function (err, user) {
        if (err) { res.send(500, err); }
        res.send(user.getToSend());
    });
});*/

router.get('/', passport.authenticate('bearer', { session: false }) , function(req, res){
    var query = User.findOne();
    query.where('username', req.user.username);
    query.exec(function (err, user) {
        if (err) { res.send(500, err); }
        console.log(user);
        res.send(user.getToSend());
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
	.put('/', passport.authenticate('bearer', { session: false }),function(req, res){
        var query = User.findOne();
        query.where('username', req.user.username);
        query.exec(function (err, user) {
            if (err) { res.send(500, err); }
            var newUser = req.body;
            
            user.email = typeof newUser.email !== 'undefined' ? newUser.email : user.email; 
            user.username = typeof newUser.username !== 'undefined' ? newUser.username : user.username;
            user.displayName = typeof newUser.displayName !== 'undefined' ? newUser.displayName : user.displayName;
            user.atWorkStyle = typeof newUser.atWorkStyle !== 'undefined' ? newUser.atWorkStyle : user.atWorkStyle;
            user.onPartyStyle = typeof newUser.onPartyStyle !== 'undefined' ? newUser.onPartyStyle : user.onPartyStyle;
            user.relaxStyle = typeof newUser.relaxStyle !== 'undefined' ? newUser.relaxStyle : user.relaxStyle;
            user.tempUnit = typeof newUser.tempUnit !== 'undefined' ? newUser.tempUnit : user.tempUnit;
            user.gender = typeof newUser.gender !== 'undefined' ? newUser.gender : user.gender;
            user.picture = typeof newUser.picture !== 'undefined' ? newUser.picture : user.picture;
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