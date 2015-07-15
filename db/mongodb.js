var MongoClient = require('mongodb').MongoClient,
	Q = require('q');

var url = 'mongodb://localhost:27017/dresscode';

function getCollectionName(styleName){
	switch(styleName.toLowerCase()){
		case 'business':
			return 'outfitsBusinessCollection';
		case 'casual':
			return 'outfitsCasualCollection';
		case 'fashion':
			return 'outfitsFashionCollection';
		case 'sportwear':
			return 'outfitsSportwearCollection';
	}
}


function insertOutfits(collection, outfits1000, callback){
	collection.insert(outfits1000, function (err, result) {
		if (err) {
			console.log(err);
			callback(true, result);
		} else {
			//console.log('Inserted %d documents into the "outfits" collection. The documents inserted with "_id" are:', result.length, result);
			callback(false, result);
		}
	});
}
var numberFinish = 0;

exports.removeOutfitsCollection = function(style, callback){
	MongoClient.connect(url, function(err, db) { 
		var collection = db.collection(getCollectionName(style));
		collection.drop(function(err, reply) {
			if (err) { callback(true, err);}
			else {
				callback(false, reply);
			}
		}); 
	});
}

exports.saveOutfitsCollection = function(style, outfits, callback){
	// Use connect method to connect to the Server
	MongoClient.connect(url, function(err, db) {  
		console.log("Connected correctly to server");
		// Get the documents collection
    	var collection = db.collection(getCollectionName(style));
    	if (outfits.length > 1000){
    		var i = Math.round(outfits.length / 1000);
    		for(var j = 0; j < i; j++){
    			var step = 1000;
    			if (j*1000 + step > outfits.length){
    				step = outfits.length - (j*1000) + 1;
    			} 
    			insertOutfits(collection, outfits.slice(j*1000, (j*1000 + step - 1)), function(err, result){
    				//Close connection
    				numberFinish++;
    				console.log(j + " " + numberFinish);
    				if (j === numberFinish) {
						db.close();
						callback(false, result);
					}
    			});
    		}
    	} else {
    		insertOutfits(collection, outfits, function(err, result){
    			db.close();
				callback(false, result);
    		});
    	}
	});
}

exports.getOutfitsCollection = function(style, options, callback){
	var result = [];
	// Use connect method to connect to the Server
	MongoClient.connect(url, function(err, db) {  
		console.log("Connected correctly to server");
		// Get the documents collection
    	var collection = db.collection(getCollectionName(style));
			/*collection.find({"outfit.maille.clothe_partnerid" : 2523502 }, {limit: 3}).toArray(function(err, docs){
    			result = result.concat(docs);
    			collection.find({"outfit.maille.clothe_partnerid" : 2379261 }, {limit: 3}).toArray(function(err, docs){
					result = result.concat(docs);
					collection.find({"outfit.maille.clothe_partnerid" : 2523503 }, {limit: 3}).toArray(function(err, docs){
    					result = result.concat(docs);
    					callback(result);
    					//Close connection
						db.close();
					});
				});
			});		*/
		
    	collection.find({}, options).toArray(function(err, docs){
    		console.log("retrieved records:");
    		callback(docs);
    		//Close connection
			db.close();
		});
	});
}

exports.getUser = function(username){
 	var deferred = Q.defer();
	MongoClient.connect(url, function(err, db) { 
		console.log("connected " + username);
		db.collection('users').findOne({'username': username}, function(err, one){
			console.log("request " + one );
			if (err) deferred.reject(err);
			else if (one === null){
				console.log("end request failed");
				deferred.reject("No user found");
        	} else 
        		deferred.resolve(one);
			console.log("end request");
		});
	});
	return deferred.promise;
};

exports.insertUser = function(username, user){
 	var deferred = Q.defer();
	MongoClient.connect(url, function(err, db) { 
		db.collection('users').insert(user, deferred.makeNodeResolver());
	});
	return deferred.promise;
};

exports.updateUser = function(user){
	var deferred = Q.defer();
	MongoClient.connect(url, function(err, db) {
		db.collection('users').update({_id:user._id }, user, deferred.makeNodeResolver());
	});
	return deferred.promise;
};

exports.deleteUser = function(user){
	var deferred = Q.defer();
	MongoClient.connect(url, function(err, db) {
		db.collection('users').delete({_id:user._id }, deferred.makeNodeResolver());
	});
	return deferred.promise;
};