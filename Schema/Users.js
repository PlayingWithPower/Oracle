const mongoose = require('mongoose');

var user = new mongoose.Schema({
    _mentionValue: String,
    _server: String,
    _name: String,
    _currentDeck: String
});

module.exports = mongoose.model('Users', user);