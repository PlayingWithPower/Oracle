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
     * Creates match
     */
    createMatch(player1, player2, player3, player4, id, callback) {
        const game = require('../Schema/Games')
        const user = require('../Schema/Users')

        let deck1
        let deck2
        let deck3
        let deck4

        //Get Decks
        //Player 1
        findQuery = {'_id': player1}
        user.findOne(findQuery, function(err, res){
            if (res){
                deck1 = res._currentDeck
            }
        })
        //Player 2
        findQuery = {'_id': player2}
        user.findOne(findQuery, function(err, res){
            if (res){
                deck2 = res._currentDeck
            }
        })
        //Player 3
        findQuery = {'_id': player3}
        user.findOne(findQuery, function(err, res){
            if (res){
                deck3 = res._currentDeck
            }
        })
        //Player 4
        findQuery = {'_id': player4}
        user.findOne(findQuery, function(err, res){
            if (res){
                deck4 = res._currentDeck
            }
        })
        game({'_match_id': id, '_server': "PWP", '_season': "1", '_player1': player1, '_player2': player2, '_player3': player3, '_player4': player4, '_player1Deck': deck1, '_player2Deck': deck2, '_player3Deck': deck3, '_player4Deck': deck4, '_Status': "STARTED", '_player1Confirmed': "N", '_player2Confirmed': "N", '_player3Confirmed': "N", '_player4Confirmed': "N"}).save(function(err, result){
            if (result){
                console.log("Successfully created Game #" + id)
                callback("SUCCESS")
            }
            else {
                console.log("Game creation failed")
                callback("FAILURE")
            }
        })
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