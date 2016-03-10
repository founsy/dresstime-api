var rootPath = process.cwd();

var express = require('express'),
	router = express.Router(),
    passport = require('passport'),
	mongoDb = require(rootPath + '/db/mongodb'),
    Clothe = require(rootPath + '/models/clothe'),
    imagesManager = require(rootPath + '/libs/imagesManager'),
    ObjectId = require('mongoose').Types.ObjectId; 

router.get('/clothes/', passport.authenticate(['facebook-token', 'bearer'], { session: false }), function(req, res){
    var user = req.user;
    Clothe.find({clothe_userid: new ObjectId(user._id)}, function(err, clothes){
        if(err)
           res.send(500, err);
        else
            res.send(clothes);            
    });
});

router.post('/clothes/', passport.authenticate(['facebook-token', 'bearer'], { session: false }), function(req, res){
    var user = req.user;
    var clothe = req.body.dressing[0];
    var clotheToSave = Clothe({
        clothe_id : clothe.clothe_id,
        clothe_name: clothe.clothe_name,
        clothe_cut: clothe.clothe_cut,
        clothe_pattern: clothe.clothe_pattern,
        clothe_type: clothe.clothe_type,
        clothe_subtype: clothe.clothe_subtype,
        clothe_litteralColor: clothe.clothe_colors,
        clothe_partnerid: clothe.clothe_partnerid,
        clothe_partnerName: clothe.clothe_partnerName,
        clothe_isUnis: clothe.clothe_isUnis,
        clothe_image: clothe.clothe_id + '.jpg',
        clothe_userid: req.user._id
    });
    
    imagesManager.createImage(clothe.clothe_id, clothe.clothe_image);
    
    clotheToSave.save(function(err){
        if(err)
           res.send(500, err);
        else
            res.send({ clothe: clothe});
    });	
});

router.put('/clothes/', passport.authenticate(['facebook-token', 'bearer'], { session: false }), function(req, res){
    var user = req.user;
    var newClothe = req.body;
    Clothe.findOneAndUpdate({clothe_id: newClothe.clothe_id}, newClothe, {upsert:true}, function(err, doc){
        if (err) {
            return res.send(500, { error: err });
        } else {
            return res.send({result: "succesfully saved"});
        }
    });
});

router.get('/clothes/:id', passport.authenticate(['facebook-token', 'bearer'], { session: false }), function(req, res){
    var user = req.user;
    Clothe.findOne({clothe_id: req.param('id')}, function(err, clothe){
        console.log(err);
        if(err){
           res.send(500, err);
        } else {
            res.send(clothe);  
        }
    });
});


router.get('/clothes/image/:id', passport.authenticate(['facebook-token', 'bearer'], { session: false }), function(req, res){
    var user = req.user;
    console.log(req.param('id'));
    Clothe.findOne({clothe_id: req.param('id')}, function(err, clothe){
        if(err){
           res.send(500, err);
        } else {
            res.send({clothe_id: req.param('id'), clothe_image : imagesManager.readImage(clothe.clothe_image)});  
        }
    });
});

router.delete('/clothes/:id', passport.authenticate(['facebook-token', 'bearer'], { session: false }), function(req, res){
    var user = req.user;
    
    Clothe.remove({clothe_id: req.param('id')}, function(err, doc){
        if (err) 
            return res.send(500, { error: err });
        else
            imagesManager.removeImage(req.param('id')+".jpg")
            return res.send({ succeeded : true, msg : "succesfully deleted"});
    });
});

router.get('/clothesIds/', passport.authenticate(['facebook-token', 'bearer'], { session: false }), function(req, res){
    var user = req.user;   
    Clothe.find({clothe_userid: new ObjectId(user._id)}, function(err, clothes){
        if(err) {
           res.send(500, err);
        } else {
            var clothesId = [];
            for (var item in clothes){
                clothesId.push({ id : clothes[item].clothe_id});
            }
            console.log(JSON.stringify(clothesId));
            res.send(clothesId); 
        }
    });
});

module.exports = router;