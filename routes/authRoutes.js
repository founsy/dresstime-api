var rootPath = process.cwd();

var express = require('express'),
	router = express.Router(),
	mongoDb = require(rootPath + '/db/mongodb'),
    passport = require('passport'),
    User = require(rootPath + '/models/user'),
    MailVerification = require(rootPath + '/routes/mailVerification'),
    AccessToken = require(rootPath + '/models/accessToken');

//sends the request through our local signup strategy, and if successful takes user to homepage, otherwise returns then to signin page
router.post('/registration', function(req, res) {
  	// If this function gets called, authentication was successful.
    // `req.user` contains the authenticated user.
    console.log(req.body);
    var userCreate = req.body
    if (userCreate.fb_id === "" && userCreate.password === ""){
        res.send(new Error('Password can not be empty'));
    }
    
    var user = new User({ 
        username: userCreate.username, 
        password: userCreate.password,
        email: userCreate.email,
        displayName: userCreate.displayName,
        atWorkStyle: userCreate.atWorkStyle,
        onPartyStyle: userCreate.onPartyStyle,
        relaxStyle: userCreate.relaxStyle,
        tempUnit: userCreate.tempUnit,
        gender: userCreate.gender,
        picture: userCreate.picture,
        isVerified: true/*userCreate.isVerified*/,
        fb_id : userCreate.fb_id,
        fb_token: userCreate.fb_token
    });
    
    user.save(function(err, user) {
        if(err) {
            res.send(500, err);
        }else {
           /* if (user.fb_id === "" || !user.isVerified){
                //Send Verification email
                MailVerification.sendVerificationEmail(user.email, function(err, result){
                    res.send(user.getToSend()); 
                });
            } else { */
                res.send(user.getToSend());
            //}
        }
    });
});

//logs user out of site, deleting them from the session, and returns to homepage
router.get('/logout', passport.authenticate(['facebook-token', 'bearer'], { session: false }), function(req, res){
  	console.log("logout");
    if (req.user !== undefined){
		var name = req.user.username;
        console.log(req.user.userId);
        AccessToken.remove({userId : req.user.userId}, function(err){
        });
        req.logout();
		res.send({ msg : "You have successfully been logged out " + name + "!" });
	} else {
		res.send({ msg : "Already logout!" });
	}
});

router.get('/facebook',
  passport.authenticate('facebook-token', { scope: 'email' }),
  function(req, res){
    // The request will be redirected to Facebook for authentication, so this
    // function will not be called.
    console.log("facebook");
  });

router.get('/facebook/callback',
  passport.authenticate('facebook-token', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    console.log("/facebook/callback");
    res.send(req.user.getToSend());
  });

module.exports = router;