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
     * Updates the URL or Alias of a deck
     */
    updateDeck(){

    },

    /**
     * Adds a new User deck to the server.
     * TODO: ****Case Sensitivity*** godo vs Godo are different decks right now
     * TODO: Change receivedmessage.author.username to reference ID instead of username, IDs are absolute
     * TODO: Add react to messages to confirm your deck and alias 
     * TODO: Command only checks DB vs other aliases, not vs other URLS. AKA you can have two decklist URLs on the DB if they have different aliases
     */
    addDeck(receivedMessage, args, callback) {
        const deck = require('../Schema/Deck')
        const alias = require('../Schema/Alias')

        const callBackArray = new Array();

        let urlArg;
        let nameArg;
        let aliasArg
        try{
            urlArg = args[0].toString()
            nameArg = (args.slice(1)).toString();
            
            var lower = nameArg.toLowerCase();
            aliasArg = lower

            var newStr = nameArg.replace(/,/g, ' ');
            nameArg = newStr
        }
        catch{
            console.log("Url or alias failed to cast to Strings")
        }

        let deckAliasQuery = {'_alias': aliasArg}
        let deckQuery = {'_link': urlArg, '_name': nameArg, '_alias': aliasArg, '_user': receivedMessage.author.username, '_server': "PWP", '_season': "1"}
        let nameQuery = {'_name': nameArg}

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
                            //console.log("DEBUG: Successfully saved to DECK DB")
                        }
                        else{
                            callback("Error: Unable to save to Database, please try again")
                        }
                    })
                    alias(nameQuery).save(function(err, res){
                        if (res){
                            callBackArray.push(nameArg)
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
        const deck = require('../Schema/Deck')
        const alias = require('../Schema/Alias')

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
                        let aliasQuery = {'_link': aliasListArray[internalIndex]}
                        alias(aliasQuery).save(function(err, res){
                            if (res){
                                //console.log(aliasListArray[i])
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