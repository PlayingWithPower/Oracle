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
        const user = require('../Schema/Seasons')
        if(new RegExp("([a-zA-Z0-9]+://)?([a-zA-Z0-9_]+:[a-zA-Z0-9_]+@)?([a-zA-Z0-9.-]+\\.[A-Za-z]{2,4})(:[0-9]+)?(/.*)?").test(args)) {
        console.log("url inside")
        }
        const args2 = args.toString()
        let query = {'_name': args2, '_alias': "", '_user': receivedMessage.author.username, '_server': "PWP", '_season': "1"}
        let someQuery = {'_id': "test",'_server': "test", '_season_name': "test"}
        user(someQuery).save(function(err, res){
            console.log(res)
        })
    },

    /**
     * Seed the server with an initial list of Deck Aliases.
     */
    populateDecks() {

    }
}