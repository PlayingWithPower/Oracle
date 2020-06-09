const mongoose = require('mongoose');

var season = new mongoose.Schema({
    _server: String,
    _season_name: String,
    _season_start: Date,
    _season_end: Date,
});

module.exports = mongoose.model('Seasons', season);