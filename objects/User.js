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
    useDeck(receivedMessage, args, callback){
        /**
         * TODO: Check if the deck they are using is a real deck (against alias)
         */
        const user = require('../Schema/Users')
        let argsWithCommas = args.toString()
        let argsWithSpaces = argsWithCommas.replace(/,/g, ' ');
        let findQuery = {_name: receivedMessage.author.username}
        let toSave = {$set: {_currentDeck: argsWithSpaces}}

        // console.log("DEBUG: \nargs as entered: " + args + '\n' + "args with commas to string: " + argsWithCommas
        // + '\n' + "args with spaces to string " + argsWithSpaces)

        user.updateOne(findQuery, toSave, function(err, res){
            if (res){
                callback(argsWithSpaces)
            }
            else{
                callback("Error")
            }
        })
    }
}