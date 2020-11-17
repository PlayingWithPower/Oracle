const mongoose = require('mongoose');
const { stringify } = require('querystring');

var config = new mongoose.Schema({
    _server: String,
    _player_threshold: String,
    _deck_threshold: String,
    _points_lost: String,
    _points_gained: String,
    _timeout: String,
    _admin: Array
});

module.exports = mongoose.model('Config', config);