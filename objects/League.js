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
         //Cleaning input
        let argsWithCommas = args.toString();
        let argsWithSpaces = argsWithCommas.replace(/,/g, ' ');
        let splitArgs = argsWithSpaces.split(" | ");
        splitArgs[0] = splitArgs[0].toLowerCase().trim();
        
        return new Promise((resolve, reject)=>{
            let conditionalQuery;
            let playerThreshold = 10;
            let deckThreshold = 10;
            let pointsGained = 30;
            let pointsLost = 10;
            let topThreshold = 10;
            let configToSet = splitArgs[0];
            let userInput = splitArgs[1]

            if ((configToSet!== "points gained") &&(configToSet!== "points lost")
                &&(configToSet!== "minimum games") && (configToSet!== "minimum decks")
                && (configToSet!== "leaderboard length")) {
                resolve("Invalid Input")
            }
            else if (!parseInt(userInput)){
                    if (isNaN(userInput)){
                            resolve("Invalid Input")
                    }
            }
            else {
                if (userInput < 0){
                    resolve("Invalid Input")
                }
                if (splitArgs.length === 1) {
                    resolve("Invalid Input")
                } else {
                    switch (configToSet) {
                        case "minimum decks":
                            conditionalQuery = {
                                $set: {
                                    _deck_threshold: userInput
                                }
                            };
                            deckThreshold = userInput
                            break;
                        case "minimum games":
                            conditionalQuery = {
                                _server: receivedMessage.guild.id,
                                $set: {
                                    _player_threshold: userInput
                                }
                            };
                            playerThreshold = userInput
                            break;
                        case "leaderboard length":
                            conditionalQuery = {
                                _server: receivedMessage.guild.id,
                                $set: {
                                    _top_threshold: userInput
                                }
                            };
                            topThreshold = userInput
                            break;
                        case "points gained":
                            conditionalQuery = {
                                _server: receivedMessage.guild.id,
                                $set: {
                                    _points_gained: userInput
                                }
                            };
                            pointsGained = userInput
                            break;
                        case "points lost":
                            conditionalQuery = {
                                _server: receivedMessage.guild.id,
                                $set: {
                                    _points_lost: userInput
                                }
                            };
                            pointsLost = userInput
                            break;
                        default:
                            resolve("Invalid Input")
                }
                    let newSave = {
                        _server: receivedMessage.guild.id,
                        _player_threshold: playerThreshold,
                        _deck_threshold: deckThreshold,
                        _points_gained: pointsGained,
                        _points_lost: pointsLost,
                        _top_threshold: topThreshold,
                        _admin: [],
                    };
                    bootstrap.Config.updateOne({_server: receivedMessage.guild.id}, conditionalQuery, async function (err, res) {
                        if (res.n > 0) {
                            let savedValue = userInput;
                            let resArr = [];
                            resArr.push("Updated", configToSet, savedValue);
                            resolve(resArr)
                        } else {
                            let newSaveRes = await bootstrap.LeagueHelper.createNewConfigs(receivedMessage, newSave);
                            if (newSaveRes !== "Error connecting to DB") {
                                let savedValue = userInput;
                                let resArr = [];
                                resArr.push("New Save", configToSet, savedValue);
                                resolve(resArr)
                            } else {
                                resolve("Error connecting to DB")
                            }
                        }
                    })
                }
            }
        })
    },
    async adminAppend(receivedMessage, discordRoles){
        let newDiscordRoles = [];
        let newSaveBool = false;
        return new Promise((resolve, reject)=>{
            bootstrap.Config.findOne({_server:receivedMessage.guild.id}).then(async foundRes=>{
                if (foundRes){
                    discordRoles.forEach((entry)=>{
                        if(foundRes._admin.includes(entry)){
                        }
                        else{
                            newDiscordRoles.push(entry)
                        }
                    })
                }
                else{
                    let newSave = {
                        _server: receivedMessage.guild.id,
                        _player_threshold: 10,
                        _deck_threshold: 10,
                    };
                    let newSaveRes = await bootstrap.LeagueHelper.createNewConfigs(receivedMessage, newSave);
                    if (newSaveRes !== "Error"){
                        if (discordRoles.length > 0){
                            discordRoles.forEach((adminEntry)=>{
                                let adminToAppend = {
                                    $push:{
                                        _admin: adminEntry
                                    }
                                };
                                bootstrap.Config.updateOne({_server: receivedMessage.guild.id}, adminToAppend, function(err, res){
                                    if (err){
                                        console.log(err)
                                    }
                                })
                            });
                            newSaveBool = true;
                        }
                    }else{
                        let retArr = [];
                        retArr.push("DB Connect Error", newDiscordRoles);
                        resolve(retArr)
                    }
                }

            })
            .then(function(e){
                if (newDiscordRoles.length > 0){
                    newDiscordRoles.forEach((adminEntry)=>{
                        let adminToAppend = {
                            $push:{
                                _admin: adminEntry
                            }
                        };
                        bootstrap.Config.updateOne({_server: receivedMessage.guild.id}, adminToAppend, function(err, res){
                            if (err){
                                let retArr = [];
                                retArr.push("DB Connect Error", newDiscordRoles);
                                resolve(retArr)
                            }
                            else{
                                let retArr = [];
                                retArr.push("Success", newDiscordRoles);
                                resolve(retArr)
                            }
                        })
                    })
                }
                else if (!newSaveBool){
                    let retArr = [];
                    retArr.push("No New Roles Error", newDiscordRoles);
                    resolve(retArr)
                }
                else{
                    let retArr = [];
                    retArr.push("New Success", newDiscordRoles);
                    resolve(retArr)
                }
            });
        });
    },
    adminDelete(receivedMessage, discordRoles){
        let newDiscordRoles = [];
        return new Promise((resolve, reject)=>{
            bootstrap.Config.findOne({_server: receivedMessage.guild.id}).then(async foundRes=>{
                if (foundRes){
                    discordRoles.forEach((entry)=>{
                        if(foundRes._admin.includes(entry)){
                            newDiscordRoles.push(entry)
                        }
                    })
                }
                else{
                    let retArr = [];
                    retArr.push("No Config Error", newDiscordRoles);
                    resolve(retArr)
                }
            }).then(function(e){
                if (newDiscordRoles.length > 0){
                    newDiscordRoles.forEach((adminEntry)=>{
                        let adminToAppend = {
                            $pull:{
                                _admin: adminEntry
                            }
                        };
                        bootstrap.Config.updateOne({_server: receivedMessage.guild.id}, adminToAppend, function(err, res){
                            if (err){
                                let retArr = [];
                                retArr.push("DB Connect Error", newDiscordRoles);
                                resolve(retArr)
                            }
                            else{
                                let retArr = [];
                                retArr.push("Success", newDiscordRoles);
                                resolve(retArr)
                            }
                        })
                    })
                }
                else{
                    let retArr = [];
                    retArr.push("No Roles Error", newDiscordRoles);
                    resolve(retArr)
                }
            });
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