/**
 * League Object
 *
 * Holds league commands, and configuration getters/setters.
 *
 * Configurations available:
 *  - Player Threshold (minimum matches before a player appears on the leaderboard)
 *  - Deck Threshold (mimimum matches before a deck appears on the leaderboard)
 *  - Timeout (how long before a match is considered timed out and nullified)
 *  - Alias Required (this setting allows you to require a deck alias when registering a user deck)
 *  - Admin (users who have admin privileges on your server)
 */
module.exports = {

    /**
     * Summary info for the league
     */
    getInfo() {
        
    },

    /**
     * Register a new user to the league.
     */
    register(receivedMessage, callback) {
        const user = require('../Schema/Users')
        user({'_id' : "<@!" + receivedMessage.author.id +">", '_server': "PWP", '_season': "1", '_name' : receivedMessage.author.username, '_currentDeck': "None", '_elo' : 1000, '_wins' : 0, '_losses' : 0, '_deck': Array}).save(function(err, result){
            if(result){
                console.log("Successfully Registered User")
                callback("1")
            }
            else {
                console.log("User is already registered")
                callback("2")
            }
        });
    },

    /**
     * Sets a configuration
     */
    configSet() {

    },

    /**
     * gets a configuration
     */
    configGet() {

    },

}