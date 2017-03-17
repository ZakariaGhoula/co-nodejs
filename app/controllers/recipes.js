const Tag = require('../models/tag');
const Recipe = require('../models/recipe');
const User = require('../models/user');
const NetworkController = require('./network');
const RecipesController = require('./recipes');

const setUserInfo = require('../helpers').setUserInfo;
var mongoose = require('mongoose');
var fs = require("fs");
var lwip = require('lwip');
var jf = require('jsonfile')
var imagemin = require('image-min');
var path = require('path');
var mkdirp = require('mkdirp');
var moment = require('moment');


// get ALL tags by lng
exports.getTraitementRecipe = function (req, res, next) {
    Tag.find({lng: 'dd', suggest: true, is_active: true}, {
            name: 1,
            lng: 1,
            is_active: 1,
            suggest: 1,
        }, function (err, tags) {
            if (err) {
                console.log(err);
                res.status(500).send({error: err});
                return next(err);
            }

            var normalizedPath = require("path").join(__dirname, "json");
            var normalizedPath = require("path").join(__dirname, "./../../public/json");

            fs.readdirSync(normalizedPath).forEach(function (file) {
                if (file != ".DS_Store") {


                    var current_Date = new Date();
                    var obj = require("./../../public/json/" + file);


                    if (typeof obj[0] === "undefined") {
                        res.status(500).send({error: "impossible d'ouvire le fichier"});
                        return next("impossible d'ouvire le fichier");
                    }
                    var tok = (obj[0].id_owner == null || obj[0].id_owner == "") ? "x_" + current_Date.getSeconds() : obj[0].id_owner;
                    var tok2 = (obj[0].id_user == null || obj[0].id_user == "") ? "y_" + current_Date.getSeconds() : obj[0].id_user;
                    var folder = 'recipe_'+current_Date.getTime()+'_' + tok + "_" + tok2 + '_' + current_Date.getYear() + current_Date.getMonth() + current_Date.getDay() + current_Date.getHours() + current_Date.getMinutes() + current_Date.getSeconds();

                    mkdirp("public/recipes/photo/" + folder, function (err) {

                    var recipeObj = new Recipe();

                    //--- default data
                    recipeObj.title = obj[0].title;
                    recipeObj.ingredient = obj[0].ingredient;
                    recipeObj.content = obj[0].content;
                    recipeObj.website = obj[0].website;
                    recipeObj.date_created =obj[0].date_created;
                    recipeObj.date_updated = obj[0].date_updated;

                    console.log(obj[0].date_created);
                    recipeObj.private = (obj[0].private == "2") ? true : false;
                    recipeObj.activated = (obj[0].activated == 1) ? true : false;
                    recipeObj.in_slider = (obj[0].in_slider == 1) ? true : false;
                    recipeObj.id_owner = (obj[0].id_owner == null || obj[0].id_owner == "") ? null : mongoose.Types.ObjectId(obj[0].id_owner);
                    recipeObj.id_user = (obj[0].id_user == null || obj[0].id_user == "") ? null : mongoose.Types.ObjectId(obj[0].id_user);
                    var media_obj = [];
                    var tags_obj = [];



                        // path exists unless there was an error


                    for (var i in obj[0].media) {

                        var url_64 = (     obj[0].media[i].base_64);

                        var imageBuffer = require('./../helpers').decodeBase64Images(url_64);

                        var file_name = "media_" + parseInt(i + 1) + "_" + current_Date.getYear() + current_Date.getMonth() + current_Date.getDay() + current_Date.getHours() + current_Date.getMinutes() + current_Date.getSeconds();

                        var obj_media = {
                            folder: folder,
                            value: file_name,
                        }


                            var is_build = require('./../helpers').imageRecipeBulder(imageBuffer, 'public/recipes/photo/' + folder, file_name);


                        media_obj.push(obj_media);
                    }


                    recipeObj.media = media_obj;
                    recipeObj.tags = obj[0].tags;


                    recipeObj.save();
                    });
                }
            });


            /*fs.readdirSync("public/json").forEach(function(file) {
             var d = JSON.parse(require("./../../public/json/" + file));
             });*/
            return res.status(200).json({tags: tags});
        }
    );

};


var getAllRecipesByUserId = function (req, res, next) {

        const userId = req.params.userId;


        Recipe.aggregate([{"$match" : {"$and":[{"id_user": mongoose.Types.ObjectId(userId)},{"activated":true}]}},{"$sort" : {'date_created':-1}},
            {
                $lookup: {
                    from: "users",
                    localField: "id_owner",
                    foreignField: "_id",
                    as: "user_owner"
                }
            }, {$unwind: "$user_owner"},
            {
                "$project": {
                    "id": 1,
                    title: "$title",
                    id_user: "$id_user",
                    id_owner: "$id_owner",
                    date_created: "$date_created",
                    tags: "$tags",
                    media: "$media",
                    in_slider: "$in_slider",
                    activated: "$activated",
                    private: "$private",
                    website: "$website",
                    content: "$content",
                    ingredient: "$ingredient",
                    "user_owner": {
                        _id: 1,
                        email: 1,
                        profile: 1,
                        media: 1,

                    },
                }
            },
            {
                $group: {
                    _id: {
                        'id': '$_id',
                        title: "$title",
                        id_user: "$id_user",
                        id_owner: "$id_owner",
                        date_created: "$date_created",
                        tags: "$tags",
                        media: "$media",
                        in_slider: "$in_slider",
                        activated: "$activated",
                        private: "$private",
                        website: "$website",
                        content: "$content",
                        ingredient: "$ingredient",
                        media: "$media",
                        user_owner:"$user_owner"
                    }
                }
            }
            ], function
                (err, recipe) {
                if (err) {
                    console.log(err);
                    res.status(500).send({error: err});
                    return next(err);
                }

                return res.status(200).json({recipe: recipe});
            }
        )
        ;

    }
    ;
exports.getAllRecipesByUserId = getAllRecipesByUserId;


var retieveAllRecipesByUserId = function (req, res, next) {

        const userId = req.params.userId;


        Recipe.aggregate([{"$match" : {"$and":[{"id_user": mongoose.Types.ObjectId(userId)},{"activated":true}]}},{"$sort" : {'date_created':-1}},
                {
                    $lookup: {
                        from: "users",
                        localField: "id_owner",
                        foreignField: "_id",
                        as: "user_owner"
                    }
                }, {$unwind: "$user_owner"},
                {
                    "$project": {
                        "id": 1,
                        title: "$title",
                        id_user: "$id_user",
                        id_owner: "$id_owner",
                        date_created: "$date_created",
                        tags: "$tags",
                        media: "$media",
                        in_slider: "$in_slider",
                        activated: "$activated",
                        private: "$private",
                        website: "$website",
                        content: "$content",
                        ingredient: "$ingredient",
                        "user_owner": {
                            _id: 1,
                            email: 1,
                            profile: 1,
                            media: 1,

                        },
                    }
                },
            {
                $group: {
                    _id: {
                        'id': '$_id',
                        title: "$title",
                        id_user: "$id_user",
                        id_owner: "$id_owner",
                        date_created: "$date_created",
                        tags: "$tags",
                        media: "$media",
                        in_slider: "$in_slider",
                        activated: "$activated",
                        private: "$private",
                        website: "$website",
                        content: "$content",
                        ingredient: "$ingredient",
                        media: "$media",
                        user_owner:"$user_owner"
                    }
                }
            }
            ], function
                (err, recipe) {
                if (err) {
                    console.log(err);
                    res.status(500).send({error: err});
                    return next(err);
                }
                return  next({recipes:recipe,count_recipes:recipe.length});
            }
        )
        ;

    }
    ;
exports.getAllRecipesByUserId = retieveAllRecipesByUserId;



var deleteRecipe = function (req, res, next) {

        const userId = req.body.userId;
        const recipeId = req.body.recipeId;
        if (!req.body.userId) {
            return res.status(500).json({error: "id_user  is required."});
        }
        if (!req.body.recipeId) {
            return res.status(500).json({error: "recipeId  is required."});
        }
        req.params = {};
        req.params.userId = userId;
        Recipe.update(
            {_id: mongoose.Types.ObjectId(recipeId),id_user: mongoose.Types.ObjectId(userId)},
            {
                $set: {
                    activated: false

                }
            }, function (err2, data) {
                if (err2) {
                    return res.status(500).json({error: 'Something went wrong, please try later.'});
                    // req.session.historyData.message = 'Something went wrong, please try later.'
                }
                User.findById(userId, (err, user) => {
                    if (err) {
                        res.status(400).json({error: 'No user could be found for this ID.'});
                        return next(err);
                    }
                    req.params = {};
                    req.params.userId = userId;
                    NetworkController.retreiveAllNetworkHost(req, res, function (abos) {
                        NetworkController.retrieveAllNetworkGuest(req, res, function (follow) {
                             retieveAllRecipesByUserId(req, res, function (recipes) {


                                const userToReturn = setUserInfo(user);
                                return res.status(200).json({user: userToReturn,recipes:recipes,network: {abos, follow}});
                            });

                        });

                    })
                });
            }
        );


    }
    ;
exports.deleteRecipe = deleteRecipe;