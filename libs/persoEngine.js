var ObjectId = require('mongoose').Types.ObjectId,
    Clothe = require(rootPath + '/models/clothe'),
    Outfit = require(rootPath + '/models/outfit');

function clotheAlreadyUse(user){
    
    Outfit.find({userid: new ObjectId(user._id)}, function(err, outfits){
        if(err) { return err; }
          
    });
    
    //Can suggest maille every 3 days
    
    //Can suggest top 1 time by week
    
    //Can suggest pants every 2 days
}

//
//Don't to propose the same clothe foreach moment of the day
//
function clotheAlreadyProposeToday(user){
    
    Outfit.find({userid: new ObjectId(user._id)}, function(err, outfits){
        if(err) { return err; }
          
    });
    
    //Can suggest maille every 3 days
    
    //Can suggest top 1 time by week
    
    //Can suggest pants every 2 days
}

//Historize outfits for user
exports.outfitHistorize = function(outfits, user){
    for (var i = 0; i < outfits.length; i++){
        var clothes = []
        for (var j=0; j < outfits[i].outfit.length; j++){
            clothes.push(new ObjectId(outfits[i].outfit[j]._id));    
        }
        var outfit = new Outfit({ 
            clothe_userid: user._id,
            clothes: clothes,
            style: outfits[i].style,
            matchingRate: outfits[i].matchingRate
        });
        outfit.save(function(err){
            if (err){
                console.log(err);
            }
        });
    }
    return;
}

exports.execute = function(listSource) {


};