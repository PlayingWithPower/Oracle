const { db } = require('../Schema/Deck')
const { resolve } = require('dns')
const Deck = require('../Schema/Deck')
const { type } = require('os')

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
        const matches = require('../Schema/Games')

        // Yeah just a sec
        // !deckstats
        // Raw dump of decks
        // !deckstats {deck nickname}
        // Stats for a given deck
        // !deckstats @user
        // Stats for a given user
        // !deckstats {Deck Nickname} | {Season Name}
        // or !deckstats {Deck Nickname} | all)
       
        if (args.length == 0){
            return new Promise((resolve, reject)=>{
                resolve("test")
            })
        }
        else if (args[0].slice(0,3) == "<@!"){
            const user = require('../Schema/Users')
            var holderArr = new Array
            return new Promise((resolve, reject) => {
                user.find({'_mentionValue': args[0],'_server' : receivedMessage.guild.id}).then((res) =>{
                    var resolveArr = new Array();
                    resolveArr.push("User Lookup", res)
                    resolve(resolveArr)
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
                query = { $or: [ { _player1Deck: splitArgs[0] }, { _player2Deck: splitArgs[0] },{ _player3Deck: splitArgs[0] }, { _player4Deck: splitArgs[0] } ] }
            }
            else if (splitArgs[1] == "All"){
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
                        passedArray.push(args, wins, losses, deckPlayers)
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
     * Checks if the deck a user is trying to update is valid. 
     * Helper Function to the two below updateDeckName() and updateDeckList()
     */
    findDeckToUpdate(receivedMessage, args){
        const deck = require('../Schema/Deck')
        args = args.join(' ')
        let lowerArgs = args.toString().toLowerCase()
        let deckQuery = {_alias: lowerArgs, _server: receivedMessage.guild.id}
        return new Promise((resolve, reject)=>{
            deck.find(deckQuery, function(err, res){
                if (res.length > 0){
                    resolve(res)
                }
                else{
                    resolve("Error 1")
                }
            })
        })
    },
    /**
     * Updates the Deck Name of a deck 
     */
    updateDeckName(newNameMessage, oldNameID){
        const deck = require('../Schema/Deck')
        const alias = require('../Schema/Alias')

        let checkingArr = new Array();
        let newName
        let newAlias
        var newStr = newNameMessage.content

        newAlias = newStr.toLowerCase()
        newName = newStr.toLowerCase()
        .split(' ')
        .map(function(word) {
            return word[0].toUpperCase() + word.substr(1);
        })
        .join(' ');

        let deckQuery = {_id: oldNameID}
        return new Promise ((resolve, reject)=>{
           deck.find(deckQuery, function(err, deckFindRes){
               if (deckFindRes){
                   deck.updateOne(deckQuery, { $set: {_name: newName, _alias: newAlias } }, function(err, deckUpdateRes){
                    if(deckUpdateRes){
                        checkingArr.push(["New Name", newName])
                    }
                    else{
                        resolve("Error 2")
                    }
                   })
                   convertedAlias = deckFindRes[0]._alias.toLowerCase()
                        .split(' ')
                        .map(function(word) {
                            return word[0].toUpperCase() + word.substr(1);
                        })
                        .join(' ');
                    let aliasQuery = {_name: convertedAlias, _server: deckFindRes[0]._server}
                    alias.findOne(aliasQuery, function(err, aliasFindRes){
                       if (aliasFindRes){
                           alias.updateOne(aliasQuery, {$set: {_name: newName}}, function (err, aliasUpdateRes){
                                if (aliasUpdateRes){
                                    checkingArr.push(["Old Name", deckFindRes[0]._name])
                                    resolve(checkingArr)
                                }
                                else{
                                    resolve("Error 4")
                                }
                           })
                       }
                       else{
                           resolve("Error 3")
                       }
                   })
               }
               else{
                   resolve("Error 1")
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
    addDeckHelper(message, args){
        const deck = require('../Schema/Deck')
        const alias = require('../Schema/Alias')
        let primerBool
        if (args[7].value == "False"){
            primerBool = false
        }
        else{
            primerBool = true
        }
        let deckSave = {
            '_link': args[3].value, 
            '_name': args[0].value, 
            '_alias': args[0].value.toLowerCase(),
            '_commander': args[1].value,
            '_colors': args[2].value,
            '_author': args[4].value,
            '_server': message.guild.id, 
            '_season': "1",
            '_description': args[5].value,
            '_discordLink': args[8].value,
            '_dateAdded': "",
            '_deckType': args[6].value,
            '_hasPrimer': primerBool
        }
        let aliasSave = {
            '_name': args[0].value, 
            '_server': message.guild.id
        }
        return new Promise ((resolve, reject)=>{
            deck(deckSave).save(function(err, res){
                if (res){
                    alias(aliasSave).save(function(err, res){
                        if (res){
                            resolve(args[0].value)
                            //DEBUG: console.log("DEBUG: Successfully saved to ALIAS DB")
                        }
                        else{
                            resolve("Error 1")
                        }
                    })
                    //DEBUG: console.log("DEBUG: Successfully saved to DECK DB")
                }
                else{
                    resolve("Error 1")
                }
            })
        })
    },
    /** 
     * Locates the deck to remove. Then waits for user reaction
     */
    findDeckToRemove(receivedMessage, args){
        const deck = require('../Schema/Deck')
        args = args.join(' ')
        let lowerArgs = args.toString().toLowerCase()
        let deckQuery = {_alias: lowerArgs, _server: receivedMessage.guild.id}
        return new Promise((resolve, reject)=>{
            deck.find(deckQuery, function(err, res){
                if (res.length > 0){
                    resolve(res)
                }
                else{
                    resolve("Error 1")
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