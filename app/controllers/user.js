const User = require('../models/user');
const NetworkController = require('./network');
const setUserInfo = require('../helpers').setUserInfo;
const writeImgToPath = require('../helpers').writeImgToPath;
const decodeBase64Image = require('../helpers').decodeBase64Image;
var fs = require('fs');
//= =======================================
// User Routes
//= =======================================
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
                const userToReturn = setUserInfo(user);
                return res.status(200).json({user: userToReturn,network:{abos,follow}});
            });

        })


    });
};
//--- update profile

exports.updateProfile = function (req, res, next) {
    const userId = req.body.userId;

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
                        const userToReturn = setUserInfo(user);
                        return res.status(200).json({user: userToReturn,network:{abos,follow}});
                    });

                })
            });
        }
    );

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
                        const userToReturn = setUserInfo(user);
                        return res.status(200).json({user: userToReturn,network:{abos,follow}});
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
                        const userToReturn = setUserInfo(user);
                        return res.status(200).json({user: userToReturn,network:{abos,follow}});
                    });

                });
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
            NetworkController.retreiveAllNetworkHost(req, res, function (abos) {
                NetworkController.retrieveAllNetworkGuest(req, res, function (follow) {
                    const userToReturn = setUserInfo(user);
                    return res.status(200).json({user: userToReturn,network:{abos,follow}});
                });

            })
        });


};
exports.updateMedia = function (req, res, next) {
    const userId = req.body.userId;

    if (req.user._id.toString() !== userId) {
        return res.status(401).json({error: 'You are not authorized to view this user profile.'});
    }

    if (!req.body.imageURI) {
        return res.status(500).json({error: "imageURI is required."});
    }
    const imgURI = req.body.imageURI;


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
                        name: 'public/users/photo/' + file_name,
                        path: 'public/users/photo/' + file_name
                    }

                }
            }, function (err2, data) {
                if (err2) {
                    return res.status(500).json({error: 'Something went wrong, please try later.'});
                    // req.session.historyData.message = 'Something went wrong, please try later.'
                }

                req.params = {};
                req.params.userId = userId;
                NetworkController.retreiveAllNetworkHost(req, res, function (abos) {
                    NetworkController.retrieveAllNetworkGuest(req, res, function (follow) {
                        const userToReturn = setUserInfo(user);
                        return res.status(200).json({user: userToReturn,network:{abos,follow}});
                    });

                })
            });
    });

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


