/**
 * User Object
 *
 * All user based functionality.
 */

const Alias = require('../Schema/Alias')
const Deck = require('../Schema/Decks')
const User = require('../Schema/Users')
const Matches = require('../Schema/Games')
const DeckHelper = require('../Helpers/DeckHelper')
const SeasonHelper = require('../Helpers/SeasonHelper')

module.exports = {

    /**
     * Get user league profile
     */
    async profile(receivedMessage, args) {
        
        var currentSeasonObj = await SeasonHelper.getCurrentSeason(receivedMessage.guild.id)
        var currentSeason = currentSeasonObj._season_name
        var lookUpID
        return new Promise((resolve, reject)=>{
            if (typeof args[0] === 'undefined'){
                args[0] = "Not Defined"
                lookUpID = receivedMessage.author.id
            }
            else{
                lookUpID = args[0].replace(/[<@!>]/g, '')
            }
            var conditionalQuery
            var passingResult
            var personLookedUp = ""
            var passedArray = new Array()
            
            //Query
            if (args[0] == "Not Defined"){
                personLookedUp = receivedMessage.author.id
                conditionalQuery = {_server: receivedMessage.guild.id, _season: currentSeason, _Status: "FINISHED", $or: 
                    [
                    {_player1: receivedMessage.author.id}, 
                    {_player2: receivedMessage.author.id},
                    {_player3: receivedMessage.author.id},
                    {_player4: receivedMessage.author.id},
                    ]
                }
            }
            else{
                personLookedUp = args[0].replace(/[<@!>]/g, '')
                conditionalQuery = {_server: receivedMessage.guild.id, _season: currentSeason, _Status: "FINISHED", $or: 
                    [
                    {_player1: args[0].replace(/[<@!>]/g, '')}, 
                    {_player2: args[0].replace(/[<@!>]/g, '')},
                    {_player3: args[0].replace(/[<@!>]/g, '')},
                    {_player4: args[0].replace(/[<@!>]/g, '')},
                    ]
                }
            }
            Matches.find(conditionalQuery, function(err, res){
                if (res){
                    passingResult = res
                }
                else{
                    resolve("Error 1")
                }
            }).then(function(passingResult){
                if (passingResult != ""){
                    var matchResults = []
                    for (var i=0; i <passingResult.length; i++){
                        var pasRes = passingResult[i]._player1Deck
                        if (passingResult[i]._player1Deck == "Rogue"){
                            pasRes = passingResult[i]._player1Rogue + " | Rogue"
                        }
                        if (passingResult[i]._player1 == personLookedUp){
                            var exists = matchResults.find(el => el[0] === pasRes)
                            if (exists) {
                                exists[1] += 1;
                              } else {
                                matchResults.push([pasRes, 1, 0]);
                              }
                        }

                        var pasRes = passingResult[i]._player2Deck
                        if (passingResult[i]._player2Deck == "Rogue"){
                            pasRes = passingResult[i]._player2Rogue + " | Rogue"
                        }
                        if (passingResult[i]._player2 == personLookedUp){
                        var exists2 = matchResults.find(el => el[0] === pasRes)
                        if (exists2) {
                            exists2[2] += 1;
                            } else {
                            matchResults.push([pasRes, 0, 1]);
                            } 
                        }

                        var pasRes = passingResult[i]._player3Deck
                        if (passingResult[i]._player3Deck == "Rogue"){
                            pasRes = passingResult[i]._player3Rogue + " | Rogue"
                        }
                        if (passingResult[i]._player3 == personLookedUp){
                        var exists3 = matchResults.find(el => el[0] === pasRes)
                        if (exists3) {
                            exists3[2] += 1;
                            } else {
                            matchResults.push([pasRes, 0, 1]);
                            }
                        }

                        var pasRes = passingResult[i]._player4Deck
                        if (passingResult[i]._player4Deck == "Rogue"){
                            pasRes = passingResult[i]._player4Rogue + " | Rogue"
                        }
                        if (passingResult[i]._player4 == personLookedUp){
                        var exists4 = matchResults.find(el => el[0] === pasRes)
                        if (exists4) {
                            exists4[2] += 1;
                            } else {
                            matchResults.push([pasRes, 0, 1]);
                            }
                        }
                    }
                    passedArray.push("Profile Look Up",matchResults, currentSeason, lookUpID)
                   
                }
                else{
                    passedArray.push("No On-Going Season", passingResult, lookUpID)
                }
            }).then(function(){
                let query = {_server: receivedMessage.guild.id, _mentionValue: lookUpID}
                User.findOne(query,function(err, res){
                    if (res){
                        passedArray.push(res._elo, res._currentDeck)
                        resolve(passedArray)
                    }
                    else{
                        resolve("Can't find user")
                    }
                })
            })
        })
    },
    sortFunction(a, b) {
        if (a[0] === b[0]) {
            return 0;
        }
        else {
            return (a[0] < b[0]) ? -1 : 1;
        }
    },
  
    /**
     * 
     * @param {Discord Message Object} message 
     * 
     * @returns {2D Array} Array of match Arrays sorted from most recent to least recent.
     * TODO: Server implementation
     */
    async recent(message, user = null, server = null) {
        gameArr = []
        const games = require('../Schema/Games')
        const seasonObj = await SeasonHelper.getCurrentSeason(message.guild.id)
        var seasonName = seasonObj._season_name
        if (user == null) {
            id = message.author.id
        }
        else {
            id = user.replace(/[<@!>]/g, '')
        }
        return new Promise((resolve, reject) => {
            if (server == null) {
                findQuery = {$and : [
                                        {
                                            $or: [
                                                {_player1: id},
                                                {_player2: id},
                                                {_player3: id},
                                                {_player4: id}
                                            ]
                                    },
                                    {
                                        _Status: "FINISHED"
                                    },
                                    {
                                        _server: message.guild.id,
                                        _season: seasonName
                                    }
                            ]
                }
            }
            else {
                findQuery = {
                    _Status: "FINISHED", 
                    _server: message.guild.id,
                    _season: seasonName
                }
            }
            games.find(findQuery).then((docs) => {
                docs.forEach((doc) => {
                    timestamp = doc._id.toString().substring(0,8)
                    date = new Date( parseInt( timestamp, 16 ) * 1000)
                    gameArr.push([date, doc._match_id, doc._server, doc._season, doc._player1, doc._player2, doc._player3, doc._player4, doc._player1Deck, doc._player2Deck, doc._player3Deck, doc._player4Deck, doc._Status, doc._player1Confirmed, doc._player2Confirmed, doc._player3Confirmed, doc._player4Confirmed,])
                });
            }).then(function() {
                gameArr.sort(module.exports.sortFunction)
                resolve(gameArr)
            });
        })

    },
    /**
     * Returns currently registered Deck name
     */
    currentDeck(receivedMessage, args, callback) {
        const user = require('../Schema/Users')
        const deck = require('../Schema/Decks')
        const alias = require('../Schema/Alias')
        const callBackArray = new Array()

        let findQuery = {
            _mentionValue: receivedMessage.author.id,
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
    useDeck(receivedMessage, args){
        var typeOfQuery = ""
        const seasonObj = SeasonHelper.getCurrentSeason(receivedMessage.guild.id)
        var seasonName = seasonObj.seasonName
        return new Promise((resolve, reject)=>{
            if (args.length > 2){
                let argsWithCommas = args.toString()
                let argsWithSpaces = argsWithCommas.replace(/,/g, ' ');
                let splitArgs = argsWithSpaces.split(" | ")
                if (args[args.length - 1].toString().toLowerCase() == "rogue"){
                    typeOfQuery = "rogue"
                }
            }
            else{
                typeOfQuery = "non-rogue"
            }

            if (typeOfQuery == "rogue"){
                let cleanedArg = DeckHelper.toUpper(args.join(' '))
                let userQuery = {
                    _server: receivedMessage.guild.id,
                    _mentionValue: receivedMessage.author.id
                }
                let updateSave = { $set: {_currentDeck: cleanedArg}}
                User.updateOne(userQuery, updateSave, function(err, res){
                    if (res){
                        resolve("Success")
                     }
                     else{
                         resolve("Can't find user")
                     }
                })
            }
            else{
                let cleanedArg = DeckHelper.toUpper(args.join(' '))
                let deckQuery = {
                    _season: seasonName,
                    _server: receivedMessage.guild.id,
                    _alias: args.join(' ').toLowerCase()
                }
                let userQuery = {
                    _server: receivedMessage.guild.id,
                    _mentionValue: receivedMessage.author.id
                }
                let updateSave = { $set: {_currentDeck: cleanedArg}}
                Deck.find(deckQuery, function(err,deckRes){
                    if (deckRes.length != 0){
                        User.updateOne(userQuery, updateSave, function(err, res){
                            if (res.n > 0){
                                resolve("Success")
                             }
                             else{
                                 resolve("Can't find user")
                             }
                        })
                    }
                    else{
                        Deck.collection.createIndex(
                            {
                              _name: "text",
                              _commander: "text"
                            }
                          )
                       Deck.find(
                           {_server: receivedMessage.guild.id,
                            '$text':{'$search': args.join(' ')}
                        },
                        function(err,res){
                            if (res.length > 0){
                                resolve(res)
                            }
                            else{
                                resolve("Not a registered deck")
                            }
                        })
                    }
                })
            }
        })
    }   
}