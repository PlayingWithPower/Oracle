const { resolve } = require('path')
const { rejects } = require('assert')

/**
 * Season Object
 *
 * Season commands and data
 */
module.exports = {

    /**
     * Starts a new season
     */
    startSeason(receivedMessage, args) {
        const season = require('../Schema/Seasons')
        const SeasonHelper = require('../Helpers/SeasonHelper')
        var seasonName = "1"
        var currentDate = new Date();
        currentDate = currentDate.toLocaleString("en-US", {timeZone: "America/New_York"});

        SeasonHelper.getCurrentSeason(receivedMessage.guild.id)

        // let checkCurrent = {
        //     '_server': receivedMessage.guild.id
        // }
        // return new Promise ((resolve, reject)=>{
        //     season.findOne(checkCurrent, function(err, result){
                
        //         if (err){
        //             resolve("Error 1")
        //         }
        //         if (result){
        //             if ((result._season_end == "Not Specified") || (new Date(result._season_end) >= new Date(currentDate))){
        //                 var ongoingSeasonArr = new Array();
        //                 ongoingSeasonArr.push("Season Ongoing", result._season_start, result._season_end, result._season_name, currentDate)
        //                 resolve(ongoingSeasonArr)
        //             }
        //             else{
        //                 let newSeason = {
        //                     '_server': receivedMessage.guild.id,
        //                     '_season_name': seasonName,
        //                     '_season_start': currentDate,
        //                     '_season_end': "Not Specified"
        //                 }
        //                 season(newSeason).save(function(err, otherRes){
        //                     if (err){
        //                         resolve("Error 2")
        //                     }
        //                     var seasonArr = new Array();
        //                     seasonArr.push("saved", currentDate, "Not Specified", seasonName)
        //                     resolve(seasonArr)
        //                 })
        //             }
        //         }else{
        //             let newSeason = {
        //                 '_server': receivedMessage.guild.id,
        //                 '_season_name': seasonName,
        //                 '_season_start': currentDate,
        //                 '_season_end': "Not Specified"
        //             }
        //             season(newSeason).save(function(err, otherRes){
        //                 if (err){
        //                     resolve("Error 2")
        //                 }
        //                 var seasonArr = new Array();
        //                 seasonArr.push("saved", currentDate, "Not Specified", seasonName)
        //                 resolve(seasonArr)
        //             })
        //         }
        //     })
        // })
    },

    /**
     * Ends the current Season
     */
    endSeason() {

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
    setEndDate() {

    },

    /**
     * Summary info for the season
     */
    getInfo(receivedMessage) {
        const season = require('../Schema/Seasons')
        let seasonSearch = {
            '_server': receivedMessage.guild.id,
            '_is_current': "yes"
        }
        return new Promise((resolve, reject)=>{
            season.findOne(seasonSearch, function(err,res){
                resolve(res)
            })
        })
    },

    /**
     * Get leaderboard info for a number of different data points
     * Top games, score, winrate
     */
    leaderBoard(receivedMessage) {
        const user = require('../Schema/Users')
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
    setSeasonName(){

    },
    /**
     * Updates the name of a season
     * Remember to update all instances of the old name with the new name
     */
    updateSeasonName(){

    },
}