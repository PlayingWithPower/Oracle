const mongoose = require('mongoose');

var deck = new mongoose.Schema({
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
});
// Columns are:
        // Has Primer
        // Deck Type: (Proactive, Adaptive, Disruptive)
        // Deck Name
        // Deck Link
        // Commander Name
        // Description
        // Color Identity
        // Discord Link
        // Authors
        // Date Added

module.exports = mongoose.model('Decks', deck);