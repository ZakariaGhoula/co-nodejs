const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const bcrypt = require('bcrypt-nodejs');
const User = require('../models/user');
//const mailgun = require('../config/mailgun');
// const mailchimp = require('../config/mailchimp');
const setUserInfo = require('../helpers').setUserInfo;
const getRole = require('../helpers').getRole;
const config = require('../config/main');

const NetworkController = require('./network');
const RecipeController = require('./recipes');
// Generate JWT
// TO-DO Add issuer and audience
function generateToken(user) {
    return jwt.sign(user, config.secret, {
        expiresIn: 604800 // in seconds 7 days
    });
}

const writeImgToPath = require('../helpers').writeImgToPath;
//= =======================================
// Login Route
//= =======================================
exports.login = function (req, res, next) {
    const userInfo = setUserInfo(req.user);
    req.params = {};
    req.params.userId = req.user._id;
    NetworkController.retreiveAllNetworkHost(req, res, function (abos) {
        NetworkController.retrieveAllNetworkGuest(req, res, function (follow) {
            RecipeController.getAllRecipesByUserId(req, res, function (recipes) {
                RecipeController.getAllRecipesLikeByUserId(req, res, function (recipes_liked) {

                    res.status(200).json({
                        token: `JWT ${generateToken(userInfo)}`,
                        user: userInfo,
                        recipes: recipes,
                        recipes_liked: recipes_liked,
                        network: {abos, follow}
                    });
                });
            });
        });

    })

    /*res.status(200).json({
     token: `JWT ${generateToken(userInfo)}`,
     user: userInfo
     });*/
};
//= =======================================
// Login token
//= =======================================
exports.relogin = function (req, res, next) {


    if (!req.user) {
        return res.status(422).send({error: 'JWT invalid'});
    }
    const userInfo = setUserInfo(req.user);

    req.params = {};
    req.params.userId = req.user._id;
    NetworkController.retreiveAllNetworkHost(req, res, function (abos) {
        NetworkController.retrieveAllNetworkGuest(req, res, function (follow) {
            RecipeController.getAllRecipesByUserId(req, res, function (recipes) {
                RecipeController.getAllRecipesLikeByUserId(req, res, function (recipes_liked) {

                    res.status(200).json({
                        token: `JWT ${generateToken(userInfo)}`,
                        user: userInfo,
                        recipes: recipes,
                        recipes_liked: recipes_liked,
                        network: {abos, follow}
                    });
                });
            });
        });

    })


};

//= =======================================
// facebook token
//= =======================================
exports.facebook = function (req, res, next) {
    var date_now = new Date();
    const email = req.body.email;
    const firstName = req.body.first_name;
    const lastName = req.body.last_name;
    const password = req.body.email + date_now.getTime();

    // Return error if no email provided
    if (!email) {
        return res.status(422).send({error: 'You must enter an email address.'});
    }

    // Return error if full name not provided
    if (!firstName || !lastName) {
        return res.status(422).send({error: 'You must enter your full name.'});
    }

    // Return error if no password provided
    if (!password) {
        return res.status(422).send({error: 'You must enter a password.'});
    }

    User.findOne({email}, (err, existingUser) => {

            if (err) {
                return next(err);
            }

            // If user is not unique, return error
            if (existingUser) {
                var userId = existingUser._id;
                User.update(
                    {_id: userId},
                    {
                        $set: {
                            provider: {'name': "facebook", 'uid': req.body.uid},


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
                            req.params.userId = user._id;
                            const userInfo = setUserInfo(user);
                            NetworkController.retreiveAllNetworkHost(req, res, function (abos) {
                                NetworkController.retrieveAllNetworkGuest(req, res, function (follow) {
                                    RecipeController.getAllRecipesByUserId(req, res, function (recipes) {
                                        RecipeController.getAllRecipesLikeByUserId(req, res, function (recipes_liked) {

                                            res.status(201).json({
                                                token: `JWT ${generateToken(userInfo)}`,
                                                user: userInfo,
                                                recipes: recipes,
                                                recipes_liked: recipes_liked,
                                                network: {abos, follow}
                                            });
                                        });
                                    });
                                });
                            });
                        });
                    });
            }
            else {



                ///--- media
                var file_name = 'avatar-' + date_now.getTime() + '-' + req.body.uid + '.jpg';

                var img = req.body.picture;
                var b64 = writeImgToPath("public/users/photo/" + file_name, img);
                var obj_media = {type: "photo", path: file_name, name: file_name};


                const user = new User({
                    email,
                    password,
                    profile: {firstName, lastName},
                    provider: {'name': "facebook", 'uid': req.body.uid},
                    media: obj_media
                });

                user.save((err, user) => {
                    if (err) {
                        return next(err);
                    }

                    // Subscribe member to Mailchimp list
                    // mailchimp.subscribeToNewsletter(user.email);

                    // Respond with JWT if user was created
                    req.params = {};
                    req.params.userId = user._id;
                    const userInfo = setUserInfo(user);
                    NetworkController.retreiveAllNetworkHost(req, res, function (abos) {
                        NetworkController.retrieveAllNetworkGuest(req, res, function (follow) {
                            RecipeController.getAllRecipesByUserId(req, res, function (recipes) {
                                RecipeController.getAllRecipesLikeByUserId(req, res, function (recipes_liked) {

                                    res.status(201).json({
                                        token: `JWT ${generateToken(userInfo)}`,
                                        user: userInfo,
                                        recipes: recipes,
                                        recipes_liked: recipes_liked,
                                        network: {abos, follow}
                                    });
                                });
                            });
                        });
                    });

                });
            }
        }
    );


};


//= =======================================
// Registration Route
//= =======================================
exports.register = function (req, res, next) {
    // Check for registration errors
    const email = req.body.email;
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const password = req.body.password;

    // Return error if no email provided
    if (!email) {
        return res.status(422).send({error: 'You must enter an email address.'});
    }

    // Return error if full name not provided
    if (!firstName || !lastName) {
        return res.status(422).send({error: 'You must enter your full name.'});
    }

    // Return error if no password provided
    if (!password) {
        return res.status(422).send({error: 'You must enter a password.'});
    }

    User.findOne({email}, (err, existingUser) => {

        if (err) {
            return next(err);
        }

        // If user is not unique, return error
        if (existingUser) {
            return res.status(422).send({error: 'That email address is already in use.'});
        }

        // If email is unique and password was provided, create account
        const user = new User({
            email,
            password,
            profile: {firstName, lastName},
        });

        user.save((err, user) => {
            if (err) {
                return next(err);
            }

            // Subscribe member to Mailchimp list
            // mailchimp.subscribeToNewsletter(user.email);

            // Respond with JWT if user was created

            const userInfo = setUserInfo(user);
            NetworkController.retreiveAllNetworkHost(req, res, function (abos) {
                NetworkController.retrieveAllNetworkGuest(req, res, function (follow) {
                    RecipeController.getAllRecipesByUserId(req, res, function (recipes) {
                        RecipeController.getAllRecipesLikeByUserId(req, res, function (recipes_liked) {

                            res.status(201).json({
                                token: `JWT ${generateToken(userInfo)}`,
                                user: userInfo,
                                recipes: recipes,
                                recipes_liked: recipes_liked,
                                network: {abos, follow}
                            });
                        });
                    });
                });
            });

            /*  res.status(201).json({
             token: `JWT ${generateToken(userInfo)}`,
             user: userInfo
             });*/
        });
    });

};

//= =======================================
// Authorization Middleware
//= =======================================

// Role authorization check
exports.roleAuthorization = function (requiredRole) {
    return function (req, res, next) {
        const user = req.user;

        User.findById(user._id, (err, foundUser) => {
            if (err) {
                res.status(422).json({error: 'No user was found.'});
                return next(err);
            }

            // If user is found, check role.
            if (getRole(foundUser.role) >= getRole(requiredRole)) {
                return next();
            }

            return res.status(401).json({error: 'You are not authorized to view this content.'});
        });
    };
};

//= =======================================
// Forgot Password Route
//= =======================================

exports.forgotPassword = function (req, res, next) {
    const email = req.body.email;

    User.findOne({email}, (err, existingUser) => {
        // If user is not found, return error
        if (err || existingUser == null) {
            res.status(422).json({error: 'Your request could not be processed as entered. Please try again.'});
            return next(err);
        }

        // If user is found, generate and save resetToken

        // Generate a token with Crypto
        crypto.randomBytes(48, (err, buffer) => {
            const resetToken = buffer.toString('hex');
            if (err) {
                return next(err);
            }

            existingUser.resetPasswordToken = resetToken;
            existingUser.resetPasswordExpires = Date.now() + 3600000; // 1 hour

            existingUser.save((err) => {
                // If error in saving token, return it
                if (err) {
                    return next(err);
                }

                const message = {
                    subject: 'Reset Password',
                    text: `${'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
                    'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                    'http://'}${req.headers.host}/reset-password/${resetToken}\n\n` +
                    `If you did not request this, please ignore this email and your password will remain unchanged.\n`
                };

                // Otherwise, send user email via Mailgun
                //  mailgun.sendEmail(existingUser.email, message);

                return res.status(200).json({message: 'Please check your email for the link to reset your password.'});
            });
        });
    });
};

//= =======================================
// Reset Password Route
//= =======================================

exports.verifyToken = function (req, res, next) {
    User.findOne({
        resetPasswordToken: req.params.token,
        resetPasswordExpires: {$gt: Date.now()}
    }, (err, resetUser) => {
        // If query returned no results, token expired or was invalid. Return error.
        if (!resetUser) {
            res.status(422).json({error: 'Your token has expired. Please attempt to reset your password again.'});
        }

        // Otherwise, save new password and clear resetToken from database
        resetUser.password = req.body.password;
        resetUser.resetPasswordToken = undefined;
        resetUser.resetPasswordExpires = undefined;

        resetUser.save((err) => {
            if (err) {
                return next(err);
            }

            // If password change saved successfully, alert user via email
            const message = {
                subject: 'Password Changed',
                text: 'You are receiving this email because you changed your password. \n\n' +
                'If you did not request this change, please contact us immediately.'
            };

            // Otherwise, send user email confirmation of password change via Mailgun
            //  mailgun.sendEmail(resetUser.email, message);

            return res.status(200).json({message: 'Password changed successfully. Please login with your new password.'});
        });
    });
};

exports.changePassword = function (req, res, next) {
    const userId = req.body.userId;

    if (req.user._id.toString() !== userId) {
        return res.status(401).json({error: 'You are not authorized to view this user profile.'});
    }

    if (!req.body.old_passwd) {
        return res.status(500).json({error: "old_passwd  is required."});
    }
    if (!req.body.new_pass) {
        return res.status(500).json({error: "new_pass  is required."});
    }

    req.user.comparePassword(req.body.old_passwd, (err, isMatch) => {
        if (err) {
            console.log(err);
            return res.status(500).json({error: 'Something went wrong, please try later.'});
        }
        if (!isMatch) {
            return res.status(500).json({error: 'Your login details could not be verified. Please try again.'});
        }


        const SALT_FACTOR = 5;
        bcrypt.genSalt(SALT_FACTOR, (err, salt) => {
            if (err) return next(err);

            bcrypt.hash(req.body.new_pass, salt, null, (err, hash) => {
                if (err) return next(err);
                User.update(
                    {_id: userId},
                    {
                        $set: {
                            password: hash

                        }
                    }, function (err2, data) {
                        if (err2) {
                            return res.status(500).json({error: 'Something went wrong, please try later.'});
                            // req.session.historyData.message = 'Something went wrong, please try later.'
                        }
                        User.findById(userId, (err3, user) => {
                            if (err3) {
                                res.status(400).json({error: 'No user could be found for this ID.'});
                                return next(err3);
                            }
                            req.params = {};
                            req.params.userId = userId;
                            NetworkController.retreiveAllNetworkHost(req, res, function (abos) {
                                NetworkController.retrieveAllNetworkGuest(req, res, function (follow) {
                                    const userToReturn = setUserInfo(user);
                                    return res.status(200).json({user: userToReturn, network: {abos, follow}});
                                });

                            })
                        });
                    }
                );

            });
        });

    });


};