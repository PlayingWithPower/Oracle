/**
 * Season Object
 *
 * Season commands and data
 */
const season = require('../Schema/Seasons')
const user = require('../Schema/Users')
const config = require('../Schema/Config')
const match = require('../Schema/Games')
const deck = require('../Schema/Deck')
const deckObj = require('../objects/Deck')
const SeasonHelper = require('../Helpers/SeasonHelper')
module.exports = {

    /**
     * Starts a new season
     */
    async startSeason(receivedMessage, args) {
        var currentDate = new Date();
        currentDate = currentDate.toLocaleString("en-US", {timeZone: "America/New_York"});

        let getSeasonReturn = await SeasonHelper.getCurrentSeason(receivedMessage.guild.id)
        let newSeasonNameReturn = await SeasonHelper.newSeasonName(receivedMessage.guild.id)
        var seasonName = newSeasonNameReturn.toString()
        let populateDecks = await deckObj.setUpPopulate(receivedMessage, seasonName)

        let checkCurrent = {
            '_server': getSeasonReturn._server,
            '_season_name': getSeasonReturn._season_name
        }
        return new Promise ((resolve, reject)=>{
            season.findOne(checkCurrent, function(err, result){
                if (err){
                    resolve("Error 1")
                }
                if (result){
                    if ((result._season_end == "Not Specified") || (new Date(result._season_end) >= currentDate)){
                        var ongoingSeasonArr = new Array();
                        ongoingSeasonArr.push("Season Ongoing", result._season_start, result._season_end, result._season_name, currentDate)
                        resolve(ongoingSeasonArr)
                    }
                    else{
                        let newSeason = {
                            '_server': receivedMessage.guild.id,
                            '_season_name': seasonName,
                            '_season_start': currentDate,
                            '_season_end': "Not Specified"
                        }
                        season(newSeason).save(function(err, otherRes){
                            if (err){
                                resolve("Error 2")
                            }
                            var successSave = new Array();
                            successSave.push("Successfully Saved", currentDate, "Not Specified", seasonName)
                            resolve(successSave)
                        })
                    }
                }else{
                    let newSeason = {
                        '_server': receivedMessage.guild.id,
                        '_season_name': seasonName,
                        '_season_start': currentDate,
                        '_season_end': "Not Specified"
                    }
                    season(newSeason).save(function(err, otherRes){
                        if (err){
                            resolve("Error 2")
                        }
                        var seasonArr = new Array();
                        seasonArr.push("Successfully Saved", currentDate, "Not Specified", seasonName)
                        resolve(seasonArr)
                    })
                }
            })
        })
    },

    /**
     * Ends the current Season
     */
    async endSeason(receivedMessage, args) {
        var currentDate = new Date()
        currentDate = currentDate.toLocaleString("en-US", {timeZone: "America/New_York"});

        let currentSeason = await SeasonHelper.getCurrentSeason(receivedMessage.guild.id)
        return new Promise((resolve, reject)=>{
            season.updateOne(currentSeason, {$set: {_season_end: currentDate}}, function (err, seasonUpdateRes){
                if (seasonUpdateRes){
                    var resolveArr = new Array()
                    resolveArr.push("Success", currentSeason, currentDate)
                    resolve(resolveArr)
                }
            })
        })
    },

    /**
     * Sets a pre-determined start date for the season.  This creates an "automatic start" of the league, without
     * having to manually start it.
     */
    setStartDate() {

    },

    /**
     * Sets a pre-determined end date for the season.  This creates an "automatic end" of the league, without having
     * to manually end it.
     */
    async setEndDate(receivedMessage, date) {
        let currentSeason = await SeasonHelper.getCurrentSeason(receivedMessage.guild.id)
        date = date.toLocaleString("en-US", {timeZone: "America/New_York"});
        return new Promise((resolve, reject)=>{
            season.updateOne(currentSeason, {$set: {_season_end: date}}, function (err, seasonUpdateRes){
                if (seasonUpdateRes){
                    let resolveArr = new Array()
                    resolveArr.push("Success", currentSeason._season_name)
                    resolve(resolveArr)
                }
            })
        })
    },

    /**
     * Summary info for the season
     */
    async getInfo(receivedMessage, args) {
        if (args == "Current"){
            let seasonReturn = await SeasonHelper.getCurrentSeason(receivedMessage.guild.id)
            return new Promise((resolve, reject)=>{
                resolve(seasonReturn)
            })
        }
        
        else if (args.toLowerCase() == "all"){
            return new Promise((resolve, reject)=>{
                let query = {_server: receivedMessage.guild.id}
                season.find(query, function(err,res){
                    if (res){
                        resolve(res)
                    }
                    else{
                        resolve("Can't Find Season")
                    }
                })
            })
        }
        else{
            return new Promise((resolve, reject)=>{
                let query = {_server: receivedMessage.guild.id, _season_name: args}
                season.findOne(query, function(err,res){
                    if (res){
                        resolve(res)
                    }
                    else{
                        resolve("Can't Find Season")
                    }
                })
            })
        }
    },

    /**
     * Get leaderboard info for a number of different data points
     * Top games, score, winrate
     */
    leaderBoard(receivedMessage) {
        let userQuery = {_server: receivedMessage.guild.id}

        return new Promise((resolve,reject)=>{
            user.find(userQuery, function(err, res){
                if (res){
                    resolve(res)
                }
                else{
                    resolve("Error 1")
                }
            })
        })

    },
    /**
     * Sets the season name
     * Helper function. May not be needed
     */
    async setSeasonName(receivedMessage, args){
        let currentSeason = await SeasonHelper.getCurrentSeason(receivedMessage.guild.id)
        return new Promise((resolve, reject)=>{
            if (currentSeason != "No Current"){
                season.findOne({_server: receivedMessage.guild.id,_season_name: args.join(' ')}, function(err, res){
                    if (res){
                        resolve("Name in use")
                    }else{
                        season.updateOne(currentSeason, {$set: {_season_name: args.join(' ')}}, function (err, seasonUpdateRes){
                            if (seasonUpdateRes){
                                let updateMatches = {
                                    _server: receivedMessage.guild.id,
                                    _season: currentSeason._season_name
                                }
                                match.updateMany(updateMatches, {$set: {_season: args.join(' ')}}, function (err, matchUpdateRes){
                                    if (matchUpdateRes){
                                        deck.updateMany(updateMatches, {$set: {_season: args.join(' ')}}, function (err, deckUpdateRes){
                                            if (deckUpdateRes){
                                                let resolveArr = new Array()
                                                resolveArr.push("Success", currentSeason._season_name, args.join(' '))
                                                resolve(resolveArr)
                                            }
                                        })
                                    }
                                })
                            }
                        })
                    }
                })
            }else{
                resolve("No Current")
            }
        })
    },
    /**
     * Updates the name of a season
     * Remember to update all instances of the old name with the new name
     */
    updateSeasonName(){

    },
}