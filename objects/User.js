/**
 * User Object
 *
 * All user based functionality.
 */

const Alias = require('../Schema/Alias')
const Deck = require('../Schema/Deck')

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
        const user = require('../Schema/Users')
        const deck = require('../Schema/Deck')

        var sanitizedString = ""
        var cleanedArg = ""
        args.forEach(arg => {
            sanitizedString = sanitizedString + " " + arg
        });
        cleanedArg = sanitizedString.slice(1)

        let findQuery = {_id: "<@!"+receivedMessage.author.id+">"}
        let updateQuery = {$addToSet: {_deck: [{'_id': 0,'Deck': cleanedArg, "Wins":0, "Losses":0}]}}
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
                                callback("Error. Unable to update collection. Please try again.")
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
        let query = {_name: receivedMessage.author.id}
        user.findOne(query, function(err, res){
            callback(res)
        })
    },
    
    /**
     * Returns currently registered Deck name
     */
    currentDeck(receivedMessage, args, callback) {
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
    useDeck(receivedMessage, args, server, callback){
        const user = require('../Schema/Users')
        const deck = require('../Schema/Deck')
        const alias = require('../Schema/Alias')
        
        console.log(server)

        let argsWithCommas = args.toString()
        let argsWithSpaces = argsWithCommas.replace(/,/g, ' ');
        let argsLowerCase = argsWithSpaces.toLowerCase()
        let splitArgs = argsLowerCase.split(" | ")

        let deckQuery = {_alias: argsLowerCase}
        let userQuery = {_deck: {$elemMatch:{Deck:argsLowerCase}}}
        let updateQuery = {_id: "<@!"+receivedMessage.author.id+">"}
        let aliasQuery = {_name: ""}

        // .toLowerCase()
        // .split(' ')
        // .map(function(word) {
            
        //     return word[0].toUpperCase() + word.substr(1);
        // })
        // .join(' ');

        // let saveToDeck = {_name: }
        
        if (splitArgs[1] == undefined || splitArgs.length > 2){
            callback("Incorrect format")
        }
        else{
            let deckname = splitArgs[0]
            let aliasName = splitArgs[1]

            alias.findOne({_name: aliasName, _server: server})
        }
        deck.findOne(deckQuery, function(err, firstres){
            if (firstres){
                user.findOne(userQuery, function(err, res){
                    if (res){
                        name = firstres._name.toString()
                        let toSet = {$set: {_currentDeck: name}}
                        let addToArray = {$addToSet: {_deck: [{'_id': 0,'Deck': cleanedArg, "Wins":0, "Losses":0}]}}
                        user.updateOne(updateQuery, toSave, function(err, res){
                            if (res){
                                callback(name)
                            }
                            else{
                                callback("Error: 3")
                            }
                        })
                    }
                    else{
                        callback("Error: 2")
                    }
                })
            }
            else{
                var deckSave = new deck()
                callback("Error: 1")
            }
        })
    }
}
