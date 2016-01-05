/**
 * Module to manage outfits and specificly filtered the user's clothe list 
 * depending on which clothe we already propose to him
 * @module ShoppingEngine
 */


var rootPath = process.cwd();

var db = require(rootPath + '/db/databases');
var styleEngine = require(rootPath + '/libs/styleEngine');

/**
* Get brand clothes matching with user's clothes
* @param {Array.<Clothe>} brandClothes - Array of all the brand clothes
* @param {Array.<Clothe>} dressingClothes - All the clothes contain into the user's wardrobe
* @returns {Object} object containing brandClothe property and a list of clothes matching with it
*/
exports.execute = function(brandClothes, dressingClothes) {
    /*  ( top -> pants)
        ( maille -> pants)
        ( pants -> top)
        ( dress -> maille)
    */
    for (var i = 0; i < dressingClothes.length; i++){
        dressingClothes[i].clothe_image = "";  
    }
    
    //Filter by type
    var dressingPants = dressingClothes.filter(function(el) { return el.clothe_type === "pants"; });
    var dressingTops = dressingClothes.filter(function(el) { return el.clothe_type === "top"; });
    var dressingMaille = dressingClothes.filter(function(el) { return el.clothe_type === "maille"; });

    
    var result = [];
    //Calculate for each brand clothe the rating style
    for (var i = 0; i < brandClothes.length; i++){
        var clothe = brandClothes[i];
        var temp = [];
        if (clothe.clothe_type === "top"){
            var combination = [];
            combination.push(dressingPants);
            combination.push([clothe]);
            temp = styleEngine.calculateOutfits("casual", "M", combination, 40);
        } else if (clothe.clothe_type === "maille") {
             var combination = [];
            combination.push(dressingPants);
            combination.push([clothe]);
            temp = styleEngine.calculateOutfits("casual", "M", combination, 40)
        } else if (clothe.clothe_type === "pants") {
            var combination = [];
            combination.push(dressingTops);
            combination.push([clothe]);
            temp = styleEngine.calculateOutfits("casual", "M", combination, 40)
        }
        console.log(temp.length);
        var obj = { brandClothe : clothe};
        obj["clothes"] = [];
        for (var j = 0; j < temp.length; j++){
            for (var k = 0; k < temp[j].outfit.length; k++){
                if (temp[j].outfit[k].clothe_partnerName === ""){
                     obj["clothes"].push({ clothe : temp[j].outfit[k], matchingRate: temp[j].matchingRate})   
                }
            }   
        }

        if (obj["clothes"].length > 0)
            result.push(obj);
    }
    return result;
};

function addBrandClothe(association) {


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