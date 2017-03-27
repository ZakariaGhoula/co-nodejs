'use strict';

var mongoose = require('mongoose');

var messageSchema = mongoose.Schema({
    id: String,
    conversationId: String,
    userId: String,
    content: Object,
    read: {type: Boolean, default: false},
    time: String
});

module.exports = mongoose.model('Message', messageSchema);