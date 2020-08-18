const mongoose = require('mongoose')

var match = new mongoose.Schema({
  _match_id: String,
  _server: String,
  _season: String,
  _player1: String,
  _player2: String,
  _player3: String,
  _player4: String,
  _player1Deck: String,
  _player2Deck: String,
  _player3Deck: String,
  _player4Deck: String,
  _Status: String,
  _player1Confirmed: String,
  _player2Confirmed: String,
  _player3Confirmed: String,
  _player4Confirmed: String,
  _player1Rogue: String,
  _player2Rogue: String,
  _player3Rogue: String,
  _player4Rogue: String
})

module.exports = mongoose.model('Matches', match)
