const mongoose = require('mongoose');

var deck = new mongoose.Schema({
    _name: String,
    _alias: String,
    _user: String,
    _server: String,
    _season: String,
});

module.exports = mongoose.model('Decks', deck);