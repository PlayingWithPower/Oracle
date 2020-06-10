const mongoose = require('mongoose');

var user = new mongoose.Schema({
    _id: String,
    _server: String,
    _season: String,
    _name: String,
    _currentDeck: String,
    _elo: Number,
    _wins: Number,
    _losses: Number
    
});

module.exports = mongoose.model('Users', user);