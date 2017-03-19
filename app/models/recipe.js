var mongoose = require('mongoose');
const Schema = mongoose.Schema;

//= ===============================
// SeasonalProduct   Schema
//= ===============================

const RecipeSchema = new Schema({
        title: {
            type: String,
            required: true
        },
        ingredient: {
            type: String,
            default:null,
        },
        content: {
            type: String,
            default:null,
        },
        website: {
            type: String,
            default:null,
        },
        date_created: {
            type: String,
        },
        data_updated: {
            type: String,
        },
        private: {
            type: Boolean,
            default: true
        },
        activated: {
            type: Boolean,
            default: true
        }, in_slider: {
            type: Boolean,
            default: false
        },
        id_owner:{
            type: Schema.Types.ObjectId,
            required: true
        },
        id_user:{
            type: Schema.Types.ObjectId,
            required: true
        },
        tags:{
            type: Array
        },
        media:{
            type: Array
        },
    },
    {
        timestamps: true
    });


module.exports = mongoose.model('recipe', RecipeSchema);