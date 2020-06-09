const mongoose = require('mongoose');

var match = new mongoose.Schema({
    _match_id: String,
    _server: String,
    _season: String,
    _player1: String,
    _player2: String,
    _player3: String,
    _player4: String,
});

module.exports = mongoose.model('Matches', match);