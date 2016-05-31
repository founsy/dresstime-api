var mongoose = require('mongoose'),

	Schema = mongoose.Schema,

	Dressing = new Schema({
        id: {
			type: String,
			unique: true,
			required: true
		},
        userid: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        clothes: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Clothe'
        }],
		updated: {
			type: Date,
			default: Date.now
		}
	});
module.exports = mongoose.model('Dressing', Dressing);