var mongoose = require('mongoose');
const Schema = mongoose.Schema;

//= ===============================
// SeasonalProduct   Schema
//= ===============================

const RecipeLikeSchema = new Schema({

        id_recipe:{
            type: Schema.Types.ObjectId,
            required: true,
            index: true
        },
        id_user:{
            type: Schema.Types.ObjectId,
            required: true,
            index: true
        }

    },
    {
        timestamps: true
    });

RecipeLikeSchema.index({ id_recipe: 1, id_user: 1 }, { unique: true });
module.exports = mongoose.model('recipes_like', RecipeLikeSchema);