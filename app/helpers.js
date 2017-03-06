
const ROLE_USER = require('./constants').ROLE_USER;
const ROLE_TEAM = require('./constants').ROLE_TEAM;
const ROLE_ADMIN = require('./constants').ROLE_ADMIN;

// Set user info from request
exports.setUserInfo = function setUserInfo(request) {
    const getUserInfo = {
        _id: request._id,
        firstName: request.profile.firstName,
        lastName: request.profile.lastName,
        email: request.email,
        role: request.role
    };

    return getUserInfo;
};

exports.getRole = function getRole(checkRole) {
    var role;

    switch (checkRole) {
        case ROLE_ADMIN: role = 3; break;
        case ROLE_TEAM: role = 2; break;
        case ROLE_USER: role = 1; break;
        default: role = 1;
    }

    return role;
};