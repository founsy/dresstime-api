var express = require('express'),
	path = require('path'),
	bodyParser = require('body-parser'),
	cookieParser = require('cookie-parser'),
	session = require('express-session'),	
	passport = require('passport'),
	methodOverride = require('method-override'),
    LocalStrategy = require('passport-local'),
    FacebookStrategy = require('passport-facebook');

var funct = require('./functions.js');
var routes = require('./routes');
var zaraRoutes = require('./zaraLoaderRoutes');
var userRoutes = require('./userRoutes.js');

var app = express();


//===============PASSPORT=================

// Passport session setup.
passport.serializeUser(function(user, done) {
  console.log("serializing " + user.username);
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  console.log("deserializing " + obj);
  done(null, obj);
});

// Use the LocalStrategy within Passport to login users.
passport.use('local-signin', new LocalStrategy(
  {passReqToCallback : true}, //allows us to pass back the request to the callback
  function(req, username, password, done) {
    funct.localAuth(username, password)
    .then(function (user) {
    	console.log(user);
      if (user) {
        console.log("LOGGED IN AS: " + user.username);
        req.session.success = 'You are successfully logged in ' + user.username + '!';
        done(null, user);
      }
      if (!user) {
        console.log("COULD NOT LOG IN");
        req.session.error = 'Could not log user in. Please try again.'; //inform user could not log them in
        done(null, user);
      }
    })
    .fail(function (err){
      console.log(err.body);
    });
  }
));

// Use the LocalStrategy within Passport to Register/"signup" users.
passport.use('local-signup', new LocalStrategy(
  {passReqToCallback : true}, //allows us to pass back the request to the callback
  function(req, username, password, done) {
    funct.localReg(username, password)
    .then(function (user) {
      if (user) {
        console.log("REGISTERED: " + user.username);
        req.session.success = 'You are successfully registered and logged in ' + user.username + '!';
        done(null, user);
      }
      if (!user) {
        console.log("COULD NOT REGISTER");
        req.session.error = 'That username is already in use, please try a different one.'; //inform user could not log them in
        done(null, user);
      }
    })
    .fail(function (err){
      console.log(err.body);
    });
  }
));

// Simple route middleware to ensure user is authenticated.
function ensureAuthenticated(req, res, next) {
  if (/^\/auth/g.test(req.url)) {
    return next();
  } else if (req.isAuthenticated()) {
    return next();
  } else {
  	 res.send(401,"Server Error"); return;
	}
}

//app.use(express.logger());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(methodOverride());
app.use(session({ secret: 'supernova', resave: true, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

app.all('*', ensureAuthenticated);

 app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH');
    res.header('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
    next();
 });
 
// catch 404 and forward to error handler
// Session-persisted message middleware
app.use(function(req, res, next){
  var err = req.session.error,
      msg = req.session.notice,
      success = req.session.success;

  delete req.session.error;
  delete req.session.success;
  delete req.session.notice;

  if (err) res.locals.error = err;
  if (msg) res.locals.notice = msg;
  if (success) res.locals.success = success;
  next();
}); 

//sends the request through our local signup strategy, and if successful takes user to homepage, otherwise returns then to signin page
app.post('/auth/registration', passport.authenticate('local-signup'), function(req, res) {
  	// If this function gets called, authentication was successful.
    // `req.user` contains the authenticated user.
    res.send(req.user);
});

//sends the request through our local login/signin strategy, and if successful takes user to homepage, otherwise returns then to signin page
app.post('/auth/login', passport.authenticate('local-signin'), function(req, res) {
  	  // If this function gets called, authentication was successful.
    	// `req.user` contains the authenticated user.
    	req.session.username = req.user.username;
  		res.send({auth: true, id: req.session.id, username: req.session.username});
});

//logs user out of site, deleting them from the session, and returns to homepage
app.get('/auth/logout', function(req, res){
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

app.use('/', routes);
app.use('/', zaraRoutes);
app.use('/', userRoutes);

//module.exports = app;

app.listen(3000);
console.log("Up & Running");