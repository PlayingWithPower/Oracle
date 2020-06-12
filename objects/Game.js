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
    logMatch(id, callback) {
        const games = require('../Schema/Games')
        const users = require('../Schema/Users')

        var loserArr = new Array()
        var callbackArr = new Array()

        let findQuery = {'_match_id': id}
        games.findOne(findQuery, function(err, res){
            if (res) {
                // Deal with Winner
                let findQuery = {'_match_id': res._player1}
                loserArr.push(res._player2)
                loserArr.push(res._player3)
                loserArr.push(res._player4)

                user.findOne(findQuery, function(err, res){
                    if (res){
                        var newVal = Math.round(Number(res._elo) + Number(res._elo)*(percentageToGain))
                        var change = Number(res._elo)*(percentageToGain)
                        var newElo = {$set: {_elo: newVal, _wins: Number(res._wins) + 1}}
                        user.updateOne(findQuery, newElo, function(err, res){
                            if (res){
                                callbackArr.push(newVal + " (+" + change + ")")

                                //Deal with Losers
                                loserArr.forEach(loser =>{
                                    findQuery = {_id: loser}
                                    user.findOne(findQuery, function(err, res){
                                        if (res){
                                            var newVal = Math.round(Number(res._elo) - Number(res._elo)*(percentageToLose))
                                            var change = Number(res._elo)*(percentageToGain)
                                            var newElo = {$set: {_elo: newVal, _losses: Number(res._losses) + 1}}
                                            user.updateOne(findQuery, newElo, function(err, res){
                                                if (res){
                                                    callbackArr.push(newVal + " (-" + change + ")")
                                                    callback(callbackArr)
                                                }
                                                else{
                                                    callbackArr.push("Error: FAIL")
                                                }
                                            })        
                                        }
                                        else{
                                            callbackArr.push("Error: NO-REGISTER")
                                        }
                                    })
                                })
                            }
                            else{
                                callbackArr.push("Error: FAIL")
                            }
                        })        
                    }
                    else{
                        callbackArr.push("Error: NO-REGISTER")
                    }
                })


            }
        })
    },

    /**
     * Confirms match against for user.
     */
    confirmMatch(id, player, callback) {
        const games = require('../Schema/Games')
        let findQuery = {'_match_id': id}
        games.findOne(findQuery, function(err, res){
            if (res) {
                if (res._player1Confirmed == "N" && res._player1 == player){
                    games.updateOne(findQuery, {$set: {_player1Confirmed: "Y"}}, function(err,result){
                        if (result){
                            callback("SUCCESS")
                        }
                        else{
                            callback("FAILURE 1")
                        }
                    })
                }
                else if (res._player2Confirmed == "N" && res._player2 == player){
                    games.updateOne(findQuery, {$set: {_player2Confirmed: "Y"}}, function(err,result){
                        if (result){
                            callback("SUCCESS")
                        }
                        else{
                            callback("FAILURE 2")
                        }
                    })
                }
                else if (res._player3Confirmed == "N" && res._player3 == player){
                    games.updateOne(findQuery, {$set: {_player3Confirmed: "Y"}}, function(err,result){
                        if (result){
                            callback("SUCCESS")
                        }
                        else{
                            callback("FAILURE 3")
                        }
                    })
                }
                else if (res._player4Confirmed == "N" && res._player4 == player){
                    games.updateOne(findQuery, {$set: {_player4Confirmed: "Y"}}, function(err,result){
                        if (result){
                            callback("SUCCESS")
                        }
                        else{
                            callback("FAILURE 4")
                        }
                    })
                }
                else {
                    callback(player)
                }
            }
            else {
                callback("NO PLAYER FOUND")
            }
        })
    },
    /**
     * Check if all players have confirmed
     * 
     */
    checkMatch(id, callback){
        const game = require('../Schema/Games')
        let findQuery = {'_id': id}
        game.findOne(findQuery, function(err, res){
            if (res) {
                if (res._player1Confirmed == "Y" && res._player2Confirmed == "Y" && res._player3Confirmed == "Y" && res._player4Confirmed == "Y" ) {
                    callback("Y")
                }
                else {
                    callback("N")
                }
            }
        })
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