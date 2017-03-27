// Importing Passport, strategies, and config
const passport = require('passport'),
    User = require('../models/user'),
    config = require('./main'),
    JwtStrategy = require('passport-jwt').Strategy,
    ExtractJwt = require('passport-jwt').ExtractJwt,
    LocalStrategy = require('passport-local');

// Setting username field to email rather than username
const localOptions = {
    usernameField: 'email'
};

// Setting up local login strategy
const localLogin = new LocalStrategy(localOptions, (email, password, done) => {
    User.findOne({email}, (err, user) => {
        if (err) {
            return done(err);
        }
        if (!user) {
            return done(null, false, {error: 'Aucun utilisateur sous cette adresse email.'});
        }

        user.comparePassword(password, (err, isMatch) => {
            if (err) {
                return done(err);
            }
            if (!isMatch) {
                return done(null, false, {error: 'Votre mot de passe est erroné.'});
            }


            User.update(
                {_id: user._id},
                {
                    $set: {
                        activated: true

                    }
                }, function (err2, data) {
                    if (err2) {
                        return done(null, false, ({error: 'Something went wrong, please try later.'}));
                        // req.session.historyData.message = 'Something went wrong, please try later.'
                    }

                    return done(null, user);
                });
        });
    });
});

// Setting JWT strategy options
const jwtOptions = {
    // Telling Passport to check authorization headers for JWT
    jwtFromRequest: ExtractJwt.fromAuthHeader(),
    // Telling Passport where to find the secret
    secretOrKey: config.secret

    // TO-DO: Add issuer and audience checks
};

// Setting up JWT login strategy
const jwtLogin = new JwtStrategy(jwtOptions, (payload, done) => {

    if (typeof payload._doc !== "undefined" && typeof payload._doc._id !== "undefined") {
        console.log(payload._doc._id);
        User.findById(payload._doc._id, (err, user) => {
            if (err) {
                return done(err, false);
            }

            if (user) {
                done(null, user);
            } else {
                User.findById(payload._id, (err, user) => {
                    if (err) {
                        return done(err, false);
                    }

                    if (user) {
                        done(null, user);
                    } else {
                        done(null, false);
                    }
                });
            }
        });
    } else {
        User.findById(payload._id, (err, user) => {
            if (err) {
                return done(err, false);
            }

            if (user) {
                done(null, user);
            } else {
                done(null, false);
            }
        });
    }

});


passport.use(jwtLogin);
passport.use(localLogin);