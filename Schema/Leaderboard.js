const mongoose = require('mongoose');

var leaderboard = new mongoose.Schema({
    _player: String,
    _server: String,
    _season: String,
    _points_gained: String,
    _points_lost: String,
    _games: Number,
    _wins: Number,
    _losses: Number,
    _points: Number,
});

module.exports = mongoose.model('Leaderboard', leaderboard);