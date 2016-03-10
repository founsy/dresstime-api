var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
    
	ShoppingList = new Schema({
        userid: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        brandClothe: {
            type: mongoose.Schema.Types.ObjectId,
            ref : 'BrandClothe'
        },
        clothes: [{
            clothe: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Clothe'
            },
            matchingRate: {
                type: Number
            }
        }],
        like: {
            type: Boolean,
            default: true
        }
    });

module.exports = mongoose.model('ShoppingList', ShoppingList);