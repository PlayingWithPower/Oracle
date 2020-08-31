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
const bootstrap = require('../bootstrap.js');


module.exports = {

    logWinner(id, receivedMessage) {
        return new Promise((resolve, reject) => {
            let findQuery = {_mentionValue: id, _server: receivedMessage.guild.id};
            bootstrap.User.findOne(findQuery, function(err, res) {
                if (res) {
                    resolve("**" + id + "**'s won. Check !profile to see your update score")
                }
                else {
                    reject('PLAYER NOT FOUND')
                }
            })      
        })
    },

    logLoser(id, receivedMessage) {
        return new Promise((resolve, reject) => {
            let findQuery = {_mentionValue: id, _server: receivedMessage.guild.id};
            bootstrap.User.findOne(findQuery, function(err, res) {
                if (res) {
                    resolve("**" + id + "**'s lost. Check !profile to see your update score")
                }
                else {
                    reject('PLAYER NOT FOUND')
                }
            })      
        })
    },

    logMatch(id, receivedMessage) {
        let promises = [];
        let out = [];

        return new Promise((resolve, reject) => {
            let findQuery = {_match_id: id, _Status: "STARTED"};
            bootstrap.Game.findOne(findQuery, function(err, res){
                if (res) {
                    promises.push(module.exports.logWinner(res._player1, receivedMessage));
                    promises.push(module.exports.logLoser(res._player2, receivedMessage));
                    promises.push(module.exports.logLoser(res._player3, receivedMessage));
                    promises.push(module.exports.logLoser(res._player4, receivedMessage));
                    Promise.all(promises).then(function() {
                        arguments[0].forEach(arg => {
                            out.push(arg)
                        });
                        resolve(out)
                    }, function(err) {
                        //console.log(err)
                    });
                }
                else {
                    reject('NO GAME')
                }
            })
        })
    },
    /**
     * Confirms match against for user.
     */
    confirmMatch(id, player) {
        let findQuery = {'_match_id': id};

        return new Promise((resolve, reject) => {
            bootstrap.Game.findOne(findQuery, function(err, res){
                if (res) {
                    if (res._player1Confirmed === "N" && res._player1 === player){
                        bootstrap.Game.updateOne(findQuery, {$set: {_player1Confirmed: "Y"}}, function(err,result){
                            if (result){
                                resolve('SUCCESS')
                            }
                            else{
                                reject('1')
                            }
                        })
                    }
                    else if (res._player2Confirmed === "N" && res._player2 === player){
                        bootstrap.Game.updateOne(findQuery, {$set: {_player2Confirmed: "Y"}}, function(err,result){
                            if (result){
                                resolve('SUCCESS')
                            }
                            else{
                                reject('2')
                            }
                        })
                    }
                    else if (res._player3Confirmed === "N" && res._player3 === player){
                        bootstrap.Game.updateOne(findQuery, {$set: {_player3Confirmed: "Y"}}, function(err,result){
                            if (result){
                                resolve('SUCCESS')
                            }
                            else{
                                reject('3')
                            }
                        })
                    }
                    else if (res._player4Confirmed === "N" && res._player4 === player){
                        bootstrap.Game.updateOne(findQuery, {$set: {_player4Confirmed: "Y"}}, function(err,result){
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
        let findQuery = {'_match_id': id};
        return new Promise((resolve, reject) => {
            bootstrap.Game.findOne(findQuery, function(err, res){
                if (res) {
                    if (res._player1Confirmed === "Y" && res._player2Confirmed === "Y" && res._player3Confirmed === "Y" && res._player4Confirmed === "Y" ) {
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
     */
    findUserDeck(id, receivedMessage){
        let findQuery = {_mentionValue: id, _server: receivedMessage.guild.id};
        return new Promise((resolve, reject) => {
            bootstrap.User.findOne(findQuery, function(err, res) {
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
        let currentSeasonObj = await bootstrap.SeasonHelper.getCurrentSeason(receivedMessage.guild.id);
        let currentSeasonName = currentSeasonObj._season_name;

        let deck1;
        let deck2;
        let deck3;
        let deck4;

        //Get Decks
        let promiseArr = [];

        promiseArr.push(module.exports.findUserDeck(player1, receivedMessage));
        promiseArr.push(module.exports.findUserDeck(player2, receivedMessage));
        promiseArr.push(module.exports.findUserDeck(player3, receivedMessage));
        promiseArr.push(module.exports.findUserDeck(player4, receivedMessage));

        Promise.all(promiseArr).then(function() {
            let player1R = "None";
            let player2R = "None";
            let player3R = "None";
            let player4R = "None";
    
            deck1 = arguments[0][0];
            deck2 = arguments[0][1];
            deck3 = arguments[0][2];
            deck4 = arguments[0][3];
            let player1Deck = deck1;
            let player2Deck = deck2;
            let player3Deck = deck3;
            let player4Deck = deck4;

            let deckTest = deck1.split(' | ');
            if (deckTest[1] === "Rogue"){
                player1R = deckTest[0];
                player1Deck = deckTest[1]
            }
            deckTest = deck2.split(' | ');
            if (deckTest[1] === "Rogue"){
                player2R = deckTest[0];
                player2Deck = deckTest[1]
            }
            deckTest = deck3.split(' | ');
            if (deckTest[1] === "Rogue"){
                player3R = deckTest[0];
                player3Deck = deckTest[1]
            }
            deckTest = deck4.split(' | ');
            if (deckTest[1] === "Rogue"){
                player4R = deckTest[0];
                player4Deck = deckTest[1]
            }
            let matchSave = {
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
                    _player4Rogue: player4R
                };
            bootstrap.Game(matchSave).save(function(err, result){
                if (result){
                    //console.log("Successfully created Game #" + id)
                    callback("SUCCESS")
                }
                else {
                    console.log("Game creation failed for Game #" + id);
                    callback("FAILURE")
                }
            })
        })
    },

    /**
     * Deletes an unconfirmed match
     */
    async deleteMatch(id, receivedMessage) {
        let currentSeasonObj = await bootstrap.SeasonHelper.getCurrentSeason(receivedMessage.guild.id);
        let currentSeasonName = currentSeasonObj._season_name;
        return new Promise((resolve, reject) => {
            let server = receivedMessage.guild.id;
            let findQuery = {_match_id: id, _server: server, _season: currentSeasonName};
            bootstrap.Game.findOne(findQuery, function(err, res) {
                if (res) {
                    resolve('CONFIRM')
                }
                else {
                    reject('ERROR')
                }
            })
        })
    },

    async confirmedDeleteMatch(id, receivedMessage) {
        let currentSeasonObj = await bootstrap.SeasonHelper.getCurrentSeason(receivedMessage.guild.id);
        let currentSeasonName = currentSeasonObj._season_name;
        return new Promise((resolve, reject) => {
            let server = receivedMessage.guild.id;

            let findQuery = {_match_id: id, _server: server, _season: currentSeasonName};
            bootstrap.Game.findOne(findQuery, function(err, res) {
                if (res) {
                    bootstrap.Game.deleteOne(findQuery, function(err, res) {
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
    async matchInfo(id, receivedMessage) {
        let currentSeasonObj = await bootstrap.SeasonHelper.getCurrentSeason(receivedMessage.guild.id);
        let currentSeasonName = currentSeasonObj._season_name;
        let match_id = id;
        let server_id = receivedMessage.guild.id;
        let returnArr = [];

        return new Promise((resolve, reject) => {
            let findQuery = {_match_id: match_id, _server: server_id, _season: currentSeasonName};
            bootstrap.Game.findOne(findQuery, function(err, res) {
                if (res) {
                        let timestamp = res._id.toString().substring(0,8);
                        let date = new Date( parseInt( timestamp, 16 ) * 1000);
                        returnArr.push(date);
                        returnArr.push(res._match_id);
                        returnArr.push(res._server);
                        returnArr.push(res._season);
                        returnArr.push(res._player1);
                        returnArr.push(res._player2);
                        returnArr.push(res._player3);
                        returnArr.push(res._player4);
                        returnArr.push(res._player1Deck);
                        returnArr.push(res._player2Deck);
                        returnArr.push(res._player3Deck);
                        returnArr.push(res._player4Deck);
                    if (res._Status === "FINISHED"){
                        returnArr.push("Finished Match");
                        resolve(returnArr)
                    }else if (res._Status === "CLOSED"){
                        returnArr.push("Disputed Match");
                        resolve(returnArr)
                    }
                    else if (res._Status === "STARTED"){
                        returnArr.push("Pending Match");
                        resolve(returnArr)
                    }
                }else {
                    resolve('FAIL')
                }
            })
        })
    },

    /**
     *  returns a 2D array of players and their respective confirmed value (Y or N)
     */
    async getRemindInfo(player, server_id) {
        let currentSeasonObj = await bootstrap.SeasonHelper.getCurrentSeason(receivedMessage.guild.id);
        let currentSeasonName = currentSeasonObj._season_name;
        let returnArr = [];

        return new Promise((resolve, reject) => {
            let findQuery = {$and: 
                                    [
                                        {_server: server_id,
                                        _season: currentSeasonName,
                                        _Status: "STARTED"},
                                        { $or: 
                                            [
                                                {_player1: player},
                                                {_player2: player},
                                                {_player3: player},
                                                {_player4: player}
                                            ]
                                        }
                                    ]
                            };
            bootstrap.Game.findOne(findQuery, function(err, res) {
                if (res) {
                    returnArr.push([res._player1, res._player1Confirmed]);
                    returnArr.push([res._player2, res._player2Confirmed]);
                    returnArr.push([res._player3, res._player3Confirmed]);
                    returnArr.push([res._player4, res._player4Confirmed]);
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
            let findQuery = {_match_id: id, _server: message.guild.id};
            bootstrap.Game.findOne(findQuery, function(err, res) {
                if (res) {
                    if (res._Status === "STARTED") {
                        let newStatus = {$set: {_Status: "FINISHED"}};
                        bootstrap.Game.updateOne(findQuery, newStatus, function(err, result){
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
            let findQuery = {_match_id: id, _Status: "STARTED"};
            bootstrap.Game.findOne(findQuery, function(err, res) {
                if (res) {
                    let newStatus = {$set: {'_Status': "CLOSED"}};
                    bootstrap.Game.updateOne(findQuery, newStatus, function(err, result){
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
    async getPending(guild, disputedTag){

        let seasonObj = await bootstrap.SeasonHelper.getCurrentSeason(guild);
        let seasonName = seasonObj._season_name;

        let statusSearch = "STARTED";

        let arrayOfPending = [];
        if (disputedTag === "Disputed"){
            statusSearch = "CLOSED"
        }
        let matchQuery = {_server: guild, _season: seasonName};
        return new Promise((resolve, reject)=>{
            bootstrap.Game.find(matchQuery, function(err, foundMatches){
                if (foundMatches){
                    foundMatches.forEach((match)=>{
                        if (match._Status === statusSearch){
                            arrayOfPending.push(match)
                        }
                    });
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

        let seasonObj = await bootstrap.SeasonHelper.getCurrentSeason(guild);
        let seasonName = seasonObj._season_name;

        let findQuery = { _server: guild, _season: seasonName, _match_id: matchID};

        return new Promise((resolve, reject)=>{
            bootstrap.Game.findOne(findQuery, function(err, res){
                if (res){
                    if (res._Status === "STARTED" || res._Status === "CLOSED"){
                        let toUpdate = {$set:{_Status: "FINISHED"}};
                        bootstrap.Game.updateOne(findQuery, toUpdate, function(err,res){
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
        
    },

};