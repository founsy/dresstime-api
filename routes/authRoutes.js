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
        password: req.body.user.password 
    });
    
    user.save(function(err, user) {
        if(!err) {
            res.send("New user - %s:%s", user.username, user.password);
        }else {
            res.send(err);
        }
    });
});

//logs user out of site, deleting them from the session, and returns to homepage
router.get('/logout', function(req, res){
  	if (req.user !== undefined){
		var name = req.user.username;
		console.log("LOGGIN OUT " + req.user.username)
		req.logout();
		req.session.notice = "You have successfully been logged out " + name + "!";
		res.send("You have successfully been logged out " + name + "!");
	} else {
		res.send("Already logout!");
	}
});

module.exports = router;