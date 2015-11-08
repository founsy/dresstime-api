var express = require('express');
var router = express.Router();
var http = require('http');
var passport = require('passport');

var rootPath = process.cwd();

var db = require(rootPath + '/db/databases');

var shoppingEngine = require(rootPath + '/libs/shoppingEngine');

var data = require(rootPath + "/db/data");

var Clothe = require(rootPath + '/models/clothe');
var ObjectId = require('mongoose').Types.ObjectId; 
var brandClothes = require(rootPath + '/db/hm.json');

router.get('/', passport.authenticate('bearer', { session: false }) , function(req, res) {
    var user = req.user;
    Clothe.find({clothe_userid: new ObjectId(user._id)}, function(err, clothes){
        if(err) { res.send(500, err); }
       
        var result = shoppingEngine.execute(brandClothes, clothes);
        res.send(result);   
    });
});


module.exports = router;