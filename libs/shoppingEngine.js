/**
 * Module to manage outfits and specificly filtered the user's clothe list 
 * depending on which clothe we already propose to him
 * @module ShoppingEngine
 */


var rootPath = process.cwd();

var db = require(rootPath + '/db/databases');
var styleEngine = require(rootPath + '/libs/styleEngine');
var contextEngine = require(rootPath + '/libs/rulesEngine');

/**
* Get brand clothes matching with user's clothes
* @param {Array.<Clothe>} brandClothes - Array of all the brand clothes
* @param {Array.<Clothe>} dressingClothes - All the clothes contain into the user's wardrobe
* @returns {Object} object containing brandClothe property and a list of clothes matching with it
*/
exports.execute = function(brandClothes, dressingClothes, user) {
    /*  ( top -> pants)
        ( maille -> pants)
        ( pants -> top)
        ( dress -> maille)
    */
    function getMainStyle(styles){
        var objStyle = {};
        for (var i = 0; i < styles.length; i++){
            if (typeof objStyle[styles[i]] === 'undefined'){
                objStyle[styles[i]] = 1;
            } else {
                objStyle[styles[i]]++;
                return styles[i];
            }
        }
        return styles[0];
    }
    
    var mainStyle = getMainStyle([user.atWorkStyle, user.relaxStyle, user.onPartyStyle]);
    console.log(mainStyle);
    //Filter by type
    var dressingPants = dressingClothes.filter(function(el) { return el.clothe_type === "pants"; });
    var dressingTops = dressingClothes.filter(function(el) { return el.clothe_type === "top"; });
    var dressingMaille = dressingClothes.filter(function(el) { return el.clothe_type === "maille"; });
    var dressingDress = dressingClothes.filter(function(el) { return el.clothe_type === "dress"; });
    
    var result = [];
    //Calculate for each brand clothe the rating style
    for (var i = 0; i < brandClothes.length; i++){
        var clothe = brandClothes[i];
        var temp = [], combination = [];
        if (clothe.clothe_type === "top"){
            var combination = [];
            combination.push(dressingMaille);
            combination.push([clothe]);
            combination.push(dressingPants);
            temp = styleEngine.calculateOutfits(mainStyle, user.gender, combination, 60);
        } else if (clothe.clothe_type === "maille") {
            var combination = [];
            combination.push([clothe]);
            combination.push(dressingTops);
            combination.push(dressingPants);
            temp = styleEngine.calculateOutfits(mainStyle, user.gender, combination, 60)
        } else if (clothe.clothe_type === "pants") {
             var combination = [];
            combination.push(dressingMaille);
            combination.push(dressingTops);
            combination.push([clothe]);
            temp = styleEngine.calculateOutfits(mainStyle, user.gender, combination, 60)
        } else if (clothe.clothe_type === "dress") {
             var combination = [];
            combination.push(dressingMaille);
            combination.push([clothe]);
            temp = styleEngine.calculateOutfits(mainStyle, user.gender, combination, 60)
        } 
        
        //console.log(JSON.stringify(temp));
        var obj = { brandClothe : clothe};
        var clothes = [];
        for (var j = 0; j < temp.length; j++){
            for (var k = 0; k < temp[j].outfit.length; k++){
                if ((obj.brandClothe.clothe_type === 'top' && temp[j].outfit[k].clothe_type === 'pants') 
                    || (obj.brandClothe.clothe_type === 'maille' && temp[j].outfit[k].clothe_type === 'pants')
                    || (obj.brandClothe.clothe_type === 'pants' && temp[j].outfit[k].clothe_type === 'top')
                    || (obj.brandClothe.clothe_type === 'dress' && temp[j].outfit[k].clothe_type === 'maille')){
                    clothes.push({ clothe : temp[j].outfit[k], matchingRate: temp[j].matchingRate});
                }
            }   
        }
        
        var uniqueClothe = [], duplicate = {};
        for (var k = 0; k < clothes.length; k++){
            if (typeof duplicate[clothes[k].clothe.clothe_id] === 'undefined'){
                uniqueClothe.push(clothes[k]); 
                duplicate[clothes[k].clothe.clothe_id] = 0;
            }       
        }
       
        if (uniqueClothe.length > 0){
            obj["clothes"] = uniqueClothe;
            obj["userid"] = user._id;
            result.push(obj);
        }
    }
    return result;
};

//@param : generic clothe
//@return : list of brand clothe ordered by ranking
function chooseClothe(genericClothe){
    //Choose clothe depending of his metadata and the ranking of the Brand
    //type, subtype, cut, color, pattern, sex
    db.getClothe(genericClothe.clothe_type, genericClothe.clothe_subtype, genericClothe.clothe_cut, genericClothe.clothe_colors,  genericClothe.clothe_pattern, 1, function(err, results) {
        return results;
    });
    
};