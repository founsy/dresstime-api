var faker = require('faker');

var rootPath = process.cwd() + '/';

var db = require(rootPath + 'db/mongoose');
var config = require(rootPath + 'config');

var User = require(rootPath + 'models/user');
var Client = require(rootPath + 'models/client');
var AccessToken = require(rootPath + 'models/accessToken');
var RefreshToken = require(rootPath + 'models/refreshToken');

User.remove({}, function(err) {
    var user = new User({ 
        username: config.get("default:user:username"), 
        password: config.get("default:user:password") 
    });
    
    user.save(function(err, user) {
        if(!err) {
            console.log("New user - %s:%s", user.username, user.password);
        }else {
            return  console.log(err);
        }
    });
});

Client.remove({}, function(err) {
    var client = new Client({ 
        name: config.get("default:client:name"), 
        clientId: config.get("default:client:clientId"), 
        clientSecret: config.get("default:client:clientSecret") 
    });
    
    client.save(function(err, client) {

        if(!err) {
             console.log("New client - %s:%s", client.clientId, client.clientSecret);
        } else {
            return  console.log(err);
        }

    });
});

AccessToken.remove({}, function (err) {
    if (err) {
        return  console.log(err);
    }
});

RefreshToken.remove({}, function (err) {
    if (err) {
        return  console.log(err);
    }
});

setTimeout(function() {
    db.disconnect();
}, 3000);