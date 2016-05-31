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