var express = require('express');
var router = express.Router();
var http = require('http');
var passport = require('passport');

var rootPath = process.cwd();

var shoppingEngine = require(rootPath + '/libs/shoppingEngine'),
    zalandoPartner =  require(rootPath + "/libs/zalandoPartner");

var Clothe = require(rootPath + '/models/clothe'),
    BrandClothe = require(rootPath + '/models/brandClothe'),
    Shopping = require(rootPath + "/models/shopping");
var ObjectId = require('mongoose').Types.ObjectId; 

router.get('/', passport.authenticate(['facebook-token', 'bearer'], { session: false }) , function(req, res) {
    var user = req.user;
    var queryPopulate = [{path: 'brandClothe'}, {path: 'clothes'}, {path: 'clothes.clothe'}];
    Shopping.find({userid: new ObjectId(user._id)}).populate(queryPopulate).exec(function(err, shoppings){
        if (shoppings.length > 0){
            console.log("Already calculated");
            res.send(shoppings);
            return;
        } else {
            Clothe.find({clothe_userid: new ObjectId(user._id)}, function(err, clothes){
                if(err) { res.send(500, err); }
                BrandClothe.find({clothe_sexe : user.gender}, function(err, brandClothes){
                    var result = shoppingEngine.execute(brandClothes, clothes, user);
                    var collectionToSave = [];
                    for (var i = 0; i < result.length; i++){
                        var model = new Shopping(result[i]);
                        model.save(function(err, model){
                            //console.log(err);
                        });
                    }
                    res.send(result);
                    return;
                });
            });
        }
    });
});
/*
router.get('/zalando', function(req, res) {
    console.log("zalando");
    zalandoPartner.retrieveProducts();
    res.send("success1");
}); */
           
module.exports = router;