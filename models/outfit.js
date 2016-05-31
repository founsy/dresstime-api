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
        isPutOn: {
            type: Boolean,
            default: false
        },
        style: {
            type: String
        },
        moment: {
            type: String
        },
        matchingRate: {
            type: Number
        },
        isSuggestion: {
            type: Boolean,
            default: true
        },
		updated: {
			type: Date,
			default: Date.now
		}
    });

Outfit.methods.getToSend = function(){
    return {
        clothes : this.clothes,
        matchingRate: this.matchingRate,
        style: this.style,
        putOn: this.putOn,
        isSuggestion : this.isSuggestion
    }
};

module.exports = mongoose.model('Outfit', Outfit);