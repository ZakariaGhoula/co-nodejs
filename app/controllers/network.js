const Network = require('../models/network');
const User = require('../models/user');

var setUserInfoNetwork = require('../helpers').setUserInfoNetwork;
var mongoose = require('mongoose');
var async = require('async');


// get ALL seasonal products by lng
var getAllNetworkHost = function (req, res, next) {
    const userId = req.params.userId;
    /*
     if (req.user._id.toString() !== userId) {
     return res.status(401).json({error: 'You are not authorized to view this user profile.'});
     }
     */


    Network.aggregate([{"$match": {"host": mongoose.Types.ObjectId(userId)}},

            {
                $lookup: {
                    from: "users",
                    localField: "guest",
                    foreignField: "_id",
                    as: "user_guest"
                }
            }, {$unwind: "$user_guest"},

            {
                $lookup: {
                    from: "networks",
                    localField: "guest",
                    foreignField: "host",
                    as: "hosts"
                },

            },
            {
                "$project": {
                    "id": 1,
                    "user_guest": 1,
                    "contain": 1,
                    "hosts": {
                        "$filter": {
                            "input": "$hosts",
                            "as": "host",
                            "cond": {"$eq": ["$$host.guest", mongoose.Types.ObjectId(userId)]}
                        }
                    }
                }
            }
        ], function (err, hosts) {
            if (err) {
                console.log(err);
                res.status(500).send({error: err});
                return next(err);
            }
            var final = [];

            for (var i in hosts) {
                var user_guest = hosts[i]['user_guest'];
                var abos = hosts[i].hosts.length > 0;

                final.push(require('../helpers').setUserInfoNetwork(user_guest, true, abos));

            }


            return res.status(200).json({followers: final, count_abos: final.length});
        }
    );


};
exports.getAllNetworkHost = getAllNetworkHost;

var retreiveAllNetworkHost = function (req, res, next) {
    const userId = req.params.userId;
    /*
     if (req.user._id.toString() !== userId) {
     return res.status(401).json({error: 'You are not authorized to view this user profile.'});
     }
     */
    Network.aggregate([{"$match": {"host": mongoose.Types.ObjectId(userId)}},

            {
                $lookup: {
                    from: "users",
                    localField: "guest",
                    foreignField: "_id",
                    as: "user_guest"
                }
            }, {$unwind: "$user_guest"},

            {
                $lookup: {
                    from: "networks",
                    localField: "guest",
                    foreignField: "host",
                    as: "hosts"
                },

            },
            {
                "$project": {
                    "id": 1,
                    "user_guest": 1,
                    "contain": 1,
                    "hosts": {
                        "$filter": {
                            "input": "$hosts",
                            "as": "host",
                            "cond": {"$eq": ["$$host.guest", mongoose.Types.ObjectId(userId)]}
                        }
                    }
                }
            }
        ], function (err, hosts) {
            if (err) {
                return (err);

            }
            var final = [];

            for (var i in hosts) {
                var user_guest = hosts[i]['user_guest'];
                var abos = hosts[i].hosts.length > 0;

                final.push(require('../helpers').setUserInfoNetwork(user_guest, true, abos));

            }

            var return_data = {followers: final, count_abos: final.length};

            return next(return_data);
        }
    );


};

exports.retreiveAllNetworkHost = retreiveAllNetworkHost;

var getAllNetworkGuest = function (req, res, next) {
    const userId = req.params.userId;
    /*
     if (req.user._id.toString() !== userId) {
     return res.status(401).json({error: 'You are not authorized to view this user profile.'});
     }
     */


    Network.aggregate([{"$match": {"guest": mongoose.Types.ObjectId(userId)}},

            {
                $lookup: {
                    from: "users",
                    localField: "host",
                    foreignField: "_id",
                    as: "user_host"
                }
            }, {$unwind: "$user_host"},

            {
                $lookup: {
                    from: "networks",
                    localField: "host",
                    foreignField: "guest",
                    as: "guests"
                },

            },
            {
                "$project": {
                    "id": 1,
                    "user_host": 1,
                    "contain": 1,
                    "guests": {
                        "$filter": {
                            "input": "$guests",
                            "as": "guest",
                            "cond": {"$eq": ["$$guest.host", mongoose.Types.ObjectId(userId)]}
                        }
                    }
                }
            }
        ], function (err, guest) {
            if (err) {
                console.log(err);
                res.status(500).send({error: err});
                return next(err);
            }
            var final = [];

            for (var i in guest) {
                var user_guest = guest[i]['user_host'];
                var follow = guest[i].guests.length > 0;

                final.push(require('../helpers').setUserInfoNetwork(user_guest, follow, true));

            }


            return res.status(200).json({abos: final, count_abos: final.length});
        }
    );


};
exports.getAllNetworkGuest = getAllNetworkGuest;


var retrieveAllNetworkGuest = function (req, res, next) {
    const userId = req.params.userId;
    /*
     if (req.user._id.toString() !== userId) {
     return res.status(401).json({error: 'You are not authorized to view this user profile.'});
     }
     */


    Network.aggregate([{"$match": {"guest": mongoose.Types.ObjectId(userId)}},

            {
                $lookup: {
                    from: "users",
                    localField: "host",
                    foreignField: "_id",
                    as: "user_host"
                }
            }, {$unwind: "$user_host"},

            {
                $lookup: {
                    from: "networks",
                    localField: "host",
                    foreignField: "guest",
                    as: "guests"
                },

            },
            {
                "$project": {
                    "id": 1,
                    "user_host": 1,
                    "contain": 1,
                    "guests": {
                        "$filter": {
                            "input": "$guests",
                            "as": "guest",
                            "cond": {"$eq": ["$$guest.host", mongoose.Types.ObjectId(userId)]}
                        }
                    }
                }
            }
        ], function (err, guests) {
            if (err) {
                console.log(err);
                return next(err);
            }
            var final = [];

            for (var i in guests) {
                var user_guest = guests[i]['user_host'];
                var follow = guests[i].guests.length > 0;

                final.push(require('../helpers').setUserInfoNetwork(user_guest, follow, true));

            }

            return next({abos: final, count_abos: final.length});
        }
    );


};
exports.retrieveAllNetworkGuest = retrieveAllNetworkGuest;

exports.removeFollower = function (req, res, next) {
    if (!req.body.id_user) {
        return res.status(500).json({error: "id_user  is required."});
    }
    if (!req.body.id_user_external) {
        return res.status(500).json({error: "id_user_exter  is required."});
    }

    /*
     if (req.user._id.toString() !== userId) {
     return res.status(401).json({error: 'You are not authorized to view this user profile.'});
     }
     */


    Network.remove({
            host: mongoose.Types.ObjectId(req.body.id_user_external),
            guest: mongoose.Types.ObjectId(req.body.id_user),
        },
        function (err, data) {
            if (err) {
                console.log(err);
                return next(err);
            }
            User.findById(mongoose.Types.ObjectId(req.body.id_user_external), (err, user) => {
                if (err) {
                    res.status(400).json({error: 'No user could be found for this ID.'});
                    return next(err);
                }
                req.params = {};
                req.params.userId = req.body.id_user_external;
                retreiveAllNetworkHost(req, res, function (abos) {
                    retrieveAllNetworkGuest(req, res, function (follow) {
                        const userToReturn = require('../helpers').setUserInfo(user);
                        return res.status(200).json({user: userToReturn, network: {abos, follow}});
                    });

                })


            })
        });
};
exports.addFollower = function (req, res, next) {
    if (!req.body.id_user) {
        return res.status(500).json({error: "id_user  is required."});
    }
    if (!req.body.id_user_external) {
        return res.status(500).json({error: "id_user_exter  is required."});
    }

    /*
     if (req.user._id.toString() !== userId) {
     return res.status(401).json({error: 'You are not authorized to view this user profile.'});
     }
     */

    var net = new Network();
    net.host = mongoose.Types.ObjectId(req.body.id_user_external);
    net.guest = mongoose.Types.ObjectId(req.body.id_user);
    net.save(
        function (err, data) {
            if (err) {
                console.log(err);
                return next(err);
            }
            User.findById(mongoose.Types.ObjectId(req.body.id_user_external), (err, user) => {
                if (err) {
                    res.status(400).json({error: 'No user could be found for this ID.'});
                    return next(err);
                }
                req.params = {};
                req.params.userId = req.body.id_user_external;
                retreiveAllNetworkHost(req, res, function (abos) {
                    retrieveAllNetworkGuest(req, res, function (follow) {
                        const userToReturn = require('../helpers').setUserInfo(user);
                        return res.status(200).json({user: userToReturn, network: {abos, follow}});
                    });

                })


            })
        });
};



