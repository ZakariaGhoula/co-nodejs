'use strict';

var mongoose = require('mongoose');

var conversationSchema = mongoose.Schema({
    id: { type: String, unique: true },
    private: Boolean,
    between: Array,
    time: String
});

module.exports = mongoose.model('Conversation', conversationSchema);