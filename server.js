var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');
var methodOverride = require('method-override');

var rootPath = process.cwd() + '/';
require(rootPath + 'auth/auth');

var config = require('./config');
var oauth2 = require('./auth/oauth2');

var api = require('./routes/api');
var routes = require('./routes/routes');
var zara = require('./routes/zaraLoaderRoutes');
var users = require('./routes/userRoutes');
var dressing = require('./routes/dressingRoutes');
var auth = require('./routes/authRoutes');
var outfits = require('./routes/outfitsRoutes');


var app = express();

// Enables CORS
app.use(function(req, res, next){
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With');
    next();
})
.options('*', function(req, res, next){
    res.end();
});
//app.use(allowCrossDomain);
app.use(bodyParser.json({limit: 100000000}));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(methodOverride('Authorization'));
app.use(passport.initialize());

app.use('/', api);
app.use('/api', api);
app.use('/users', users);
app.use('/zara', zara);
app.use('/oauth/token', oauth2.token);
app.use('/dressing', dressing);
app.use('/auth', auth);
app.use('/outfits', outfits);

// catch 404 and forward to error handler
app.use(function(req, res, next){
    res.status(404);
    console.log('%s %d %s', req.method, res.statusCode, req.url);
    res.json({ 
    	error: 'Not found' 
    });
    return;
});

// error handlers
app.use(function(err, req, res, next){
    res.status(err.status || 500);
    console.log('%s %d %s', req.method, res.statusCode, err.message);
    res.json({ 
    	error: err.message 
    });
    return;
});



app.listen(3000);
//module.exports = app;