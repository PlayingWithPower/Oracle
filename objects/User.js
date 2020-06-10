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
         * TODO: Basic checking against the alias DB is being made, but more work needs to be done
         * EX: typing is $use gitrog will not set your deck but $use Gitrog will. 
         * Case sensitivity work needs to be done
         */
        const user = require('../Schema/Users')
        const alias = require('../Schema/Alias')
        let argsWithCommas = args.toString()
        let argsWithSpaces = argsWithCommas.replace(/,/g, ' ');

        let findQuery = {_name: argsWithSpaces}
        let updateQuery = {_name: receivedMessage.author.username}
        let toSave = {$set: {_currentDeck: argsWithSpaces}}

        // console.log("DEBUG: \nargs as entered: " + args + '\n' + "args with commas to string: " + argsWithCommas
        // + '\n' + "args with spaces to string " + argsWithSpaces)
        alias.findOne(findQuery, function(err, res){
            if (res){
                user.updateOne(updateQuery, toSave, function(err, res){
                    if (res){
                        callback(argsWithSpaces)
                    }
                    else{
                        callback("Error")
                    }
                })
            }
            else{
                callback("Error")
            }
        })
    }
}