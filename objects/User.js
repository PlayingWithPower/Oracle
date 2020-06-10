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
        /**
         * TODO: Check if the deck they are using is a real deck 
         */
        const user = require('../Schema/Users')
        let findQuery = {_name: receivedMessage.author.username}
        let toSave = {$set: {_currentDeck: "test"}}
        user.updateOne(findQuery, toSave, function(err, res){
            console.log(res)
        })
    }
}