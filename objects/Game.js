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

    logWinner(id, receivedMessage) {
        return new Promise((resolve, reject) => {
            const users = require('../Schema/Users')
            let findQuery = {_mentionValue: id, _server: receivedMessage.guild.id}
            users.findOne(findQuery, function(err, res) {
                if (res) {
                    // // Deck W/L Handling
                    // tempArr = res._deck
                    // tempArr.forEach(deck => {
                    //     if (deck.Deck == res._currentDeck){
                    //         deck.Wins += 1
                    //     }
                    // })

                    // Elo Handling
                    var newVal
                    var change
                    let newWins = res._wins
                    
                    newWins += 1
                    newVal = Math.round(Number(res._elo) + Number(res._elo)*(percentageToGain))
                    change = Math.round(Number(res._elo)*(percentageToGain))
                    

                    newInfo = { $set: {'_elo': newVal}}
                    users.updateOne(findQuery, newInfo, function(err, res) {
                        if (res) {
                            resolve("**" + id + "**'s Score " + newVal + " (+" + change + ")")
                        }
                        else {
                            reject('SET FAIL')
                        }
                    })
                }
                else {
                    reject('PLAYER NOT FOUND')
                }
            })      
        })
    },

    logLoser(id, receivedMessage) {
        return new Promise((resolve, reject) => {
            const users = require('../Schema/Users')
            let findQuery = {_mentionValue: id, _server: receivedMessage.guild.id}
            users.findOne(findQuery, function(err, res) {
                if (res) {
                    // // Deck W/L Handling
                    // tempArr = res._deck
                    // tempArr.forEach(deck => {
                    //     if (deck.Deck == res._currentDeck){
                    //         deck.Losses += 1
                    //     }
                    // })

                    // Elo Handling
                    var newVal
                    var change
                    let newLosses = res._losses
                    
                    newLosses += 1
                    newVal = Math.round(Number(res._elo) - Number(res._elo)*(percentageToLose))
                    change = Math.round(Number(res._elo)*(percentageToLose))
                    

                    let newInfo = { $set: {'_elo': newVal}}
                    users.updateOne(findQuery, newInfo, function(err, res) {
                        if (res) {
                            resolve("**" + id + "**'s Score " + newVal + " (-" + change + ")")
                        }
                        else {
                            reject('SET FAIL')
                        }
                    })
                }
                else {
                    reject('PLAYER NOT FOUND')
                }
            })      
        })
    },

    logMatch(id, receivedMessage) {
        const games = require('../Schema/Games')
        var promises = [];
        var out = [];

        return new Promise((resolve, reject) => {
            let findQuery = {_match_id: id, _Status: "STARTED"}
            games.findOne(findQuery, function(err, res){
                if (res) {
                    promises.push(module.exports.logWinner(res._player1, receivedMessage))
                    promises.push(module.exports.logLoser(res._player2, receivedMessage))
                    promises.push(module.exports.logLoser(res._player3, receivedMessage))
                    promises.push(module.exports.logLoser(res._player4, receivedMessage))
                    Promise.all(promises).then(function() {
                        arguments[0].forEach(arg => {
                            out.push(arg)
                        })
                        resolve(out)
                    }, function(err) {
                        console.log(err)
                    });
                }
                else {
                    reject('NO GAME')
                }
            })
        })
    },

    /**
     * Logs a new match to the season.
     * TODO: Change specific deck w/l
     */
    oldLogMatch(id) {
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
                        reject('Match Not Confirmed')
                    }
                }
                else {
                    //console.log ("Match #:" + id + " not found")
                }
            })
        })
    },
    /**
     * Creates match
     * TODO: Add server functionality
     */
    findUserDeck(id, receivedMessage){
        const user = require('../Schema/Users')
        return new Promise((resolve, reject) => {
            findQuery = {_mentionValue: id, _server:receivedMessage.guild.id}
            user.findOne(findQuery, function(err, res) {
                if (res) {
                    resolve(res._currentDeck)
                }
                else {
                    reject('ERROR')
                }
            })
        })
    },
    async createMatch(player1, player2, player3, player4, id, receivedMessage, callback) {
        const game = require('../Schema/Games')
        const SeasonHelper = require('../Helpers/SeasonHelper')
        var currentSeasonObj = await SeasonHelper.getCurrentSeason(receivedMessage.guild.id)
        var currentSeasonName = currentSeasonObj._season_name

        let deck1
        let deck2
        let deck3
        let deck4

        //Get Decks
        promiseArr = []

        promiseArr.push(module.exports.findUserDeck(player1, receivedMessage))
        promiseArr.push(module.exports.findUserDeck(player2, receivedMessage))
        promiseArr.push(module.exports.findUserDeck(player3, receivedMessage))
        promiseArr.push(module.exports.findUserDeck(player4, receivedMessage))

        Promise.all(promiseArr).then(function() {
            var player1R = "None"
            var player2R = "None"
            var player3R = "None"
            var player4R = "None"
    
            deck1 = arguments[0][0]
            deck2 = arguments[0][1]
            deck3 = arguments[0][2]
            deck4 = arguments[0][3]
            var player1Deck = deck1
            var player2Deck = deck2
            var player3Deck = deck3
            var player4Deck = deck4

            deckTest = deck1.split(' | ')
            if (deckTest[1] == "Rogue"){
                player1RF = deckTest[0]
                player1Deck = deckTest[1]
            }
            deckTest = deck2.split(' | ')
            if (deckTest[1] == "Rogue"){
                player2RF = deckTest[0]
                player2Deck = deckTest[1]
            }
            deckTest = deck3.split(' | ')
            if (deckTest[1] == "Rogue"){
                player3RF = deckTest[0]
                player3Deck = deckTest[1]
            }
            deckTest = deck4.split(' | ')
            if (deckTest[1] == "Rogue"){
                player4RF = deckTest[0]
                player4Deck = deckTest[1]
            }
            game({
                    _match_id: id, 
                    _server: receivedMessage.guild.id, 
                    _season: currentSeasonName, 
                    _player1: player1, 
                    _player2: player2, 
                    _player3: player3, 
                    _player4: player4, 
                    _player1Deck: player1Deck, 
                    _player2Deck: player2Deck, 
                    _player3Deck: player3Deck, 
                    _player4Deck: player4Deck, 
                    _Status: "STARTED", 
                    _player1Confirmed: "N", 
                    _player2Confirmed: "N", 
                    _player3Confirmed: "N", 
                    _player4Confirmed: "N",
                    _player1Rogue: player1R,
                    _player2Rogue: player2R,
                    _player3Rogue: player3R,
                    _player4Rogue: player4R,
                }).save(function(err, result){
                if (result){
                    console.log("Successfully created Game #" + id)
                    callback("SUCCESS")
                }
                else {
                    console.log("Game creation failed for Game #" + id)
                    callback("FAILURE")
                }
            })
        })
    },

    /**
     * Deletes an unconfirmed match
     */
    deleteMatch(id, receivedMessage) {
        return new Promise((resolve, reject) => {
            const games = require('../Schema/Games')
            server = receivedMessage.guild.id

            let findQuery = {_match_id: id, _server: server}
            games.findOne(findQuery, function(err, res) {
                if (res) {
                    if (res._Status != "FINISHED") {
                        games.deleteOne(findQuery, function(err, res) {
                            if (err) throw err;
                            resolve('SUCCESS')
                        })
                    }
                    else {
                        resolve('CONFIRM')
                    }
                }
                else {
                    reject('ERROR')
                }
            })
    })
    },

    confirmedDeleteMatch(id, receivedMessage) {
        return new Promise((resolve, reject) => {
            const games = require('../Schema/Games')
            server = receivedMessage.guild.id

            let findQuery = {_match_id: id, _server: server}
            games.findOne(findQuery, function(err, res) {
                if (res) {
                    games.deleteOne(findQuery, function(err, res) {
                        if (err) throw err;
                        resolve('SUCCESS')
                    })
                }
                else {
                    reject('ERROR')
                }
            })
        })
    },

    /**
     * Display info about a match
     */
    matchInfo(id, receivedMessage) {
        let match_id = id
        let server_id = receivedMessage.guild.id
        var returnArr = new Array
        const games = require('../Schema/Games')

        return new Promise((resolve, reject) => {
            let findQuery = {_match_id: match_id, _server: server_id}
            games.findOne(findQuery, function(err, res) {
                if (res) {
                    timestamp = res._id.toString().substring(0,8)
                    date = new Date( parseInt( timestamp, 16 ) * 1000)
                    returnArr.push(date)
                    returnArr.push(res._match_id)
                    returnArr.push(res._server)
                    returnArr.push(res._season)
                    returnArr.push(res._player1)
                    returnArr.push(res._player2)
                    returnArr.push(res._player3)
                    returnArr.push(res._player4)
                    returnArr.push(res._player1Deck)
                    returnArr.push(res._player2Deck)
                    returnArr.push(res._player3Deck)
                    returnArr.push(res._player4Deck)
                    resolve(returnArr)
                }
                else {
                    reject('FAIL')
                }
            })
        })
    },

    /**
     *  returns a 2D array of players and their respective confirmed value (Y or N)
     */
    getRemindInfo(player, server_id) {
        const games = require('../Schema/Games')
        var returnArr = new Array;

        return new Promise((resolve, reject) => {
            let findQuery = {$and: 
                                    [
                                        {_server: server_id, _Status: "STARTED"},
                                        { $or: 
                                            [
                                                {_player1: player},
                                                {_player2: player},
                                                {_player3: player},
                                                {_player4: player}
                                            ]
                                        }
                                    ]
                            }
            games.findOne(findQuery, function(err, res) {
                if (res) {
                    returnArr.push([res._player1, res._player1Confirmed])
                    returnArr.push([res._player2, res._player2Confirmed])
                    returnArr.push([res._player3, res._player3Confirmed])
                    returnArr.push([res._player4, res._player4Confirmed])
                    resolve(returnArr)
                }
                else {
                    reject(returnArr)
                }
            })
        })
    },
    finishMatch(id, message) {
        return new Promise((resolve, reject) => {
            const games = require('../Schema/Games')
            findQuery = {_match_id: id, _server: message.guild.id}
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
    },
    async getPending(guild){
        const matches = require('../Schema/Games')
        const SeasonHelper = require('../Helpers/SeasonHelper')

        var seasonObj = await SeasonHelper.getCurrentSeason(guild)
        let seasonName = seasonObj._season_name

        let arrayOfPending = new Array();

        let matchQuery = {_server: guild, _season: seasonName}
        return new Promise((resolve, reject)=>{
            matches.find(matchQuery, function(err, foundMatches){
                if (foundMatches){
                    foundMatches.forEach((match)=>{
                        if (match._Status == "STARTED"){
                            arrayOfPending.push(match)
                        }
                    })
                    if (arrayOfPending.length > 0){
                        resolve(arrayOfPending)
                    }else{
                        resolve("No Pending")
                    }
                }
                else{
                    resolve("No Matches")
                }
            })
        })
    },
    async forceAccept(matchID ,guild){
        const matches = require('../Schema/Games')
        const SeasonHelper = require('../Helpers/SeasonHelper')

        var seasonObj = await SeasonHelper.getCurrentSeason(guild)
        let seasonName = seasonObj._season_name

        let findQuery = { _server: guild, _season: seasonName, _match_id: matchID}

        return new Promise((resolve, reject)=>{
            matches.findOne(findQuery, function(err, res){
                if (res){
                    if (res._Status == "STARTED"){
                        let toUpdate = {$set:{_Status: "FINISHED"}}
                        matches.updateOne(findQuery, toUpdate, function(err,res){
                            if (res){ resolve("Success")}
                            else{ resolve ("Error")}
                        })
                    }else{
                        resolve("Match is already accepted")
                    }
                }
                else{
                    resolve("Can't find match")
                }
            })
        })
        
    }
}