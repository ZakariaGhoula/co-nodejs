const Network = require('../models/network');
const User = require('../models/user');

var mongoose = require('mongoose');

<<<<<<< Updated upstream

// get ALL seasonal products by lng
exports.getAllNetworkHost = function (req, res, next) {
    const userId = req.params.userId;
/*
    if (req.user._id.toString() !== userId) {
        return res.status(401).json({error: 'You are not authorized to view this user profile.'});
    }
  */


   Network.aggregate([
        {
            $lookup:
            {
                from: "users",
                localField: "host",
                foreignField: "_id",
                as: "user_host"
            }
        } , {
               $unwind: "$user_host"
           },
       {
           $lookup:
           {
               from: "users",
               localField: "guest",
               foreignField: "_id",
               as: "user_guest"
           }
       }
       , {
               $unwind: "$user_guest"
           }
    ],function (err, hosts) {
            if (err) {
                console.log(err);
                res.status(500).send({ error: err });
                return next(err);
            }

       return res.status(200).json({ final: hosts });
        }
    );


    /* Network.find({},function (err, hosts) {
        if (err) {
            console.log(err);
            res.status(500).send({ error: err });
            return next(err);
        }
for(var i in hosts){

    Network.update({_id: hosts[i]._id},
        {
            $set: {
                host: mongoose.Types.ObjectId(hosts[i].host),
                guest: mongoose.Types.ObjectId(hosts[i].guest),

            }}
    ).exec();
    console.log(mongoose.Types.ObjectId(hosts[i].host));
}

        return res.status(200).json({ hosts: hosts });
    }
    );*/
};
=======
>>>>>>> Stashed changes
