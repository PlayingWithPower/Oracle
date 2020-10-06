const bootstrap = require('../bootstrap.js');

/**
 * League Object
 *
 * Holds league commands, and configuration getters/setters.
 *
 * Configurations available:
 *  - Player Threshold (minimum matches before a player appears on the leaderboard)
 *  - Deck Threshold (mimimum matches before a deck appears on the leaderboard)
 *  - Alias Required (this setting allows you to require a deck alias when registering a user deck)
 *  - Admin (users who have admin privileges on your server)
 */
module.exports = {
    /**
     * Register a new user to the league.
     */
    register(receivedMessage) {
        let findQuery = {
            _mentionValue: receivedMessage.author.id,
            _server: receivedMessage.guild.id,
        };
        let toSave = {
            _mentionValue: receivedMessage.author.id,
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
        };
        return new Promise((resolve, reject)=>{
            bootstrap.User.findOne(findQuery, function(err, res){
                if (res){
                    resolve("Already Registered")
                }
                else{
                    bootstrap.User(toSave).save(function(error, result){
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
        let argsWithCommas = args.toString();
        let argsWithSpaces = argsWithCommas.replace(/,/g, ' ');
        let splitArgs = argsWithSpaces.split(" | ");
        splitArgs[0] = splitArgs[0].toLowerCase();
        
        return new Promise((resolve, reject)=>{
            let conditionalQuery;
            let playerThreshold = 10;
            let deckThreshold = 10;
            let admin = "";
            let adminList;
            if ((splitArgs[0]!== "minimum games") && (splitArgs[0]!== "minimum decks")){
                resolve("Invalid Input")
            }
            else if (splitArgs.length === 1){
                resolve("Invalid Input")
            }
            else{
                if ((splitArgs[0] === "minimum games")){
                    if (parseInt(splitArgs[1])){
                        if (!isNaN(splitArgs[1])){
                            conditionalQuery = {
                                _server: receivedMessage.guild.id,
                                $set:{
                                    _player_threshold: splitArgs[1]
                                }
                            };
                            playerThreshold = splitArgs[1]
                        }
                    }
                }else if ((splitArgs[0] === "minimum decks")){
                    if (parseInt(splitArgs[1])){
                        if (!isNaN(splitArgs[1])){
                            conditionalQuery = {
                                _server: receivedMessage.guild.id,
                                $set:{
                                    _deck_threshold: splitArgs[1]
                                }
                            };
                            deckThreshold = splitArgs[1]
                        }
                    }
                }else if ((splitArgs[0] === "admin")){
                    adminList = splitArgs[1];
                    adminList = adminList.replace(/  /g, ', ')
                    conditionalQuery = {
                        _server: receivedMessage.guild.id,
                        _admin: adminList
                    };
                    admin = adminList
                }
                else{
                    resolve("Invalid Input")
                }
                let newSave = {
                    _server: receivedMessage.guild.id,
                    _player_threshold: playerThreshold,
                    _deck_threshold: deckThreshold,
                    _admin: admin, 
                };
                bootstrap.Config.updateOne({_server: receivedMessage.guild.id}, conditionalQuery, function(err,res){
                    if (res.n > 0){
                        let savedValue = splitArgs[1];
                        if (splitArgs[0] === "admin"){
                            savedValue = adminList
                        }
                        let resArr = [];
                        resArr.push("Updated", splitArgs[0], savedValue);
                        resolve(resArr)
                    }
                    else{
                        bootstrap.Config(newSave).save({_server: receivedMessage.guild.id}, function(err,configSaveRes){
                            if (res){
                                let savedValue = splitArgs[1];
                                if (splitArgs[0] === "admin"){
                                    savedValue = adminList
                                }
                                let resArr = [];
                                resArr.push("New Save", splitArgs[0], savedValue);
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
            let checkForConfig = {_server: guild};
            bootstrap.Config.findOne(checkForConfig, function(err,foundRes){
                if (foundRes){
                    resolve(foundRes)
                }
                else{
                    resolve("No configs")
                }
            })
        })
    },
};