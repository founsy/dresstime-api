var rootPath = process.cwd();

var express = require('express'),
	router = express.Router(),
	mongoDb = require(rootPath + '/db/mongodb'),
    passport = require('passport'),
    User = require(rootPath + '/models/user');

//sends the request through our local signup strategy, and if successful takes user to homepage, otherwise returns then to signin page
router.post('/registration', function(req, res) {
  	// If this function gets called, authentication was successful.
    // `req.user` contains the authenticated user.
    console.log(req.body.user);
     var user = new User({ 
        username: req.body.user.username, 
        password: req.body.user.password,
        email: req.body.user.email,
        displayName: "",
        atWorkStyle: req.body.user.atWorkStyle,
        onPartyStyle: req.body.user.onPartyStyle,
        relaxStyle: req.body.user.relaxStyle,
        tempUnit: req.body.user.tempUnit,
        gender: req.body.user.gender,
        picture: ""
    });
    
    user.save(function(err, user) {
        if(err) {
            res.send(err);
        }else {
            res.send(user.getToSend());    
        }
    });
});

//logs user out of site, deleting them from the session, and returns to homepage
router.get('/logout', passport.authenticate('bearer', { session: false }), function(req, res){
  	if (req.user !== undefined){
		var name = req.user.username;
		console.log("LOGGIN OUT " + req.user.username)
		req.logout();
		res.send({ msg : "You have successfully been logged out " + name + "!" });
	} else {
		res.send({ msg : "Already logout!" });
	}
});

module.exports = router;