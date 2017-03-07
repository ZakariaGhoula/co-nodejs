var mongoose = require('mongoose');
const Schema = mongoose.Schema;

//= ===============================
// SeasonalProduct   Schema
//= ===============================

const NetworkSchema = new Schema({

        host: {
            type: Schema.Types.ObjectId,
            required: true
        },
        guest: {
            type: Schema.Types.ObjectId,
            required: true
        },

    },
    {
        timestamps: true
    });


module.exports = mongoose.model('network', NetworkSchema);