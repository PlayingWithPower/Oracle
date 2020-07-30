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
        
        return new Promise((resolve, reject)=>{
            var conditionalQuery
            var playerThreshold = 10
            var deckThreshold = 10
            var timeout = 60
            var admin = ""
            if ((splitArgs[0]!= "player threshold") && (splitArgs[0]!= "deck threshold")
            &&(splitArgs[0]!= "timeout")&&(splitArgs[0]!= "admin")){
                resolve("Invalid Input")
            }
            else{
                if ((splitArgs[0]== "player threshold")){
                    if (parseInt(splitArgs[1])){
                        if (!isNaN(splitArgs[1])){
                            conditionalQuery = {
                                _server: receivedMessage.guild.id,
                                $set:{
                                    _player_threshold: splitArgs[1]
                                }
                            }
                            playerThreshold = splitArgs[1]
                        }
                    }
                }else if ((splitArgs[0]== "deck threshold")){ 
                    if (parseInt(splitArgs[1])){
                        if (!isNaN(splitArgs[1])){
                            conditionalQuery = {
                                _server: receivedMessage.guild.id,
                                $set:{
                                    _deck_threshold: splitArgs[1]
                                }
                            }
                            deckThreshold = splitArgs[1]
                        }
                    }
                }else if ((splitArgs[0]== "timeout")){ 
                    if (parseInt(splitArgs[1])){
                        if (!isNaN(splitArgs[1])){
                            if (splitArgs[1] > 60){
                                resolve("Timeout too large")
                            }else{
                                conditionalQuery = {
                                    _server: receivedMessage.guild.id,
                                    $set:{
                                        _timeout: splitArgs[1]
                                    }
                                }
                                timeout = splitArgs[1]
                            }   
                        }
                    }
                }else if ((splitArgs[0]== "admin")){ 
                    var adminList = splitArgs[1]
                    adminList = adminList.replace(/  /g, ', ')
                    conditionalQuery = {
                        _server: receivedMessage.guild.id,
                        _admin: adminList
                    }
                    admin = adminList
                }
                else{
                    resolve("Invalid Input")
                }
                let newSave = {
                    _server: receivedMessage.guild.id,
                    _player_threshold: playerThreshold,
                    _deck_threshold: deckThreshold,
                    _timeout: timeout, 
                    _admin: admin, 
                }
                config.updateOne({_server: receivedMessage.guild.id}, conditionalQuery, function(err,res){
                    if (res.n > 0){
                        let savedValue = splitArgs[1]
                        if (splitArgs[0] == "admin"){
                            savedValue = adminList
                        }
                        var resArr = new Array();
                        resArr.push("Updated", splitArgs[0], savedValue)
                        resolve(resArr)
                    }
                    else{
                        config(newSave).save({_server: receivedMessage.guild.id}, function(err,configSaveRes){
                            if (res){
                                let savedValue = splitArgs[1]
                                if (splitArgs[0] == "admin"){
                                    savedValue = adminList
                                }
                                var resArr = new Array();
                                resArr.push("New Save", splitArgs[0], savedValue)
                                resolve(resArr)
                            }
                            else{
                                resolve("Error")
                            }
                        })
                    }
                    
                })
            }
        })
    },

    /**
     * gets a configuration
     */
    configGet(guild) {
        return new Promise((resolve, reject)=>{
            let checkForConfig = {_server: guild}
            config.findOne(checkForConfig, function(err,foundRes){
                if (foundRes){
                    resolve(foundRes)
                }
                else{
                    resolve("No configs")
                }
            })
        })
    },
    startupConfig(guild){
        let checkForConfig = {_server: guild}
        config.findOne(checkForConfig, function(err, foundRes){
            if (foundRes){
                //console.log("Been here before")
            }else{
                let configSave = {
                        _server: guild,
                        _player_threshold: "10",
                        _deck_threshold: "10",
                        _timeout: "60",
                        _admin: ""
                }
                config(configSave).save(function(err, res){
                    if (res){
                        //console.log("Success")
                    }
                    else{
                        //console.log("Error")
                    }
                })
            }
        })
    }
}