/**
 * User Object
 *
 * All user based functionality.
 */

const Alias = require('../Schema/Alias')
const Deck = require('../Schema/Deck')
const { User } = require('discord.js')

module.exports = {

    /**
     * Get user league profile
     */
    profile(receivedMessage, args, callback) {
        const user = require('../Schema/Users')
        let query = {
            _mentionValue: "<@!"+receivedMessage.author.id+">",
            _server: receivedMessage.guild.id
        }
        console.log(query)
        user.findOne(query, function(err, res){
            //console.log(res)
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

        let findQuery = {
            _mentionValue: "<@!"+receivedMessage.author.id+">",
            _server: receivedMessage.guild.id
        }
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

        //Cleaning arguments and testing if they exist
        let argsWithCommas = args.toString()
        let argsWithSpaces = argsWithCommas.replace(/,/g, ' ');
        let argsLowerCase = argsWithSpaces.toLowerCase()
        let splitArgs = argsLowerCase.split(" | ")

        //Cleaning up deckname and aliasname
        let deckname = splitArgs[0]
        let deckNameFormatted = deckname.toLowerCase().split(' ').map(function(word) {
            return word[0].toUpperCase() + word.substr(1);
        }).join(' ');

        let aliasName
        let aliasNameFormatted
        try {
            aliasName = splitArgs[1]

            aliasNameFormatted = aliasName.toLowerCase().split(' ').map(function(word) {
                return word[0].toUpperCase() + word.substr(1);
            }).join(' ');
        }catch{
            aliasName = ""
            aliasNameFormatted = ""
        }

        //Queries
        let deckQuery = {_alias: argsLowerCase}
        let aliasQuery = {_name: ""}

        let userQuery = {_deck: {$elemMatch:{Deck:argsLowerCase}}}
        let findingUserQuery = {_mentionValue: "<@!"+receivedMessage.author.id+">", _server: server}
        let idQuery = {_mentionValue: "<@!"+receivedMessage.author.id+">"}
        let addToSet = {$addToSet: {_deck: [{'_id': 0,'Deck': deckNameFormatted, "Alias": aliasNameFormatted, "Wins":0, "Losses":0}]}}
        let singleArgAddToSett = {_currentDeck:deckNameFormatted, $addToSet: {_deck: [{'_id': 1,'Deck': deckNameFormatted, "Alias": deckNameFormatted, "Wins":0, "Losses":0}]}}

        if (splitArgs.length == 1){
            alias.findOne({_name: deckNameFormatted, _server: server}, function(err, deckSearchRes){
                if (deckSearchRes){
                    callback("Found from deck name")
                    user.find(findingUserQuery, function(err, userResult){
                        if (userResult){
                            user.updateOne(idQuery, singleArgAddToSett, function(err, addingResult){
                                if (addingResult){
                                    callback("Successfully added " + "**"+deckNameFormatted+"**"
                                    + " to " + "**"+receivedMessage.author.username+"**" + "'s profile")
                                }
                                else{
                                    callback("Error adding deck")
                                }
                            })
                        }
                        else{
                            callback("Error finding user")
                        }
                    })
                }
                else{
                    callback("Error. Try again with the format !use <DeckName> | <Alias>. Ex: !use Godo | Godo.")
                }
            })
        }
        else if (splitArgs[1] == undefined || splitArgs.length > 2){
            callback("Error. Try again with the format !use <DeckName> | <Alias>. Ex: !use Godo | Godo.")
        }
        else{
            alias.findOne({_name: aliasNameFormatted, _server: server}, function(err, aliasSearchRes){
                if (aliasSearchRes){
                    callback("Found from alias name")
                }
                else{
                    callback("Not found in alias")
                }
            })
        }
        // deck.findOne(deckQuery, function(err, firstres){
        //     if (firstres){
        //         user.findOne(userQuery, function(err, res){
        //             if (res){
        //                 name = firstres._name.toString()
        //                 let toSet = {$set: {_currentDeck: name}}
        //                 let addToArray = {$addToSet: {_deck: [{'_id': 0,'Deck': cleanedArg, "Wins":0, "Losses":0}]}}
        //                 user.updateOne(updateQuery, toSave, function(err, res){
        //                     if (res){
        //                         callback(name)
        //                     }
        //                     else{
        //                         callback("Error: 3")
        //                     }
        //                 })
        //             }
        //             else{
        //                 callback("Error: 2")
        //             }
        //         })
        //     }
        //     else{
        //         callback("Error: 1")
        //     }
        // })
    }
}
