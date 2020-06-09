const mongoose = require('mongoose');

var alias = new mongoose.Schema({
   _name: String,
});

module.exports = mongoose.model('Aliases', alias);