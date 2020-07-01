const { db } = require('../Schema/Deck')
const { resolve } = require('dns')

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
        deck.find({_server: receivedMessage.guild.id},{_name:"", _user:"", _id:0},function(err, res){
            callback(res)
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
     * Returns stats about a deck alias
     */
    deckStats(receivedMessage, args){
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
        const matches = require('../Schema/Games')

        let query = { $or: [ { _player1Deck: args }, { _player2Deck: args },{ _player3Deck: args }, { _player4Deck: args } ] }
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
                        if (entry._player1Deck == args){
                            wins = wins + 1
                            deckPlayers.push(entry._player1)
                        }
                        else if (entry._player2Deck == args){
                            losses = losses + 1
                            deckPlayers.push(entry._player2)
                        }
                        else if (entry._player3Deck == args){
                            losses = losses + 1
                            deckPlayers.push(entry._player3)
                        }
                        else if (entry._player4Deck == args){
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
        
    },

    /**
     * Updates the URL or Alias of a deck
     */
    updateDeck(){

    },

    /**
     * Adds a new User deck to the server.
     * TODO: Add react to messages to confirm your deck and alias - utilizes the Manage Reaction func in main.js
     */
    addDeck(receivedMessage, args) {
        const deck = require('../Schema/Deck')
        const alias = require('../Schema/Alias')
        const callBackArray = new Array();
        let urlArg;
        let nameArg;
        let aliasArg
        try{
            urlArg = args[0].toString()
            nameArg = (args.slice(1)).toString();
            
            //var lower = nameArg.toLowerCase();
            var newStr = nameArg.replace(/,/g, ' ');

            aliasArg = newStr.toLowerCase()
            nameArg = newStr.toLowerCase()
            .split(' ')
            .map(function(word) {
                // console.log("First capital letter: "+word[0]);
                // console.log("remain letters: "+ word.substr(1));
                return word[0].toUpperCase() + word.substr(1);
            })
            .join(' ');
        }catch{
            console.log("Url or alias failed to cast to Strings")
        }
        let deckAliasQuery = {'_alias': aliasArg, '_server': receivedMessage.guild.id}
        let deckSave = {'_link': urlArg, '_name': nameArg, '_alias': aliasArg, '_user': "<@!"+receivedMessage.author.id+">", '_server': receivedMessage.guild.id, '_season': "1"}
        let aliasSave = {'_name': nameArg, '_server': receivedMessage.guild.id}

        if(new RegExp("([a-zA-Z0-9]+://)?([a-zA-Z0-9_]+:[a-zA-Z0-9_]+@)?([a-zA-Z0-9.-]+\\.[A-Za-z]{2,4})(:[0-9]+)?(/.*)?").test(urlArg)) {
            return new Promise ((resolve,reject)=>{
                deck.findOne(deckAliasQuery, function(err, res){
                    if (res){
                        resolve("Error 1")
                    }
                    else{
                        deck(deckSave).save(function(err, res){
                            if (res){
                                callBackArray.push(urlArg)
                                callBackArray.push(aliasArg)
                                resolve(callBackArray)
                                console.log("DEBUG: Successfully saved to DECK DB")
                            }
                            else{
                                resolve("Error 2")
                            }
                        })
                        alias(aliasSave).save(function(err, res){
                            if (res){
                                console.log("DEBUG: Successfully saved to ALIAS DB")
                            }
                            else{
                                resolve("Error 2")
                            }
                        })
                    }
                })       
            })
        }
        else{
            resolve("Error 3")
        }    
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
                resolve(res)
            })
        })
    },
    /** 
     * Takes located deck and deletes it
    */
    removeDeck(args){
        args = args.replace("**","")
        args = args.replace("**","")
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
    }
}