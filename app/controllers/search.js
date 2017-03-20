const Tag = require('../models/tag');
const Recipe = require('../models/recipe');
const RecipesLike = require('../models/recipe_like');
const User = require('../models/user');
const NetworkController = require('./network');
const RecipesController = require('./recipes');
const UserController = require('./user');

const setUserInfo = require('../helpers').setUserInfo;

//*reqAllUserAutoComplete*/


exports.getSearch = function (req, res, next) {

    UserController.reqAllUserAutoComplete(req, res, function (users) {
        RecipesController.retieveAllRecipesAutoComplete(req, res, function (recipes) {
            RecipesController.retieveAllRecipesAutoCompleteTags(req, res, function (tags) {
                return res.status(200).json({tags, users, recipes});
            })

        });


    })
};