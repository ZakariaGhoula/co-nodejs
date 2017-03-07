var mongoose = require('mongoose');
const Schema = mongoose.Schema;

//= ===============================
// SeasonalProduct   Schema
//= ===============================

const NetworkSchema = new Schema({

        host: {
            type: String,
            required: true
        },
        guest: {
            type: Boolean,
            default: true
        },

    },
    {
        timestamps: true
    });


module.exports = mongoose.model('network', NetworkSchema);