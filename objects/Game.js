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
     * TODO: Change specific deck w/l
     */
    logMatch(id) {
        const games = require('../Schema/Games')
        const users = require('../Schema/Users')

        var loserArr = new Array()
        var callbackArr = new Array()

        return new Promise((resolve, reject) => {
            let findQuery = {_match_id: id, _Status: "STARTED"}
            games.findOne(findQuery, function(err, res){
                if (res) {
                    // Deal with Winner
                    let player1_id = res._player1
                    let player2_id = res._player2
                    let player3_id = res._player3
                    let player4_id = res._player4

                    let findQuery = {_mentionValue: res._player1}
                    loserArr.push(res._player2)
                    loserArr.push(res._player3)
                    loserArr.push(res._player4)

                    users.findOne(findQuery, function(err, res){
                        if (res){
                            var newVal = Math.round(Number(res._elo) + Number(res._elo)*(percentageToGain))
                            var change = Math.round(Number(res._elo)*(percentageToGain))
                            var newElo = {$set: {_elo: newVal, _wins: Number(res._wins) + 1}}
                            users.updateOne(findQuery, newElo, function(err, res){
                                if (res){
                                    callbackArr.push("**" + player1_id + "**'s Score " + newVal + " (+" + change + ")")

                                    //Deal with Losers **Yes I know this could be solved better with a loop but that would require a completely different implementation shhhhh
                                    //loser 1
                                    findQuery = {_mentionValue: loserArr[0]}
                                    users.findOne(findQuery, function(err, res){
                                        if (res){
                                            var newVal = Math.round(Number(res._elo) - Number(res._elo)*(percentageToLose))
                                            var change = Math.round(Number(res._elo)*(percentageToLose))
                                            var newElo = {$set: {_elo: newVal, _losses: Number(res._losses) + 1}}
                                            users.updateOne(findQuery, newElo, function(err, res){
                                                if (res){
                                                    callbackArr.push("**" + player2_id + "**'s Score " + newVal + " (-" + change + ")")
                                                    
                                                    //loser 2
                                                    findQuery = {_mentionValue: loserArr[1]}
                                                    users.findOne(findQuery, function(err, res){
                                                        if (res){
                                                            var newVal = Math.round(Number(res._elo) - Number(res._elo)*(percentageToLose))
                                                            var change = Math.round(Number(res._elo)*(percentageToLose))
                                                            var newElo = {$set: {_elo: newVal, _losses: Number(res._losses) + 1}}
                                                            users.updateOne(findQuery, newElo, function(err, res){
                                                                if (res){
                                                                    callbackArr.push("**" + player3_id + "**'s Score " + newVal + " (-" + change + ")")
                                                                    
                                                                    //loser 3
                                                                    findQuery = {_mentionValue: loserArr[2]}
                                                                    users.findOne(findQuery, function(err, res){
                                                                        if (res){
                                                                            var newVal = Math.round(Number(res._elo) - Number(res._elo)*(percentageToLose))
                                                                            var change = Math.round(Number(res._elo)*(percentageToLose))
                                                                            var newElo = {$set: {_elo: newVal, _losses: Number(res._losses) + 1}}
                                                                            users.updateOne(findQuery, newElo, function(err, res){
                                                                                if (res){
                                                                                    callbackArr.push("**" + player4_id + "**'s Score " + newVal + " (-" + change + ")")
                                                                                    resolve(callbackArr)
                                                                                    
                                                                                }
                                                                                else{
                                                                                    reject('Error: FAIL LOSER 3')
                                                                                }
                                                                            })        
                                                                        }
                                                                        else{
                                                                            reject('Error: NO-REGISTER LOSER 3')
                                                                        }
                                                                    })
                                                                }
                                                                else{
                                                                    reject('Error: FAIL LOSER 2')
                                                                }
                                                            })        
                                                        }
                                                        else{
                                                            reject('Error: NO-REGISTER LOSER 2')
                                                        }
                                                    })
                                                }
                                                else{
                                                    reject('Error: FAIL LOSER 1')
                                                }
                                            })        
                                        }
                                        else{
                                            reject('Error: NO-REGISTER LOSER 1')
                                        }
                                    })
                                }
                                else{
                                    reject('Error: FAIL WINNER')
                                }
                            })        
                        }
                        else{
                            reject('Error: NO-REGISTER')
                        }
                    })
                    

                }
            })
        })
        
    },

    /**
     * Confirms match against for user.
     */
    confirmMatch(id, player) {
        const games = require('../Schema/Games')
        let findQuery = {'_match_id': id}

        return new Promise((resolve, reject) => {
            games.findOne(findQuery, function(err, res){
                if (res) {
                    if (res._player1Confirmed == "N" && res._player1 == player){
                        games.updateOne(findQuery, {$set: {_player1Confirmed: "Y"}}, function(err,result){
                            if (result){
                                resolve('SUCCESS')
                            }
                            else{
                                reject('1')
                            }
                        })
                    }
                    else if (res._player2Confirmed == "N" && res._player2 == player){
                        games.updateOne(findQuery, {$set: {_player2Confirmed: "Y"}}, function(err,result){
                            if (result){
                                resolve('SUCCESS')
                            }
                            else{
                                reject('2')
                            }
                        })
                    }
                    else if (res._player3Confirmed == "N" && res._player3 == player){
                        games.updateOne(findQuery, {$set: {_player3Confirmed: "Y"}}, function(err,result){
                            if (result){
                                resolve('SUCCESS')
                            }
                            else{
                                reject('3')
                            }
                        })
                    }
                    else if (res._player4Confirmed == "N" && res._player4 == player){
                        games.updateOne(findQuery, {$set: {_player4Confirmed: "Y"}}, function(err,result){
                            if (result){
                                resolve('SUCCESS')
                            }
                            else{
                                reject('4')
                            }
                        })
                    }
                    else {
                        reject(player)
                    }
                }
                else {
                    reject('NO PLAYER FOUND')
                }
            })
        })
    },
    /**
     * Check if all players have confirmed
     * 
     */
    checkMatch(id){
        const game = require('../Schema/Games')
        let findQuery = {'_match_id': id}
        return new Promise((resolve, reject) => {
            game.findOne(findQuery, function(err, res){
                if (res) {
                    if (res._player1Confirmed == "Y" && res._player2Confirmed == "Y" && res._player3Confirmed == "Y" && res._player4Confirmed == "Y" ) {
                        resolve("SUCCESS")
                    }
                    else {
                        reject('Player Not Found')
                    }
                }
                else {
                    console.log ("Match #:" + id + " not found")
                }
            })
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
        findQuery = {_mentionValue: player1}
        user.findOne(findQuery, function(err, res){
            if (res){
                deck1 = res._currentDeck
            }
        })
        //Player 2
        findQuery = {_mentionValue: player2}
        user.findOne(findQuery, function(err, res){
            if (res){
                deck2 = res._currentDeck
            }
        })
        //Player 3
        findQuery = {_mentionValue: player3}
        user.findOne(findQuery, function(err, res){
            if (res){
                deck3 = res._currentDeck
            }
        })
        //Player 4
        findQuery = {_mentionValue: player4}
        user.findOne(findQuery, function(err, res){
            if (res){
                deck4 = res._currentDeck
            }
        })
        game({_match_id: id, _server: "PWP", _season: "1", _player1: player1, _player2: player2, _player3: player3, _player4: player4, _player1Deck: deck1, _player2Deck: deck2, _player3Deck: deck3, _player4Deck: deck4, _Status: "STARTED", _player1Confirmed: "N", _player2Confirmed: "N", _player3Confirmed: "N", _player4Confirmed: "N"}).save(function(err, result){
            if (result){
                console.log("Successfully created Game #" + id)
                callback("SUCCESS")
            }
            else {
                console.log("Game creation failed for Game #" + id)
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
    finishMatch(id) {
        return new Promise((resolve, reject) => {
            const games = require('../Schema/Games')
            findQuery = {_match_id: id}
            games.findOne(findQuery, function(err, res) {
                if (res) {
                    if (res._Status == "STARTED") {
                        var newStatus = {$set: {_Status: "FINISHED"}}
                        games.updateOne(findQuery, newStatus, function(err, result){
                            if (result) {
                                resolve('SUCCESS')
                            }
                            else {
                                reject('FAIL FINISH')
                            }
                        })
                    }
                    else {
                        resolve('CLOSED')
                    }
                }
                else {
                    reject('FAIL FIND')
                }
            })
        })
    },
    closeMatch(id) {
        return new Promise((resolve, reject) => {
            const games = require('../Schema/Games')
            let findQuery = {_match_id: id, _Status: "STARTED"}
            games.findOne(findQuery, function(err, res) {
                if (res) {
                    var newStatus = {$set: {'_Status': "CLOSED"}}
                    games.updateOne(findQuery, newStatus, function(err, result){
                        if (result) {
                            resolve('SUCCESS')
                        }
                        else {
                            reject('FAIL CLOSE')
                        }
                    })
                }
                else {
                    reject('FAIL FIND')
                }
            })
        })
    },
    /**
     * Creates a unique 6 digit alphanumeric match number
     */
    createMatchNumber() {

    },
    /**
     * @param {discord user id} args 
     * @param {*} callback 
     */
    logLoser(args, callback){
        const user = require('../Schema/Users')

        findQuery = {_mentionValue: args}
        user.findOne(findQuery, function(err, res){
            if (res){
                // elo stuff
                var newVal = Math.round(Number(res._elo) - Number(res._elo)*(percentageToLose))
                var change = Number(res._elo)*(percentageToLose)
                

                // deck stuff
                let tempArray = res._deck
                const deckFind = (element) => element == res._currentDeck
                tempArray.forEach(arr => {
                    if (arr.findIndex(deckFind) != -1) {
                        tempArray[arr.findIndex(deckFind)][4] += 1
                    }
                    else {
                        callback("Error: FAIL")
                    }
                })

                var newSet = {$set: {_elo: newVal, _losses: Number(res._losses) + 1, _deck: tempArray}}

                user.updateOne(findQuery, newSet, function(err, res){
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
        findQuery = {_mentionValue: "<@!"+args+">"}
        user.findOne(findQuery, function(err, res){
            if (res){
                var newVal = Math.round(Number(res._elo) + Number(res._elo)*(percentageToGain))
                var change = Number(res._elo)*(percentageToGain)

                // deck stuff
                let tempArray = res._deck
                const deckFind = (element) => element == res._currentDeck
                tempArray.forEach(arr => {
                    if (arr.findIndex(deckFind) != -1) {
                        tempArray[arr.findIndex(deckFind)][3] += 1
                    }
                    else {
                        callback("Error: FAIL")
                    }
                })

                var newSet = {$set: {_elo: newVal, _losses: Number(res._losses) + 1, _deck: tempArray}}

                user.updateOne(findQuery, newSet, function(err, res){
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
    },
    hasDuplicates(array) {
        var valuesSoFar = Object.create(null);
        for (var i = 0; i < array.length; ++i) {
            var value = array[i];
            if (value in valuesSoFar) {
                return true;
            }
            valuesSoFar[value] = true;
        }
        return false;
    }
}