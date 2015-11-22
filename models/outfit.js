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
module.exports = mongoose.model('Outfit', Outfit);