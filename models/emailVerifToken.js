var mongoose = require('mongoose'),
    Schema = mongoose.Schema,

    EmailVerifToken = new Schema({
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        email: {
            type: String,
            required: true
        },
        verifToken: {
            type: String,
            unique: true,
            required: true
        },
        created: {
            type: Date,
            default: Date.now
        }
    });

module.exports = mongoose.model('emailVerifToken', EmailVerifToken);