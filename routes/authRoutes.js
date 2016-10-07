var rootPath = process.cwd();

var express = require('express'),
	router = express.Router(),
	mongoDb = require(rootPath + '/db/mongodb'),
    passport = require('passport'),
    User = require(rootPath + '/models/user'),
    MailVerification = require(rootPath + '/routes/mailVerification'),
    ResetPasswordToken = require(rootPath + '/models/resetPasswordToken'),
    AccessToken = require(rootPath + '/models/accessToken');
    
    var ObjectId = require('mongoose').Types.ObjectId;

//sends the request through our local signup strategy, and if successful takes user to homepage, otherwise returns then to signin page
router.post('/registration', function(req, res) {
  	// If this function gets called, authentication was successful.
    // `req.user` contains the authenticated user.
    var userCreate = req.body
    if (userCreate.fb_id === "" && userCreate.password === ""){
        res.send(new Error('Password can not be empty'));
    }
    
    userCreate.isVerified = true
    
    var user = new User(userCreate);
    
    user.save(function(err, user) {
        if(err) {
        	if (typeof err.toJSON !== 'undefined'){
        		var json = err.toJSON();
            	res.send(400, json);
        	} else {
        		var error = {name: err.name, fields: []};
        		
        		if (err.name == 'ValidationError') {
    				for (field in err.errors) {
    					error.fields.push({name : field, type: err.errors[field].properties.type});
    				}
    			}
        		
        		res.send(400, error);
        	}
        	
        } else {
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
  
router.get('/resetpassword/form', function(req, res){
	var html = '<html><head>' +
'<script>/*<![CDATA[*/function gup(c,b){if(!b){b=location.href}c=c.replace(/[\[]/,"\\[").replace(/[\]]/,"\\]");var a="[\\?&]"+c+"=([^&#]*)";var e=new RegExp(a);var d=e.exec(b);return d==null?null:d[1]}function setHiddenToken(){document.getElementsByName("token")[0].value=gup("verifToken")}/*]]>*/</script>'+
'</head>' +
'<body>' +
'<form action="/auth/resetpassword/newpassword" method="post">' +
'<div>' +
'<label for="nom">New password :</label>' +
'<input type="password" name="password" id="password" />' +
'</div>' +
'<input type="hidden" name="token" value="">' +
'<button type="submit">Send</button>' +
'</form>' +
'<script>setHiddenToken();</script>' +
'</body>' +
'</html>'
	res.send(html);

});
  
router.get('/resetpassword/:email', function(req, res) {
  	User.findOne({email : req.params.email}, function(err, user){
        if(err || user === null)
           res.send(500, err);
        else {
            //Send Verification email
            MailVerification.sendResetPasswordEmail(user, function(err, result){
                res.send({result : "OK "}); 
            }); 
        }          
    });
});

router.post('/resetpassword/newpassword', function(req, res){
	console.log(req.body);
	var password = req.body.password;
	ResetPasswordToken.findOne({verifToken: req.body.token}, function(err, token){	
		if(err || token == null) {
			res.send(500, err);
		}
		else {
			console.log(token);
			if( Math.round((Date.now()-token.created)/1000) < 600 ) {
				var userId = token.userId; 
                ResetPasswordToken.remove({ verifToken: token.verifToken }, function (err) {
                    if (err) {
                    	return res.send(500, err);
                    } else {
                    	User.findOne({_id : new ObjectId(userId)}, function (err, user){
                    		console.log(user);
                    		user.password = password;
                    		user.save(function(err){
                    			console.log(err);
                    			if (err) {
                    				return res.send(500, err);
                    			} else {	
                    				res.send({result: "OK"});
                    			}
                    		});
                    	});	
                    }
                });
            }
		}
	});
});

module.exports = router;