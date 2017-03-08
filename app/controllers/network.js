const Network = require('../models/network');
const User = require('../models/user');

var setUserInfoNetwork = require('../helpers').setUserInfoNetwork;
var mongoose = require('mongoose');
var async = require('async');


// get ALL seasonal products by lng
exports.getAllNetworkHost = function (req, res, next) {
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
            },{ $unwind : "$user_guest" },

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

              final.push(setUserInfoNetwork(user_guest, true, abos));

            }


            return res.status(200).json({abos: final,count_abos: final.length});
        }
    );



};
exports.retreiveAllNetworkHost = function (req, res, next) {
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
            },{ $unwind : "$user_guest" },

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
                return(err);

            }
            var final = [];

            for (var i in hosts) {
                var user_guest = hosts[i]['user_guest'];
                var abos = hosts[i].hosts.length > 0;

              final.push(setUserInfoNetwork(user_guest, true, abos));

            }

           var return_data = {abos: final,count_abos: final.length};

            return next(return_data);
        }
    );



};



exports.getAllNetworkGuest = function (req, res, next) {
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
            },{ $unwind : "$user_host" },

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

              final.push(setUserInfoNetwork(user_guest,follow , true));

            }


            return res.status(200).json({followers: final,count_abos: final.length});
        }
    );



};



exports.retrieveAllNetworkGuest = function (req, res, next) {
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
            },{ $unwind : "$user_host" },

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

               final.push(require('../helpers').setUserInfoNetwork(user_guest,follow , true));

            }

        return next({followers: final,count_abos: final.length});
        }
    );



};


