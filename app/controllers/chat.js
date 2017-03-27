var Conversation = require('../models/Conversation');
var Message = require('../models/Message');
var bodyparser = require('body-parser');

module.exports = function (router) {
    router.use(bodyparser.json());


    // this route returns all channels including private channels for that user
    router.get('/conversations/:id', function (req, res) {

        Conversation.aggregate([{"$match": {"between": {"$in": [parseInt(req.params.id)]}}},
            {
                "$lookup": {
                    "from": "messages",
                    "localField": "id",
                    "foreignField": "conversationID",
                    "as": "messages"
                }
            }, {"$sort": {"time": -1}}
        ], function (err, data) {
            if (err) {
                console.log(err);
                return res.status(500).json({msg: 'internal server error'});
            }

            res.json(data);
        });
    });

    router.get('/conversation/by-token', function (req, res) {
            var token = req.headers.token;
            //-- list id conversation id user
            Message.find(
                {
                    "user.token": {"$eq": token}
                }, {
                    id: 1,
                    conversationID: 1,
                    text: 1,
                    user: 1,
                    time: 1,
                    read: 1,
                    _id: 0
                }
                , function (err, data) {
                    if (err) {
                        console.log(err);
                        return res.status(500).json({msg: 'internal server error'});
                    }

                    if (data.length > 0) {
                        var id_user = null;//data[0].id_user[0];

                        if (typeof data[0] !== "undefined" && data[0] != null
                            && typeof data[0].user !== "undefined" && data[0].user.id != null) {
                            id_user = data[0].user.id;
                        }

                        if (id_user != null) {

                            console.log(id_user);
                            Conversation.aggregate([{"$match": {"between": {"$in": [parseInt(id_user)]}}},

                                {
                                    "$lookup": {
                                        "from": "messages",
                                        "localField": "id",
                                        "foreignField": "conversationID",
                                        "as": "messages"
                                    }
                                }, {"$sort": {"time": -1}}
                            ], function (err2, data2) {
                                if (err) {
                                    console.log(err2);
                                    return res.status(500).json({msg: 'internal server error'});
                                }

                                res.json(data2);
                            });

                        }
                        else {
                            res.json(null)
                        }


                    }
                    else
                        res.json(null);


                }
            )
            ;

        }
    )
    ;

    router.get('/conversations/get/:id_conversation', function (req, res) {

        Conversation.aggregate([{"$match": {"$or": [{"id": req.params.id_conversation}]}},

            {
                "$lookup": {
                    "from": "messages",
                    "localField": "id",
                    "foreignField": "conversationID",
                    "as": "messages"
                }
            }, {
                "$sort": {"time": -1}
            }, {"$limit": 1}
        ], function (err, data) {
            if (err) {
                console.log(err);
                return res.status(500).json({msg: 'internal server error'});
            }

            res.json({conversation: data});
        });
    });


    router.get('/conversations/get/:id1/:id2', function (req, res) {
        Conversation.aggregate(
            [{"$match": {"between": {"$all": [parseInt(req.params.id1), parseInt(req.params.id2)]}, "private": true}},
                {"$limit": 1}


            ], function (err, data) {
                if (err) {
                    console.log(err);
                    return res.status(500).json({msg: 'internal server error'});
                }

                res.json(data);
            });

    });
    router.get('/conversations/check_job_conversation/:id1/:id2/:id_job', function (req, res) {
        Conversation.aggregate(
            [{"$match": {"$and": [{"between": {"$all": [parseInt(req.params.id1), parseInt(req.params.id2)]}}, {"job_id": req.params.id_job}, {"private": true}]}}]

            , function (err, data) {
                if (err) {
                    console.log(err);
                    return res.status(500).json({msg: 'internal server error'});
                }
                if (data != null && data.length > 0) {
                    res.json({
                        "conversation_exist": true,
                        "between": [parseInt(req.params.id1), parseInt(req.params.id2)],
                        "job_id": req.params.id_job
                    })
                }
                else {
                    res.json({
                        "conversation_exist": false,
                        "between": [parseInt(req.params.id1), parseInt(req.params.id2)],
                        "job_id": req.params.id_job
                    })
                }

            });

    });
    router.get('/conversations/check_job_conversation_approuved/:id1/:id2', function (req, res) {
        Conversation.aggregate(
            [{"$match": {"$and": [{"between": {"$all": [parseInt(req.params.id1), parseInt(req.params.id2)]}}, {"approved": "1"}, {"private": true}]}}]

            , function (err, data) {
                if (err) {
                    console.log(err);
                    return res.status(500).json({msg: 'internal server error'});
                }
                if (data != null && data.length > 0) {
                    res.json({
                        "conversation_approved_exist": true,
                        "between": [parseInt(req.params.id1), parseInt(req.params.id2)],

                    })
                }
                else {
                    res.json({
                        "conversation_approved_exist": false,
                        "between": [parseInt(req.params.id1), parseInt(req.params.id2)],
                    })
                }

            });

    });




// post a new user to channel list db
    router.post('/conversations/new_conversation', function (req, res) {
        var newConversation = new Conversation(req.body);
        newConversation.save(function (err, data) {
            if (err) {
                console.log(err);
                return res.status(500).json({msg: 'internal server error'});
            }

            res.json({conversation: data});
        });
    });

    router.post('/conversations/update_conversation', function (req, res) {
        Conversation.update(
            {id: req.body.id},
            {
                $set: {
                    approved: req.body.approved,
                    time: req.body.time
                }
            }, function (err2, data) {
                res.json({result: data});
            }
        )

    });


}

module.exports = function (router) {
    router.use(bodyparser.json());


    // query DB for messages for a specific conversation
    router.get('/messages/:conversation', function (req, res) {
        Message.find({conversationID: req.params.conversation}, {
            id: 1,
            conversationID: 1,
            text: 1,
            user: 1,
            time: 1,
            read: 1,
            _id: 0
        }, function (err, data) {
            if (err) {
                console.log(err);
                return res.status(500).json({msg: 'internal server error'});
            }


            res.json(data);
        });
    });


    // updata DB for read messages for a specific conversation

    router.get('/messages/read/:id_conversation/:id_user', function (req, res) {
        var conditions = {
            "conversationID": req.params.id_conversation,
            "user.id": {"$eq": (parseInt(req.params.id_user))}
        }
            , update = {$set: {read: true}}
            , options = {multi: true};

        Message.update(conditions, update, options, callback);
        function callback(err, numAffected) {

            // numAffected is the number of updated documents
            Conversation.aggregate([{"$match": {$or: [{between: parseInt(req.params.id_user)}, {private: true}]}},
                {
                    "$lookup": {
                        "from": "messages",
                        "localField": "id",
                        "foreignField": "conversationID",
                        "as": "messages"
                    }
                }, {"$sort": {"time": -1}}
            ], function (err, data) {
                if (err) {
                    console.log(err);
                    return res.status(500).json({msg: 'internal server error'});
                }

                res.json({result: data});
            });
        }
    });


    //post a new message to db
    router.post('/message/add', function (req, res) {
        var newMessage = new Message(req.body);
        newMessage.save(function (err, data) {
            if (err) {
                console.log(err);
                return res.status(500).json({msg: 'internal server error'});
            }
            Conversation.update(
                {id: data.conversationID},
                {
                    $set: {
                        time: data.time
                    }
                }, function (err2, data) {
                    res.json({result: data});
                }
            )
        });
    });



    //-- query to get notification message header
    router.get('/notifications-messages', function (req, res) {
        var token = req.headers.token;
        //-- list id conversation id user
        Message.aggregate([
            {
                "$match": {
                    "user.token": {"$eq": token}
                }
            },
            {
                "$group": {
                    "_id": "$conversationID",
                    "id_user": {"$addToSet": "$user.id"}

                }


            }
        ], function (err, data) {
            if (err) {
                console.log(err);
                return res.status(500).json({msg: 'internal server error'});
            }
            if (data.length > 0) {
                var id_user = null;//data[0].id_user[0];

                if (typeof data[0] !== "undefined" && data[0] != null
                    && typeof data[0].id_user[0] !== "undefined" && data[0].id_user[0] != null) {
                    id_user = data[0].id_user[0];
                }
                /* var list_conversation = [];
                 data.map(function (conv, i) {
                 if (typeof conv.id_user[0] !== "undefined" && conv.id_user[0] != null) {
                 id_user = conv.id_user[0];
                 }
                 list_conversation.push(conv._id);
                 });
                 */
                if (id_user != null) {
                    Conversation.aggregate(
                        [{"$match": {"$or": [{"between": parseInt(id_user)}, {"private": true}]}},
                            {
                                "$lookup": {
                                    "from": "messages",
                                    "localField": "id",
                                    "foreignField": "conversationID",
                                    "as": "messages"
                                }
                            },
                            {
                                "$group": {
                                    "_id": "$id",
                                    "between":{"$push": "$between"},
                                    "messages": {
                                        "$addToSet": {
                                            "$filter": {
                                                "input": "$messages",
                                                "as": "mess",
                                                "cond": {"$and": [{"$ne": ["$$mess.user.id", id_user]}, {"$eq": ["$$mess.read", false]}]}
                                            }
                                        }
                                    }

                                }
                            }], function (err2, data2) {
                            if (err2) {
                                console.log(err2);
                                return res.status(500).json({msg: 'internal server error'});
                            }
                            var notification_message = {
                                'read': true
                                , "number": 0
                                , "number_read": 0
                            };
                            data2.map(function (conversation, i) {
                                if(conversation.between[0].length>0 && conversation.between[0].indexOf(id_user)!=-1) {
                                    if (typeof conversation.messages[0] !== "undefined" && conversation.messages[0].length > 0) {

                                        notification_message.number_read++;
                                        notification_message.read = false;
                                    }
                                    notification_message.number++;
                                }
                            });
                            res.json({"result":notification_message});
                        }
                    );
                }
                else {
                    res.json(null)
                }


            }
            else
                res.json(null)
        });


    });

    //--- update name message
    router.post('/account/update/name',function (req,res){
        var token = req.headers.token;
        var last_name = req.body.last_name;
        var first_name = req.body.first_name;

        var conditions = {
            "user.token": {"$eq": (token)}
        }
            , update = {$set: {"user.first_name": first_name,"user.last_name": last_name}}
            , options = {multi: true};

        Message.update(conditions, update, options, callback);
        function callback(err, numAffected) {
            res.json({"result":"yzq",'numAffected':numAffected});
        }
    });
}
