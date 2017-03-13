const ROLE_USER = require('./constants').ROLE_USER;
const ROLE_TEAM = require('./constants').ROLE_TEAM;
const ROLE_ADMIN = require('./constants').ROLE_ADMIN;

const NetworkController = require('./controllers/network');
const fs = require('fs');
const moment = require('moment');
// Set user info from request
exports.setUserInfo = function setUserInfo(request) {

    const getUserInfo = {
        _id: request._id,
        profile: {
            firstName: capitalize(request.profile.firstName),
            lastName: capitalize(request.profile.lastName),
            nickName: getNickName(request.profile.firstName, request.profile.lastName),
            gender: request.profile.gender,
            rangeAge: request.profile.rangeAge,
            level: request.profile.level,
            about: request.profile.about,
        },
        provider: request.provider,
        config: request.config,
        media: request.media,

        email: request.email,
        role: request.role,
    };


    return getUserInfo;

};

exports.setUserInfoNetwork = function setUserInfoNetwork(request, is_follow, is_abo) {
    const getUserInfo = {
        _id: request._id,
        firstName: capitalize(request.profile.firstName),
        lastName: capitalize(request.profile.lastName),
        nickName: getNickName(request.profile.firstName, request.profile.lastName),
        media: request.media,
        follow: is_follow,
        abos: is_abo,
    };

    return getUserInfo;
};

exports.getRole = function getRole(checkRole) {
    var role;

    switch (checkRole) {
        case ROLE_ADMIN:
            role = 3;
            break;
        case ROLE_TEAM:
            role = 2;
            break;
        case ROLE_USER:
            role = 1;
            break;
        default:
            role = 1;
    }

    return role;
};

exports.writeImgToPath = function writeImgToPath(path_name, file) {
    // read binary data
    //var bitmap = fs.readFileSync(file);
    // convert binary data to base64 encoded string
    //return new Buffer(bitmap).toString('base64');

    var img = require('request')(
        {
            url: file,
            encoding: 'binary'
        }
        , function (e, r, b) {
            var type = r.headers["content-type"];
            var prefix = "data:" + type + ";base64,";
            var base64 = new Buffer(b, 'binary').toString('base64');
            var dataURI = prefix + base64;
            img = dataURI;

            var imageBuffer = decodeBase64Image(dataURI);
            fs.writeFile(path_name, imageBuffer.data, function (err) {
                console.log(dataURI);
                return path_name;
            });

            return dataURI;
        }
    );

    return img;

};
exports.decodeBase64Images = function decodeBase64Image(dataString) {
    var matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
        response = {};

    if (matches.length !== 3) {
        return new Error('Invalid input string');
    }

    response.type = matches[1];
    response.data = new Buffer(matches[2], 'base64');

    return response;
}
exports.getCurrentSeasonTime = function getCurrentSeasonTime() {
    // read binary data
    //var bitmap = fs.readFileSync(file);
    // convert binary data to base64 encoded string
    //return new Buffer(bitmap).toString('base64');


    var year_day = moment().dayOfYear();
    var year = moment().year();
    var is_leap_year = year % 4 == 0 && year % 100 != 0 || year % 400 == 0
    if (is_leap_year && year_day > 60) {
        // if is leap year and date > 28 february
        year_day = year_day - 1
    }
    var s;
    if (year_day >= 355 || year_day < 81) {
        s = "winter";
    }
    else if (year_day >= 81 || year_day < 173) {
        s = "spring";
    } else if (year_day >= 173 || year_day < 266) {
        s = "summer";
    } else if (year_day >= 266 || year_day < 355) {
        s = "autumn";
    }
    return s;

}
var decodeBase64Image = function decodeBase64Image(dataString) {
    var matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
        response = {};

    if (matches.length !== 3) {
        return new Error('Invalid input string');
    }

    response.type = matches[1];
    response.data = new Buffer(matches[2], 'base64');

    return response;
}

var getNickName = function getNickName(firstName, lastName) {
    var nickName;

    nickName = capitalize(firstName) + " " + lastName.toUpperCase().substr(0, 1) + "."

    return nickName;
};


var capitalize = function capitalize(s) {
    // returns the first letter capitalized + the string from index 1 and out aka. the rest of the string
    return s[0].toUpperCase() + s.substr(1);
}
