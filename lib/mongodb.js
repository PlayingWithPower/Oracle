const mongoose = require('mongoose');

var user = new mongoose.Schema({
    _id: String,
    _name: String
});

module.exports = mongoose.model('Users', user);