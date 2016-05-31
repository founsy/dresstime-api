var mongoose = require('mongoose'),
	Schema = mongoose.Schema,

	Clothe = new Schema({
        clothe_id: {
			type: String,
			unique: true,
			required: true
		},
		clothe_name: {
			type: String
		},
		clothe_partnerid: {
			type: Number
		},
        clothe_partnerName: {
			type: String
		},
		clothe_cut: {
			type: String
		},
		clothe_isUnis: {
			type: Number
		},
		clothe_pattern: {
			type: String
		},
		clothe_type: {
			type: String
		},
		clothe_subtype: {
			type: String
		},
        clothe_colors: {
			type: String
		},
        clothe_litteralColor: {
            type: String,
            default: ""
        },
        clothe_image: {
            type: String
        },
        clothe_favorite: {
            type: Boolean
        },
        clothe_userid: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
		updated: {
			type: Date,
			default: Date.now
		}
	});

Clothe.virtual('Id')
.get(function () {
    console.log(this.id);
	return this.id;
});

module.exports = mongoose.model('Clothe', Clothe);