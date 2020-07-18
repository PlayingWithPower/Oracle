const mongoose = require('mongoose');

var season = new mongoose.Schema({
    _server: String,
    _season_name: String,
    _season_start: String,
    _season_end: String
});

module.exports = mongoose.model('Seasons', season);