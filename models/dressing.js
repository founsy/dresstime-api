var mongoose = require('mongoose'),

	Schema = mongoose.Schema,

	Dressing = new Schema({
        dressing_id: {
			type: String,
			unique: true,
			required: true
		},
        dressing_userid: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        dressing_clotheid: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Clothe'
        },
		updated: {
			type: Date,
			default: Date.now
		}
	});
module.exports = mongoose.model('Dressing', Dressing);