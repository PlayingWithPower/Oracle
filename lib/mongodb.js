//Establishes a "user" object and connects this object to the Users collection
const mongoose = require('mongoose');

var user = new mongoose.Schema({
    _id: String,
    _name: String,
    _elo: Number
});

module.exports = mongoose.model('Users', user);