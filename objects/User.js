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
     * Returns currently registered Deck name
     */
    currentDeck(receivedMessage, args, callback) {
        /**
         */
        const user = require('../Schema/Users')
        const deck = require('../Schema/Deck')
        const alias = require('../Schema/Alias')
        const callBackArray = new Array()

        let findQuery = {_name: receivedMessage.author.username.toString()}

        user.findOne(findQuery, function(err, res){
            if (res) {
                let findQuery = {_alias: res._currentDeck.toLowerCase()}
                deck.findOne(findQuery, function(err, res){
                    if (res) {
                        callBackArray.push(res._link)
                        callBackArray.push(res._name)
                        callback(callBackArray)
                    }
                    else {
                        callback("Error: 2")
                    }
                })
            }
            else {
                callback("Error: 1")
            }
        })
    },
    /**
     * Sets the users current Deck
     */
    useDeck(receivedMessage, args, callback){
        /**
         * TODO: Basic checking against the alias DB is being made, but more work needs to be done
         */
        const user = require('../Schema/Users')
        const alias = require('../Schema/Alias')
        const deck = require('../Schema/Deck')
        

        let argsWithCommas = args.toString()
        let argsWithSpaces = argsWithCommas.replace(/,/g, ' ');

        let findQuery = {_alias: argsWithSpaces.toLowerCase()}
        let updateQuery = {_name: receivedMessage.author.username}
        

        // console.log("DEBUG: \nargs as entered: " + args + '\n' + "args with commas to string: " + argsWithCommas
        // + '\n' + "args with spaces to string " + argsWithSpaces)
        deck.findOne(findQuery, function(err, res){
            if (res){
                name = res._name.toString()
                let toSave = {$set: {_currentDeck: name}}
                user.updateOne(updateQuery, toSave, function(err, res){
                    if (res){
                        callback(name)
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
