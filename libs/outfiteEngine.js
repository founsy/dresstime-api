var rootPath = process.cwd();

var data = require(rootPath + '/db/data');	

function getClothForStyle(style){
	if (style === 'casual'){
		return ["maille", "top", "pants"];
	}
}

function getMatrixForStyle(style){
	var matrixStyle;
	switch(style.toLowerCase()){
		case "casual":
			matrixStyle = ["menCasualChic", "menCasualChicCombineTop"];
			break; 
		case "fashion":
			matrixStyle = ["menFashion", "menFashionCombineTop"];
			break;
		case "business":
			matrixStyle = ["menBusiness", "menBusinessCombineTop"];
			break;
		case "sportwear":
			matrixStyle = ["menSportwear", "menSportwearCombineTop"];
			break;
	}
	return matrixStyle;
}

function getScoringByStyle(styleName){
	switch(styleName.toLowerCase()){
		case 'business':
			return 61;
		case 'casual':
			return 80;
		case 'fashion':
			return 82;
		case 'sportwear':
			return 80;
	}
}

function getScoringByStyleOwn(styleName){
	switch(styleName.toLowerCase()){
		case 'business':
			return 70;
		case 'casual':
			return 70;
		case 'fashion':
			return 70;
		case 'sportwear':
			return 70;
	}
}


//Outfit : Top, Pants
function findElemIntoList(outfit, matchMailleAndTop, index){
	var list = [];
	for (var i = 0; i < matchMailleAndTop.length; i++){
		if (matchMailleAndTop[i].outfit[1].clothe_id === outfit[index].clothe_id){
			list.push(outfit.push(matchMailleAndTop[i].outfit[1]))
		}
	}
	return list;
}

function matchingList(style, listMaille, topList, pantsList, isOwn){
	var outfits = [];
	var tempScoring = 0;
	var path = require('path');
	for (var elem1 = 0; elem1 < topList.length; elem1++) {
		for (var elem = 0; elem < listMaille.length; elem++) {
			for (var elem2 = 0; elem2 < pantsList.length; elem2++){
				var outfit = {};
				
				var ptsColor = colorMatchingElem(listMaille[elem], topList[elem1], pantsList[elem2]);
				var ptsStyle = styleMatchingElem(style, topList[elem1], listMaille[elem], pantsList[elem2]);
				var ptsPattern = patternMatchingElem(topList[elem1], listMaille[elem], pantsList[elem2]);
				var scoring = ((ptsColor + (ptsStyle*3) + ptsPattern)/6);
				scoring > tempScoring ? tempScoring = scoring : "";
				
				var limitScore = isOwn ? getScoringByStyleOwn(style) :  getScoringByStyle(style);
				
				if (scoring > limitScore){
					outfit.maille = listMaille[elem];
					outfit.top = topList[elem1];
					outfit.pants = pantsList[elem2];
					if (typeof outfit.maille.clothe_image !== 'undefined'){
						outfit.maille.clothe_image = path.basename(outfit.maille.clothe_image);
					}
					if (typeof outfit.top.clothe_image !== 'undefined')
						outfit.top.clothe_image = path.basename(outfit.top.clothe_image);
					if (typeof outfit.pants.clothe_image !== 'undefined')
						outfit.pants.clothe_image = path.basename(outfit.pants.clothe_image);
					
					outfits.push({outfit : outfit, matchingRate: scoring});
				}
			}
		}
	}
	console.log(tempScoring);
	return outfits;
}

function matchingTopAndPants(style, listTop, listPants){
	var outfits = [];
	
	for (elem in listTop) {
		for (elem1 in listPants) {
		var outfit = [];
			var ptsColor = colorMatching2Elem(listTop[elem], listPants[elem1]);
			var ptsStyle = styleMatching2Elem(style, listTop[elem], listPants[elem1]);
			var ptsPattern = patternMatching2Elem(listTop[elem], listPants[elem1]);
			if (((ptsColor + (ptsStyle*3) + ptsPattern)/5) >= 85){
					outfit.push(listTop[elem]);
					outfit.push(listPants[elem1]);
					outfits.push({outfit : outfit, matchingRate: ((ptsColor + ptsStyle + ptsPattern)/3)});
			}
		}
	}
	return outfits;
}

function colorMatching2Elem(elem1, elem2){
	var x = getIndexColorsMatrix(0, elem1.clothe_colors); 
	var y = getIndexColorsMatrix(1, elem2.clothe_colors);
	if (x > -1 && y > -1 )
		return data.colorsMatching[x][y];
	else 
		return 0;
}

function colorMatchingElem(elem1, elem2, elem3){
	var y = getIndexColorsMatrix(0, elem1.clothe_colors); 
	var x = getIndexColorsMatrix(1, elem2.clothe_colors);
	var xIndex = getIndexColorsMatrix(1, elem3.clothe_colors);
	
	if (x > -1 && y > -1 && xIndex > -1)
		return (data.colorsMatching[x][y] + data.colorsMatching[xIndex][y] + data.colorsMatching[xIndex][x])/3;
	else
		return 0;
}

function patternMatching2Elem(elem1, elem2){
	var x = getIndexPatternMatrix(0, elem1.clothe_isUnis ? "plain" : elem1.clothe_pattern); 
	var y = getIndexPatternMatrix(1, elem2.clothe_isUnis ? "plain" : elem2.clothe_pattern);
	return data.patternMatching[x][y];
}

function patternMatchingElem(elem1, elem2, elem3){
	var y = getIndexPatternMatrix(0, elem1.clothe_isUnis ? "plain" : elem1.clothe_pattern); 
	var x = getIndexPatternMatrix(1, elem2.clothe_isUnis ? "plain" : elem2.clothe_pattern);
	var xIndex = getIndexPatternMatrix(1, elem3.clothe_isUnis ? "plain" : elem3.clothe_pattern);
	
	return (data.patternMatching[x][y] + data.patternMatching[xIndex][y] + data.patternMatching[xIndex][x])/3;
}

function styleMatching2Elem(style, elem1, elem2){
	var x = -1, y = -1;
	var subType1 = elem1.clothe_subtype, subType2 = elem2.clothe_subtype;

	if ((elem1.clothe_subtype.toLowerCase() === "t-shirt" || elem1.clothe_subtype.toLowerCase() === "shirt") 
		 && elem1.clothe_cut.toLowerCase() === "sleeve"){
		subType1 = subType1 + "-" + elem1.clothe_cut.toLowerCase();
	} else if (elem1.clothe_subtype.toLowerCase() === "trousers" && elem1.clothe_cut.toLowerCase() !== ""){
		subType1 = subType1 + "-" + elem1.clothe_cut.toLowerCase();
	}
	
	if ((elem2.clothe_subtype.toLowerCase().indexOf("t-shirt") > -1 || elem2.clothe_subtype.toLowerCase().indexOf("shirt") > -1 )
		 && elem2.clothe_cut.toLowerCase().indexOf("sleeve") > -1 ){
		subType2 = subType2 + "-" + elem2.clothe_cut.toLowerCase();
	} else if (elem2.clothe_subtype.toLowerCase() === "trousers" && elem2.clothe_cut.toLowerCase() !== ""){
		subType2 = subType2 + "-" + elem2.clothe_cut.toLowerCase();
	}
	
	var matrix = getMatrixForStyle(style);
	var matrixStyleName = matrix[0];
	
	y = getIndexStyleMatrix(style, 0, subType1); 
	x = getIndexStyleMatrix(style, 1, subType2);
	
	if (x > -1 && y > -1)	
		return data[matrixStyleName][x][y];
	else
		return 0;
}

function styleMatchingElem(style, elem1, elem2, elem3){
	var combineSubType;
	var topElem, pantsElem;
	if (elem1.clothe_type === "top" || elem1.clothe_type === "maille") {
		combineSubType = elem1.clothe_subtype;
		if (elem1.clothe_type === "top")
			topElem = elem1;
	}
	if (elem2.clothe_type === "top" || elem2.clothe_type === "maille") {
		combineSubType += "+"+elem2.clothe_subtype;
		if (elem2.clothe_type === "top")
			topElem = elem2;
	}
	if (elem3.clothe_type === "top" || elem3.clothe_type === "maille") {
		combineSubType  += "+"+ elem3.clothe_subtype;
		if (elem3.clothe_type === "top")
			topElem = elem3;
	}	
	var y = getIndexCombineStyleMatrix(style, 0, combineSubType); 
	var x = -1;
	if (elem1.clothe_type === "pants"){
		x = getIndexCombineStyleMatrix(style, 1, elem1.clothe_subtype); 
		if (elem1.clothe_type === "pants")
			pantsElem = elem1;
	} else if (elem2.clothe_type === "pants"){
		x = getIndexCombineStyleMatrix(style, 1, elem2.clothe_subtype); 
		if (elem2.clothe_type === "pants")
			pantsElem = elem2;
	} else if (elem3.clothe_type === "pants"){
		x = getIndexCombineStyleMatrix(style, 1, elem3.clothe_subtype); 
		if (elem3.clothe_type === "pants")
			pantsElem = elem3;
	}
	
	var matrix = getMatrixForStyle(style);
	var matrixStyleName = matrix[1];
	
	var pts = styleMatching2Elem(style, topElem, pantsElem);
	
	if (x > -1 && y > -1 && pts > 0)
		return (pts + data[matrixStyleName][x][y])/2;
	else
		return 0;
}

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

//Type : 0 = top; Type 1 = pant
function getIndexStyleMatrix(style, type, property){
	var matrix = getMatrixForStyle(style);
	var matrixStyleName = matrix[0];
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

//Type : 0 = top; Type 1 = pant
function getIndexCombineStyleMatrix(style, type, property){
	var matrix = getMatrixForStyle(style);
	var matrixStyleName = matrix[1];
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

exports.calculateOutfits = function (style, listMaille, topList, pantsList, isOwn){
	console.log(style);
	return matchingList(style, listMaille, topList, pantsList, isOwn);
}
