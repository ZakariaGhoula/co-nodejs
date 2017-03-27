var mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');
const Schema = mongoose.Schema;
const GENDER_FEMALE = require('../constants').GENDER_FEMALE;
const GENDER_MALE = require('../constants').GENDER_MALE;
const RANGE_AGE_MINOR = require('../constants').RANGE_AGE_MINOR;
const RANGE_AGE_19_25 = require('../constants').RANGE_AGE_19_25;
const RANGE_AGE_26_35 = require('../constants').RANGE_AGE_26_35;
const RANGE_AGE_36_55 = require('../constants').RANGE_AGE_36_55;
const RANGE_AGE_55 = require('../constants').RANGE_AGE_55;
//= ===============================
// User Schema
//= ===============================
const UserSchema = new Schema({
        email: {
            type: String,
            lowercase: true,
            unique: true,
            required: true
        },
        password: {
            type: String,
            required: true
        },
        profile: {
            firstName: {type: String},
            lastName: {type: String},
            gender: {type: String, enum: [GENDER_MALE, GENDER_FEMALE, null], default: null},
            rangeAge: {
                type: String,
                enum: [RANGE_AGE_MINOR, RANGE_AGE_19_25, RANGE_AGE_26_35, RANGE_AGE_36_55, RANGE_AGE_55, null],
                default: null
            },
            level: {type: Number, enum: [1, 2, 3, 4], default: 1},
            about: {
                type: String,
                default: null
            }
        },
        provider: {
            name: {type: String, enum: ['facebook', 'email'], default: "email"},
            uid: {type: String, default: null}
        },
        role: {
            type: String,
            enum: ["user", "team", "admin"],
            default: "user"
        },
        config: {
            locale: {type: String, enum: ['fr_FR', 'en_EN'], default: 'fr_FR'},
            zone: {type: Number, enum: [1, 2, 3, 4, 5], default: 1},
            notification: {
                recipe: {type: Boolean, default: true},
                follow: {type: Boolean, default: true},
                app: {type: Boolean, default: true}
            },
            form_skiped: {type: Boolean, default: false},
            code_promo: {type: String, default: null}
        },
        activated: {
            type: Boolean,
            default: true
        },
        media: {
            type: {type: String, default: 'photo'},
            name: {type: String, default: null},
            path: {type: String, default: null}
        }
    },
    {
        timestamps: true
    });

//= ===============================
// User ORM Methods
//= ===============================

// Pre-save of user to database, hash password if password is modified or new
UserSchema.pre('save', function (next) {
    const user = this,
        SALT_FACTOR = 5;

    if (!user.isModified('password')) return next();

    bcrypt.genSalt(SALT_FACTOR, (err, salt) => {
        if (err) return next(err);

        bcrypt.hash(user.password, salt, null, (err, hash) => {
            if (err) return next(err);
            user.password = hash;
            next();
        });
    });
});

// Method to compare password for login
UserSchema.methods.comparePassword = function (candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
        if (err) {
            return cb(err);
        }

        cb(null, isMatch);
    });
};


module.exports = mongoose.model('User', UserSchema);