/**
 * Module to calculate outfits by style
 * @module StyleEngine
 */



var rootPath = process.cwd();

var data = require(rootPath + '/db/data');

/**
* Calculate outfits depending of the style
* @param {String} style - Number of clothe for a specific type
* @param {String} sex - Sexe to determine the matrix  to use
* @param {Array.<Array.<Clothte>>} clothes - Array by type of array of clothe
* @param {Number} maxScore - Max score acceptable
* @returns {Outfit[]} Outfits
*/
exports.calculateOutfits = function (style, sex, clothes, maxScore){
    maxScore = typeof maxScore !== 'undefined' ? maxScore : 60;
	return calculateOutfits(style, sex, clothes, maxScore);
};

/**
* Calculate outfits depending of the style
* @deprecated since version 2.0
* @param {String} style - Number of clothe for a specific type
* @param {String} sex - Sexe to determine the matrix  to use
* @param {Array} clothes - Array of combinations
* @param {Number} maxScore - Max score acceptable
* @returns {Outfit[]} Outfits
*/
exports.getOutfit = function(style, sex, clothes, maxScore){
    var combine = cartesian(clothes);
    for (var nbrComb = 0; nbrComb < combine.length; nbrComb++){  
        var globalScore = scoreRecursif(style, sex, combine[nbrComb]);
        //console.log("----------" + globalScore + "------------");
         if (globalScore > maxScore){
            return {outfit : combine[nbrComb], matchingRate: globalScore};
         }
    }
};

/**
* Remove clothe already use
* @param {Outfit[]} outfit - 
* @param {Clothe[]} combine - 
* @param {Number} numberClotheByType - 
* @returns {Array} Combination of clothes
*/
function removeClotheAlreadyUse(outfit, combine, numberClotheByType){
    combine = combine.filter(function(el){
        for (var i = 2; i < el.length; i++){
            for (var j = 2; j < outfit.length; j++){
                if (el[i - 2].clothe_id === outfit[j - 2].clothe_id || el[i - 1].clothe_id === outfit[j -1 ].clothe_id || el[i].clothe_id === outfit[j].clothe_id ){
                    return false;
                } else {
                    return true;
                }
            }
            
        }
    });
    return combine;
};

/**
* Get the matrix for a specific style and sexe
* @param {String} style - Style name
* @param {String} sex - Sexe
* @returns {String} Name of the matrix variable
*/
function getMatrixForStyle(style, sexe){
    switch(style.toLowerCase()){
		case "casual":
            if (sexe)
                return "menCasualChic";
            else 
                return "womenCasualChic";
		case "fashion":
            if (sexe)
                return "menFashion";
            else 
                return "womenFashion";
		case "business":
            if (sexe)
                return "menBusiness";
            else 
                return "womenBusiness";
		case "sportwear":
             if (sexe)
                return "menSportwear";
            else 
                return "womenSportwear";
	   }
}

/**
* Internal methode to calculate the outifts
* @param {String} style - Number of clothe for a specific type
* @param {String} sex - Sexe to determine the matrix  to use
* @param {Array.<Clothe>} clothes - Array of combinations
* @param {Number} maxScore - Max score acceptable
* @returns {Outfit[]} Outfits
*/
function calculateOutfits(style, sex, clothes, maxScore){
    var combine = cartesian(clothes);
    var numberOfClothesByType = {};
    for (var i = 0; i < clothes.length; i++){
        if (clothes[i].length > 0){
            numberOfClothesByType[clothes[i][0].clothe_type] = clothes[i].length;        
        }
    }

    //Pour chaque combinason, calcul score betwean each elem
    var maxValue = 0;
    var outfitsResult = [];
    
    var nbrComb = combine.length;
    for (var nbrComb = combine.length - 1; nbrComb >= 0; nbrComb--){  
        var globalScore = scoreRecursif(style, sex, combine[nbrComb]);
        if (globalScore >= maxScore){
            outfitsResult.push({outfit : combine[nbrComb], matchingRate: globalScore});
        }
        if (globalScore > maxValue)
            maxValue = globalScore;
    }
    console.log("----------- " + maxValue + "-------------");
    return outfitsResult;
}

/**
* Calculate the score for a specific outfit with recursif approach
* @param {String} style - Style name
* @param {String} sexe - Sexe
* @param {Array.<Clothe>} outfit - Array of clothes to create an outfit
* @returns {Number} Scoring of the clothe's combination
*/
function scoreRecursif(style, sexe, outfit){
    var score = 0, k = 0;
    //console.log(outfits[0].clothe_id + " " + outfits[1].clothe_id);
    for (var i = 0; i < outfit.length; i++){
        for (var t = 0; t < outfit.length; t++){
            if (t > i){
                var temp = scoring2Elements(style, sexe, outfit[i], outfit[t]);
                score += temp;
                k++;
            }
        }
    }
    return (score/k);
}

/**
* Create an array of all possible combination of different type of clothe
* @param {Array.<Clothe>} arrayList - Array of clothes
* @returns {Array.<Outfit>} array of all the possible combination of different type of clothe
*/
function cartesian(arrayList) {
    var r = [], arg = arrayList, max = arg.length-1;
    function helper(arr, i) {
        for (var j=0, l=arg[i].length; j<l; j++) {
            var a = arr.slice(0); // clone arr
            a.push(arg[i][j]);
            if (i==max)
                r.push(a);
            else
                helper(a, i+1);
        }
    }
    helper([], 0);
    return r;
}

/**
* Scoring 2 elements each other
* @param {String} style - Style for which we want to score combination of clothe
* @param {String} sexe - Sexe
* @param {Clothe} elem1 - Clothe
* @param {Clothe} elem2 - Clothe
* @returns {Number} Style ranking between 2 elementsq
*/
function scoring2Elements(style, sexe, elem1, elem2) {
    var ptsColor = colorMatching(elem1, elem2);
    var ptsStyle = styleMatching(style, sexe, elem1, elem2);
    var ptsPattern = patternMatching(elem1, elem2);

    return ((ptsColor + (ptsStyle) + ptsPattern)/3);
}

/**
* Calculate the pattern score between 2 clothes
* @param {Clothe} elem1 - Clothe
* @param {Clothe} elem2 - Clothe
* @returns {Number} Pattern Scoring
*/
function patternMatching(elem1, elem2){
	var x = getIndexPatternMatrix(0, elem1.clothe_isUnis ? "plain" : elem1.clothe_pattern); 
	var y = getIndexPatternMatrix(1, elem2.clothe_isUnis ? "plain" : elem2.clothe_pattern);
    return parseInt(data.patternMatching[x][y]);
}

/**
* Calculate the color score between 2 clothes
* @param {String} style - Style for matching
* @param {String} sexe - Sexe
* @param {Clothe} elem1 - Clothe
* @param {Clothe} elem2 - Clothe
* @returns {Number} Color Scoring
*/
function styleMatching(style, sexe, elem1, elem2){
	var x = -1, y = -1;
	var subType1 = elem1.clothe_subtype, subType2 = elem2.clothe_subtype;
    
    
    if (elem1.clothe_cut.toLowerCase() !== ""){
        subType1 = subType1 + "-" + elem1.clothe_cut.toLowerCase();
    }
    
    if (elem2.clothe_cut.toLowerCase() !== ""){
        subType2 = subType2 + "-" + elem2.clothe_cut.toLowerCase();
    }
	
	y = getIndexStyleMatrix(style, sexe, 0, subType1); 
	x = getIndexStyleMatrix(style, sexe, 1, subType2);
	
	if (x > -1 && y > -1){
        var matrixStyleName = getMatrixForStyle(style, sexe);
		return parseInt(data[matrixStyleName][x][y]);
    }
	else
		return 0;
}

/**
* Calculate the color score between 2 clothes
* @param {Clothe} elem1 - Clothe
* @param {Clothe} elem2 - Clothe
* @returns {Number} Color Scoring
*/
function colorMatching(elem1, elem2){

    var color1 = typeof elem1.clothe_litteralColor !== 'undefined' ? elem1.clothe_litteralColor : elem1.clothe_colors
	var color2 = typeof elem2.clothe_litteralColor !== 'undefined' ? elem2.clothe_litteralColor : elem2.clothe_colors
    var x = getIndexColorsMatrix(0, color1); 
    var y = getIndexColorsMatrix(1, color2);
	if (x > -1 && y > -1 )
		return parseInt(data.colorsMatching[x][y]);
	else 
		return 0;
}


/**
* Get index of the specific subtype of clothe
* @param {String} style - Clothe
* @param {String} sexe - Clothe
* @param {Number} type - Type : 0 = horizontal (abscisse); Type 1 = vertical (ordonnée)
* @param {String} property - Subtype of clothe
* @returns {Number} the index into style matrix for a specific color of clothe
*/
function getIndexStyleMatrix(style, sexe, type, property){
    var matrixStyleName = getMatrixForStyle(style, sexe);
	//console.log(property.toLowerCase());
	if (type == 0){
		return data[matrixStyleName][0].indexOf(property.toLowerCase()); 
	} else if (type == 1){
		for (var i = 0; i < data[matrixStyleName].length; i ++) {
			var array = data[matrixStyleName][i];
			if (array[0] === property.toLowerCase())
				return i;
		}
	}
}

/**
* Get index for color of clothe
* @param {Number} type - Type : 0 = horizontal (abscisse); Type 1 = vertical (ordonnée)
* @param {String} property - color of clothe
* @returns {Number} the index into color matrix for a specific subtype of clothe
*/
function getIndexColorsMatrix(type, property){
	if (type == 0){
		for (var i = 1; i < data.colorsMatching[0].length; i ++) {
			if (data.colorsMatching[0][i].toLowerCase() === property.toLowerCase()){
				return i;
			}
		}
	} else if (type == 1){
		for (var i = 1; i < data.colorsMatching.length; i ++) {
			var array = data.colorsMatching[i];
			if (array[0].toLowerCase() === property.toLowerCase())
				return i;
		}
	}
	return -1;
}

/**
* Get index for pattern of clothe
* @param {Number} type - Type : 0 = horizontal (abscisse); Type 1 = vertical (ordonnée)
* @param {String} property - color of clothe
* @returns {Number} the index into color matrix for a specific pattern of clothe
*/
function getIndexPatternMatrix(type, property){
	if (type == 0){
		return data.patternMatching[0].indexOf(property); 
	} else if (type == 1){
		for (var i = 0; i < data.patternMatching.length; i ++) {
			var array = data.patternMatching[i];
			if (array[0] == property)
				return i;
		}
	}
}