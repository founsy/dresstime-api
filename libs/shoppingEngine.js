var rootPath = process.cwd();

var db = require(rootPath + '/db/databases');

//@param : outfits list of generic clothes
//@return : list of outfits of brand clothes
exports.execute = function(outfitsList) {
    for (var i=0; i < outfitsList.length; i++){
        outfitsList[i].brandClothe = chooseClothe(outfitsList[i]);
        /*var outfit = outfitsList[i];
        console.log(outfit);
        for (var j =0; j < outfit.length; j++){
            outfit[j].brandClothe = chooseClothe(outfit[j]);
        } */
    }
    return outfitsList;
};


//@param : generic clothe
//@return : list of brand clothe ordered by ranking
function chooseClothe(genericClothe){
    //Choose clothe depending of his metadata and the ranking of the Brand
    //type, subtype, cut, color, pattern, sex
    db.getClothe(genericClothe.clothe_type, genericClothe.clothe_subtype, genericClothe.clothe_cut, genericClothe.clothe_colors,  genericClothe.clothe_pattern, 1, function(err, results) {
        console.log(results);
        return results;
    });
    
};