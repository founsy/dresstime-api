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

function randomIntFromInterval(min,max)
{
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
function clotheAlreadyProposeToday(user, type, /*list,*/ cb){    
    console.log('------------- Start clotheAlreadyProposeToday() ---------');
    var startDate = new Date(); // this is the starting date that looks like ISODate("2014-10-03T04:00:00.188Z")
    startDate.setDate(startDate.getDate() - getPeriodByType(type)); //Return 3 days in the past
    startDate.setSeconds(0);
    startDate.setHours(0);
    startDate.setMinutes(0);
    
    var query = {
        $and : [{userid: new ObjectId(user._id)}, { updated : { $gt: startDate}} ]
    }
    Outfit
        .find(query)
        .populate({
            path: 'clothes',
            match: { 'clothe_type' : type },
            select: 'clothe_id'
            })
        .exec(function(err, outfits){
            if(err) { return err; }
            var numberOfPropositionByClothe = [];
            async.each(outfits, function(item, callback){
                if (item.clothes.length > 0) {
                    numberOfPropositionLastWeek(item.clothes[0].clothe_id, user, function(number, clothe_id){
                        numberOfPropositionByClothe.push({clothe_id : clothe_id, number: number});
                        callback();
                    });
                }
            }, function (err){
                console.log(numberOfPropositionByClothe);
                return cb(type, numberOfPropositionByClothe);    
            });
        });
    
}


function getClothesOfWeek(user, callback){
    var startDate = new Date(); // this is the starting date that looks like ISODate("2014-10-03T04:00:00.188Z")
    startDate.setDate(startDate.getDate() - 5); //Return 3 days in the past
    startDate.setSeconds(0);
    startDate.setHours(0);
    startDate.setMinutes(0);
     var query = {
        $and : [{userid: new ObjectId(user._id)}, { updated : { $gt: startDate}} ]
    }
      Outfit
        .find(query)
        .populate({ path: 'clothes' })
        .exec(function(err, outfits){
            if(err) { return err; }
            var numberOfPropositionByClothe = {};
            for (var i = 0; i < outfits.length; i++){
                for (var j = 0; j < outfits[i].clothes.length; j++){
                    var clothe_id = outfits[i].clothes[j].clothe_id;
                    //TODO
                    //If proposition was yesterday add more than 1, to remove it from proposition
                    var diff = getDiffDay(new Date(), outfits[i].updated);

                    if (typeof numberOfPropositionByClothe[clothe_id] === 'undefined'){
                        numberOfPropositionByClothe[clothe_id] = diff > 1 ? 1 : randomIntFromInterval(1, 3);
                    } else {
                        numberOfPropositionByClothe[clothe_id] = diff > 1 ? numberOfPropositionByClothe[clothe_id] + 1 : numberOfPropositionByClothe[clothe_id] + randomIntFromInterval(1, 3);
                    }   
                }
            }
            return callback(numberOfPropositionByClothe);
        });
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

function numberOfPropositionLastWeek(clotheId, user, callback){
    var startDate = new Date(); // this is the starting date that looks like ISODate("2014-10-03T04:00:00.188Z")
    startDate.setDate(startDate.getDate() - 7); //Return 3 days in the past
    startDate.setSeconds(0);
    startDate.setHours(0);
    startDate.setMinutes(0);
    
    var query = {
        $and : [{userid: new ObjectId(user._id)}, { updated : { $gt: startDate}} ]
    }
    
    Outfit
        .find(query)
        .populate({
            path: 'clothes',
            match: { 'clothe_id' : clotheId },
            select: 'clothe_id'
            })
        .exec(function(err, outfits){
            if(err) { return err; }
            var k = 0;
            for (var j = 0; j < outfits.length; j++){
                if(outfits[j].clothes.length > 0){
                    k++;
                }
            }
            return callback(k, clotheId);
        });
};

function filterFromArray(arrayToFilter, arrayFiltering){
    var result = [];
    for (var i = 0; i < arrayToFilter.length; i++){
        for (var j =0; j < arrayFiltering.length; j++){
            if (arrayToFilter[i].clothe_id !== arrayFiltering[j].clothe_id || (arrayToFilter[i].clothe_id === arrayFiltering[j].clothe_id && arrayFiltering[j].number < 3)){
                result.push(arrayToFilter[i]);
                break;
            }
        }
    } 
    return result;
}


exports.removeClothes = function(user, clothes, cb){
    var number = {};
    number['top'] = clothes.filter(function(el){ return el.clothe_type === 'top' }).length;
    number['maille'] = clothes.filter(function(el){ return el.clothe_type === 'maille' }).length;
    number['pants'] = clothes.filter(function(el){ return el.clothe_type === 'pants' }).length;
    number['dress'] = clothes.filter(function(el){ return el.clothe_type === 'dress' }).length;
    console.log(number)
    getClothesOfWeek(user, function(numberOfProposition){
        console.log(numberOfProposition);
        clothes = clothes.filter(function(el){
            return !(typeof numberOfProposition[el.clothe_id] !== 'undefined' && numberOfProposition[el.clothe_id] > 5) || number[el.clothe_type] <= 3;
        });
        number['top'] = clothes.filter(function(el){ return el.clothe_type === 'top' }).length;
        number['maille'] = clothes.filter(function(el){ return el.clothe_type === 'maille' }).length;
        number['pants'] = clothes.filter(function(el){ return el.clothe_type === 'pants' }).length;
        number['dress'] = clothes.filter(function(el){ return el.clothe_type === 'dress' }).length;
        console.log(number)
        cb(clothes);
    });
}; 


exports.getOutfits = function(user, cb){
    var startDate = new Date(); // this is the starting date that looks like ISODate("2014-10-03T04:00:00.188Z")
    startDate.setSeconds(0);
    startDate.setHours(0);
    startDate.setMinutes(0);
    
    var query = {
        $and : [{userid: new ObjectId(user._id)}, { updated : { $gt: startDate}} ]
    }
    Outfit
        .find(query)
        .populate('clothes')
        .exec(function(err, outfits){
            if(err) { return err; }
            var resultToSend = [];
            for (var i = 0; i < outfits.length; i++){
                styleCalc(outfits[i].matchingRate);
                resultToSend.push(
                    {
                        outfit : outfits[i].clothes,
                        matchingRate: outfits[i].matchingRate,
                        style: outfits[i].style
                    }
                );
            }
           return cb(resultToSend);
        });
};

exports.execute = function(user, arrayOfCombinations, cb) {
    async.each(arrayOfCombinations, function(item, callback){
        if (item.length > 3){
            clotheAlreadyProposeToday(user, item[0].clothe_type, /*item,*/ function(clothe_type, list){
                for(var j = 0; j < arrayOfCombinations.length; j++){
                    if (arrayOfCombinations[j][0].clothe_type === clothe_type && list.length > 0){
                        console.log(arrayOfCombinations[j].length);
                        arrayOfCombinations[j] = filterFromArray(arrayOfCombinations[j], list);
                        console.log(arrayOfCombinations[j].length);
                        break;
                    }
                }
                callback();
            });
        } else {
            callback();
        }
    }, function(err){
        return cb(arrayOfCombinations);
    });
    
    //clotheAlreadyProposeToday(user, type, listSource, callback);
};

//Historize outfits for user
exports.saveOutfits = function(user, outfits, callbackResult){
    var startDate = new Date(); // this is the starting date that looks like ISODate("2014-10-03T04:00:00.188Z")
    startDate.setSeconds(0);
    startDate.setHours(0);
    startDate.setMinutes(0);
    
    var query = {
        $and : [{userid: new ObjectId(user._id)}, { updated : { $gt: startDate}} ]
    }
     Outfit.find(query, function(err, result){
        if (result.length < 12){
            for (var i= 0; i < outfits.length; i++){
                var outfit = outfits[i].outfit;
                var refClothes = [];
                for (var j = 0; j < outfit.length; j++){
                    refClothes.push(outfit[j]._id);
                }
                           
                var newOutfit = new Outfit({userid: user._id, clothes : refClothes, style : outfits[i].style, matchingRate: outfits[i].matchingRate});
                newOutfit.save(function (err) {
                    if (err) return callbackResult(err);
                    //return callbackResult(null, newOutfit);
                });
            }
        }
         //return callbackResult(null, result);
     });
    
};

//Apply Coefficient on frequency depending of the number of clothes
// @Parameters :
//  numberOfClothe : Number of clothe for a specific type
//  frequency : Number , frenquency acceptable for a specific type
// @Return
//    Frequency depending of the type and the number of clothe available
function calculateFrequency(numberOfClothe, frequency) {
    var coef = 2/numberOfClothe;
	return  Math.round((frequency*coef) + frequency)
}

// Calculate the score of a clothe already proposed
// @Parameters :
//
// @Return :
//   Score for a clothe depending of the last date proposed
function calculateSuggestionScoring(lastDate, currentDate){
    var diff = getDiffDay(currentDate, lastDate);
    var score = Math.round((0.14 * diff*diff) - (1.6*diff) + 5.6);
    return score;
}

// Calculate the starting date, for the range of outfits we needs
// @Parameters :
//  isPutOn : true meaning filter one outfit put on, false meaning suggestion
// @Return
//    Date to Start the Query
function calculateStartingDate(isPutOn){
    var startDate = new Date(); // this is the starting date that looks like ISODate("2014-10-03T04:00:00.188Z")
    startDate.setDate(startDate.getDate() - 5); //Return 3 days in the past
    startDate.setSeconds(0);
    startDate.setHours(0);
    startDate.setMinutes(0);
    return startDate;
};

// Retrieve all clothes already putOn since last Wash (hypothesis : washing saturday)
// @Parameters :
//  isPutOn : true meaning filter one outfit put on, false meaning suggestion
//  callback : (err, valuation)
// @Return an object :
// { «clothe_id » : numberOfPutOn } 
function retrieveValuations(user, isPutOn, callback){
    var startDate = calculateStartingDate(isPutOn);
    var endDate = new Date(); // this is the starting date that looks like ISODate("2014-10-03T04:00:00.188Z")
    endDate.setSeconds(0);
    endDate.setHours(0);
    endDate.setMinutes(0);

     var query = {
        $and : [{userid: new ObjectId(user._id)}, { updated : { $gt: startDate}},  { updated : { $lt: endDate}}, {isPutOn : isPutOn} ]
    }
      Outfit
        .find(query)
        .populate({ path: 'clothes' })
        .exec(function(err, outfits){
            if(err) { return callback(err); }
            var clotheValuation = {};
            console.log(outfits.length);
            for (var i = 0; i < outfits.length; i++){
                for (var j = 0; j < outfits[i].clothes.length; j++){
                    var clothe = outfits[i].clothes[j];
                    var score = calculateSuggestionScoring(outfits[i].updated, new Date());
                    if (!isPutOn){
                        //If proposition was yesterday add more than 1, to remove it from proposition
                        var diff = getDiffDay(endDate, outfits[i].updated);
                        console.log(diff);
                        if (typeof clotheValuation[clothe.clothe_id] === 'undefined'){
                            clotheValuation[clothe.clothe_id] = score//diff > 1 ? 1 : randomIntFromInterval(1, 5);
                        } else {
                            clotheValuation[clothe.clothe_id] += score //diff > 1 ? clotheValuation[clothe.clothe_id] + 1 : clotheValuation[clothe.clothe_id] + randomIntFromInterval(1, 5);
                        } 
                    
                    } else {
                        if (typeof clotheValuation[clothe.clothe_id] === 'undefined') {
                            clotheValuation[clothe.clothe_id] = score;
                            break;
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

// Perform the clothe filtering
// @Parameters :
//      putOnValuation : Object : valuation of all clothes already put on this week
//      suggestionValuation : Object : valuation of all clothes already propose this week
//      callback : function(error, clotheListFiltered)
// @Return :
//      nothing
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
        pants : 3,
        dress : 2
    };
    
    number['top'] = clothesList.filter(function(el){ return el.clothe_type === 'top' }).length;
    number['maille'] = clothesList.filter(function(el){ return el.clothe_type === 'maille' }).length;
    number['pants'] = clothesList.filter(function(el){ return el.clothe_type === 'pants' }).length;
    number['dress'] = clothesList.filter(function(el){ return el.clothe_type === 'dress' }).length;
    console.log(number);
    var clotheListFiltered = clothesList;
    
    for (var i = clothesList.length - 1; i >= 0 ; i--){
        var clothe = clothesList[i];
        var type = clothe.clothe_type.toLocaleLowerCase()
        console.log(type);
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
            break;
        }
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
    
    number['top'] = clothesList.filter(function(el){ return el.clothe_type === 'top' }).length;
    number['maille'] = clotheListFiltered.filter(function(el){ return el.clothe_type === 'maille' }).length;
    number['pants'] = clotheListFiltered.filter(function(el){ return el.clothe_type === 'pants' }).length;
    number['dress'] = clotheListFiltered.filter(function(el){ return el.clothe_type === 'dress' }).length;
    console.log(number);
    
    callback(null, clotheListFiltered);
};



//Remove all clothes already PutOn this week and exceeding the frequency authorized
exports.apply = function(user, clothesList, callback){
    async.parallel([
        //Retrieva valuation for clothe put On
        function(callback){ 
            retrieveValuations(user, true, function(err, putOnValuation){
                callback(err, putOnValuation);
            });
        },
        //Retrieva valuation for clothe suggested
        function(callback){
            retrieveValuations(user, false, function(err, suggestionValuation){
                callback(err, suggestionValuation);
            });
        }
    ],
    // Perform deleting
    function(err, results){
        console.log(results);
        performDeleting(clothesList, results[0], results[1], function(err, clotheList){
            callback(err, clotheList);
        });
    });
};