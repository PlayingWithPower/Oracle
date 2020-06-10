const mongoose = require('mongoose');

var match = new mongoose.Schema({
    _match_id: String,
    _server: String,
    _season: String,
    _player1: String,
    _player2: String,
    _player3: String,
    _player4: String,
    _player1Deck: String,
    _player2Deck: String,
    _player3Deck: String,
    _player4Deck: String,
});

module.exports = mongoose.model('Matches', match);