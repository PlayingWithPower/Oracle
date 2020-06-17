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
    useDeck(receivedMessage, args, callback){
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

        let aliasFindQuery = {_name: aliasNameFormatted, _server: receivedMessage.guild.id}
        let singleArgAliasFindQuery = {_name: deckNameFormatted, _server: receivedMessage.guild.id}

        let findingUserQuery = {_mentionValue: "<@!"+receivedMessage.author.id+">", _server: receivedMessage.guild.id}
        let idQuery = {_mentionValue: "<@!"+receivedMessage.author.id+">"}

        let addToSet = {$addToSet: {_deck: [{'_id': 0,'Deck': deckNameFormatted, "Alias": aliasNameFormatted, "Wins":0, "Losses":0}]}}
        let singleArgAddToSett = {_currentDeck:deckNameFormatted, $addToSet: {_deck: [{'_id': 1,'Deck': deckNameFormatted, "Alias": deckNameFormatted, "Wins":0, "Losses":0}]}}

        let updateCurrent = {_currentDeck: aliasNameFormatted}
        let singleArgUpdateCurrent = {_currentDeck: deckNameFormatted}

        let dupQuery = {_mentionValue: "<@!"+receivedMessage.author.id+">", _server: receivedMessage.guild.id, _deck: {$elemMatch:{Alias:aliasNameFormatted}}}
        let singleArgDupQuery = {_mentionValue: "<@!"+receivedMessage.author.id+">", _server: receivedMessage.guild.id, _deck: {$elemMatch:{Alias:deckNameFormatted}}}

        if (splitArgs.length == 1){
            user.findOne(findingUserQuery, function(err, userResult){
                if (userResult){
                    alias.findOne(singleArgAliasFindQuery, function(err, aliasSearchRes){
                        if (aliasSearchRes){
                            user.findOne(singleArgDupQuery, function(err, checkDupResult){
                                if (checkDupResult){
                                    user.updateOne(idQuery, singleArgUpdateCurrent, function(err, addingResult){
                                        if (addingResult){
                                            let callBackArray = new Array();
                                            callBackArray.push("4")
                                            callBackArray.push(deckNameFormatted)
                                            callback(callBackArray)
                                        }else{
                                            callback("3")
                                        }
                                    }) 
                                }
                                else{
                                    user.updateOne(idQuery, singleArgAddToSett, function(err, addingResult){
                                        if (addingResult){
                                            let callBackArray = new Array();
                                            callBackArray.push("4")
                                            callBackArray.push(deckNameFormatted)
                                            callback(callBackArray)
                                        }else{
                                            callback("3")
                                        }
                                    }) 
                                }
                            })
                             
                        }
                        else{
                            let callBackArray = new Array();
                            callBackArray.push("2")
                            callBackArray.push(deckNameFormatted)
                            callback(callBackArray)
                        }
                    })
                    
                }else{
                    callback("1")
                }
            })
        }
        else if (splitArgs[1] == undefined || splitArgs.length > 2){
            callback("Error. Try again with the format !use <DeckName> | <Alias>. Ex: !use Godo | Godo.")
        }
        else{
            user.findOne(findingUserQuery, function(err, userResult){
                if (userResult){
                    alias.findOne(aliasFindQuery, function(err, aliasSearchRes){
                        if (aliasSearchRes){
                            user.findOne(dupQuery, function(err, checkDupResult){
                                if (checkDupResult){
                                    user.updateOne(idQuery, updateCurrent, function(err, addingResult){
                                        if (addingResult){
                                            let callBackArray = new Array();
                                            callBackArray.push("4")
                                            callBackArray.push(aliasNameFormatted)
                                            callback(callBackArray)
                                        }else{
                                            callback("3")
                                        }
                                    }) 
                                }
                                else{
                                    user.updateOne(idQuery, addToSet, function(err, addingResult){
                                        if (addingResult){
                                            let callBackArray = new Array();
                                            callBackArray.push("4")
                                            callBackArray.push(aliasNameFormatted)
                                            callback(callBackArray)
                                        }else{
                                            callback("3")
                                        }
                                    }) 
                                }
                            })
                             
                        }
                        else{
                            let callBackArray = new Array();
                            callBackArray.push("2")
                            callBackArray.push(aliasNameFormatted)
                            callback(callBackArray)
                        }
                    })
                    
                }else{
                    callback("1")
                }
            })
            
        }
    }
}
