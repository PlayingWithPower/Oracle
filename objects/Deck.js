const { db } = require('../Schema/Deck')
const { resolve } = require('dns')
const Deck = require('../Schema/Deck')
const { type } = require('os')
const DeckHelper = require('../Helpers/DeckHelper')
const { match } = require('assert')
const { exit } = require('process')

/**
 * Deck Object
 *
 * Functionality for decks and deck aliases.
 */
module.exports = {

    /**
     * Returns a list of all Deck Aliases registered to the server
     */
    listDecks(receivedMessage, callback) {
        const deck = require('../Schema/Deck')
        return new Promise((resolve, reject) =>{
            deck.find({_server: receivedMessage.guild.id},function(err, res){
                resolve(res)
            }) 
        })
        
    },
    /**
     * Returns a list of all User submitted decks registered to the server.
     */
    listUserDecks(receivedMessage) {
        const user = require('../Schema/Users')
        var holderArr = new Array
        return new Promise((resolve, reject) => {
            user.find({'_mentionValue': "<@!"+receivedMessage.author.id+">",'_server' : receivedMessage.guild.id}).then((docs) =>{
                docs.forEach((doc)=>{
                    holderArr.push(doc)
                })
            }).then(function(){
                resolve(holderArr)
            })
        })
    },
    /**
     * Returns information about a deck
     * @param {*} receivedMessage 
     * @param {*} args 
     */
    deckInfo(receivedMessage, args){
        try{
            args = args.join(' ')
            .toLowerCase()
            .split(' ')
            .map(function(word) {
                // console.log("First capital letter: "+word[0]);
                // console.log("remain letters: "+ word.substr(1));
                return word[0].toUpperCase() + word.substr(1);
            })
            .join(' ');
        }
        catch{
            args = ""
        }
        const deck = require('../Schema/Deck')

        let deckQuery = {_name: args, _server: receivedMessage.guild.id}
        return new Promise((resolve, reject) =>{
            deck.findOne(deckQuery, function(err, res){
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
     * Returns stats about a deck alias
     * TODO: !deckstats <deckname> should return the current season by default. ATM 
     *  it returns the same as !deckstats <deckname> | all
     */
    deckStats(receivedMessage, args){
        const DeckHelper = require('../Helpers/DeckHelper')
        
        const user = require('../Schema/Users')
        const matches = require('../Schema/Games')
        var currentSeason = "1" //UPDATE ME

        //Notes:
            //     !deckstats
            // Raw dump of decks against the current season for the server
            //     Deck Name / Alias
            //     Matches / Wins / Losses / Winrate
            // Decks with no matches for the season will not show up in the list
            // Default sorting is number of matches
            //         !deckstats {deck alias}
            // Dump of the deck passed against the current season for the server
            //     Alias / Matches / Wins / Losses / Winrate
            // Secondary piece of data pertaining to the users using that deck in the server
            //     Username / Wins / Losses / Winrate (for that deck only)
            // Don't give deck meta data (color identity, url, etc.), instead give a footer reminder note of the command to get that data.

        //Include in all of these:
            //deck name, wins, losses, number of matches, win rate
        // !deckstats
            // All Decks for current season
        // !deckstats {deck nickname}
            // Stats for a given deck, *CURRENT SEASON* change me
        // !deckstats @user
            // Stats for a given user
            // Make this a helper for !profile @user
        // !deckstats {Deck Nickname} | {Season Name}
        // or !deckstats {Deck Nickname} | all)
        //   "For season name: all" vs "For season name: across all seasons"

        //implement !deckstats here
        if (args.length == 0){
            return new Promise((resolve, reject)=>{
                let query = {'_server': receivedMessage.guild.id, '_season': currentSeason}
                var passingResult
                var passedArray = new Array()
                matches.find(query, function(err, res){
                    if (res){
                        passingResult = res
                    }
                    else{
                        resolve("Error 1")
                    }
                }).then(function(passingResult){
                    if (passingResult != ""){
                        var matchResults = []
                        for (var i=0; i <passingResult.length; i++){
                            var exists = matchResults.find(el => el[0] === passingResult[i]._player1Deck)
                            var exists2 = matchResults.find(el => el[0] === passingResult[i]._player2Deck)
                            var exists3 = matchResults.find(el => el[0] === passingResult[i]._player3Deck)
                            var exists4 = matchResults.find(el => el[0] === passingResult[i]._player4Deck)
                            if (exists) {
                                exists[1] += 1;
                              } else {
                                matchResults.push([passingResult[i]._player1Deck, 1, 0]);
                              }
                            if (exists2) {
                                exists2[2] += 1;
                                } else {
                                matchResults.push([passingResult[i]._player2Deck, 0, 1]);
                                } 
                            if (exists3) {
                                exists3[2] += 1;
                                } else {
                                matchResults.push([passingResult[i]._player3Deck, 0, 1]);
                                }
                            if (exists4) {
                                exists4[2] += 1;
                                } else {
                                matchResults.push([passingResult[i]._player4Deck, 0, 1]);
                                }
                        }
                        passedArray.push("Raw Deck Lookup",matchResults, currentSeason)
                        resolve(passedArray)
                    }
                    else{
                        resolve("Can't find deck")
                    }
                })
            })
        }

        else if (args[0].slice(0,3) == "<@!"){
            return new Promise((resolve, reject) => {

                args = args.join(' ')
                args = DeckHelper.toUpper(args)
                var conditionalQuery

                let argsWithCommas = args.toString()
                let argsWithSpaces = argsWithCommas.replace(/,/g, ' ');
                let splitArgs = argsWithSpaces.split(" | ")
                
                let wins = 0
                let losses = 0
                var passingResult
                
                if (splitArgs[1] == undefined){
                    conditionalQuery = {_server: receivedMessage.guild.id, _season: currentSeason, $or: 
                        [
                        {_player1: splitArgs[0]}, 
                        {_player2: splitArgs[0]},
                        {_player3: splitArgs[0]},
                        {_player4: splitArgs[0]},
                        ]
                    }
                }
                else if (splitArgs[1].toLowerCase() == "all"){
                    conditionalQuery = {_server: receivedMessage.guild.id, $or: 
                        [
                        {_player1: splitArgs[0]}, 
                        {_player2: splitArgs[0]},
                        {_player3: splitArgs[0]},
                        {_player4: splitArgs[0]},
                        ]
                    }
                }
                else{
                    conditionalQuery = {_server: receivedMessage.guild.id, _season: splitArgs[1], $or: 
                        [
                        {_player1: splitArgs[0]}, 
                        {_player2: splitArgs[0]},
                        {_player3: splitArgs[0]},
                        {_player4: splitArgs[0]},
                        ]
                    }
                }
                matches.find(conditionalQuery, function(err,res){
                    if (err){
                        throw err;
                    }
                    passingResult = res;
                }).then(function(passingResult){
                    if (passingResult != ""){
                        passingResult.forEach((entry)=>{   
                            if (entry._player1 == splitArgs[0]){
                                wins = wins + 1
                            }
                            else if (entry._player2 == splitArgs[0]){
                                losses = losses + 1
                            }
                            else if (entry._player3 == splitArgs[0]){
                                losses = losses + 1
                            }
                            else if (entry._player4 == splitArgs[0]){
                                losses = losses + 1
                            }
                        })
                        let passedArray = new Array()
                        passedArray.push("User Lookup",splitArgs[0],wins,losses, currentSeason)
                        resolve(passedArray)
                    }else{
                        resolve("Can't find deck")
                    }
                    
                })
                
            })
        }
        else{
            args = args.join(' ')
            args = DeckHelper.toUpper(args)
            var query

            let argsWithCommas = args.toString()
            let argsWithSpaces = argsWithCommas.replace(/,/g, ' ');
            let splitArgs = argsWithSpaces.split(" | ")
            if (splitArgs[1] == undefined){
                query = {_season: currentSeason, $or: [ { _player1Deck: splitArgs[0] }, { _player2Deck: splitArgs[0] },{ _player3Deck: splitArgs[0] }, { _player4Deck: splitArgs[0] } ] }
            }
            else if (splitArgs[1].toLowerCase() == "all"){
                query = { $or: [ { _player1Deck: splitArgs[0] }, { _player2Deck: splitArgs[0] },{ _player3Deck: splitArgs[0] }, { _player4Deck: splitArgs[0] } ] }
            }
            else{
                query = {_season: splitArgs[1], $or: [ { _player1Deck: splitArgs[0] }, { _player2Deck: splitArgs[0] },{ _player3Deck: splitArgs[0] }, { _player4Deck: splitArgs[0] } ] }
            }
            let wins = 0
            let losses = 0
            var deckPlayers = new Array()
            var passingResult

            return new Promise((resolve, reject) =>{
                matches.find(query, function(err, res){
                    if (err){
                        throw err;
                    }
                    passingResult = res;
                }).then(function(passingResult){
                    if (passingResult != ""){
                        passingResult.forEach((entry)=>{
                            if (entry._player1Deck == splitArgs[0]){
                                wins = wins + 1
                                deckPlayers.push(entry._player1)
                            }
                            if (entry._player2Deck == splitArgs[0]){
                                losses = losses + 1
                                deckPlayers.push(entry._player2)
                            }
                            if (entry._player3Deck == splitArgs[0]){
                                losses = losses + 1
                                deckPlayers.push(entry._player3)
                            }
                            if (entry._player4Deck == splitArgs[0]){
                                losses = losses + 1
                                deckPlayers.push(entry._player4)
                            }
                        })
                        let passedArray = new Array
                        deckPlayers = deckPlayers.filter( function( item, index, inputArray ) {
                            return inputArray.indexOf(item) == index;
                        });
                        passedArray.push("Deck Lookup",args, currentSeason, wins, losses, deckPlayers)
                        resolve(passedArray)
                    }
                    else{
                        resolve("Can't find deck")
                    }
                })
            })
        }
    },
    /**
     * Used in ManageReactionHelper
     * Updates the Primer of a Deck
     */
    updatePrimer(newPrimerMessage, oldID){
        const deck = require('../Schema/Deck')
        const DeckHelper = require('../Helpers/DeckHelper')
        let promiseArr = new Array();
        let deckQuery = {_id: oldID}

        if((newPrimerMessage.content.toLowerCase() != "yes") && (newPrimerMessage.content.toLowerCase() !="no")){
            resolve("Error 1")
        }
        else{
            newPrimer = newPrimerMessage.content
            newPrimer = DeckHelper.toUpper(newPrimer)
            if (newPrimer == "Yes"){
                newPrimer = true
            }else{
                newPrimer = false
            }
    
            return new Promise ((resolve, reject)=>{
                deck.find(deckQuery, function(err, deckFindRes){
                    if (deckFindRes){
                        deck.updateOne(deckQuery, {$set: {_hasPrimer: newPrimer}}, function (err, deckUpdateRes){
                            promiseArr.push(deckFindRes[0]._name)
                            promiseArr.push(deckFindRes[0]._hasPrimer)
                            promiseArr.push(newPrimer)
                            resolve(promiseArr)
                        })
                    }
                })
            })
        }

    },
    /**
     * Used in ManageReactionHelper
     * Updates the Type of a Deck
     */
    updateType(newAuthorMessage, oldID){
        const deck = require('../Schema/Deck')
        const DeckHelper = require('../Helpers/DeckHelper')
        let promiseArr = new Array();
        let deckQuery = {_id: oldID}

        if ((newAuthorMessage.content.toLowerCase() != "proactive")&& (newAuthorMessage.content.toLowerCase() != "adaptive")&&(newAuthorMessage.content.toLowerCase() != "disruptive")){
            resolve("Error 1")
        }
        else{
            newDeckType = newAuthorMessage.content
            newDeckType = DeckHelper.toUpper(newDeckType)
    
            return new Promise ((resolve, reject)=>{
                deck.find(deckQuery, function(err, deckFindRes){
                    if (deckFindRes){
                        deck.updateOne(deckQuery, {$set: {_deckType: newDeckType}}, function (err, deckUpdateRes){
                            promiseArr.push(deckFindRes[0]._name)
                            promiseArr.push(deckFindRes[0]._deckType)
                            promiseArr.push(newDeckType)
                            resolve(promiseArr)
                        })
                    }
                })
            })
        }  
    },
    /**
     * Used in ManageReactionHelper
     * Updates the author of a Deck
     */
    updateAuthor(newAuthorMessage, oldID){
        const deck = require('../Schema/Deck')

        let promiseArr = new Array();
        let deckQuery = {_id: oldID}

        let bulkAuthors = newAuthorMessage.content
        bulkAuthors = bulkAuthors.replace(/ /g, "")
        bulkAuthors = bulkAuthors.split(',')

        let commaAuthors = ""
        bulkAuthors.forEach(author =>{
            commaAuthors += author + ", " 
        })
        commaAuthors = commaAuthors.replace(/,([^,]*)$/, '$1')
        commaAuthors = commaAuthors.replace(/ ([^ ]*)$/, '$1')
        return new Promise ((resolve, reject)=>{
            deck.find(deckQuery, function(err, deckFindRes){
                if (deckFindRes){
                    deck.updateOne(deckQuery, {$set: {_author: commaAuthors}}, function (err, deckUpdateRes){
                        promiseArr.push(deckFindRes[0]._name)
                        promiseArr.push(deckFindRes[0]._author)
                        promiseArr.push(commaAuthors)
                        resolve(promiseArr)
                    })
                }
            })
        })
    },
    /**
     * Used in ManageReactionHelper
     * Updates the description of a Deck
     */
    updateDescription(newDescriptionMessage, oldID){
        const deck = require('../Schema/Deck')

        let promiseArr = new Array();
        let deckQuery = {_id: oldID}
        let newDescription = newDescriptionMessage.content

        return new Promise((resolve, reject)=>{
            if (newDescription.length > 750){
                resolve("Error 1")
            }
            else{
                deck.find(deckQuery, function(err, deckFindRes){
                    if (deckFindRes){
                        deck.updateOne(deckQuery, {$set: {_description: newDescription}}, function(err, deckUpdateRes){
                            if (deckUpdateRes){
                                promiseArr.push(deckFindRes[0]._name)
                                resolve(promiseArr)
                            }
                        })
                    }
                })
            }
        })
    },
    /**
     * Used in ManageReactionHelper
     * Updates the color of a Deck
     */
    updateColors(newColorMessage, oldID){
        const deck = require('../Schema/Deck')

        let promiseArr = new Array();
        let deckQuery = {_id: oldID}

        let colorIdentity = newColorMessage.content
        let catchBool = new Boolean
        catchBool = true
        
        return new Promise((resolve, reject)=>{
            for (let letter of colorIdentity.toLowerCase()) {
                if (letter !== ("w") &&letter !== ("u") &&letter !== ("b") &&letter !== ("r") &&letter !== ("g")){
                    catchBool = false
                    resolve("Error 1")
                }
            }
            if (catchBool == true){
                colorIdentity = colorIdentity.toUpperCase()
                colorIdentity = colorIdentity.split('').join(' ')
                colorIdentity = colorIdentity.replace(/ /g, ', ');
                deck.find(deckQuery, function(err, deckFindRes){
                    if (deckFindRes){
                        deck.updateOne(deckQuery, {$set: {_colors: colorIdentity}}, function(err, deckUpdateRes){
                            if (deckUpdateRes){
                                promiseArr.push(deckFindRes[0]._name)
                                promiseArr.push(deckFindRes[0]._colors)
                                promiseArr.push(colorIdentity)
                                resolve(promiseArr)
                            }
                        })
                    }
                })
            }
            else{
                return
            }
        })
        
    },
    /**
     * Used in ManageReactionHelper
     * Updates the Commander of a Deck
     */
    updateCommander(newNameMessage, oldID){
        const deck = require('../Schema/Deck')
        const DeckHelper = require('../Helpers/DeckHelper')

        let promiseArr = new Array();
        let deckQuery = {_id: oldID}
        let newName

        newName = DeckHelper.toUpper(newNameMessage.content)

        return new Promise((resolve, reject) =>{
            deck.find(deckQuery, function(err, deckFindRes){
                if (deckFindRes){
                    deck.updateOne(deckQuery, {$set: {_commander: newName}}, function (err, deckUpdateRes){
                        if (deckUpdateRes){
                            promiseArr.push(deckFindRes[0]._name)
                            promiseArr.push(deckFindRes[0]._commander)
                            promiseArr.push(newName)
                            resolve(promiseArr)
                        }
                        else{
                            console.log("error 1")
                        }
                    })
                }
                else{
                    console.log("error 2")
                }
            })
        })
    },
    /**
     * Updates the URL of a deck
     */
    updateDeckList(newURLMessage, oldNameID){
        const deck = require('../Schema/Deck')

        let checkingArr = new Array();

        let deckQuery = {_id: oldNameID}
        return new Promise ((resolve, reject)=>{
            if(new RegExp("([a-zA-Z0-9]+://)?([a-zA-Z0-9_]+:[a-zA-Z0-9_]+@)?([a-zA-Z0-9.-]+\\.[A-Za-z]{2,4})(:[0-9]+)?(/.*)?").test(newURLMessage.content)) {
                deck.find(deckQuery, function(err, deckFindRes){
                    if (deckFindRes){
                        deck.updateOne(deckQuery, { $set: {_link: newURLMessage.content} }, function(err, deckUpdateRes){
                         if(deckUpdateRes){
                             checkingArr.push(newURLMessage.content)
                             checkingArr.push(deckFindRes[0]._name)
                             resolve(checkingArr)
                         }
                         else{
                             resolve("Error 3")
                         }
                        })
                    }
                    else{
                        resolve("Error 2")
                    }
                })
            }
            else{
                resolve("Error 1")
            }
        })
    },
    /**
     * Updates the URL of a deck
     */
    updateDiscordLink(newURLMessage, oldNameID){
        const deck = require('../Schema/Deck')

        let checkingArr = new Array();

        let deckQuery = {_id: oldNameID}
        return new Promise ((resolve, reject)=>{
            if(new RegExp("([a-zA-Z0-9]+://)?([a-zA-Z0-9_]+:[a-zA-Z0-9_]+@)?([a-zA-Z0-9.-]+\\.[A-Za-z]{2,4})(:[0-9]+)?(/.*)?").test(newURLMessage.content)) {
                deck.find(deckQuery, function(err, deckFindRes){
                    if (deckFindRes){
                        deck.updateOne(deckQuery, { $set: {_discordLink: newURLMessage.content} }, function(err, deckUpdateRes){
                         if(deckUpdateRes){
                             checkingArr.push(newURLMessage.content)
                             checkingArr.push(deckFindRes[0]._name)
                             resolve(checkingArr)
                         }
                         else{
                             resolve("Error 3")
                         }
                        })
                    }
                    else{
                        resolve("Error 2")
                    }
                })
            }
            else{
                resolve("Error 1")
            }
        })
    },
    /**
     * Adds a new User deck to the server.
     */
    addDeck(receivedMessage, newDeckArr) {
        const deck = require('../Schema/Deck')
        const alias = require('../Schema/Alias')
        const DeckHelper = require('../Helpers/DeckHelper')

        let deckNick = newDeckArr[0]
        let deckAlias = newDeckArr[0].toLowerCase()
        let commanderName = newDeckArr[1]
        let colorIdentity = newDeckArr[2]
        let deckLink = newDeckArr[3]
        let author = newDeckArr[4]
        let deckDescription = newDeckArr[5]
        let deckType = newDeckArr[6]
        let hasPrimer = newDeckArr[7]
        let discordLink = newDeckArr[8]
        
        deckNick = DeckHelper.toUpper(deckNick)
        colorIdentity = colorIdentity.toUpperCase()
        colorIdentity = colorIdentity.split('').join(', ')
        commanderName = DeckHelper.toUpper(commanderName)
        deckType = DeckHelper.toUpper(deckType)
        
        if (hasPrimer == "no"){
            hasPrimer = false
        }
        else{
            hasPrimer = true
        }

        const sendBackArr = new Array();
        
        let deckAliasQuery = {
            '_alias': deckAlias, 
            '_server': receivedMessage.guild.id
        }
        return new Promise ((resolve,reject)=>{
            deck.findOne(deckAliasQuery, function(err, res){
                if (res){
                    resolve("Error 1")
                }
                else{
                    sendBackArr.push(
                        deckNick, commanderName, colorIdentity, 
                        deckLink, author, deckDescription, 
                        deckType, hasPrimer, discordLink
                        )
                    resolve(sendBackArr)
                }
            })       
        })
    },
    /** 
     * Takes located deck and deletes it
    */
    removeDeck(args){
        const deck = require('../Schema/Deck')
        argsFiltered = args.slice(9)

        let deckQuery = {_id: argsFiltered}
        return new Promise((resolve, reject)=>{
            deck.deleteOne(deckQuery, function(err, res){
                if (res){
                    resolve(res)
                }
                else{
                    reject("Error 1")
                }
            })
        })
    },
    /**
     * Seed the server with an initial list of Deck Aliases.
     */
    populateDecks(receivedMessage) {
        const deck = require('../Schema/Deck')
        const alias = require('../Schema/Alias')
        
        var deckListArray = new Array();
        var aliasListArray = new Array();

        deckListArray.push("https://tappedout.net/mtg-decks/waiting-for-godo-cedh-primer/")
        aliasListArray.push("Godo Helm")
        deckListArray.push("https://tappedout.net/mtg-decks/the-gitfrog-1/")
        aliasListArray.push("Gitrog Dredge")
        deckListArray.push("https://cedh-decklist-database.xyz/primary.html")
        aliasListArray.push("Kess Storm")
        aliasListArray.push("Rogue")

        var internalIndex = 0;
        
        for (i = 0; i < aliasListArray.length; i++){
            let deckAliasQuery = {_alias: aliasListArray[i].toLowerCase(), _server: receivedMessage.guild.id}
            deck.findOne(deckAliasQuery, function(err, res){
                if (res){
                    //console.log("Populate already ran... ignore this if NOT first set up. Large error if this prints out on first set up. Will print out a few times")
                }
                else{
                        let deckSave = {_link: deckListArray[internalIndex], _name: aliasListArray[internalIndex], _alias: aliasListArray[internalIndex].toLowerCase(), _user: "Discord Bot", _server: receivedMessage.guild.id, _season: "1"}
                        deck(deckSave).save(function(err, res){
                            if (res){
                                //console.log(deckListArray[i])
                            }
                            else{
                                console.log("Error: Unable to save to Database, please try again")
                            }
                        })
                        let aliasSave = {_name: aliasListArray[internalIndex], _server: receivedMessage.guild.id}
                        alias(aliasSave).save(function(err, res){
                            if (res){
                                //console.log(deckListArray[i])
                            }
                            else{
                                console.log("Error: Unable to save to Database, please try again")
                            }
                        })
                    internalIndex++
                }
            })
        }
    },
    setUpPopulate(receivedMessage){
        // Columns are:
        // Has Primer
        // Deck Type: (Proactive, Adaptive, Disruptive)
        // Deck Name
        // Deck Link
        // Commander Name
        // Description
        // Color Identity
        // Discord Link
        // Authors
        // Date Added
        const data = require('../data/decklists.json');
        const deck = require('../Schema/Deck')
        const alias = require('../Schema/Alias')

        data.forEach(decks =>{
            if (decks[0] == "Y"){
                hasPrimer = true
            }
            else{
                hasPrimer = false
            }
            let deckSave = {
                _link: decks[3],
                _name: decks[2],
                _alias: decks[2].toLowerCase(),
                _commander: decks[4],
                _colors: decks[6],
                _author: decks[8],
                _server: receivedMessage.guild.id,
                _season: "1",
                _description: decks[5],
                _discordLink: decks[7],
                _dateAdded: decks[9],
                _deckType: decks[1],
                _hasPrimer: hasPrimer
            }
            let aliasSave = {
                _name: decks[2],
                _server: receivedMessage.guild.id
            }
                deck(deckSave).save(function(err, res){
                    if (res){
                        //console.log("Success!")
                    }
                    else{
                        console.log("Error: Unable to save to Database, please try again")
                    }
                })
                alias(aliasSave).save(function(err, res){
                    if (res){
                        //console.log("Success!")
                    }
                    else{
                        console.log("Error: Unable to save to Database, please try again")
                    }
                })
        })
    }
}