/**
 * Deck Object
 *
 * Functionality for decks and deck aliases.
 */
module.exports = {

    /**
     * Returns a list of all Deck Aliases registered to the server
     */
    listDecks() {

    },
    /**
     * Returns a list of all User submitted decks registered to the server.
     */
    listUserDecks() {

    },

    /**
     * Returns stats about a deck alias
     */
    deckStats() {

    },

    /**
     * Returns stats about a user submitted deck.
     */
    userDeckStats() {

    },

    /**
     * Registers a new Deck Alias into the server.
     */
    registerAlias() {
        
    },

    /**
     * Adds a new User deck to the server.
     * TODO: Check if listed URL DONE
     * Check against alias
     * 
     */
    addDeck(receivedMessage, args, callback) {
        const deck = require('../Schema/Deck')
        const alias = require('../Schema/Alias')
        const callBackArray = new Array();

        let urlArg;
        let aliasArg;
        try{
            urlArg = args[0].toString()
            aliasArg = (args.slice(1)).toString();
        }
        catch{
            console.log("url or alias failed")
        }

        let deckAliasQuery = {'_alias': aliasArg}
        let deckQuery = {'_name': urlArg, '_alias': aliasArg, '_user': receivedMessage.author.username, '_server': "PWP", '_season': "1"}
        let aliasQuery = {'_name': aliasArg}

        if(new RegExp("([a-zA-Z0-9]+://)?([a-zA-Z0-9_]+:[a-zA-Z0-9_]+@)?([a-zA-Z0-9.-]+\\.[A-Za-z]{2,4})(:[0-9]+)?(/.*)?").test(urlArg)) {
            //console.log("DEBUG: User succesfully entered a URL")
            deck.findOne(deckAliasQuery, function(err, res){
                if (res){
                    callback("Error: Alias already used")
                }
                else{
                    deck(deckQuery).save(function(err, res){
                        if (res){
                            callBackArray.push(urlArg)
                            //console.log("DEBUG: Successfully saved to DECK DB")
                        }
                        else{
                            callback("Error: Unable to save to Database, please try again")
                        }
                    })
                    alias(aliasQuery).save(function(err, res){
                        if (res){
                            callBackArray.push(aliasArg)
                            callback(callBackArray)
                            //console.log("DEBUG: Successfully saved to ALIAS DB")
                        }
                        else{
                            callback("Error: Unable to save to Database, please try again")
                        }
                    })
                }
            })   
        }
        else{
            callback("Error: Not a valid URL, please follow the format !adddeck <url> <alias>")
        }
        
        
    },

    /**
     * Seed the server with an initial list of Deck Aliases.
     */
    populateDecks() {

    }
}