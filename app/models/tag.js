var mongoose = require('mongoose');
const Schema = mongoose.Schema;

//= ===============================
// SeasonalProduct   Schema
//= ===============================

const TagSchema = new Schema({
        lng: {
            type: String,
            enum: ["fr", "en"],
            default: "fr"
        },
        name: {
            type: String,
            required: true
        },
        suggest: {
            type: Boolean,
            default: true
        },
        is_active: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    });


module.exports = mongoose.model('tag', TagSchema);