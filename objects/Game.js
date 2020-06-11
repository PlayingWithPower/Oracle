/**
 * Game Object
 *
 * Holds all functionality to record matches (games).
 *
 * Steps:
 * 1. Log match, (creates match number, sets pending status, and adds 4 users in pending status)
 * 2. Confirm Match (each user confirms their standings in the match.  This is called 4 times total)
 * 3. Commit Match (this puts the match into an accepted status and performs match calculations)
 */

const percentageToLose = 0.010
const percentageToGain = 0.030

module.exports = {

    /**
     * Logs a new match to the season.
     * TODO: Test for when bot is awaiting reaction + other commmand. What happens?
     */
    logMatch() {

    },

    /**
     * Confirms match against a user.
     */
    confirmMatch() {

    },

    /**
     * Commits match, and performs all point calculations
     */
    commitMatch() {

    },

    /**
     * Deletes an unconfirmed match
     */
    deleteMatch() {

    },

    /**
     * Display info about a match
     */
    matchInfo() {

    },

    /**
     * remind users of unconfirmed matches
     */
    remind() {

    },

    /**
     * Update a player's deck for a given match
     */
    updateDeck() {

    },

    /**
     * Creates a unique 6 digit alphanumeric match number
     */
    createMatchNumber() {

    },
    /*
    Single User elo modifiers, 
    :param: args should be user discord id
    */
    logLoser(args, callback){
        const user = require('../Schema/Users')

        findQuery = {_id: args}
        user.findOne(findQuery, function(err, res){
            if (res){
                var newVal = Math.round(Number(res._elo) - Number(res._elo)*(percentageToLose))
                var change = Number(res._elo)*(percentageToGain)
                var newElo = {$set: {_elo: newVal, _losses: Number(res._losses) + 1}}
                user.updateOne(findQuery, newElo, function(err, res){
                    if (res){
                        callback(newVal + " (-" + change + ")")
                    }
                    else{
                        callback("Error: FAIL")
                    }
                })        
            }
            else{
                callback("Error: NO-REGISTER")
            }
        })
    },
    logWinner(args, callback){
        const user = require('../Schema/Users')
        findQuery = {_id: "<@!"+args+">"}
        console.log(findQuery)
        user.findOne(findQuery, function(err, res){
            if (res){
                var newVal = Math.round(Number(res._elo) + Number(res._elo)*(percentageToGain))
                var change = Number(res._elo)*(percentageToGain)
                var newElo = {$set: {_elo: newVal, _wins: Number(res._wins) + 1}}
                user.updateOne(findQuery, newElo, function(err, res){
                    if (res){
                        callback(newVal + " (+" + change + ")")
                    }
                    else{
                        callback("Error: FAIL")
                    }
                })        
            }
            else{
                callback("Error: NO-REGISTER")
            }
        })
    }
}