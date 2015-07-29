var rootPath = process.cwd();

var data = require(rootPath + '/db/data');	

exports.calculateOutfits = function (style, sex, clothes, types){
    console.log("New engine");
	return calculateOutfits(style, sex, clothes, types);
}

function getMatrixForStyle(style, sex){
    switch(style.toLowerCase()){
		case "casual":
            if (sex)
                return "menCasualChic";
            else 
                return "womenCasualChic";
		case "fashion":
            if (sex)
                return "menFashion";
            else 
                return "womenFashion";
		case "business":
            if (sex)
                return "menBusiness";
            else 
                return "womenBusiness";
		case "sportwear":
             if (sex)
                return "menSportwear";
            else 
                return "womenSportwear";
	   }
}

// arrTypeClothes : [ArrayOfClothesByType]
function calculateOutfits(style, sex, clothes, types){
    var all = clothes.filter(function(x){return (types.indexOf(x.clothe_type) > -1)}); 
    
    console.log(all.length);
    var combine = k_combinations(all, types.length);
    //Pour chaque combinason, calcul score betwean each elem
    var maxScore = 0;
    var outfitsResult = [];
     for (var nbrComb = 0; nbrComb < combine.length; nbrComb++){  
        var globalScore = scoreRecursif(style, sex, combine[nbrComb]);
        //console.log("----------" + globalScore + "------------");
         if (globalScore > 60){
            outfitsResult.push(combine[nbrComb]);
         }
         if (globalScore > maxScore)
             maxScore = globalScore;
    }
    console.log(maxScore);
    console.log(combine.length);
    return outfitsResult;
}

function scoreRecursif(style, sex, outfits, combineType){
    var score = 0, k = 0;
    //console.log(outfits[0].clothe_id + " " + outfits[1].clothe_id);
    for (var i = 0; i < outfits.length; i++){
        for (var t = 0; t < outfits.length; t++){
            if (t > i){
                var temp = scoring2Elements(style, sex, outfits[i], outfits[t]);
                score += temp;
                k++;
                //console.log(outfits[i].clothe_type + " " + outfits[t].clothe_type + " " + temp);
            }
        }
    }
    return (score/k);
}

function k_combinations(set, k) {
	var i, j, combs, head, tailcombs;
	
	if (k > set.length || k <= 0) {
		return [];
	}
	
	if (k == set.length) {
		return [set];
	}
	
	if (k == 1) {
		combs = [];
		for (i = 0; i < set.length; i++) {
			combs.push([set[i]]);
		}
		return combs;
	}
	
	// Assert {1 < k < set.length}
	combs = [];
	for (i = 0; i < set.length - k + 1; i++) {
		head = set.slice(i, i+1);
		tailcombs = k_combinations(set.slice(i + 1), k - 1);
		for (j = 0; j < tailcombs.length; j++) {
            var d = head.concat(tailcombs[j])
            if (isDifferentType(d))
                combs.push(d);
		}
	}
	return combs;
}

function isDifferentType(head){
    
    for (var i = 0; i < head.length - 1; i++){
       for (var j = 0; j < head.length; j++){
        if (i != j && head[i].clothe_type === head[j].clothe_type){
            return false;
        }
       }
    }
    return true;
}


function scoring2Elements(style, sex, elem1, elem2) {
    var ptsColor = colorMatching(elem1, elem2);
    var ptsStyle = styleMatching(style, sex, elem1, elem2);
    var ptsPattern = patternMatching(elem1, elem2);

    return ((ptsColor + (ptsStyle*3) + ptsPattern)/6);
}

// Return score for pattern
function patternMatching(elem1, elem2){
	var x = getIndexPatternMatrix(0, elem1.clothe_isUnis ? "plain" : elem1.clothe_pattern); 
	var y = getIndexPatternMatrix(1, elem2.clothe_isUnis ? "plain" : elem2.clothe_pattern);
	return data.patternMatching[x][y];
}

// Return score for style
function styleMatching(style, sex, elem1, elem2){
	var x = -1, y = -1;
	var subType1 = elem1.clothe_subtype, subType2 = elem2.clothe_subtype;
    
    
    if (elem1.clothe_cut.toLowerCase() !== ""){
        subType1 = subType1 + "-" + elem1.clothe_cut.toLowerCase();
    }
    
    if (elem2.clothe_cut.toLowerCase() !== ""){
        subType2 = subType2 + "-" + elem2.clothe_cut.toLowerCase();
    }
	
	y = getIndexStyleMatrix(style, sex, 0, subType1); 
	x = getIndexStyleMatrix(style, sex, 1, subType2);
	
	if (x > -1 && y > -1){
        var matrixStyleName = getMatrixForStyle(style, sex);
		return data[matrixStyleName][x][y];
    }
	else
		return 0;
}

// Return score for color
function colorMatching(elem1, elem2){
	var x = getIndexColorsMatrix(0, elem1.clothe_colors); 
	var y = getIndexColorsMatrix(1, elem2.clothe_colors);
	if (x > -1 && y > -1 )
		return data.colorsMatching[x][y];
	else 
		return 0;
}


/* Return the index into style matrix for the property */
//Type : 0 = horizontal (abscisse); Type 1 = vertical (ordonnée)
function getIndexStyleMatrix(style, sex, type, property){
    var matrixStyleName = getMatrixForStyle(style, sex);
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

/* Return the index into color matrix for the property */
//Type : 0 = horizontal (abscisse); Type 1 = vertical (ordonnée)
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

/* Return the index into pattern matrix for the property */
//Type : 0 = horizontal (abscisse); Type 1 = vertical (ordonnée)
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
