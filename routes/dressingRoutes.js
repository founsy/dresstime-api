var rootPath = process.cwd();

var express = require('express'),
	router = express.Router(),
    passport = require('passport'),
	mongoDb = require(rootPath + '/db/mongodb'),
    Clothe = require(rootPath + '/models/clothe'),
    Dressing = require(rootPath + '/models/dressing');

router.post('/clothes/', passport.authenticate('bearer', { session: false }), function(req, res){
    var user = req.user;
    var clothe = req.body.dressing[0];
    console.log(clothe.clothe_image.length);
    var clothe = Clothe({
        clothe_id : clothe.clothe_id,
        clothe_name: clothe.clothe_name,
        clothe_cut: clothe.clothe_cut,
        clothe_pattern: clothe.clothe_pattern,
        clothe_type: clothe.clothe_type,
        clothe_subtype: clothe.clothe_subtype,
        clothe_colors: clothe.clothe_colors,
        clothe_partnerid: clothe.clothe_partnerid,
        clothe_partnerName: clothe.clothe_partnerName,
        clothe_isUnis: clothe.clothe_isUnis,
        clothe_image: clothe.clothe_image,
        clothe_userid: req.user._id
    });
    
    clothe.save(function(err){
        if(err)
           res.send(500, err);
        else
            res.send({ clothe: clothe});
    });	
});

router.get('/clothes/', passport.authenticate('bearer', { session: false }), function(req, res){
    var user = req.user;
    console.log(user);
    Clothe.find({clothe_userid: req.user._id}, function(err, clothes){
        if(err)
           res.send(500, err);
        else
            res.send(clothes);            
    });
});

router.get('/clothes/ids/', passport.authenticate('bearer', { session: false }), function(req, res){
    var user = req.user;
    console.log(user);
    Clothe.find({clothe_userid: req.user._id}, function(err, clothes){
        if(err) {
           res.send(500, err);
        } else {
            var clothesId = [];
            for (var item in clothes){
                clothesId.push({ id : clothes[item].clothe_id});
            }
            res.send({list: clothesId}); 
        }
    });
});

router.get('/clothes/:id', passport.authenticate('bearer', { session: false }), function(req, res){
    var user = req.user;
    console.log(user);
    Clothe.findOne({clothe_userid: req.user._id, clothe_id: req.param('id')}, function(err, clothes){
        if(err)
           res.send(500, err);
        else
            res.send(clothes);            
    });
});

module.exports = router;