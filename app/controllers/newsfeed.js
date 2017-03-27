const Tag = require('../models/tag');
const Network = require('../models/network');
const Recipe = require('../models/recipe');
const RecipesLike = require('../models/recipe_like');
const User = require('../models/user');
const NetworkController = require('./network');
const RecipesController = require('./recipes');
const UserController = require('./user');

var mongoose = require('mongoose');
const setUserInfo = require('../helpers').setUserInfo;

//*reqAllUserAutoComplete*/


exports.getMyNewsfeeds = function (req, res, next) {

    const userId = req.params.userId;
    const offset = req.params.offset;
    const limit = req.params.limit;

    Network.aggregate([{"$match": {"guest": mongoose.Types.ObjectId(userId)}},

        {
            $lookup: {
                from: "recipes",
                localField: "host",
                foreignField: "id_user",
                as: "news_recipes"
            }
        },
        {
            "$project": {

                "news_recipes": {
                    "$filter": {
                        input: "$news_recipes",
                        as: "recipe",
                        cond: {
                            $and: [
                                {$eq: ["$$recipe.private", false]},
                                {$eq: ["$$recipe.activated", true]},
                                {$eq: ["$$recipe.in_slider", false]}
                            ]
                        }


                    }
                },
            }
        },


        {$unwind: "$news_recipes"},
        {
            $lookup: {
                from: "users",
                localField: "news_recipes.id_owner",
                foreignField: "_id",
                as: "owner"
            }
        }, {$unwind: "$owner"}, {
            $lookup: {
                from: "users",
                localField: "news_recipes.id_user",
                foreignField: "_id",
                as: "poster"
            }
        }, {$unwind: "$poster"}, {
            $lookup: {
                from: "recipes_likes",
                localField: "news_recipes._id",
                foreignField: "id_recipe",
                as: "recipes_likes"
            }
        },

        {
            "$project": {

                "news_recipes": 1,
                "owner": {
                    'email': 1,
                    'profile': 1,
                    'media': 1,
                },
                "poster": {
                    'email': 1,
                    'profile': 1,
                    'media': 1,
                },
                "recipes_likes": {$size: "$recipes_likes"},
            }
        },
        {'$sort': {'news_recipes.date_created': -1}},

    ], function (err, recipes) {
        if (err) {
            console.log(err);
            res.status(500).send({error: err});
            return next(err);
        }
        var final = [];

        Network.aggregate([{"$match": {"guest": mongoose.Types.ObjectId(userId)}},

            {
                $lookup: {
                    from: "recipes",
                    localField: "host",
                    foreignField: "id_user",
                    as: "news_recipes"
                }
            },
            {
                "$project": {

                    "news_recipes": {
                        "$filter": {
                            input: "$news_recipes",
                            as: "recipe",
                            cond: {
                                $and: [
                                    {$eq: ["$$recipe.private", false]},
                                    {$eq: ["$$recipe.activated", true]},
                                    {$eq: ["$$recipe.in_slider", false]}
                                ]
                            }


                        }
                    },
                }
            },
            {$unwind: "$news_recipes"},

            {$group: {_id: null, count: {$sum: 1}}}

        ], function (err, count_Receipe) {
            if (err) {
                console.log(err);
                res.status(500).send({error: err});
                return next(err);
            }

            var list_final = [];
            for (var i = 0; i < recipes.length; i++) {
                if (i > parseInt(offset) && i <= parseInt(offset + limit) && typeof recipes[i] !== "undefined") {

                    list_final.push(recipes[i]);
                }
            }

            var count_r = 0;
            if(count_Receipe!==null && typeof count_Receipe[0]!=="undefined" && typeof count_Receipe[0].count!=="undefined" )
            count_r=count_Receipe[0].count;

            return res.status(200).json({
                recettes: list_final,
                count_recettes: count_r,
                offset: parseInt(offset),
                limit: parseInt(limit)
            });

        });


    });

};
exports.getSliderExplorer = function (req, res, next) {

    const userId = req.params.userId;

    Recipe.aggregate([{
        "$match": {
            $and: [
                {"activated": true}, {"in_slider": true}
            ]
        }

    }, {
        $lookup: {
            from: "users",
            localField: "id_owner",
            foreignField: "_id",
            as: "owner"
        }
    }, {$unwind: "$owner"}, {
        $lookup: {
            from: "users",
            localField: "id_user",
            foreignField: "_id",
            as: "poster"
        }
    }, {$unwind: "$poster"},

    ], function (err, recipes) {
        if (err) {
            console.log(err);
            res.status(500).send({error: err});
            return next(err);
        }

        return res.status(200).json({
            recettes: recipes,
        });


    });

};


exports.getNewsfeedsExplorer = function (req, res, next) {

    const userId = req.params.userId;
    const offset = req.params.offset;
    const limit = req.params.limit;
    Network.aggregate([{"$match": {"guest": {"$ne": mongoose.Types.ObjectId(userId)}}},

        {
            $lookup: {
                from: "networks",
                localField: "host",
                foreignField: "guest",
                as: "netw_guest"
            }
        },
        {
            "$project": {

                "netw_guest": {
                    "$filter": {
                        input: "$netw_guest",
                        as: "net",
                        cond: {
                            $and: [
                                {$ne: ["$$net.guest", mongoose.Types.ObjectId(userId)]},
                                {$ne: ["$$net.host", mongoose.Types.ObjectId(userId)]},

                            ]
                        }


                    }
                },
            }
        },
        {$unwind: "$netw_guest"},
        {$group: {_id: "$netw_guest.host"}},


        {
            $lookup: {
                from: "recipes",
                localField: "_id",
                foreignField: "id_user",
                as: "news_recipes"
            }
        },
        {
            "$project": {

                "news_recipes": {
                    "$filter": {
                        input: "$news_recipes",
                        as: "recipe",
                        cond: {
                            $and: [
                                {$eq: ["$$recipe.private", false]},
                                {$eq: ["$$recipe.activated", true]},
                                {$eq: ["$$recipe.in_slider", false]},
                                {$ne: ["$$recipe.id_user", mongoose.Types.ObjectId("58becc88d981bf04a1357dc3")]},
                                {$ne: ["$$recipe.id_owner", mongoose.Types.ObjectId("58becc88d981bf04a1357dc3")]},
                            ]
                        }


                    }
                },
            }
        },
        {$unwind: "$news_recipes"},

        {
            $lookup: {
                from: "users",
                localField: "news_recipes.id_owner",
                foreignField: "_id",
                as: "owner"
            }
        }, {$unwind: "$owner"}, {
            $lookup: {
                from: "users",
                localField: "news_recipes.id_user",
                foreignField: "_id",
                as: "poster"
            }
        }, {$unwind: "$poster"}, {
            $lookup: {
                from: "recipes_likes",
                localField: "news_recipes._id",
                foreignField: "id_recipe",
                as: "recipes_likes"
            }
        },
        {
            "$project": {

                "_id": 0,
                "news_recipes": 1,
                "owner": {
                    '_id': 1,
                    'email': 1,
                    'profile': 1,
                    'media': 1,


                },


                "poster": {
                    'email': 1,
                    'profile': 1,
                    'media': 1,
                },
                "recipes_likes": {$size: "$recipes_likes"},
            }
        },
        {'$sort': {'news_recipes.date_created': -1}},

    ], function (err, recipes) {
        if (err) {
            console.log(err);
            res.status(500).send({error: err});
            return next(err);
        }
        Network.aggregate([{"$match": {"guest": {"$ne": mongoose.Types.ObjectId(userId)}}},

            {
                $lookup: {
                    from: "networks",
                    localField: "host",
                    foreignField: "guest",
                    as: "netw_guest"
                }
            },
            {
                "$project": {

                    "netw_guest": {
                        "$filter": {
                            input: "$netw_guest",
                            as: "net",
                            cond: {
                                $and: [
                                    {$ne: ["$$net.guest", mongoose.Types.ObjectId(userId)]},
                                    {$ne: ["$$net.host", mongoose.Types.ObjectId(userId)]},

                                ]
                            }


                        }
                    },
                }
            },
            {$unwind: "$netw_guest"},
            {$group: {_id: "$netw_guest.host"}},


            {
                $lookup: {
                    from: "recipes",
                    localField: "_id",
                    foreignField: "id_user",
                    as: "news_recipes"
                }
            },
            {
                "$project": {

                    "news_recipes": {
                        "$filter": {
                            input: "$news_recipes",
                            as: "recipe",
                            cond: {
                                $and: [
                                    {$eq: ["$$recipe.private", false]},
                                    {$eq: ["$$recipe.activated", true]},
                                    {$eq: ["$$recipe.in_slider", false]},
                                    {$ne: ["$$recipe.id_user", mongoose.Types.ObjectId("58becc88d981bf04a1357dc3")]},
                                    {$ne: ["$$recipe.id_owner", mongoose.Types.ObjectId("58becc88d981bf04a1357dc3")]},
                                ]
                            }


                        }
                    },
                }
            },
            {$unwind: "$news_recipes"},
            {$group: {_id: null, count: {$sum: 1}}}
        ], function (err, count_Receipe) {
            if (err) {
                console.log(err);
                res.status(500).send({error: err});
                return next(err);
            }
            var list_final = [];
            for (var i = 0; i < recipes.length; i++) {
                if (i > parseInt(offset) && i <= parseInt(offset + limit) && typeof recipes[i] !== "undefined") {

                    list_final.push(recipes[i]);
                }
            }

            var count_r = 0;
            if(count_Receipe!==null && typeof count_Receipe[0]!=="undefined" && typeof count_Receipe[0].count!=="undefined" )
                count_r=count_Receipe[0].count;


            return res.status(200).json({
                recettes: list_final,
                count_recettes: count_r,
                offset: parseInt(offset),
                limit: parseInt(limit)
            });
        });


    });

};