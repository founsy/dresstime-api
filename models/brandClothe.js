var mongoose = require('mongoose'),
	Schema = mongoose.Schema,

	BrandClothe = new Schema({
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
        clothe_brand : {
            type: String
        },
        clothe_brandLogo: {
            type: String
        },
        clothe_price : {
             type: Number
        },
        clothe_currency : {
             type: String
        },
        clothe_shopUrl : {
            type: String
        },
        clothe_sexe : {
            type: String
        },
		updated: {
			type: Date,
			default: Date.now
		}
	});
module.exports = mongoose.model('BrandClothe', BrandClothe);