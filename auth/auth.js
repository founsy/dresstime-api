var passport = require('passport');
var BasicStrategy = require('passport-http').BasicStrategy,
    FacebookTokenStrategy = require('passport-facebook-token'),
    FacebookStrategy = require('passport-facebook').Strategy,
    ClientPasswordStrategy = require('passport-oauth2-client-password').Strategy,
    BearerStrategy = require('passport-http-bearer').Strategy;

var rootPath = process.cwd() + '/';

var config = require(rootPath + 'config');

var User = require(rootPath + 'models/user');
var Client = require(rootPath + 'models/client');
var AccessToken = require(rootPath + 'models/accessToken');
var RefreshToken = require(rootPath + 'models/refreshToken');

passport.use(new BasicStrategy(
    function(username, password, done) {
         console.log("BasicStrategy");
        Client.findOne({ clientId: username }, function(err, client) {
            if (err) { 
            	return done(err); 
            }

            if (!client) { 
            	return done(null, false); 
            }

            if (client.clientSecret !== password) { 
            	return done(null, false); 
            }

            return done(null, client);
        });
    }
));

passport.use(new ClientPasswordStrategy(
    function(clientId, clientSecret, done) {
        console.log("ClientPasswordStrategy");
    
        Client.findOne({ clientId: clientId }, function(err, client) {
            if (err) { 
            	return done(err); 
            }

            if (!client) { 
            	return done(null, false); 
            }

            if (client.clientSecret !== clientSecret) { 
            	return done(null, false); 
            }

            return done(null, client);
        });
    }
));

passport.use(new BearerStrategy(
    function(accessToken, done) {
        AccessToken.findOne({ token: accessToken }, function(err, token) {
            console.log("BearerStrategy");
            if (err) { 
            	return done(err); 
            }

            if (!token) { 
            	return done(null, false); 
            }
            
            //TODO - Token valide forever
           /* if( Math.round((Date.now()-token.created)/1000) > config.get('security:tokenLife') ) {

                AccessToken.remove({ token: accessToken }, function (err) {
                    if (err) {
                    	return done(err);
                    } 
                });

                return done(null, false, { message: 'Token expired' });
            } */

            User.findById(token.userId, function(err, user) {
            
                if (err) { 
                	return done(err); 
                }

                if (!user) { 
                	return done(null, false, { message: 'Unknown user' }); 
                }

                var info = { scope: '*' };
                done(null, user, info);
            });
        });
    }
));

passport.use(new FacebookTokenStrategy({
    clientID            : "192759377738235",
    clientSecret        : "9c9fe3d9f28454b6a946c8dc0828bf3e",
    profileFields: ["id", "email", "gender", "name", 'displayName', 'profileUrl', 'picture']
  }, function(accessToken, refreshToken, profile, done) {
    console.log('FacebookTokenStrategy');
    
    User.findOne({fb_id: profile.id}, function (error, user) {
        //If not user exists in our login system, send facebook profile to create an account with him
        if (!user){
            return done(error, profile);
        } else { //Otherwise return the user
            return done(error, user);
        }
    });
  }
));

/*
passport.use('facebook', new FacebookStrategy ({
        clientID        : "192759377738235",
        clientSecret    : "9c9fe3d9f28454b6a946c8dc0828bf3e",
        callbackURL     : "http://127.0.0.1:3000/auth/facebook/callback",
        //enableProof     : false,
        profileFields: ["id", "email", "gender", "name", 'displayName', 'profileUrl', 'picture']
    },
 
  // facebook will send back the tokens and profile
  function(access_token, refresh_token, profile, done) {
    console.log('profile', profile);
    console.log("FacebookTokenStrategy");
    // asynchronous
    process.nextTick(function() {
     
      // find the user in the database based on their facebook id
      User.findOne({ 'id' : profile.id }, function(err, user) {
 
        // if there is an error, stop everything and return that
        // ie an error connecting to the database
        if (err)
          return done(err);
 
          // if the user is found, then log them in
          if (user) {
            return done(null, user); // user found, return that user
          } else {
            // if there is no user found with that facebook id, create them
            var newUser = new User();
 
            // set all of the facebook information in our user model
            newUser.fb.id    = profile.id; // set the users facebook id                 
            newUser.fb.access_token = access_token; // we will save the token that facebook provides to the user                    
            newUser.fb.firstName  = profile.name.givenName;
            newUser.fb.lastName = profile.name.familyName; // look at the passport user profile to see how names are returned
            newUser.fb.email = profile.emails[0].value; // facebook can return multiple emails so we'll take the first
            
            //return done(null, profile);
            // save our user to the database
            newUser.save(function(err) {
              if (err)
                throw err;
 
              // if successful, return the new user
              return done(null, newUser);
            });
         } 
      });
    });
})); */