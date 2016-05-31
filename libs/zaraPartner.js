var http = require('http');
var rootPath = process.cwd();

var db = require(rootPath + '/db/databases');

function detectType(type){
	if (type.toUpperCase().indexOf("POLO") > -1){ 
		return "top";
	} else if (type.toUpperCase().indexOf("T-SHIRT") > -1){
		return "top";
	} else if (type.toUpperCase().indexOf("SHIRT") > -1){
		return "top";
	} else if (type.toUpperCase().indexOf("TOP") > -1){
		return "top";
	} else if (type.toUpperCase().indexOf("JEANS") > -1){
		return "pants";
	}  else if (type.toUpperCase().indexOf("SHORT") > -1){
		return "pants";
	} else if (type.toUpperCase().indexOf("BERMUDA") > -1){
		return "pants";
	} else if (type.toUpperCase().indexOf("DUNGAREES") > -1){
		return "pants";
	} else if (type.toUpperCase().indexOf("TROUSERS") > -1){
		return "pants";
	} else if (type.toUpperCase().indexOf("PANT") > -1){
		return "pants";
	} else if (type.toUpperCase().indexOf("JOGGING") > -1){
		return "pants";
	} else if (type.toUpperCase().indexOf("CHINOS") > -1){
		return "pants";
	} else if (type.toUpperCase().indexOf("CULOTTES") > -1){
		return "pants";
	} else if (type.toUpperCase().indexOf("JEGGINGS") > -1){
		return "pants";
	}  else if (type.toUpperCase().indexOf("SWEATER") > -1){
		return "maille";
	} else if (type.toUpperCase().indexOf("KNITWEAR") > -1){
		return "maille";
	} else if (type.toUpperCase().indexOf("JUMPER") > -1){
		return "maille";
	} else if (type.toUpperCase().indexOf("CARDIGAN") > -1){
		return "maille";
	} else if (type.toUpperCase().indexOf("SKIRT")> -1){
		return "pants";
	} else if (type.toUpperCase().indexOf("DRESS")> -1){
		return "top";
	} else if (type.toUpperCase().indexOf("JUMPSUITS")> -1){
		return "top";
	} else if (type.toUpperCase().indexOf("TUNIC")> -1){
		return "top";
	}  else if (type.toUpperCase().indexOf("BLOUSE")> -1){
		return "top";
	} else {
		return "";
	}
}

function detectCutFromName(name){
	if (name.toUpperCase().indexOf("SKINNY".toUpperCase()) > -1){
		return "SKINNY";
	} else if (name.toUpperCase().indexOf("SLIM".toUpperCase()) > -1){
		return "SLIM";
	} else if (name.toUpperCase().indexOf("REGULAR".toUpperCase()) > -1){
		return "REGULAR";
	} else if (name.toUpperCase().indexOf("TAPERED".toUpperCase()) > -1){
		return "TAPERED";
	} else if (name.toUpperCase().indexOf("RELAX FIT".toUpperCase()) > -1){
		return "RELAX FIT";
	} else if (name.toUpperCase().indexOf("RELAXED FIT".toUpperCase()) > -1){
		return "RELAX FIT";
	} else if (name.toUpperCase().indexOf("PLEATED".toUpperCase()) > -1){
		return "PLEATED";
	} else if (name.toUpperCase().indexOf("SUIT".toUpperCase()) > -1){
		return "SUIT";
	} else if (name.toUpperCase().indexOf("SLEEVE".toUpperCase()) > -1){
		return "SLEEVE";
	} else if (name.toUpperCase().indexOf("MAO COLLAR".toUpperCase()) > -1){
		return "MAO COLLAR";
	} else if (name.toUpperCase().indexOf("MINI".toUpperCase()) > -1){
		return "MINI";
	} else if (name.toUpperCase().indexOf("MIDI".toUpperCase()) > -1){
		return "MIDI";
	} else if (name.toUpperCase().indexOf("MAXI".toUpperCase()) > -1){
		return "LONG";
	} else if (name.toUpperCase().indexOf("LONG".toUpperCase()) > -1){
		return "LONG";
	} else {
		return "";
	}
}

function detectSubTypeFromName(name){
	if (name.toUpperCase().indexOf("JACKET".toUpperCase())> -1){
		return "JACKET";
	} else if (name.toUpperCase().indexOf("PARKA".toUpperCase())> -1){
		return "PARKA"; 
	} else if (name.toUpperCase().indexOf("POLO".toUpperCase())> -1){
		return "POLO";
	} else if (name.toUpperCase().indexOf("T-SHIRT".toUpperCase())> -1){
		return "T-SHIRT";
	} else if (name.toUpperCase().indexOf("SHIRT".toUpperCase())> -1){
		return "SHIRT";
	} else if (name.toUpperCase().indexOf("NECK TOP".toUpperCase())> -1){
		return "TOP";
	} else if (name.toUpperCase().indexOf("TANK TOP".toUpperCase())> -1){
		return "TOP";
	} else if (name.toUpperCase().indexOf("TOP".toUpperCase())> -1){
		return "TOP";
	} else if (name.toUpperCase().indexOf("SHORT".toUpperCase())> -1){
		return "SHORT";
	} else if (name.toUpperCase().indexOf("SWEATER".toUpperCase())> -1){
		return "SWEATER";
	} else if (name.toUpperCase().indexOf("TROUSER".toUpperCase())> -1){
		return "TROUSERS";
	} else if (name.toUpperCase().indexOf("JEANS".toUpperCase())> -1){
		return "JEANS";
	} else if (name.toUpperCase().indexOf("CHINOS".toUpperCase())> -1){
		return "CHINOS";
	} else if (name.toUpperCase().indexOf("DUNGAREES".toUpperCase())> -1){
		return "DUNGAREES";
	} else if (name.toUpperCase().indexOf("CULOTTES".toUpperCase())> -1){
		return "CULOTTES";
	} else if (name.toUpperCase().indexOf("JEGGINGS".toUpperCase())> -1){
		return "JEGGINGS";
	} else if (name.toUpperCase().indexOf("JOGGING".toUpperCase())> -1){
		return "JOGGING";
	} else if (name.toUpperCase().indexOf("JUMPER".toUpperCase())> -1){
		return "JUMPER";
	} else if (name.toUpperCase().indexOf("JERSEY".toUpperCase())> -1){
		return "JUMPER";
	} else if (name.toUpperCase().indexOf("CARDIGAN".toUpperCase())> -1){
		return "CARDIGAN";
	} else if (name.toUpperCase().indexOf("SKIRT".toUpperCase())> -1){
		return "SKIRTS";
	} else if (name.toUpperCase().indexOf("DRESS".toUpperCase())> -1){
		return "DRESSES";
	} else if (name.toUpperCase().indexOf("JUMPSUITS".toUpperCase())> -1){
		return "JUMPSUITS";
	} else if (name.toUpperCase().indexOf("TUNIC".toUpperCase())> -1){
		return "TUNIC";
	}  else if (name.toUpperCase().indexOf("BLOUSE".toUpperCase())> -1){
		return "BLOUSE";
	} else {
		return "";
	}
	
}

function detectPatternFromName(name){
	if (name.toUpperCase().indexOf("HORIZONTAL STRIPE".toUpperCase()) > -1){
		pattern = "Hstripe";
	} else if (name.toUpperCase().indexOf("VERTICAL STRIPE".toUpperCase()) > -1){
		pattern = "Vstripe";
	} else if (name.toUpperCase().indexOf("STRIPE".toUpperCase()) > -1){
		pattern = "Hstripe";
	} else if (name.toUpperCase().indexOf("PRINT".toUpperCase()) > -1) {
		pattern = "printed";
	} else if (name.toUpperCase().indexOf("GINGHAM".toUpperCase()) > -1) {
		pattern = "gingham";
	} else if (name.toUpperCase().indexOf("JACQUARD".toUpperCase()) > -1) {
		pattern = "jacquard";
	} else if (name.toUpperCase().indexOf("CHECK".toUpperCase()) > -1) {
		pattern = "check";
	} else if (name.toUpperCase().indexOf("FLORAL".toUpperCase()) > -1) {
		pattern = "floral";
	} else {
		pattern = "plain";
	}
	return pattern;
}

function wrapProduct(product, type, subtype, patternCat, sex){
	type = detectType(product.name);
	subtype = detectSubTypeFromName(product.name);
	var cut = detectCutFromName(product.name);
	
	var pattern = detectPatternFromName(product.name);
	var prod = {clothe_partnerid:product.id , clothe_partnerName: "Zara", clothe_type: type, clothe_subtype : subtype, clothe_name: product.name, clothe_isUnis: (pattern === "plain"), clothe_pattern : pattern, clothe_cut: cut};
	if (typeof product.detail.colors[0].colorImage !== "undefined"){
		prod.clothe_image = "http://static.zara.net/photos/"+product.detail.colors[0].colorImage.path+"w/1024/" + product.detail.colors[0].colorImage.name+"_1.jpg"
	}
	prod.clothe_colors = product.detail.colors[0].name;
	prod.clothe_sex = sex;
	prod.clothe_price = product.price;
	return prod;
}

var completed_requests = 0;
var data = '';
var isCurrentRequestCompleted = true;
var sexe;

function retrieveProductsFromCategories(categoriesId, index, sex){
	var productsNew = [];
	var data = '';
	sexe = sex;
	if (completed_requests < categoriesId.length){ 
		http.get('http://www.zara.com/itxrest/1/catalog/store/10703/category/'+categoriesId[completed_requests].id+'/product', function(resp){
			resp.on('data', function(chunk){
				data += chunk;
			});
			resp.on('end', function(){
				var products = JSON.parse(data);
				for (var i = 0; i < products.products.length; i++){
					var product = products.products[i];
					productsNew.push(wrapProduct(product, detectType(categoriesId[completed_requests].name), categoriesId[completed_requests].name , categoriesId[completed_requests].subtype, sexe));
				}
				db.postClothes(productsNew, function(err, results) {
					if(err) { console.log(err); return;}
					console.log("Finish saving");
					completed_requests++;
					retrieveProductsFromCategories(categoriesId, completed_requests, sexe);
				});
			});
		});
	}
}

/*function retrieveCategoriesToFetch(categoriesId){
	var catToFetch = [];
	for (var j=0; j < categoriesId.length; j++){
		var options = {
			host: 'www.zara.com',
			path: '/itxrest/1/catalog/store/10703/category/'+categoriesId[j]+'/product',
			method : 'GET'
		};
		var request = http.request(options, function(resp){
			var data = '';
  			resp.on('data', function(chunk){
    			//do something with chunk
    			data += chunk;
  			});
  			resp.on('end', function(){
				var cats = JSON.parse(data);
				var catName = "";
			
				if (cats.subcategories.length === 0){
					catToFetch.push({id: cats.id, name: cats.name, subtype: ""});
				} else {
					for(var i = 0; i < cats.subcategories.length; i++){
						if (cats.subcategories[i].name !== "View all"){
							catToFetch.push({id: cats.subcategories[i].id, name: cats.name, subtype: cats.subcategories[i].name});
						}
					}
				}
			});
		}).on("error", function(e){
			console.log("Got error: " + e.message);
		});
	}
	retrieveProductsFromCategories(catToFetch);
	//request.end();  		
}
*/

exports.retrieveProducts = function(categorieId){
	var categoriesId = [
	{"id":715535,"name":"Polos","subtype":""},
	{"id":583033,"name":"T-shirts","subtype":"Plain"},
	{"id":583032,"name":"T-shirts","subtype":"Pattern"},
	{"id":731501,"name":"T-shirts","subtype":"Sleeveless"},
	{"id":583025,"name":"Shirts","subtype":"Plain"},
	{"id":583024,"name":"Shirts","subtype":"Printed"},
	{"id":715532,"name":"Shirts","subtype":"Short Sleeves"},
	{"id":586537,"name":"Jeans","subtype":"Slim Fit"},
	{"id":401036,"name":"Jeans","subtype":"Skinny Fit"},
	{"id":587001,"name":"Jeans","subtype":"Regular Fit"},
	{"id":716026,"name":"Denim","subtype":""},
	{"id":551503,"name":"Trousers","subtype":"Joggers"},
	{"id":551501,"name":"Trousers","subtype":"Casual"},
	{"id":551502,"name":"Trousers","subtype":"Chinos"},
	{"id":551504,"name":"Trousers","subtype":"Tailored"},
	{"id":714016,"name":"Knitwear","subtype":"Jumper"},
	{"id":578501,"name":"Knitwear","subtype":"Cardigans"}];

	/*var categoriesId = [
		{"id":399001,"name":"Jumpsuits","subtype":""},
		{"id":400009,"name":"Dresses","subtype":"Mini"},
		{"id":718502,"name":"Dresses","subtype":"Midi"},
		{"id":400008,"name":"Dresses","subtype":"Maxi"},
		{"id":401033,"name":"Shirts","subtype":""},
		{"id":718512,"name":"Tops","subtype":"Plain"},
		{"id":727001,"name":"Tops","subtype":"Crochet"},
		{"id":718515,"name":"Tops","subtype":"Stripes"},
		{"id":718516,"name":"Tops","subtype":"Checks"},
		{"id":401019,"name":"Trousers","subtype":"Skinny"},
		{"id":401020,"name":"Trousers","subtype":"Smart"},
		{"id":722056,"name":"Trousers","subtype":"Flowing"},
		{"id":401021,"name":"Trousers","subtype":"Relaxed fit"},
		{"id":718504,"name":"Trousers","subtype":"Culottes"},
		{"id":401016,"name":"Trousers","subtype":"Leggings"},
		{"id":404505,"name":"Shorts","subtype":""},
		{"id":400017,"name":"Jeans","subtype":"Skinny"},
		{"id":431510,"name":"Jeans","subtype":"Damaged"},
		{"id":401002,"name":"Jeans","subtype":"Boyfriend"},
		{"id":401001,"name":"Jeans","subtype":"Flared"},
		{"id":718505,"name":"Jeans","subtype":"High Waisted"},
		{"id":401023,"name":"Skirts","subtype":"Mini"},
		{"id":401024,"name":"Skirts","subtype":"Midi"},
		{"id":401025,"name":"Skirts","subtype":"Maxi"},
		{"id":727004,"name":"Knitwear","subtype":"Tops"},
		{"id":401012,"name":"Knitwear","subtype":"Sweaters"},
		{"id":401011,"name":"Knitwear","subtype":"Cardigans"},
		{"id":401011,"name":"Knitwear","subtype":"Dresses"},
		{"id":718509,"name":"T-shirts","subtype":"Sleeveless"},
		{"id":401008,"name":"T-shirts","subtype":"Short Sleeve"},
		{"id":401009,"name":"T-shirts","subtype":"Long Sleeve"},
		{"id":401009,"name":"Sweatshirts","subtype":""}
	];*/
	retrieveProductsFromCategories(categoriesId, 0, 1);		
}
