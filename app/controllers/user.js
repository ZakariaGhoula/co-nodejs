const User = require('../models/user');
const RecipeController = require('./recipes');
const NetworkController = require('./network');
const setUserInfo = require('../helpers').setUserInfo;
const writeImgToPath = require('../helpers').writeImgToPath;
var fs = require('fs');
var mongoose = require('mongoose');
var _ = require("lodash");


//= =======================================
// check email
//= =======================================
exports.emailExist = function (req, res, next) {
    const email = req.params.email;
    User.findOne({'email': email}, function (err, user) {
        if (err) {
            return res.status(200).json({exist: false})
        }

        var is_used = user !== null && typeof user.email !== "undefined" && user.email != "";

        return res.status(200).json({exist: is_used})
    })
};

//= =======================================
// User Routes
//= =======================================
exports.myProfile = function (req, res, next) {
    const userId = req.user._id

    if (!req.user._id) {
        return res.status(401).json({error: 'You are not authorized to view this user profile.'});
    }
    req.params = {};
    req.params.userId = userId;
    User.findById(req.user._id, (err, user) => {
        if (err) {
            res.status(400).json({error: 'No user could be found for this ID.'});
            return next(err);
        }
        NetworkController.retreiveAllNetworkHost(req, res, function (abos) {
            NetworkController.retrieveAllNetworkGuest(req, res, function (follow) {
                RecipeController.getAllRecipesByUserId(req, res, function (recipes) {
                    RecipeController.getAllRecipesLikeByUserId(req, res, function (recipes_liked) {

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
};
exports.viewProfile = function (req, res, next) {
    const userId = req.params.userId;

    if (req.user._id.toString() !== userId) {
        return res.status(401).json({error: 'You are not authorized to view this user profile.'});
    }
    User.findById(userId, (err, user) => {
        if (err) {
            res.status(400).json({error: 'No user could be found for this ID.'});
            return next(err);
        }
        NetworkController.retreiveAllNetworkHost(req, res, function (abos) {
            NetworkController.retrieveAllNetworkGuest(req, res, function (follow) {
                RecipeController.getAllRecipesByUserId(req, res, function (recipes) {
                    RecipeController.getAllRecipesLikeByUserId(req, res, function (recipes_liked) {

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
};
exports.viewExternalProfile = function (req, res, next) {

    const userId = req.params.userId;


    User.findById(userId, (err, user) => {
        if (err) {
            res.status(400).json({error: 'No user could be found for this ID.'});
            return next(err);
        }
        NetworkController.retreiveAllNetworkHost(req, res, function (abos) {
            NetworkController.retrieveAllNetworkGuest(req, res, function (follow) {
                RecipeController.getAllRecipesByUserId(req, res, function (recipes) {


                    const userToReturn = setUserInfo(user);
                    return res.status(200).json({user: userToReturn, recipes: recipes, network: {abos, follow}});
                });

            });

        })


    });


};
//--- update profile

exports.updateProfile = function (req, res, next) {
    const userId = req.body.userId;
    console.log(userId);
    if (req.user._id.toString() !== userId) {
        return res.status(401).json({error: 'You are not authorized to view this user profile.'});
    }

    if (!req.body.profile) {
        return res.status(500).json({error: "data profile is required."});
    }

    User.update(
        {_id: userId},
        {
            $set: {
                profile: req.body.profile

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
                        RecipeController.getAllRecipesByUserId(req, res, function (recipes) {


                            const userToReturn = setUserInfo(user);
                            return res.status(200).json({
                                user: userToReturn,
                                recipes: recipes,
                                network: {abos, follow}
                            });
                        });

                    });

                })
            });
        }
    );

};//--- update profile

exports.updateSkipForm = function (req, res, next) {
    const userId = req.body.userId;

    if (req.user._id.toString() !== userId) {
        return res.status(401).json({error: 'You are not authorized to view this user profile.'});
    }


    User.findById(userId, (err1, user1) => {
<<<<<<< HEAD
            if (err1) {
                res.status(400).json({error: 'No user could be found for this ID.'});
                return next(err);
            }
=======
        if (err1) {
            res.status(400).json({error: 'No user could be found for this ID.'});
            return next(err);
        }
>>>>>>> origin/master

        var profile = user1.profile;
        var config = user1.config;
        profile.gender = req.body.gender;
        profile.level = req.body.level;
        profile.rangeAge = req.body.age;

        config.form_skiped = true;
        config.code_promo = req.body.body;
<<<<<<< HEAD
            User.update(
                {_id: userId},
                {
                    $set: {
                        profile: profile,
                        config: config,

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
                                RecipeController.getAllRecipesByUserId(req, res, function (recipes) {


                                    const userToReturn = setUserInfo(user);
                                    return res.status(200).json({
                                        user: userToReturn,
                                        recipes: recipes,
                                        network: {abos, follow}
                                    });
                                });

                            });

                        })
                    });
                });
        });
=======
        User.update(
            {_id: userId},
            {
                $set: {
                    profile: profile,
                    config: config,

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
                            RecipeController.getAllRecipesByUserId(req, res, function (recipes) {


                                const userToReturn = setUserInfo(user);
                                return res.status(200).json({
                                    user: userToReturn,
                                    recipes: recipes,
                                    network: {abos, follow}
                                });
                            });

                        });

                    })
                });
            });
    });
>>>>>>> origin/master

};//--- update profile

exports.updateProvider = function (req, res, next) {
    const userId = req.body.userId;

    if (req.user._id.toString() !== userId) {
        return res.status(401).json({error: 'You are not authorized to view this user profile.'});
    }

    if (!req.body.provider) {
        return res.status(500).json({error: "data provider is required."});
    }

    User.update(
        {_id: userId},
        {
            $set: {
                provider: req.body.provider

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
                        RecipeController.getAllRecipesByUserId(req, res, function (recipes) {


                            const userToReturn = setUserInfo(user);
                            return res.status(200).json({
                                user: userToReturn,
                                recipes: recipes,
                                network: {abos, follow}
                            });
                        });

                    });

                })
            });
        }
    );

};
//--- update config

exports.updateConfig = function (req, res, next) {
    const userId = req.body.userId;

    if (req.user._id.toString() !== userId) {
        return res.status(401).json({error: 'You are not authorized to view this user profile.'});
    }

    if (!req.body.config) {
        return res.status(500).json({error: "data config is required."});
    }

    User.update(
        {_id: userId},
        {
            $set: {
                config: req.body.config

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
                        RecipeController.getAllRecipesByUserId(req, res, function (recipes) {


                            const userToReturn = setUserInfo(user);
                            return res.status(200).json({
                                user: userToReturn,
                                recipes: recipes,
                                network: {abos, follow}
                            });
                        });

                    });

                })
            });
        }
    );

};//--- update activated

exports.updateActivation = function (req, res, next) {
    const userId = req.body.userId;

    if (req.user._id.toString() !== userId) {
        return res.status(401).json({error: 'You are not authorized to view this user profile.'});
    }

    if (!req.body.activated) {
        return res.status(500).json({error: "activated is required."});
    }
    User.update(
        {_id: userId},
        {
            $set: {
                activated: true

            }
        }, function (err2, data) {
            if (err2) {
                return res.status(500).json({error: 'Something went wrong, please try later.'});
                // req.session.historyData.message = 'Something went wrong, please try later.'
            }

            req.params = {};
            req.params.userId = userId;
            User.findById(userId, (err, user) => {
                if (err) {
                    res.status(400).json({error: 'No user could be found for this ID.'});
                    return next(err);
                }

                req.params = {};
                req.params.userId = userId;
                NetworkController.retreiveAllNetworkHost(req, res, function (abos) {
                    NetworkController.retrieveAllNetworkGuest(req, res, function (follow) {
                        RecipeController.getAllRecipesByUserId(req, res, function (recipes) {


                            const userToReturn = setUserInfo(user);
                            return res.status(200).json({
                                user: userToReturn,
                                recipes: recipes,
                                network: {abos, follow}
                            });
                        });

                    });

                })
            });
        });


};

//--- update media
exports.updateMedia = function (req, res, next) {
    const userId = req.body.userId;

    if (req.user._id.toString() !== userId) {
        return res.status(401).json({error: 'You are not authorized to view this user profile.'});
    }

    if (!req.body.imageURI) {
        return res.status(500).json({error: "imageURI is required."});
    }
    var imgURI = req.body.imageURI.uri;


    var imageBuffer = decodeBase64Image(imgURI);
    var current_Date = new Date();
    var file_name = 'avatar-' + current_Date.getYear() + current_Date.getMonth() + current_Date.getDay() + current_Date.getHours() + current_Date.getMinutes() + current_Date.getSeconds() + '-' + userId + '.jpg';
    fs.writeFile('public/users/photo/' + file_name, imageBuffer.data, function (err) {

        if (err) {
            return res.status(500).json({error: 'Something went wrong, please try later.'});
            // req.session.historyData.message = 'Something went wrong, please try later.'
        }
        User.update(
            {_id: userId},
            {
                $set: {
                    media: {
                        type: "photo",
                        name: file_name,
                        path: file_name
                    }

                }
            }, function (err2, data_user) {
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
                            RecipeController.getAllRecipesByUserId(req, res, function (recipes) {


                                const userToReturn = setUserInfo(user);
                                return res.status(200).json({
                                    user: userToReturn,
                                    recipes: recipes,
                                    network: {abos, follow}
                                });
                            });

                        });

                    })
                });
            });
    });

};

//--- autocomplete user

exports.getAllUserAutoComplete = function (req, res, next) {

    if (!req.params.name) {
        return res.status(500).json({error: "name is required."});
    }
    if (!req.params.userId) {
        return res.status(500).json({error: "userId is required."});
    }
    User.aggregate([{
            $match: {
                $and: [{"_id": {$ne: mongoose.Types.ObjectId(req.params.userId)}},
                    {$or: [{'profile.lastName': {$regex: new RegExp(req.params.name, "ig")}}, {'profile.firstName': {$regex: new RegExp(req.params.name, "ig")}}]}
                ]
            }
        },
            {
                $lookup: {
                    from: "networks",
                    localField: "_id",
                    foreignField: "guest",
                    as: "user_guest"
                }
            }, {$unwind: '$user_guest'}, {
                $lookup: {
                    from: "users",
                    localField: "user_guest.host",
                    foreignField: "_id",
                    as: "guests"
                }
            }, {
                "$project": {
                    "id": 1,
                    email: "$email",
                    profile: "$profile",
                    provider: "$provider",
                    role: "$role",
                    config: "$config",
                    media: "$media",
                    "guests": {
                        _id: 1,
                        email: 1,
                        profile: 1,
                        media: 1,

                    }
                }
            }, {
                $lookup: {
                    from: "networks",
                    localField: "_id",
                    foreignField: "host",
                    as: "user_host"
                }
            }, {$unwind: '$user_host'}, {
                $lookup: {
                    from: "users",
                    localField: "user_host.guest",
                    foreignField: "_id",
                    as: "hosts"
                }
            }, {
                "$project": {
                    "id": 1,
                    email: "$email",
                    profile: "$profile",
                    provider: "$provider",
                    role: "$role",
                    config: "$config",
                    media: "$media",
                    "guests": {
                        _id: 1,
                        email: 1,
                        profile: 1,
                        media: 1,

                    }, "hosts": {
                        _id: 1,
                        email: 1,
                        profile: 1,
                        media: 1,

                    }
                }
            },
            {
                $group: {
                    _id: {
                        'id': '$_id',
                        email: "$email",
                        followed: "false",
                        abo: "false",
                        profile: "$profile",
                        provider: "$provider",
                        role: "$role",
                        config: "$config",
                        media: "$media"
                    },
                    follow: {$addToSet: '$guests'}, hosts: {$addToSet: '$hosts'}
                }
            }

        ],
        function (err, user) {
            if (err) {
                console.log(err);
                res.status(500).send({error: err});
                return next(err);
            }

            var final = [];

            for (var j in user) {
                var host = false;
                var follow = false;
                for (var j2 in user[j].hosts) {
                    if (typeof user[j].hosts[j2][0] !== "undefined") {
                        if (user[j].hosts[j2][0]._id == req.params.userId) {
                            follow = true;

                        }
                    }
                }
                for (var j2 in user[j].follow) {
                    if (typeof user[j].follow[j2][0] !== "undefined") {
                        if (user[j].follow[j2][0]._id == req.params.userId) {
                            host = true;

                        }
                    }
                }
                user[j]._id.followed = host;
                user[j]._id.abo = follow;

                final.push(user[j]);
            }
            return res.status(200).json({users: final});
        }
    );

};


exports.thumbImg = function (req, res, next) {


    User.find({activated: true}, {}, function (err, users) {
            if (err) {
                console.log(err);
                res.status(500).send({error: err});
                return next(err);
            }


            for (var i in users) {

                var userToReturn = setUserInfo(users[i]);

                if (users[i].media.path != null) {
                    var current_Date = new Date();
                    var file_name = 'avatar-' + current_Date.getYear() + current_Date.getMonth() + current_Date.getDay() + current_Date.getHours() + current_Date.getMinutes() + current_Date.getSeconds() + '-' + users[i]._id + '.jpg';

                    var img = "http://api.mygetaway.fr/images/users/" + users[i].media.path;
                    var b64 = writeImgToPath("public/users/photo/" + file_name, img);
                    var obj_media = {type: "photo", path: file_name, name: file_name};
                    User.update(
                        {_id: users[i]._id},
                        {
                            $set: {
                                media: obj_media
                            }
                        }, function (err2, data) {
                            if (err2) {
                                return res.status(500).json({error: 'Something went wrong, please try later.'});
                                // req.session.historyData.message = 'Something went wrong, please try later.'
                            }
                        }
                    );

                }


            }


            return res.status(200).json({b64: "yes"});
        }
    );

}


function decodeBase64Image(dataString) {
    console.log(dataString);
    var matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
        response = {};

    if (matches.length !== 3) {
        return new Error('Invalid input string');
    }

    response.type = matches[1];
    response.data = new Buffer(matches[2], 'base64');

    return response;
}

<<<<<<< HEAD

exports.reqAllUserAutoComplete = function (req, res, next) {

    if (!req.params.query) {
        console.log(err);
        res.status(500).send({error: err});
        return next(err);
    }
    if (!req.params.userId) {
        console.log(err);
        res.status(500).send({error: err});
        return next(err);
    }
    User.aggregate([{
            $match: {
                $and: [{"_id": {$ne: mongoose.Types.ObjectId(req.params.userId)}},
                    {$or: [{'profile.lastName': {$regex: new RegExp(req.params.query, "ig")}}, {'profile.firstName': {$regex: new RegExp(req.params.query, "ig")}}]}
                ]
            }
<<<<<<< HEAD
        }, {$sort: {'profile.firstName': -1}},
=======
        },
>>>>>>> origin/master
            {
                $lookup: {
                    from: "networks",
                    localField: "_id",
                    foreignField: "guest",
                    as: "user_guest"
                }
<<<<<<< HEAD
            }
            ,
            {
                $unwind: '$user_guest'
            }
            ,
            {
=======
            }, {$unwind: '$user_guest'}, {
>>>>>>> origin/master
                $lookup: {
                    from: "users",
                    localField: "user_guest.host",
                    foreignField: "_id",
                    as: "guests"
                }
<<<<<<< HEAD
            }
            ,
            {
=======
            }, {
>>>>>>> origin/master
                "$project": {
                    "id": 1,
                    email: "$email",
                    profile: "$profile",
                    provider: "$provider",
                    role: "$role",
                    config: "$config",
                    media: "$media",
                    "guests": {
                        _id: 1,
                        email: 1,
                        profile: 1,
                        media: 1,

                    }
                }
<<<<<<< HEAD
            }
            ,
            {
=======
            }, {
>>>>>>> origin/master
                $lookup: {
                    from: "networks",
                    localField: "_id",
                    foreignField: "host",
                    as: "user_host"
                }
<<<<<<< HEAD
            }
            ,
            {
                $unwind: '$user_host'
            }
            ,
            {
=======
            }, {$unwind: '$user_host'}, {
>>>>>>> origin/master
                $lookup: {
                    from: "users",
                    localField: "user_host.guest",
                    foreignField: "_id",
                    as: "hosts"
                }
<<<<<<< HEAD
            }
            ,
            {
=======
            }, {
>>>>>>> origin/master
                "$project": {
                    "id": 1,
                    email: "$email",
                    profile: "$profile",
                    provider: "$provider",
                    role: "$role",
                    config: "$config",
                    media: "$media",
                    "guests": {
                        _id: 1,
                        email: 1,
                        profile: 1,
                        media: 1,

<<<<<<< HEAD
                    }
                    ,
                    "hosts": {
=======
                    }, "hosts": {
>>>>>>> origin/master
                        _id: 1,
                        email: 1,
                        profile: 1,
                        media: 1,

                    }
                }
<<<<<<< HEAD
            }
            ,
=======
            },
>>>>>>> origin/master
            {
                $group: {
                    _id: {
                        'id': '$_id',
                        email: "$email",
                        followed: "false",
                        abo: "false",
                        profile: "$profile",
                        provider: "$provider",
                        role: "$role",
                        config: "$config",
                        media: "$media"
<<<<<<< HEAD
                    }
                    ,
                    follow: {
                        $addToSet: '$guests'
                    }
                    ,
                    hosts: {
                        $addToSet: '$hosts'
                    }
=======
                    },
                    follow: {$addToSet: '$guests'}, hosts: {$addToSet: '$hosts'}
>>>>>>> origin/master
                }
            }

        ],
        function (err, user) {
            if (err) {
                console.log(err);
                res.status(500).send({error: err});
                return next(err);
            }

            var final = [];

            for (var j in user) {
                var host = false;
                var follow = false;
                for (var j2 in user[j].hosts) {
                    if (typeof user[j].hosts[j2][0] !== "undefined") {
                        if (user[j].hosts[j2][0]._id == req.params.userId) {
                            follow = true;

                        }
                    }
                }
                for (var j2 in user[j].follow) {
                    if (typeof user[j].follow[j2][0] !== "undefined") {
                        if (user[j].follow[j2][0]._id == req.params.userId) {
                            host = true;

                        }
                    }
                }
                user[j]._id.followed = host;
                user[j]._id.abo = follow;

                final.push(user[j]);
            }
            return next({users: final});
        }
<<<<<<< HEAD
    )
    ;
=======
    );
>>>>>>> origin/master

};
=======
>>>>>>> origin/master
