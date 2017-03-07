var mongoose = require('mongoose');
const Schema = mongoose.Schema;

//= ===============================
// SeasonalProduct   Schema
//= ===============================
const ProductsSchema = new Schema({
    category: {
        type: String,
        required: true
    },
    list_products: {
        type: Array
    }

});
const SeasonalProductSchema = new Schema({
        season: {
            type: String,
            lowercase: true,
            required: true
        },
        lng: {
            type: String,
            enum: ["fr", "en"],
            default: "fr"
        }, is_active: {
            type: Boolean,
            default: true
        },
        products: [ProductsSchema]

    },
    {
        timestamps: true
    });



module.exports = mongoose.model('seasonal_product', SeasonalProductSchema);