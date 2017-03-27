const Tag = require('../models/tag');
const Recipe = require('../models/recipe');
const RecipesLike = require('../models/recipe_like');
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
var path = require('path');
var ncp = require('ncp').ncp;

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
                    var folder = 'recipe_' + current_Date.getTime() + '_' + tok + "_" + tok2 + '_' + current_Date.getYear() + current_Date.getMonth() + current_Date.getDay() + current_Date.getHours() + current_Date.getMinutes() + current_Date.getSeconds();

                    mkdirp("public/recipes/photo/" + folder, function (err) {

                        var recipeObj = new Recipe();

                        //--- default data
                        recipeObj.title = obj[0].title;
                        recipeObj.ingredient = obj[0].ingredient;
                        recipeObj.content = obj[0].content;
                        recipeObj.website = obj[0].website;
                        recipeObj.date_created = obj[0].date_created;
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


        Recipe.aggregate([{"$match": {"$and": [{"id_user": mongoose.Types.ObjectId(userId)}, {"activated": true}]}}, {"$sort": {'createdAt': -1}},
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
                            user_owner: "$user_owner"
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


        Recipe.aggregate([{"$match": {"$and": [{"id_user": mongoose.Types.ObjectId(userId)}, {"activated": true}]}}, {"$sort": {'date_created': 1}},
                {
                    $lookup: {
                        from: "users",
                        localField: "id_owner",
                        foreignField: "_id",
                        as: "user_owner"
                    }
                }, {$unwind: "$user_owner"}
            , {
                $lookup: {
                    from: "users",
                    localField: "id_user",
                    foreignField: "_id",
                    as: "user_poster"
                }
            }, {$unwind: "$user_poster"},
<<<<<<< HEAD
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

                        }, "user_poster": {
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
                            user_owner: "$user_owner",
                            user_poster: "$user_poster",
                        }
                    }
                }
                , {
                    $sort: {
                        'date_created': -1
                    }
                }
            ], function
                (err, recipe) {
                if (err) {
                    console.log(err);
                    res.status(500).send({error: err});
                    return next(err);
                }
                return next({recipes: recipe, count_recipes: recipe.length});
            }
        )
        ;

    }
    ;
exports.getAllRecipesByUserId = retieveAllRecipesByUserId;

var retieveAllRecipesAutoComplete = function (req, res, next) {

        const userId = req.params.userId;


<<<<<<< HEAD
        Recipe.aggregate([{"$match": {$or: [{"title": {$regex: new RegExp(req.params.query, "ig")}}, {'content': {$regex: new RegExp(req.params.query, "ig")}}, {'ingredient': {$regex: new RegExp(req.params.query, "ig")}}]}}, {"$sort": {'title': -1}},
=======
        Recipe.aggregate([{"$match": {$or: [{"title": {$regex: new RegExp(req.params.query, "ig")}}, {'content': {$regex: new RegExp(req.params.query, "ig")}}, {'ingredient': {$regex: new RegExp(req.params.query, "ig")}}]}}, {"$sort": {'date_created': 1}},
>>>>>>> origin/master
                {
                    $lookup: {
                        from: "users",
                        localField: "id_owner",
                        foreignField: "_id",
                        as: "user_owner"
                    }
<<<<<<< HEAD
                }, {$unwind: "$user_owner"},{
                $lookup: {
                    from: "users",
                    localField: "id_user",
                    foreignField: "_id",
                    as: "user_poster"
                }
            }, {$unwind: "$user_poster"},
=======
                }, {$unwind: "$user_owner"},
>>>>>>> origin/master
=======
>>>>>>> origin/master
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

<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> origin/master
                        }, "user_poster": {
                            _id: 1,
                            email: 1,
                            profile: 1,
                            media: 1,

<<<<<<< HEAD
=======
>>>>>>> origin/master
=======
>>>>>>> origin/master
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
<<<<<<< HEAD
<<<<<<< HEAD
                            user_owner: "$user_owner",
                            user_poster: "$user_poster"
=======
                            user_owner: "$user_owner"
>>>>>>> origin/master
=======
                            user_owner: "$user_owner",
                            user_poster: "$user_poster",
>>>>>>> origin/master
                        }
                    }
                }
                , {
                    $sort: {
                        'date_created': -1
                    }
                }
            ], function
                (err, recipe) {
                if (err) {
                    console.log(err);
                    res.status(500).send({error: err});
                    return next(err);
                }
                return next({recipes: recipe, count_recipes: recipe.length});
<<<<<<< HEAD
=======
            }
        )
        ;

    }
    ;
exports.getAllRecipesByUserId = retieveAllRecipesByUserId;

var retieveAllRecipesAutoComplete = function (req, res, next) {

        const userId = req.params.userId;


        Recipe.aggregate([{"$match": {$or: [{"title": {$regex: new RegExp(req.params.query, "ig")}}, {'content': {$regex: new RegExp(req.params.query, "ig")}}, {'ingredient': {$regex: new RegExp(req.params.query, "ig")}}]}}, {"$sort": {'title': -1}},
                {
                    $lookup: {
                        from: "users",
                        localField: "id_owner",
                        foreignField: "_id",
                        as: "user_owner"
                    }
                }, {$unwind: "$user_owner"},{
                $lookup: {
                    from: "users",
                    localField: "id_user",
                    foreignField: "_id",
                    as: "user_poster"
                }
            }, {$unwind: "$user_poster"},
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

                        }, "user_poster": {
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
                            user_owner: "$user_owner",
                            user_poster: "$user_poster"
                        }
                    }
                }
                , {
                    $sort: {
                        'date_created': -1
                    }
                }
            ], function
                (err, recipe) {
                if (err) {
                    console.log(err);
                    res.status(500).send({error: err});
                    return next(err);
                }
                return next({recipes: recipe, count_recipes: recipe.length});
>>>>>>> origin/master
            }
        )
        ;

    }
    ;
exports.retieveAllRecipesAutoComplete = retieveAllRecipesAutoComplete;
var retieveAllRecipesAutoCompleteTags = function (req, res, next) {

        const userId = req.params.userId;


<<<<<<< HEAD
<<<<<<< HEAD
        Recipe.aggregate([{"$match": {"tags.value": {$regex: new RegExp(req.params.query, "ig")}}}, {"$sort": {'title': -1}},
=======
        Recipe.aggregate([{"$match": {"tags.value": {$regex: new RegExp(req.params.query, "ig")}}}, {"$sort": {'date_created': 1}},
>>>>>>> origin/master
=======
        Recipe.aggregate([{"$match": {"tags.value": {$regex: new RegExp(req.params.query, "ig")}}}, {"$sort": {'title': -1}},
>>>>>>> origin/master
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
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> origin/master
                }, {
                    $lookup: {
                        from: "users",
                        localField: "id_user",
                        foreignField: "_id",
                        as: "user_poster"
                    }
                }, {$unwind: "$user_poster"},
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

                        }, "user_poster": {
                            _id: 1,
                            email: 1,
                            profile: 1,
                            media: 1,

                        },
                    }
<<<<<<< HEAD
=======
>>>>>>> origin/master
=======
>>>>>>> origin/master
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
<<<<<<< HEAD
<<<<<<< HEAD
                            user_owner: "$user_owner",
                            user_poster: "$user_poster"
=======
                            user_owner: "$user_owner"
>>>>>>> origin/master
=======
                            user_owner: "$user_owner",
                            user_poster: "$user_poster"
>>>>>>> origin/master
                        }
                    }
                }
                , {
                    $sort: {
                        'date_created': -1
                    }
                }
            ], function
                (err, recipe) {
                if (err) {
                    console.log(err);
                    res.status(500).send({error: err});
                    return next(err);
                }
                return next({recipes: recipe, count_recipes: recipe.length});
            }
        )
        ;

    }
    ;
exports.retieveAllRecipesAutoCompleteTags = retieveAllRecipesAutoCompleteTags;

var retieveAllRecipesLikedByUserId = function (req, res, next) {

        const userId = req.params.userId;

        RecipesLike.aggregate([{"$match": {"id_user": mongoose.Types.ObjectId(userId)}}, {"$sort": {'createdAt': -1}}, {
                $lookup: {
                    from: "recipes",
                    localField: "id_recipe",
                    foreignField: "_id",
                    as: "recipe"
                }
            }, {$unwind: "$recipe"},
                {
                    $lookup: {
                        from: "users",
                        localField: "recipe.id_owner",
                        foreignField: "_id",
                        as: "user_owner"
                    }
                }, {$unwind: "$user_owner"},
                {
                    "$project": {
                        "id": 1,
                        "recipe": {
                            _id: 1,
                            title: 1,
                            id_user: 1,
                            id_owner: 1,
                            date_created: 1,
                            tags: 1,
                            media: 1,
                            in_slider: 1,
                            activated: 1,
                            private: 1,
                            website: 1,
                            content: 1,
                            ingredient: 1,
                        },
                        "user_owner": {
                            _id: 1,
                            email: 1,
                            profile: 1,
                            media: 1,
                        },
                    }
                },
            ], function
                (err, recipe) {
                if (err) {
                    console.log(err);
                    res.status(500).send({error: err});
                    return next(err);
                }
                return next({recipes: recipe, count_recipes: recipe.length});
            }
        )
        ;


    }
    ;
exports.getAllRecipesLikeByUserId = retieveAllRecipesLikedByUserId;


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
            {_id: mongoose.Types.ObjectId(recipeId), id_user: mongoose.Types.ObjectId(userId)},
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
                                retieveAllRecipesLikedByUserId(req, res, function (recipes_liked) {

                                    const userToReturn = setUserInfo(user);
                                    return res.status(200).json({
                                        user: userToReturn,
                                        recipes: recipes,
                                        recipes_liked: recipes_liked,
                                        network: {abos, follow}
                                    });
                                });
                            });

                        });

                    })
                });
            }
        );


    }
    ;
exports.deleteRecipe = deleteRecipe;


var addLikeRecipe = function (req, res, nex) {


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

    var rl = new RecipesLike();

    rl.id_user = mongoose.Types.ObjectId(userId);
    rl.id_recipe = mongoose.Types.ObjectId(recipeId);

    rl.save(function (err, data) {
        if (err) {
            return res.status(500).json({error: 'Something went wrong, please try later.'});
            // req.session.historyData.message = 'Something went wrong, please try later.'
        }
        RecipesLike.count({id_recipe: mongoose.Types.ObjectId(recipeId)}, function (err2, c) {
            return res.status(200).json({userId: userId, recipeId: recipeId, liked: true, count: c});
        });

    });


}
exports.addLikeRecipe = addLikeRecipe;

var removeLikeRecipe = function (req, res, nex) {


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

    var rl = new RecipesLike();

    RecipesLike.remove({
        id_user: mongoose.Types.ObjectId(userId),
        id_recipe: mongoose.Types.ObjectId(recipeId)
    }, function (err, data) {
        if (err) {
            return res.status(500).json({error: 'Something went wrong, please try later.'});
            // req.session.historyData.message = 'Something went wrong, please try later.'
        }
        RecipesLike.count({id_recipe: mongoose.Types.ObjectId(recipeId)}, function (err2, c) {
            return res.status(200).json({userId: userId, recipeId: recipeId, liked: false, count: c});
        });
    });


}
exports.removeLikeRecipe = removeLikeRecipe;

var retrieveLikeRecipe = function (req, res, nex) {

    const userId = req.params.userId;
    const recipeId = req.params.recipeId;
    if (!req.params.userId) {
        return res.status(500).json({error: "id_user  is required."});
    }
    if (!req.params.recipeId) {
        return res.status(500).json({error: "recipeId  is required."});
    }

    var rl = new RecipesLike();

    RecipesLike.find({
        id_user: mongoose.Types.ObjectId(userId),
        id_recipe: mongoose.Types.ObjectId(recipeId)
    }, function (err, data) {
        if (err) {
            return res.status(500).json({error: 'Something went wrong, please try later.'});
            // req.session.historyData.message = 'Something went wrong, please try later.'
        }
        var is_liked = data.length > 0;

        RecipesLike.count({id_recipe: mongoose.Types.ObjectId(recipeId)}, function (err2, c) {
            return res.status(200).json({userId: userId, recipeId: recipeId, liked: is_liked, count: c});
        });
    });


}
exports.retrieveLikeRecipe = retrieveLikeRecipe;


///--- create new Recipe
//--- step 1/1
var createNewRecipe = function (req, res, nex) {


    const userId = req.body.userId;
    const title = req.body.title;
    if (!req.body.userId) {
        return res.status(500).json({error: "id_user  is required."});
    }
    if (!req.body.title) {
        return res.status(500).json({error: "title  is required."});
    }
    req.params = {};
    req.params.userId = userId;

    var new_recipe = new Recipe();

    new_recipe.id_user = mongoose.Types.ObjectId(userId);
    new_recipe.id_owner = mongoose.Types.ObjectId(userId);
    new_recipe.title = title;
    new_recipe.website = "";
    new_recipe.content = "";
    new_recipe.ingredient = "";
    new_recipe.private = true;
    new_recipe.activated = false;
    new_recipe.date_created = moment().format("YYYY-MM-DD HH:mm:ss");


    new_recipe.save(function (err, data) {
        if (err) {
            return res.status(500).json({error: 'Something went wrong, please try later.'});
            // req.session.historyData.message = 'Something went wrong, please try later.'
        }
        return res.status(200).json(new_recipe);
    });
}


exports.createNewRecipe = createNewRecipe;

///--- create new Recipe
//--- step 1/1
var updateTitleRecipe = function (req, res, nex) {


    const userId = req.body.userId;
    const title = req.body.title;
    const recipeId = req.body.recipeId;
    if (!req.body.userId) {
        return res.status(500).json({error: "id_user  is required."});
    }
    if (!req.body.title) {
        return res.status(500).json({error: "title  is required."});
    }
    req.params = {};
    req.params.userId = userId;

    var new_recipe = new Recipe();

    new_recipe.title = title;
    new_recipe._id = mongoose.Types.ObjectId(recipeId);


    Recipe.update({"_id": mongoose.Types.ObjectId(recipeId)}, {
        $set: {
            title: req.body.title

        }
    }, function (err, data) {
        if (err) {
            return res.status(500).json({error: 'Something went wrong, please try later.'});
            // req.session.historyData.message = 'Something went wrong, please try later.'
        }
        Recipe.findOne({"_id": mongoose.Types.ObjectId(recipeId)}, function (err2, data2) {
            return res.status(200).json(data2);

        })
    });
}


exports.updateTitleRecipe = updateTitleRecipe;

var updateWebsiteRecipe = function (req, res, nex) {


    const userId = req.body.userId;
    const website = req.body.website;
    const recipeId = req.body.recipeId;
    if (!req.body.userId) {
        return res.status(500).json({error: "id_user  is required."});
    }
    if (!req.body.recipeId) {
        return res.status(500).json({error: "recipeId  is required."});
    }
    req.params = {};
    req.params.userId = userId;

    Recipe.update({"_id": mongoose.Types.ObjectId(recipeId)}, {
        $set: {
            website: req.body.website

        }
    }, function (err, data) {
        if (err) {
            return res.status(500).json({error: 'Something went wrong, please try later.'});
            // req.session.historyData.message = 'Something went wrong, please try later.'
        }
        Recipe.findOne({"_id": mongoose.Types.ObjectId(recipeId)}, function (err2, data2) {
            return res.status(200).json(data2);

        })
    });
}
exports.updateWebsiteRecipe = updateWebsiteRecipe;
var updateIngredientRecipe = function (req, res, nex) {


    const userId = req.body.userId;
    const content = req.body.content;
    const ingredient = req.body.ingredient;
    const recipeId = req.body.recipeId;
    if (!req.body.userId) {
        return res.status(500).json({error: "id_user  is required."});
    }
    if (!req.body.recipeId) {
        return res.status(500).json({error: "recipeId  is required."});
    }

    req.params = {};
    req.params.userId = userId;

    Recipe.update({"_id": mongoose.Types.ObjectId(recipeId)}, {
        $set: {
            ingredient: req.body.ingredient,
            content: req.body.content,

        }
    }, function (err, data) {
        if (err) {
            return res.status(500).json({error: 'Something went wrong, please try later.'});
            // req.session.historyData.message = 'Something went wrong, please try later.'
        }
        Recipe.findOne({"_id": mongoose.Types.ObjectId(recipeId)}, function (err2, data2) {
            return res.status(200).json(data2);

        })
    });
}
exports.updateIngredientRecipe = updateIngredientRecipe;
var updateImageRecipe = function (req, res, nex) {


    const userId = req.body.userId;
    const image64 = req.body.image64;
    const is_first = req.body.is_first;
    const recipeId = req.body.recipeId;

    if (!req.body.userId) {
        return res.status(500).json({error: "id_user  is required."});
    }
    if (!req.body.image64) {
        return res.status(500).json({error: "image64  is required."});
    }
    req.params = {};
    req.params.userId = userId;

    var current_Date = new Date();

    var folder = 'recipe_' + recipeId + "_" + current_Date.getTime();

    mkdirp("public/recipes/photo/" + folder, function (err) {


        var url_64 = image64;

        var imageBuffer = require('./../helpers').decodeBase64Images(url_64);

        var file_name = "media_ " + recipeId + "_" + current_Date.getTime();

        var is_build = require('./../helpers').imageCloneBylderBulder(imageBuffer, 'public/recipes/photo/' + folder, file_name);


        var obj_media = {
            folder: folder,
            value: file_name,
        }
        Recipe.update({"_id": mongoose.Types.ObjectId(recipeId)}, {$push: {media: obj_media}}, function (err, data) {
            if (err) {
                return res.status(500).json({error: 'Something went wrong, please try later.'});
                // req.session.historyData.message = 'Something went wrong, please try later.'
            }
            Recipe.findOne({"_id": mongoose.Types.ObjectId(recipeId)}, function (err2, data2) {
                return res.status(200).json(data2);

            })
        });


    });

}
exports.updateImageRecipe = updateImageRecipe;
var deleteImageRecipe = function (req, res, nex) {


    const userId = req.body.userId;
    const position = req.body.position;
    const recipeId = req.body.recipeId;

    if (!req.body.userId) {
        return res.status(500).json({error: "id_user  is required."});
    }
    if (typeof req.body.position === "undefined") {

        return res.status(500).json({error: "position  is required."});
    }
    req.params = {};
    req.params.userId = userId;

    Recipe.findOne({"_id": mongoose.Types.ObjectId(recipeId)}, function (err2, data2) {

        var list_media = data2.media;
        list_media.splice(position, 1);


        Recipe.update({"_id": mongoose.Types.ObjectId(recipeId)}, {media: list_media}, function (err, data) {
            if (err) {
                return res.status(500).json({error: 'Something went wrong, please try later.'});
                // req.session.historyData.message = 'Something went wrong, please try later.'
            }
            Recipe.findOne({"_id": mongoose.Types.ObjectId(recipeId)}, function (err3, data3) {
                if (err3) {
                    return res.status(500).json({error: 'Something went wrong, please try later.'});
                    // req.session.historyData.message = 'Something went wrong, please try later.'
                }
                return res.status(200).json(data3);
            });
        });


    });

}
exports.deleteImageRecipe = deleteImageRecipe;

var positionImageRecipe = function (req, res, nex) {


    const userId = req.body.userId;
    const position = req.body.position;
    const recipeId = req.body.recipeId;

    if (!req.body.userId) {
        return res.status(500).json({error: "id_user  is required."});
    }
    if (typeof req.body.position === "undefined") {

        return res.status(500).json({error: "position  is required."});
    }
    req.params = {};
    req.params.userId = userId;

    Recipe.findOne({"_id": mongoose.Types.ObjectId(recipeId)}, function (err2, data2) {

        var list_media = data2.media;
        var value = list_media[position];
        if (position > -1) {
            var newIndex = 0

            if (newIndex < 0) {
                newIndex = 0
            } else if (newIndex >= list_media.length) {
                newIndex = list_media.length
            }

            var arrayClone = list_media.slice();
            arrayClone.splice(position, 1);
            arrayClone.splice(newIndex, 0, value);

            var list_media = arrayClone;
        }

        Recipe.update({"_id": mongoose.Types.ObjectId(recipeId)}, {media: list_media}, function (err, data) {
            if (err) {
                return res.status(500).json({error: 'Something went wrong, please try later.'});
                // req.session.historyData.message = 'Something went wrong, please try later.'
            }
            Recipe.findOne({"_id": mongoose.Types.ObjectId(recipeId)}, function (err3, data3) {
                if (err3) {
                    return res.status(500).json({error: 'Something went wrong, please try later.'});
                    // req.session.historyData.message = 'Something went wrong, please try later.'
                }
                return res.status(200).json(data3);
            });
        });


    });

    /*

     Recipe.update({"_id": mongoose.Types.ObjectId(recipeId)}, {
     $set: {
     ingredient: req.body.ingredient,
     content: req.body.content,

     }
     }, function (err, data) {
     if (err) {
     return res.status(500).json({error: 'Something went wrong, please try later.'});
     // req.session.historyData.message = 'Something went wrong, please try later.'
     }
     Recipe.findOne({"_id": mongoose.Types.ObjectId(recipeId)},function (err2,data2) {
     return res.status(200).json(data2);

     })
     });*/
}
exports.positionImageRecipe = positionImageRecipe;

var updateTagsRecipe = function (req, res, nex) {


    const userId = req.body.userId;
    const list_tags = req.body.tags;
    const recipeId = req.body.recipeId;

    if (!req.body.userId) {
        return res.status(500).json({error: "id_user  is required."});
    }
    if (!req.body.tags) {

        return res.status(500).json({error: "tags  is required."});
    }
    req.params = {};
    req.params.userId = userId;

    Recipe.findOne({"_id": mongoose.Types.ObjectId(recipeId)}, function (err2, data2) {


        Recipe.update({"_id": mongoose.Types.ObjectId(recipeId)}, {tags: list_tags}, function (err, data) {
            if (err) {
                return res.status(500).json({error: 'Something went wrong, please try later.'});
                // req.session.historyData.message = 'Something went wrong, please try later.'
            }
            Recipe.findOne({"_id": mongoose.Types.ObjectId(recipeId)}, function (err3, data3) {
                if (err3) {
                    return res.status(500).json({error: 'Something went wrong, please try later.'});
                    // req.session.historyData.message = 'Something went wrong, please try later.'
                }
                return res.status(200).json(data3);
            });
        });


    });

}
exports.updateTagsRecipe = updateTagsRecipe;
var updateStatutRecipe = function (req, res, nex) {


    const userId = req.body.userId;
    const is_private = req.body.is_private;
    const recipeId = req.body.recipeId;

    if (!req.body.userId) {
        return res.status(500).json({error: "id_user  is required."});
    }

    req.params = {};
    req.params.userId = userId;

    Recipe.findOne({"_id": mongoose.Types.ObjectId(recipeId)}, function (err2, data2) {


        Recipe.update({"_id": mongoose.Types.ObjectId(recipeId)}, {
            "private": is_private,
            "activated": true
        }, function (err, data) {
            if (err) {
                return res.status(500).json({error: 'Something went wrong, please try later.'});
                // req.session.historyData.message = 'Something went wrong, please try later.'
            }
            Recipe.findOne({"_id": mongoose.Types.ObjectId(recipeId)}, function (err3, data3) {
                if (err3) {
                    return res.status(500).json({error: 'Something went wrong, please try later.'});
                    // req.session.historyData.message = 'Something went wrong, please try later.'
                }
                return res.status(200).json(data3);
            });
        });


    });

}
exports.updateStatutRecipe = updateStatutRecipe;

var addFromExistRecipe = function (req, res, nex) {


    const userId = req.body.userId;

    const recipeId = req.body.recipeId;
    console.log(req.body)
    if (!req.body.userId) {
        return res.status(500).json({error: "id_user  is required."});
    }

    req.params = {};
    req.params.userId = userId;

    Recipe.findOne({"_id": mongoose.Types.ObjectId(recipeId)}, function (err2, data2) {
        if (err2) {
            return res.status(500).json({error: 'Something went wrong, please try later.'});
            // req.session.historyData.message = 'Something went wrong, please try later.'
        }

        var new_recipe = new Recipe();

        new_recipe.id_user = mongoose.Types.ObjectId(userId);
        new_recipe.id_owner = mongoose.Types.ObjectId(data2.id_owner);
        new_recipe.title = data2.title;
        new_recipe.website = data2.website;
        new_recipe.content = data2.content;
        new_recipe.ingredient = data2.ingredient;
        new_recipe.private = true;
        new_recipe.activated = true;
        new_recipe.tags = data2.tags;
        new_recipe.date_created = moment().format("YYYY-MM-DD HH:mm:ss");

        var list_media = data2.media;
        var new_list_media = [];
        if (data2.media.length > 0) {
            var current_Date = new Date();
            var folder = 'recipe_' + current_Date.getTime();


            mkdirp("public/recipes/photo/" + folder, function (err, r) {

            }, new_recipe);
            for (var i in data2.media) {
                if (typeof data2.media[i].folder !== "undefined") {
                    var obj = {'folder': folder, "value": list_media[i].value};
                    var path = data2.media[i].folder
                    ncp("public/recipes/photo/" + data2.media[i].folder, "public/recipes/photo/" + folder, function (err) {
                        if (err) {

                            return console.error(err);

                        }
                    });
                    new_list_media.push(obj);
                    new_recipe.media.push(obj)


                }
            }


        }


        new_recipe.save(function (errs, d) {
            if (errs) {
                return res.status(500).json({error: 'Something went wrong, please try later.'});
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
                            retieveAllRecipesLikedByUserId(req, res, function (recipes_liked) {

                                const userToReturn = setUserInfo(user);
                                return res.status(200).json({
                                    user: userToReturn,
                                    recipes: recipes,
                                    recipes_liked: recipes_liked,
                                    network: {abos, follow}
                                });
                            });
                        });

                    });

                })
            });

        })
    });


}
exports.addFromExistRecipe = addFromExistRecipe;