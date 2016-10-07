/**
 * Module to manage outfits and specificly filtered the user's clothe list 
 * depending on which clothe we already propose to him
 * @module PersoEngine
 * @local RetrieveValuationCb
 * @local PerformDeletingCb
 * @local GetOutfitsCb
 * @local SaveOutfitsCb
 * @local ApplyCb
 */


var rootPath = process.cwd();

var async = require('async');

var ObjectId = require('mongoose').Types.ObjectId,
    Clothe = require(rootPath + '/models/clothe'),
    Outfit = require(rootPath + '/models/outfit'),
    fuzzylogic = require('fuzzylogic');

function getDiffDay(date1, date2){
    var timeDiff = Math.abs(date2.getTime() - date1.getTime());
    var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24)); 
    return diffDays;
}   

function randomIntFromInterval(min,max) {
    return Math.floor(Math.random()*(max-min+1)+min);
}

function styleCalc(stylized) {
        var probabNotGood   = fuzzylogic.triangle(stylized, 0, 20, 40);
        var probabNormal    = fuzzylogic.trapezoid(stylized, 20, 30, 50, 70);
        var probabGood      = fuzzylogic.trapezoid(stylized, 50, 60, 80, 90);
        var probabVeryGood  = fuzzylogic.trapezoid(stylized, 70, 90, 100, 110);
        
      /*  console.log('------ Stylized: ' + stylized);
        
        console.log('Not good: '    + probabNotGood);
        console.log('Normal: '      + probabNormal);
        console.log('Good: '        + probabGood);
        console.log('Very Good: '   + probabVeryGood); */
};

function getPeriodByType(type){
    switch (type){
        case 'maille':
            return 3;
        case 'top':
            return 7;
        case 'pants':
            return 2;
        case 'dress':
            return 4;
    }
};

/**
* Apply Coefficient on frequency depending of the number of clothes
* @param {Number} numberOfClothe - Number of clothe for a specific type
* @param {Number} frequency - Frenquency acceptable for a specific type
* @returns {Number} Frequency depending of the type and the number of clothe available
*/
function calculateFrequency(numberOfClothe, frequency) {
    var coef = Math.round(0.015*(numberOfClothe*numberOfClothe) - 0.4*numberOfClothe + 3)
	return frequency + coef;
}

/**
* Calculate the score of a clothe already proposed
* @param {Date} lastDate - Date of last clothe suggestion
* @param {Date} currentDate - Date of today
* @returns {Number} Score for a clothe depending of the last date proposed
*/
function calculateSuggestionScoring(lastDate, currentDate){
    var diff = getDiffDay(currentDate, lastDate);
    var score = Math.round((0.14 * diff*diff) - (1.6*diff) + 5.6);
    return score;
}

/**
* Calculate the starting date, for the range of outfits we needs
* @param {Boolean} isPutOn - true meaning filter one outfit put on, false meaning suggestion
* @returns {Date} Date to Start the Query
*/
function calculateStartingDate(isPutOn){
    var startDate = new Date(); // this is the starting date that looks like ISODate("2014-10-03T04:00:00.188Z")
    startDate.setSeconds(0);
    startDate.setHours(0);
    startDate.setMinutes(0);
    startDate.setDate(startDate.getDate() - 3); //Return 3 days in the past
    return startDate;
};


/**
 * Called after doing asynchronous stuff.
 * @name RetrieveValuationCb
 * @function
 * @param {Error} err - Information about the error.
 * @param {Object} valuations - { «clothe_id » : numberOfPutOn } 
 */

/**
* Retrieve all clothes already putOn since last Wash (hypothesis : washing saturday)
* @param {Boolean} isPutOn - true meaning filter one outfit put on, false meaning suggestion
* @param {RetrieveValuationCb} callback - Callback returning an array of valuation
*/
function retrieveValuations(user, isPutOn, callback){
    var startDate = calculateStartingDate(isPutOn);
    var endDate = new Date(); // this is the starting date that looks like ISODate("2014-10-03T04:00:00.188Z")
    endDate.setSeconds(0);
    endDate.setHours(0);
    endDate.setMinutes(0);
    
     var query = {
        $and : [{userid: new ObjectId(user._id)}, { updated : { $gte: startDate, $lt: endDate}} , {isPutOn : isPutOn} ]
    };

      Outfit
        .find(query)
        .populate({ path: 'clothes' })
        .exec(function(err, outfits){
            if(err) { return callback(err); }
            var clotheValuation = {};
            for (var i = 0; i < outfits.length; i++){
                for (var j = 0; j < outfits[i].clothes.length; j++){
                    var clothe = outfits[i].clothes[j];
                    var score = calculateSuggestionScoring(outfits[i].updated, new Date());
                    if (!isPutOn){
                        //If proposition was yesterday add more than 1, to remove it from proposition
                        var diff = getDiffDay(endDate, outfits[i].updated);
                        if (typeof clotheValuation[clothe.clothe_id] === 'undefined'){
                            clotheValuation[clothe.clothe_id] = score//diff > 1 ? 1 : randomIntFromInterval(1, 5);
                        } else {
                            clotheValuation[clothe.clothe_id] += score //diff > 1 ? clotheValuation[clothe.clothe_id] + 1 : clotheValuation[clothe.clothe_id] + randomIntFromInterval(1, 5);
                        } 
                    
                    } else {
                        if (typeof clotheValuation[clothe.clothe_id] === 'undefined') {
                            clotheValuation[clothe.clothe_id] = score;
                        } else {
                            //Increment the valuations
                            clotheValuation[clothe.clothe_id]++;
                        } 
                       
                    }
                }
             }
            callback(null, clotheValuation);
        });
};


/**
 * Called after performing clothes filtering.
 * @name PerformDeletingCb
 * @function
 * @param {Error} err - Information about the error.
 * @param {Array<Clothe>} clotheListFiltered - List of clothe filtered 
 * @return undefined
 */


/**
* Perform the clothe filtering
* @param {Object} putOnValuation - Valuation of all clothes already put on this week
* @param {Object} suggestionValuation - Valuation of all clothes already propose this week
* @param {PerformDeletingCb} callback - Callback returning an array of valuation
*/
function performDeleting(clothesList, putOnValuation, suggestionValuation, callback){
    var number = {};
    var putOnFrequencyCst = {
        maille : 2,
        top : 1,
        pants : 2,
        dress : 2
    };

    var suggestionFrequencyCst = {
        maille : 3,
        top : 2,
        pants : 4,
        dress : 2
    };
    //console.log(putOnValuation);
    number['top'] = clothesList.filter(function(el){ return el.clothe_type === 'top' }).length;
    number['maille'] = clothesList.filter(function(el){ return el.clothe_type === 'maille' }).length;
    number['pants'] = clothesList.filter(function(el){ return el.clothe_type === 'pants' }).length;
    number['dress'] = clothesList.filter(function(el){ return el.clothe_type === 'dress' }).length;
    //console.log(number);
    var clotheListFiltered = clothesList;
    
    for (var i = clothesList.length - 1; i >= 0 ; i--){
        var clothe = clothesList[i];
        var type = clothe.clothe_type.toLocaleLowerCase()
        //Get the frequency allowed for the type
        var putOnFrequency = calculateFrequency(number[type], putOnFrequencyCst[type]);
        //Get the frequency allowed for the type
		var suggestionFrequency = calculateFrequency(number[type], suggestionFrequencyCst[type]);
        
        //In case of putOn deleting - Don’t put a limit of minimum clothe require because, if the user put on the clothe now it’s dirty - so need to wait next week to propose again 
        if (putOnValuation[clothe.clothe_id] >= putOnFrequency){
            //Remove clothe
            clotheListFiltered.splice(i, 1);
            //Decrement counter
            number[clothe.clothe_type]--;
        } else {
            // Now, we can verified if the number of clothe resting is > 3 to continue
            if (number[clothe.clothe_type] < 3) break;

            // In case of suggestion deleting - Catch if the limit of clothe necessary for 				
            //calculate outfit is not exceeded
            if (suggestionValuation[clothe.clothe_id] >= suggestionFrequency 
                && number[clothe.clothe_type] - 1 > 3) {
                //Remove clothe of the list 
                clotheListFiltered.splice(i, 1);
                //Decrement total number
                number[clothe.clothe_type]--;
            }
        }
    }
    
    number['top'] = clotheListFiltered.filter(function(el){ return el.clothe_type === 'top' }).length;
    number['maille'] = clotheListFiltered.filter(function(el){ return el.clothe_type === 'maille' }).length;
    number['pants'] = clotheListFiltered.filter(function(el){ return el.clothe_type === 'pants' }).length;
    number['dress'] = clotheListFiltered.filter(function(el){ return el.clothe_type === 'dress' }).length;
    //console.log(number);
    
    callback(null, clotheListFiltered);
};

/**
 * Called after query outfit from Mongodb
 * @name GetOutfitsCb
 * @function
 * @param {Outfit[]} outfits - List of outfit for the specific user
 */

/**
* Get outfit of the day already calculated
* @param {Object} user - User for which we want outfit
* @param {GetOutfitsCb} cb - Callback returning outfits already calculated for today
*/
exports.getOutfits = function(user, cb){
    var startDate = new Date(); // this is the starting date that looks like ISODate("2014-10-03T04:00:00.188Z")
    startDate.setSeconds(0);
    startDate.setHours(0);
    startDate.setMinutes(0);
    console.log(startDate);
    var queryIsPutOn = {
        $and : [{userid: new ObjectId(user._id)}, { updated : { $gt: startDate}}, {isPutOn: true} ]
    };
    
    var resultToSend = [];
    
    Outfit
        .find(queryIsPutOn)
        .populate('clothes')
        .exec(function(err, outfits){
            if (outfits.length > 0){
                resultToSend.push( outfits[0]);
            }
            var query = { $and : [{userid: new ObjectId(user._id)}, { updated : { $gt: startDate}} ] };
            Outfit.find(query).populate('clothes').exec(function(err, outfits){
                if(err) { return err; }
                var resultToSend = [];
                for (var i = 0; i < outfits.length && resultToSend.length < 6; i++){
                    styleCalc(outfits[i].matchingRate);
                    resultToSend.push(outfits[i]);
                }
                return cb(resultToSend);
            });
     });
};

/**
 * Called after query outfit from Mongodb
 * @name SaveOutfitsCb
 * @function
 * @param {Error} error - Error during saving outfit into Mongodb
 */


/**
* Historize outfits for specific user
* @param {Object} user - User for which we want to save outfits
* @param {Array<Outfit>} outfits - Lists of outfits we want to save
* @param {SaveOutfitsCb} callbackResult - Callback returning potential error during saving
*/
exports.saveOutfits = function(user, outfits, callbackResult){
    var startDate = new Date(); // this is the starting date that looks like ISODate("2014-10-03T04:00:00.188Z")
    startDate.setSeconds(0);
    startDate.setHours(0);
    startDate.setMinutes(0);
    
    var query = {
        $and : [{userid: new ObjectId(user._id)}, { updated : { $gt: startDate}} ]
    };
     Outfit.find(query, function(err, result){
        if (result.length < 12){
            var newOutfits = [];
            async.each(outfits, 
                function(outfitObj, callback) {
                    var refClothes = [];
                    for (var j = 0; j < outfitObj.outfit.length; j++){
                        refClothes.push(outfitObj.outfit[j]._id);
                    }
                    var newOutfit = new Outfit({userid: user._id, clothes : refClothes, style : outfitObj.style, matchingRate: outfitObj.matchingRate, moment: outfitObj.moment});
                    newOutfit.save(function (err, outfitWithId) {
                        outfitObj._id = outfitWithId._id;
                        newOutfits.push(outfitObj);
                        if (err) return callbackResult(err);
                        callback(null, outfitWithId);
                    });
                }, function(err){
                    return callbackResult(null, newOutfits);        
                }
            );
        } else {
            return callbackResult(null, result);   
        }
    });
};

/**
 * Called after query outfit from Mongodb
 * @name ApplyCb
 * @function
 * @param {Error} error - Error during filtering clothes
 * @param {Array} clothes - List of clothes filtering depending of clothes already put on or suggested
 */
 
 
 /**
 * Delete outfits of the day
 *
 */
exports.deleteOutfits = function(user, callback) {
	var startDate = new Date(); // this is the starting date that looks like ISODate("2014-10-03T04:00:00.188Z")
    startDate.setSeconds(0);
    startDate.setHours(0);
    startDate.setMinutes(0);
    
    var query = {
        $and : [{userid: new ObjectId(user._id)}, { updated : { $gt: startDate}} ]
    };
    Outfit.remove(query, function(err, result){
    	if (err){
    		return callback(err, null);
    	} else {
    		callback(null, {success: true});
    	}
    });
};

/**
* Remove all clothes already PutOn this week and exceeding the frequency authorized
* @param {Object} user - User for which we want to remove clothes already used
* @param {Array<Clothes>} clothesList - Lists of Clothes
* @param {ApplyCb} callbackResult - Callback returning clothes can be used by the style engine.
*/
exports.apply = function(user, clothesList, callback){
    async.parallel([
        //Retrieve valuation for clothe put On
        function(callback){ 
            retrieveValuations(user, true, function(err, putOnValuation){
                //console.log("putOnValuation");
                //console.log(putOnValuation);
                callback(err, putOnValuation);
            });
        },
        //Retrieve valuation for clothe suggested
        function(callback){
            retrieveValuations(user, false, function(err, suggestionValuation){
                //console.log("suggestionValuation");
                //console.log(suggestionValuation);
                callback(err, suggestionValuation);
            });
        }
    ],
    // Perform deleting
    function(err, results){
        performDeleting(clothesList, results[0], results[1], function(err, clotheList){
            callback(err, clotheList);
        });
    });
};