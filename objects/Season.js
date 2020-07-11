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
    startSeason() {

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
    getInfo() {

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