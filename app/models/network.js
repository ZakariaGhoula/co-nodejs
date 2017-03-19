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

NetworkSchema.index({ host: 1, guest: 1 }, { unique: true });
module.exports = mongoose.model('network', NetworkSchema);