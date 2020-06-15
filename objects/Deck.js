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
     * TODO: Filter by server 
     */
    listDecks(callback) {
        const deck = require('../Schema/Deck')
        deck.find({},{_name:"", _user:"",_id:0},function(err, res){
            callback(res)
        })
    },
    /**
     * Returns a list of all User submitted decks registered to the server.
     * TODO: filters by server, add in restrictions from above ^ 
     */
    listUserDecks() {
        const deck = require('../Schema/Deck')
        deck.find({'_server' : "PWP"}, function(err, res){
            console.log(res)
        })
    },

    /**
     * Returns stats about a deck alias
     */
    deckStats() {

    },

    /**
     * Updates the URL or Alias of a deck
     */
    updateDeck(){

    },

    /**
     * Adds a new User deck to the server.
     * TODO: Add react to messages to confirm your deck and alias 
     * TODO: Command only checks DB vs other aliases, not vs other URLS. AKA you can have two decklist URLs on the DB if they have different aliases
     */
    addDeck(receivedMessage, args, callback) {
        const deck = require('../Schema/Deck')

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
        }
        catch{
            console.log("Url or alias failed to cast to Strings")
        }

        let deckAliasQuery = {'_alias': aliasArg}
        let deckQuery = {'_link': urlArg, '_name': nameArg, '_alias': aliasArg, '_user': "<@!"+receivedMessage.author.id+">", '_server': "PWP", '_season': "1"}

        if(new RegExp("([a-zA-Z0-9]+://)?([a-zA-Z0-9_]+:[a-zA-Z0-9_]+@)?([a-zA-Z0-9.-]+\\.[A-Za-z]{2,4})(:[0-9]+)?(/.*)?").test(urlArg)) {
            //console.log("DEBUG: User succesfully entered a URL")
            deck.findOne(deckAliasQuery, function(err, res){
                if (res){
                    callback("Error: Deck name already used")
                }
                else{
                    deck(deckQuery).save(function(err, res){
                        if (res){
                            callBackArray.push(urlArg)
                            callBackArray.push(aliasArg)
                            callback(callBackArray)
                            console.log("DEBUG: Successfully saved to DECK DB")
                        }
                        else{
                            callback("Error: Unable to save to Database, please try again")
                        }
                    })
                }
            })   
        }
        else{
            callback("Error: Not a valid URL, please follow the format !adddeck <url> <name>")
        }
        
        
    },
    /**
     * Removes a User deck from the server. 
     */
    removeDeck(){

    },
    /**
     * Seed the server with an initial list of Deck Aliases.
     */
    populateDecks() {
        const deck = require('../Schema/Deck')
        
        var deckListArray = new Array();
        var aliasListArray = new Array();

        deckListArray.push("https://tappedout.net/mtg-decks/waiting-for-godo-cedh-primer/")
        aliasListArray.push("Godo")
        deckListArray.push("https://tappedout.net/mtg-decks/the-gitfrog-1/")
        aliasListArray.push("Gitrog")
        deckListArray.push("https://cedh-decklist-database.xyz/primary.html")
        aliasListArray.push("Kess Storm")

        var internalIndex = 0;
        
        for (i = 0; i < deckListArray.length; i++){
            let deckAliasQuery = {'_alias': aliasListArray[i].toLowerCase()}
            deck.findOne(deckAliasQuery, function(err, res){
                if (res){
                    //console.log("Populate already ran... ignore this if NOT first set up. Large error if this prints out on first set up. Will print out a few times")
                }
                else{
                        let deckQuery = {'_link': deckListArray[internalIndex], '_name': aliasListArray[internalIndex], '_alias': aliasListArray[internalIndex].toLowerCase(), '_user': "Discord Bot", '_server': "PWP", '_season': "1"}
                        deck(deckQuery).save(function(err, res){
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