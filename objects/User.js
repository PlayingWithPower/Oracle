/**
 * User Object
 *
 * All user based functionality.
 */

const Alias = require('../Schema/Alias')

module.exports = {

    /**
     * Get user league profile
     */
    profile(receivedMessage, args, callback) {
        const user = require('../Schema/Users')
        let query = {_id: "<@!"+receivedMessage.author.id+">"}
        user.findOne(query, function(err, res){
            callback(res)
        })
    },
  
    /**
     * Shows recent matches
     */
    recent() {

    },
    /**
     * Adds a deck to your deck collection
     * TODO: Output spits out like "kess storm" instead of "Kess Storm"... small but if someone has time
     */ 
    addToCollection(receivedMessage, args, callback){
        //will add to my account even if I change the find query... weird
        const user = require('../Schema/Users')
        const deck = require('../Schema/Deck')

        var sanitizedString = ""
        var cleanedArg = ""
        args.forEach(arg => {
            sanitizedString = sanitizedString + " " + arg
        });
        cleanedArg = sanitizedString.slice(1)

        let findQuery = {_id: "<@!"+receivedMessage.author.id+">"}
        let updateQuery = {$addToSet: {_deck: [[cleanedArg,0,0]]}}
        let aliasCheckQuery = {_alias: cleanedArg}

        deck.findOne(aliasCheckQuery, function(err, res){
            if (res){
                user.findOne(findQuery, function(err, res){
                    if (res) {
                        user.updateOne(findQuery,updateQuery, function(err, res){
                            if (res) {
                                callback("Successfully added " + "**"+cleanedArg+"**"
                                + " to " + "**"+receivedMessage.author.username+"**" + "'s profile")
                            }
                            else {
                                callback("Error: 2")
                            }
                        })
                    }
                    else {
                        callback("User not found. Try registering first !register")
                    }
                })
            }
            else{
                callback("Alias not registered. Try !listdecks to see available decks")
            }
        })
    },
    
    /** 
     * Lists your deck collection
    */
    listCollection(receivedMessage, args, callback){
        const user = require('../Schema/Users')
        let query = {_name: receivedMessage.author.username}
        user.findOne(query, function(err, res){
            callback(res)
        })
    },

    /**
     * Returns currently registered Deck name
     * TODO: Check against user's collection of decks! You can !use gitrog if it's not in your collection
     */
    currentDeck(receivedMessage, args, callback) {
        /**
         */
        const user = require('../Schema/Users')
        const deck = require('../Schema/Deck')
        const alias = require('../Schema/Alias')
        const callBackArray = new Array()

        let findQuery = {_id: "<@!"+receivedMessage.author.id+">"}
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
