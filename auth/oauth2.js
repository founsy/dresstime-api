var oauth2orize = require('oauth2orize');
var passport = require('passport');
var crypto = require('crypto');

var rootPath = process.cwd() + '/';

var config = require(rootPath + 'config');

var db = require(rootPath + 'db/mongoose');
var User = require(rootPath + 'models/user');
var AccessToken = require(rootPath + 'models/accessToken');
var RefreshToken = require(rootPath + 'models/refreshToken');

// create OAuth 2.0 server
var aserver = oauth2orize.createServer();

// Generic error handler
var errFn = function (cb, err) {
	if (err) { 
		return cb(err); 
	}
};

// Destroys any old tokens and generates a new access and refresh token
var generateTokens = function (data, done) {

	// curries in `done` callback so we don't need to pass it
    var errorHandler = errFn.bind(undefined, done), 
	    refreshToken,
	    refreshTokenValue,
	    token,
	    tokenValue;

    RefreshToken.remove(data, errorHandler);
    AccessToken.remove(data, errorHandler);

    tokenValue = crypto.randomBytes(32).toString('hex');
    refreshTokenValue = crypto.randomBytes(32).toString('hex');

    data.token = tokenValue;
    token = new AccessToken(data);

    data.token = refreshTokenValue;
    refreshToken = new RefreshToken(data);

    refreshToken.save(errorHandler);

    token.save(function (err) {
    	if (err) {
			console.log(err);
    		return done(err); 
    	}
    	console.log(data.user);
    	done(null, tokenValue, refreshTokenValue, { 
    		'expires_in': config.get('security:tokenLife'),
            'user': data.user
    	});
    });
};

// Exchange username & password for access token.
aserver.exchange(oauth2orize.exchange.password(function(client, username, password, scope, done) {
	User.findOne({  $or:[ {'username': username.toLowerCase()}, {'email': username.toLowerCase()}, {'displayName': username.toLowerCase() } ] }, function(err, user) {
		if (err) { 
			return done(err); 
		}
		if (!user){
            return done(new Error("No user found"));
        }
        
        if (typeof user.isVerified !== 'undefined' && !user.isVerified){
            //Error Code : 001 = Please Verified your account
            return done(new Error('001'));
        }
		if (!user || !user.checkPassword(password) || (typeof user.isVerified !== 'undefined' && !user.isVerified)) {
			return done(null, false);
		}

		var model = { 
			userId: user.userId, 
			clientId: client.clientId,
            user: user.getToSend()
		};

		generateTokens(model, done);
	});

}));

// Exchange refreshToken for access token.
aserver.exchange(oauth2orize.exchange.refreshToken(function(client, refreshToken, scope, done) {

	RefreshToken.findOne({ token: refreshToken, clientId: client.clientId }, function(err, token) {
		if (err) { 
			return done(err); 
		}

		if (!token) { 
			return done(null, false); 
		}

		User.findById(token.userId, function(err, user) {
			if (err) { return done(err); }
			if (!user) { return done(null, false); }

			var model = { 
				userId: user.userId, 
				clientId: client.clientId 
			};

			generateTokens(model, done);
		});
	});
}));

// token endpoint
//
// `token` middleware handles client requests to exchange authorization grants
// for access tokens.  Based on the grant type being exchanged, the above
// exchange middleware will be invoked to handle the request.  Clients must
// authenticate when making requests to this endpoint.

exports.token = [
	passport.authenticate(['basic', 'oauth2-client-password', 'facebook'], { session: false }),
	aserver.token(),
	aserver.errorHandler()
];