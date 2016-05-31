var fs = require('fs'),
    rootPath = process.cwd(),
    uuid = require('node-uuid'),
    Clothe = require(rootPath + '/models/clothe');


    function decodeBase64Image(dataString) {
        var response = {};
        response.type = "";
        response.data = new Buffer(dataString, 'base64');
        return response;
    }
    

exports.writeImage = function(clothe){
    var re = /(?:\.([^.]+))?$/;
    if (typeof clothe.clothe_image !== 'undefined' && clothe.clothe_image.length > 50) {
        var imageBuffer = decodeBase64Image(clothe.clothe_image);

        var name = clothe.clothe_id +  '.jpg';
        fs.writeFile(rootPath + "/images/" + name, imageBuffer.data, function(err) {
            if (err) return console.log(err);
        
            Clothe.update({_id: clothe.id}, {$set: { clothe_image: name }}, {upsert: true}, function(err){
                if (!err) console.log(err);
                console.log("Update successfull");
            });
        });
    } else {
        console.log("Already update");
    }
};

exports.createImage = function(clothe_id, clothe_image){
    console.log("create Image");
    var re = /(?:\.([^.]+))?$/;
    var imageBuffer = decodeBase64Image(clothe_image);
    
    var name = clothe_id + '.jpg';
    fs.writeFile(rootPath + "/images/" + name, imageBuffer.data, function(err) {
        if (err) { console.log(err); return false; }
        console.log("End image creating");
        return true;
    });
    
}

//For now, read image file and convert into base64
exports.readImage = function(clothe_imageName){
    var name = rootPath + "/images/" + clothe_imageName;
    if (fs.existsSync(name)){
        // read binary data
        var bitmap = fs.readFileSync(rootPath + "/images/" + clothe_imageName);
        // convert binary data to base64 encoded string
        return new Buffer(bitmap).toString('base64');
    } else {
        return "";    
    }
};

exports.removeImage = function(clothe_imageName){
    var filePath = rootPath + "/images/" + clothe_imageName;
    if (fs.existsSync(filePath)){
        fs.unlinkSync(filePath);
    }
};