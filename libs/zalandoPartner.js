var https = require('https');
var rootPath = process.cwd();
var BrandClothe = require(rootPath + '/models/brandClothe');

var async = require('async');

//url = https://api.zalando.com/articles?gender=male&category=pantalons-costumes-homme

//https://api.zalando.com/categories?name=pantalon&outlet=false&hidden=false&targetGroup=men&page=1&pageSize=20

/*    
var categoriesTranslationEn = {
    "mens-clothing-suit-trousers" : { type : "pants", subtype: "trousers", cut : "suit"},
    "mens-clothing-trousers-chinos" : { type: "pants", subtype: "chinos" },
    "premium-mens-trousers" : {type: "pants" , subtype : "trousers" },
    "mens-clothing-jeans-slim-fit" : {type: "pants", subtype: "jeans", cut: "slim"},
    "mens-clothing-jeans" : {type: "pants", subtype: "jeans" },
    "mens-clothing-basic-t-shirts" : {type: "top", subtype: "tshirt" },
    "mens-clothing-print-t-shirts" : {type: "top", subtype: "tshirt", pattern : "printed"},
    "mens-clothing-polo-shirts" : {type: "top", subtype: "polo", cut: "sleeve"},
    "mens-clothing-shirts" : {type: "top", subtype: "shirt" },
    "mens-clothing-long-sleeve-tops" : {type : "top", subtype: "polo"},
    "mens-cardigans" : {type: "maille", subtype: "cardigan"},
    "mens-clothing-jumpers-knitted-jumpers" : {type: "maille", subtype: "jumper", cut : "fin"},
    "mens-sports-sweatshirts" : {type: "maille", subtype: "sweater"}
}; */

var brand = {
    "ralph-lauren" : ["RP5", "PO2", "D30", "L42"], 
    "gap" : ["GP0"], 
    "benetton" : ["4BE"], 
    "gstar": ["GS1"], 
    "reiss": ["RB0"], 
    "jbrand" : ["JB2"], 
    "scotch-and-soda" : ["SC3"], 
    "ted-baker" : ["TE4"], 
    "tommy-hilfiger" : ["T10", "TO1"],
    "nike" : ["NI1"],
    "adidas" : ["AD1", "AD7"]
};



var brandWomen = {
    "edc-by-esprit" : ["ED1"],
    "benetton" : ["4BE"], 
    "coast" : ["C0I", "C98"],
    "jbrand" : ["JB2"], 
    "new-look" : ["NL7", "NL0", "N32", "NL6"],
    "river-island" : ["RI9"],
    "ted-baker" : ["TE4"], 
    "topshop" : ["TP7"],
    "urbar-outfitters" : ["UR6", "UX8", "UR5"],
    "nike" : ["NI1"],
    "adidas" : ["AD1", "AD7"]
};

var categoriesTranslationEn = {
    "mens-clothing-jumpers-knitted-jumpers" : {type: "maille", subtype: "jumper", cut : "fin"},
    "mens-cardigans" : {type: "maille", subtype: "cardigan"},
    "mens-clothing-jumpers-hoodies" : {type: "maille", subtype: "sweater"},
    "mens-clothing-shirts" : {type: "top", subtype: "shirt"},
    "mens-clothing-polo-shirts" : {type: "top", subtype: "polo"},
    "mens-clothing-basic-t-shirts"  : {type: "top", subtype: "tshirt"},
    "mens-clothing-jeans" : {type:"pants", subtype:"jean"},
    "mens-clothing-jeans-slim-fit" : {type: "pants", subtype: "jeans", cut : "slim"},
    "mens-clothing-suit-trousers" : {type: "pants", subtype: "trousers", cut : "suit"},
    "mens-clothing-chinos" : {type: "pants", subtype: "chinos"},
    "mens-clothing-trousers" : {type: "pants", subtype: "trousers"},
    "mens-clothing-shorts" : {type: "pants", subtype: "short"}
};

var categoriesTranslationFr = {
    "pullovers-homme" : {type: "maille", subtype: "jumper", cut : "fin"},
    "gilets-homme" : {type: "maille", subtype: "cardigan"},
    "sweatshirts-homme" : {type: "maille", subtype: "sweater"},
    "chemises-homme" : {type: "top", subtype: "shirt"},
    "polos-homme" : {type: "top", subtype: "polo"},
    "t-shirts-basiques-homme"  : {type: "top", subtype: "tshirt"},
    "jeans-droits-homme" : {type:"pants", subtype:"jean"},
    "jeans-slim-homme" : {type: "pants", subtype: "jeans", cut : "slim"},
    "pantalons-costumes-homme" : {type: "pants", subtype: "trousers", cut : "suit"},
    "pantalons-chino-homme" : {type: "pants", subtype: "chinos"},
    "pantalons-classiques-homme" : {type: "pants", subtype: "trousers"},
    "shorts-homme" : {type: "pants", subtype: "short"}
};

var catTranlationFrWomen = {
    "pulls-femme" : {type: "maille", subtype: "jumper", cut : "fin"},
    "polaires-femme" : {type: "maille", subtype: "jumper", cut : "epais"},
    "gilets-femme" : {type: "maille", subtype: "cardigan"},
    "sweatshirts-femme" : {type: "maille", subtype: "sweater"},
    "chemises-chemisiers-femme" : {type: "top", subtype: "shirt"},
    "polos-femme" : {type: "top", subtype: "polo"},
    "t-shirts-femme"  : {type: "top", subtype: "tshirt"},
    "jeans-droits-femme"  : {type: "pants", subtype: "jean"},
    "jeans-slim-femme"  : {type: "pants", subtype: "jeans", cut : "slim"},
    "chino-femme"  : {type: "pants", subtype: "chinos"},
    "pantalons-classiques-femme"  : {type: "pants", subtype: "trousers", cut : "regular"},
    "pantalons-femme"  : {type: "pants", subtype: "trousers"},
    "shorts-femme"  : {type: "pants", subtype: "short"},
    "jupes-plissees"  : {type: "dress", subtype: "skirt",  cut : "midlenght"},
    "maxi-jupes"  : {type: "dress", subtype: "skirt", cut : "long"},
    "mini-jupes" : {type: "dress", subtype: "skirt", cut : "short"},
    "robes-ete-femme"  : {type: "dress", subtype: "dress", cut : "casual"},
    "robes-de-soiree-femme"  : {type: "dress", subtype: "dress", cut : "evening"},
    "robes-foureau-femme"  : {type: "dress", subtype: "dress", cut : "straight"}
};

/*
var categoriesTranslationFr = {
    "pantalons-costumes-homme" : { type : "pants", subtype: "trousers", cut : "suit"},
    "pantalons-chino-homme" : { type: "pants", subtype: "chinos" },
    "pantalons-homme-luxe" : {type: "pants" , subtype : "trousers" },
    "pantalons-classiques-homme" : {type: "pants" , subtype : "trousers", cut: "regular"},
    "jeans-slim-homme" : {type: "pants", subtype: "jeans", cut: "slim"},
    "jeans-droits-homme" : {type: "pants", subtype: "jeans" },
    "t-shirts-basiques-homme" : {type: "top", subtype: "tshirt" },
    "t-shirts-imprimes-homme" : {type: "top", subtype: "tshirt", pattern : "printed"},
    "polos-homme" : {type: "top", subtype: "polo", cut: "sleeve"},
    "chemises-homme" : {type: "top", subtype: "shirt" },
    "t-shirts-manches-longues-homme" : {type : "top", subtype: "polo"},
    "gilets-homme" : {type: "maille", subtype: "cardigan"},
    "pullovers-homme" : {type: "maille", subtype: "jumper", cut : "fin"},
    "sweatshirts-homme" : {type: "maille", subtype: "sweater"}
};
*/
    
var colorsTranslationFr = {
    "noir" : "black",
    "marron" : "brown",
    "beige" : "beige",
    "gris" : "gray",
    "blanc" : "white",
    "bleu" : "blue",
    "bleu pétrole" : "petrol",
    "turquoise" : "turquoise",
    "vert" : "green",
    "vert olive" : "olive",
    "jaune" : "yellow",
    "orange" : "orange",
    "rouge" : "red",
    "rose" : "pink",
    "violet" : "purple",
    "doré" : "gold",
    "argenté" : "silver",
    "multicolore" : "mulitcolored"
};


var patternTranslationFr = {
    "couleur unie" : "plain",
    "rayures" : "Hstripe",
    "" : "Vstripe",
    "carreaux" : "check",
    "" : "gingham",
    "" : "jacquard",
    "imprimé" : "printed",
    "fleurs" : "floral"
};


var cutTranslation = {
    "noir" : "black"

};

    
    
function getAttributes(attributes, obj){
    //console.log(attributes);
    for (var i = 0; i < attributes.length; i++){
        var property_name = "";
        if (attributes[i]["name"] === "Motif / Couleur" || attributes[i]["name"] === "Pattern"){
            property_name = "clothe_pattern"; 
            obj[property_name] = typeof patternTranslationFr[attributes[i]["values"][0].toLocaleLowerCase()] !== 'undefined' ? patternTranslationFr[attributes[i]["values"][0].toLocaleLowerCase()] : "";
        } /*else if (attributes[i]["name"] == "Coupe"){
            property_name = "clothe_cut"; 
            obj[property_name] = attributes[i]["values"][0];
        } else if (attributes[i]["name"] == "Longueur") {
            property_name = "clothe_subtype";   
            obj[property_name] = attributes[i]["values"][0];
        } else if (attributes[i]["name"] == "Sleeve length"){
            //obj["clothe_cut"] = attributes[i]["values"][0] === "Long sleeve" &&  attributes[i]["values"].length > 1 ? "" : "sleeve";
        } */
    }
    return obj;
}    
    
function wrapProduct(sexe, clothe, type){
    var clotheWrap = {};
    //var type = categoriesTranslation[categorie];
    clotheWrap["clothe_type"] = type.type;
    clotheWrap["clothe_subtype"] = type.subtype;
    clotheWrap["clothe_cut"] = typeof type.cut !== 'undefined' ? type.cut : "";
    clotheWrap["clothe_pattern"] = typeof type.pattern !== 'undefined' ? type.pattern : "";
    clotheWrap["clothe_id"] = clothe.id;
    clotheWrap["clothe_name"] = clothe.name;
    clotheWrap["clothe_partnerid"] = "";
    clotheWrap["clothe_partnerName"] = "zalando";
    clotheWrap["clothe_shopUrl"] = clothe.shopUrl;
    clotheWrap["clothe_brand"] = clothe.brand.name;
    clotheWrap["clothe_brandLogo"] = clothe.brand.logoUrl;
    clotheWrap["clothe_colors"] = typeof colorsTranslationFr[clothe.color.toLocaleLowerCase()] !== 'undefined' ? colorsTranslationFr[clothe.color.toLocaleLowerCase()] : clothe.color.toLocaleLowerCase();
    clotheWrap["clothe_litteralColor"] = typeof colorsTranslationFr[clothe.color.toLocaleLowerCase()] !== 'undefined' ? colorsTranslationFr[clothe.color.toLocaleLowerCase()] : clothe.color.toLocaleLowerCase();
    clotheWrap["clothe_image"] = clothe.media.images[0].smallHdUrl;
    clotheWrap["clothe_price"] = clothe.units[0].price.value;
    clotheWrap["clothe_currency"] = clothe.units[0].price.currency;
    clotheWrap["clothe_sexe"] = sexe === "male" ? 'M' : 'F';
    
    //Update with attributes
    clotheWrap = getAttributes(clothe.attributes, clotheWrap);
    //console.log(clotheWrap);
    return clotheWrap;
};

//Robe / Pantalons / T-shirt / Pull / Chemise
function getCategories(){
    
};


function getClothes(sexe, categorie, type, callbackSaved){
    var url = "https://api.zalando.com/articles?gender=" + sexe
    var filter = "category=" + categorie;
    var data = "";    
    var brandFilter = "";
    
    for (var item in brandWomen){
        for (var i = 0; i < brandWomen[item].length; i++){
            brandFilter += "&brand=" + brandWomen[item][i];
        }
    }
    
     var options = {
      host: 'api.zalando.com',
      port: '443',
      path: '/articles?gender=' + sexe + '&' + filter + brandFilter,
      method: 'GET',
      headers: {
        'Accept-Language': 'fr-FR'
      }
    };
    
    console.log(options.path);
    
    var req = https.request(options, function(resp){
        resp.on('data', function(chunk){
            data += chunk;
        });
        resp.on('end', function(){
            var clothes = JSON.parse(data);
            for (var i = 0; i < clothes.content.length; i++){
                clothe = wrapProduct(sexe, clothes.content[i], type);
                BrandClothe.create(clothe, function (err, clothe) {
                    if (err) console.log(err);
                });
            }
            return callbackSaved(null);
        });
    });

    req.end();
};

exports.retrieveProducts = function(){
    async.forEachOf(catTranlationFrWomen, function (value, key, callback){
        getClothes("female", key, value, function(err){
            console.log("categorie finnsih");
            callback(err);
        });
        
    }, function (err){
        console.log('finish');
    });
};