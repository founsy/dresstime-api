var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// AccessToken
var AccessToken = new Schema({
    userId: {
        type: String,
        required: true
    },

    clientId: {
        type: String,
        required: true
    },
    uuid: {
        type: Stirng,
        required: false
    },
    token: {
        type: String,
        unique: true,
        required: true
    },
    
    created: {
        type: Date,
        default: Date.now
    }
});

module.exports  = mongoose.model('AccessToken', AccessToken);