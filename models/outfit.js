var mongoose = require('mongoose'),
	Schema = mongoose.Schema,

	Outfit = new Schema({
        userid: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        clothes: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Clothe'
        }],
        putOn: {
            type: Boolean,
            default: false
        },
        style: {
            type: String
        },
        matchingRate: {
            type: Number
        },
		updated: {
			type: Date,
			default: Date.now
		}
    });

Outfit.methods.getToSend = function(){
    return {
        outfit : this.clothes,
        matchingRate: this.matchingRate,
        style: this.style
    }
};

module.exports = mongoose.model('Outfit', Outfit);