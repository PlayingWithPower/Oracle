/**
 * Deck Object
 *
 * Functionality for decks and deck aliases.
 */
module.exports = {

    /**
     * Returns a list of all Deck Aliases registered to the server
     */
    listDecks() {

    },
    /**
     * Returns a list of all User submitted decks registered to the server.
     */
    listUserDecks() {

    },

    /**
     * Returns stats about a deck alias
     */
    deckStats() {

    },

    /**
     * Returns stats about a user submitted deck.
     */
    userDeckStats() {

    },

    /**
     * Registers a new Deck Alias into the server.
     */
    registerAlias() {

    },

    /**
     * Adds a new User deck to the server.
     */
    addDeck(receivedMessage, args) {
        console.log(args)
        const user = require('../Schema/Deck')
        //user({'_id' : "<@!" + receivedMessage.author.id +">", '_name' : receivedMessage.author.username, '_elo' : 1000, '_wins' : 0, '_losses' : 0}).save(function(err, result){
        let query = {'_name': args, '_alias': "", '_user': receivedMessage.author.username, '_server': "PWP", '_season': "1"}
        user(query).save(function(err, res){
            console.log(res)
        })
    },

    /**
     * Seed the server with an initial list of Deck Aliases.
     */
    populateDecks() {

    }
}