// This file should provide assistance for the help() command.
// It will save the default "help" strings for each of the supported commands,
// as well as an example of the command that further assists the user.
//
const Discord = require('discord.js')

var helpDictionary = Object();
var exampleDictionary = Object();
const ConfigHelper = require('../Helpers/ConfigHelper')

//Colors
const messageColorRed = "#af0000"
const messageColorGreen = "#5fff00"
const messageColorBlue = "#0099ff"
const messageColorSecondBlue = "#020ff0"

// Define dictionary with (string) key : (string) value.
// ex. helpDictionary["help"] = "Where you are now. A list of all available commands."
deckDictionary = {
    decks: "Lists all available decks",
    deckstats: "Lists stats information about decks",
    deckinfo: "Provides detailed information about a deck",
}
gameDictionary = {
    log: "Logs a game to this server's league",
    remind: "Reminds users to confirm logged matches",
    pending: "Lists all unfinished matches",
    matchinfo: "Provides information on a match",
}
leagueDictionary = {
    register: "Registers a user to participate in this server's league",
    top: "Lists the top users this season"
}
seasonDictionary = {
    seasoninfo: "Provides summary information about a season"
}
userDictionary = {
    profile: "Displays summary information about a user",
    recent: "Displays recent matches a user has played in",
    use: "Sets a user's current deck. Required to log games",
}
adminDictionary = 
{
    deletematch: "Removes a match from the records",
    acceptmatch: "Force a match to be logged",
    add: "Adds a new deck to your server's list of decks",
    removedeck: "Removes a deck from your server's list of decks",
    startseason: "Starts a new season",
    endseason: "Ends the current season",
    setendseason: "Sets an end date for the current season",
    setseasonname: "Sets a name for a season",
    setconfig: "Sets up configurations",
    getconfig: "Displays configuration information"
}

exampleDictionary =
{
    deletematch: "!deletematch <Match ID>. Use !pending to find a list of matches that haven't been accepted. Use !recent to find match IDs.",
    acceptmatch: "!accept <Match ID>. Use !pending to find a list of matches that haven't been accepted. Use !recent to find match IDs.",
    add: "!add Deck Alias | Commander | Color | Deck Link | Author | Deck Description | Deck Type | Has Primer? (Yes/No) | Discord Link.\n\
    Example: !add Sphinx Control | Unesh, Criosphinx Sovereign | https://www.google.com | Gnarwhal | This is a control deck that seeks to win through isochron scepter | Disruptive | No | https://discord.gg/12345 | ",
    removedeck: "!removedeck <Deck Name>",

    
    help : "Lists all available commands. Use !help <command> to get more specific help.",
    register : "!register - registers you to the league.",
    users : "!users - Lists all users, by username, that are registered in the league.",
    log : "!log @<loser1> @<loser2> @<user3> - logs you as the winner of a game and logs the pod.\n\nex. !log @cruzer @noah @ben",
    remind : "!remind @<user> - to remind them to confirm a pending game.\n\nex. !remind @cruzer",
    delete : "!delete <match id> - deletes the specifc match. [admin-only]\n\nex. !delete 4jjf65",
    info : "!info <match id> - provides information about given match.\n\nex. !info 4jjf65",
    profile : "!profile - to see your profile\n\n!profile @<user> - to see their profile\n\nex. !profile , !profile @noah",
    recent : "!recent - to see your recent matches\n\n!recent @<user> - to see user's recent matches\n\nex. !recent, !recent @ben",
    use : "!use <Deck name from database>\n\n!use Rogue | <Title> to use a deck not in the database\n\nex. !use Gitrog Dredge, !use Rogue | Kinnan",
    current : "!current - your current deck",
    adddeck : "!add <Deck URL> <Deck Name>\n\nex. !add https://tappedout.net/mtg-decks/21-07-19-fblthp-lost-and-found/ Fblthp: Lost and Found",
    decks : "!decks - Lists all decks registered.",
    decksdetailed : "!deckdetailed <Deck Name>\n\nex. !deckdetailed Kess Storm",
    removedeck : "!removedeck <Deck Name> [admin-only]\n\nex. !removedeck Kess Storm\n\n** Requires reaction for confirmation. **",
    updatedeck : "!updatedeck <Deck Name> [admin-only]\n\nex. !updatedeck Kess Storm\n\n** Requires reaction for confirmation. **",
    mydecks : "!mydecks - lists your current decks",
    credits : "!credits - Do it, do it now!",
    unknown : "We have no real clue what we can do to help you after that command. =)"
}

module.exports = {
    test()
    {
        console.log("Testing other file.")
    },
    /**
     * This is used in !deck to quickly create 5 embeds, one for each color
     * @param {*} colorArr 
     * @param {*} colorNum 
     */
    createDeckEmbed(colorArr, colorNum){
        const someEmbed = new Discord.MessageEmbed()
            .setColor(messageColorBlue)
            .setAuthor(colorNum)
        for(i = 0; i < colorArr.length; i++){
            someEmbed.addFields(
                { name: " \u200b",value: colorArr[i], inline: true},
            )
        }
        return someEmbed
    },
    /**
     * toUpper()
     * @param {*} str 
     */
    toUpper(str) {
    return str
        .toLowerCase()
        .split(' ')
        .map(function(word) {
            // console.log("First capital letter: "+word[0]);
            // console.log("remain letters: "+ word.substr(1));
            return word[0].toUpperCase() + word.substr(1);
        })
        .join(' ');
    },
    /**
     * showEmbedHelpForCommand()
     * @param {*} receivedMessage 
     * @param {*} arguments - command key
     * 
     * Retrieves info from the help dictionary about a specific command. 
     */
    showEmbedHelpForCommand(receivedMessage, arguments)
    {
        const exampleEmbed = new Discord.MessageEmbed()
        .setColor(messageColorBlue)
            exampleEmbed.addFields(
                { name: "!" + [arguments], value: exampleDictionary[arguments] },
            )

        receivedMessage.channel.send(exampleEmbed);
    },

    /**
     * showEmbedHelpForAllCommands()
     * @param {*} receivedMessage 
     * 
     * Loops through command help dictionary and prints
     * out all commands supported in an embed message.
     */
    async showEmbedHelpForAllCommands(receivedMessage)
    {
        const deckEmbed = new Discord.MessageEmbed()
        .setAuthor("Deck Commands")
        .setColor(messageColorSecondBlue)
        const gameEmbed = new Discord.MessageEmbed()
        .setAuthor("Game Commands")
        .setColor(messageColorBlue)
        const leagueEmbed = new Discord.MessageEmbed()
        .setAuthor("League Commands")
        .setColor(messageColorSecondBlue)
        const seasonEmbed = new Discord.MessageEmbed()
        .setAuthor("Season Commands")
        .setColor(messageColorBlue)
        const userEmbed = new Discord.MessageEmbed()
        .setAuthor("User Commands")
        .setColor(messageColorSecondBlue)
        const adminEmbed = new Discord.MessageEmbed()
        .setAuthor("Admin Commands")
        .setColor(messageColorBlue)
        var embedArray = new Array()
        embedArray.push(deckEmbed, gameEmbed, leagueEmbed, seasonEmbed, userEmbed, adminEmbed)

        for(var keyVal in adminDictionary){
            adminEmbed.addField('!' + keyVal, adminDictionary[keyVal]);   
        }
        for (var keyVal in deckDictionary){
            deckEmbed.addField('!' + keyVal, deckDictionary[keyVal]);
        }
        for (var keyVal in gameDictionary){
            gameEmbed.addField('!' + keyVal, gameDictionary[keyVal]);
        }
        for (var keyVal in leagueDictionary){
            leagueEmbed.addField('!' + keyVal, leagueDictionary[keyVal]);
        }
        for (var keyVal in seasonDictionary){
            seasonEmbed.addField('!' + keyVal, seasonDictionary[keyVal]);
        }
        for (var keyVal in userDictionary){
            userEmbed.addField('!' + keyVal, userDictionary[keyVal]);
        }

        embedArray.forEach((embed)=>{
            receivedMessage.channel.send(embed)
        })
        
    }
}
