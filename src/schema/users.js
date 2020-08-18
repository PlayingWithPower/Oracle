const mongoose = require('mongoose');

var user = new mongoose.Schema({
    _mentionValue: String,
    _server: String,
    _name: String,
    _currentDeck: String,
    _elo: Number,
    _wins: Number,
    _losses: Number,
    _deck: [{
        _id: Number,
        Deck: String,
        Alias: String,
        Wins: Number,
        Losses: Number
    }]
    //!listdecks shows all names of decks
    //!addcollection adds to your deck array ^
    //!collection lists your deck array ^
    //!use gitrog grabs from your collection
});

module.exports = mongoose.model('Users', user);