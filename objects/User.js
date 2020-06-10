/**
 * User Object
 *
 * All user based functionality.
 */

module.exports = {

    /**
     * Get user league profile
     */
    profile(receivedMessage, args) {
        const user = require('../Schema/Users')
        let query = {_name: receivedMessage.author.username}
        user.findOne(query, function(err, res){
            console.log(res)
        })
    },

    /**
     * Shows recent matches
     */
    recent() {

    },

    /**
     * Shows currently registered Deck and Alias
     */
    currentDeck() {

    },
    /**
     * Sets the users current Deck
     */
    useDeck(){
        const user = require('../Schema/Users')
        let query = {_name: receivedMessage.author.username}
        user(someQuery).save(function(err, res){
            console.log(res)
        })
    }
}