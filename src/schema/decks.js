const mongoose = require('mongoose')

var decks = new mongoose.Schema({
  _link: String,
  _name: String,
  _alias: String,
  _commander: String,
  _colors: String,
  _author: String,
  _server: String,
  _description: String,
  _discordLink: String,
  _dateAdded: String,
  _deckType: String,
  _hasPrimer: Boolean
})
module.exports = mongoose.model('Decks', decks)
