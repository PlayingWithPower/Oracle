const { User } = require('discord.js')

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

        let qwe = {
            _id: "",
            _mentionValue: "<@!" + receivedMessage.author.id+ ">",
            _server: receivedMessage.guild.id,
        }
        let findQuery = {
            _id: "123",
            _server: receivedMessage.guild.id,
            _season: "1", 
            _name : receivedMessage.author.username, 
            _currentDeck: "None", 
            _elo : 1000, _wins : 0, _losses : 0,
            _deck: {
                _id: 0,
                Deck: "Default Deck. Ignore.", 
                Wins:1, 
                Losses:1
            }
        }
        let otherQuery = {
            _mentionValue: "!",
            _server: "1",
            _season: "!",
            _name: "!",
            _currentDeck: "!",
            _elo: 1,
            _wins: 1,
            _losses: 1
        }
        //console.log(receivedMessage.guild.id)
        user.findOne(findQuery, function(err, res){
            console.log(res)
            if (res){
                callback("2")
            }
            else{
                let someuser = new user
               someuser.save(otherQuery, function(err, result){
                    console.log(result)
                    if(result){
                        callback("1")
                    }
                    else {
                        callback("3")
                    }
                })
            }
        })
       
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