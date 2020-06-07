const mongoose = require('mongoose');

var user = new mongoose.Schema({
    _id: String,
    _name: String,
    _elo: Number,
    _wins: Number,
    _losses: Number,
});

module.exports = mongoose.model('Users', user);