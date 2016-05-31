var mysql = require('mysql');

var pool = mysql.createPool({
  host: 'localhost',
  user: 'nodejs',
  password: '@CodeDress!',
  database: 'dresscode',
  connectionLimit: 10,
  supportBigNumbers: true
});

function prepareForBulk(arrayOfObject){
	var arrayResult = [];
	for (var i = 0; i < arrayOfObject.length; i++){
		var array = [];
		for (p in arrayOfObject[i]) {
			array.push(arrayOfObject[i][p]);
    	}
    	if (array.length === 12)
    		arrayResult.push(array);
	}
	return arrayResult;
}

// Get records from a color
exports.getRecords = function(colors, callback) {
  var sql = "SELECT * FROM clothes_tbl WHERE clothe_colors=?";
  // get a connection from the pool
  pool.getConnection(function(err, connection) {
    if(err) { console.log(err); callback(true); return; }
    // make the query
    connection.query(sql, [colors], function(err, results) {
      connection.release();
      if(err) { console.log(err); callback(true); return; }
      callback(false, results);
    });
  });
};

exports.getClothe = function(type, subtype, cut, color, pattern, sex, callback){
    var sql = "SELECT * FROM clothes_tbl WHERE clothe_type=? AND clothe_subtype=? AND clothe_colors=? AND clothe_pattern=? AND clothe_cut=? AND clothe_sex=? LIMIT 5";
    // get a connection from the pool
    pool.getConnection(function(err, connection) {
        if(err) { console.log(err); callback(true); return; }
        // make the query
        connection.query(sql, [type, subtype, color, pattern, cut, sex], function(err, results) {
            connection.release();
        if(err) { console.log(err); callback(true); return; }
        callback(false, results);
    });
  });
};

exports.getColors = function(callback) {
  var sql = "SELECT clothe_colors, clothe_image FROM clothes_tbl GROUP BY clothe_colors";
  // get a connection from the pool
  pool.getConnection(function(err, connection) {
    if(err) { console.log(err); callback(true); return; }
    // make the query
    connection.query(sql, function(err, results) {
      connection.release();
      if(err) { console.log(err); callback(true); return; }
      callback(false, results);
    });
  });
};

exports.postRecord = function(cloth, callback){
	var sql = 'INSERT INTO clothes_tbl SET ?';
	pool.getConnection(function(err, connection) {
    if(err) { console.log(err); callback(true); return; }
    // make the query
    var query = connection.query(sql, [cloth], function(err, results) {
      connection.release();
      if(err) { console.log(err); callback(true); return; }
      callback(false, results);
    });
  });
};

exports.postClothes = function(clothes, callback){
	var sql = 'INSERT INTO clothes_tbl (clothe_partnerid, clothe_partnerName, clothe_type, clothe_subtype, clothe_name, clothe_isUnis, clothe_pattern, clothe_cut, clothe_image, clothe_colors, clothe_sex, clothe_price) VALUES ?';
	pool.getConnection(function(err, connection) {
    	if(err) { console.log(err); callback(true); return; }
    	var bulk = prepareForBulk(clothes);
		
    	// make the query
    	var q = connection.query(sql, [bulk], function(err, results) {
      		connection.release();
      		if(err) { console.log(err); callback(true); return; }
      		callback(false, results);
    	});
    	
  	});
};

exports.getClothes = function(sex, callback){
	
	var sql = "SELECT clothe_partnerid, clothe_partnerName, clothe_type, clothe_subtype, clothe_name, clothe_isUnis, clothe_pattern, clothe_cut, clothe_image, clothe_colors, clothe_sex FROM clothes_tbl GROUP BY clothe_partnerid, clothe_subtype, clothe_sex having clothe_subtype <> ''";
	if (sex !== null)
		sql +=  " and clothe_sex = ?";
	console.log(sql);
	pool.getConnection(function(err, connection) {
		connection.query(sql, [sex], function (err, rows, fields) {
			connection.release();
			if(err) { console.log(err); callback(true); return; }
    		callback(false, rows);
  		});
  	});
};