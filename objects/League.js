const user = require('../Schema/Users')
const config = require('../Schema/Config')
const SeasonHelper = require('../Helpers/SeasonHelper')
const Season = require('./Season')
/**
 * League Object
 *
 * Holds league commands, and configuration getters/setters.
 *
 * Configurations available:
 *  - Player Threshold (minimum matches before a player appears on the leaderboard)
 *  - Deck Threshold (mimimum matches before a deck appears on the leaderboard)
 *  - Timeout (how long before a match is considered timed out and nullified)
 *  - Alias Required (this setting allows you to require a deck alias when registering a user deck)
 *  - Admin (users who have admin privileges on your server)
 */
module.exports = {

    /**
     * Summary info for the league
     */
    getInfo() {
        
    },

    /**
     * Register a new user to the league.
     */
    register(receivedMessage) {
        let currentSeason = SeasonHelper.getCurrentSeason(receivedMessage.guild.id)
        let findQuery = {
            _mentionValue: "<@!" + receivedMessage.author.id+ ">",
            _server: receivedMessage.guild.id,
        }
        let toSave = {
            _mentionValue: "<@!" + receivedMessage.author.id+ ">",
            _server: receivedMessage.guild.id,
            _name : receivedMessage.author.username, 
            _currentDeck: "None", 
            _elo : 1000, _wins : 0, _losses : 0,
            _deck: {
                _id: 0,
                Deck: "Default Deck. Ignore.", 
                Wins:1, 
                Losses:1
            }
        }
        return new Promise((resolve, reject)=>{
            user.findOne(findQuery, function(err, res){
                if (res){
                    resolve("Already Registered")
                }
                else{
                   user(toSave).save(function(error, result){
                        if(result){
                            resolve("Success")
                        }
                        else {
                            resolve("Error")
                        }
                    })
                }
            })
        })
    },

    /**
     * Sets a configuration
     */
    configSet(receivedMessage, args) {
        let argsWithCommas = args.toString()
        let argsWithSpaces = argsWithCommas.replace(/,/g, ' ');
        let splitArgs = argsWithSpaces.split(" | ")
        let playerThreshold = parseInt(splitArgs[0])
        let deckThreshold = parseInt(splitArgs[1])
        let timeout = parseInt(splitArgs[2])
        let adminList = splitArgs[3]
        var parseIntCheck = false
        return new Promise((resolve, reject)=>{
            if (!isNaN(playerThreshold)){
                if (!isNaN(deckThreshold)){
                    if (!isNaN(timeout) && timeout <= 60){
                        parseIntCheck = true
                    }else{ resolve("Invalid Input")}
                }else{ resolve("Invalid Input")}
            }else{ resolve("Invalid Input")}
        
            adminList = adminList.replace(/  /g, ', ')
            

            if (splitArgs.length == 4){
                    let checkForConfig = {_server: receivedMessage.guild.id}
                    config.findOne(checkForConfig, function(err,foundRes){
                        if (foundRes){
                            let configSet = {
                                $set: {
                                    _player_threshold: playerThreshold,
                                    _deck_threshold: deckThreshold,
                                    _timeout: timeout,
                                    _admin: adminList
                                }
                            }
                            config.updateOne(foundRes, configSet, function(err, res){
                                if (res){
                                    let returnArr = new Array();
                                    returnArr.push("Updated", playerThreshold, deckThreshold, timeout, adminList)
                                    resolve(returnArr)
                                }
                                else{
                                    resolve("Error")
                                }
                            })
                        }
                        else{
                            resolve("Error")
                        }
                    })  
            }
            else{
                resolve("Invalid Input")
            }
        })
    },

    /**
     * gets a configuration
     */
    configGet(receivedMessage) {
        return new Promise((resolve, reject)=>{
            let checkForConfig = {_server: receivedMessage.guild.id}
            config.findOne(checkForConfig, function(err,foundRes){
                if (foundRes){
                    resolve(foundRes)
                }
                else{
                    resolve("No configs")
                }
            })
        })
    }
}