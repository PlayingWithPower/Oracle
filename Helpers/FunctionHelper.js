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

// Define dictionary with (string) key : (string) value.
// ex. helpDictionary["help"] = "Where you are now. A list of all available commands."

helpDictionary =
{
    help : "Where you are now. A list of all available commands.",
    register : "Allows you to register yourself as a user to keep track of your stats/season.",
    users : "Shows all the users registered to the elo bot.",
    log : "The command used to log a game.",
    remind : "Command to remind a user to confirm a game.",
    // delete is a keyword...we gotta choose something else.
    de_lete : "Command to delete a record from the elo bot records. **",
    info : "Command to get info about a match.",
    profile : "Command to check a profile of a user.",
    recent : "Command to see recent matches.",
    use : "Command to set the deck you are using.",
    current : "Command to show the deck you are currently using.",
    add : "Command to add a deck to the collection. **",
    decks : "Command to show the decks currently registered.",
    decksdetailed : "Command to show detailed info on the decks registered.",
    removedeck : "Command to remove a deck from the list. **",
    updatedeck : "Command to update a deck's information. **",
    mydecks : "List decks registered to you.",
    credits : "Roll the credits!",
    unknown : "We have no real clue what we can do to help you after that command. =)"
}

exampleDictionary =
{
    help : "Provides the available commands. Use !help <command> to get more specific help.",
    register : "!register - registers you to the league.",
    users : "!users - Lists all users, by username, that are registered in the league.",
    log : "!log @<loser1> @<loser2> @<user3> - logs you as the winner of a game and logs the pod.\n\nex. !log @cruzer @noah @ben",
    remind : "!remind @<user> - to remind them to confirm a pending game.\n\nex. !remind @cruzer",
    // delete is a keyword...we gotta choose something else.
    de_lete : "!delete <match id> - deletes the specifc match. [admin-only]\n\nex. !delete 4jjf65",
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
        .setTimestamp()
        .setFooter('Here to help, anytime!', '');

        // due to keyword collision, delete is 'de_lete' in dictionary
        if (arguments == 'delete')
        {
            exampleEmbed.addFields(
                { name: "Command: !delete", value: exampleDictionary['de_lete'] },
            )
        }
        else
        {
            exampleEmbed.addFields(
                { name: "Command: !" + [arguments], value: exampleDictionary[arguments] },
            )
        }

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
        let isAdmin = await ConfigHelper.checkAdminPrivs(receivedMessage)
        const exampleEmbed = new Discord.MessageEmbed()
        .setColor(messageColorBlue)
        .setTitle('PWP Bot')
        .setURL('')
        .setAuthor('Noah Saldaña', '', '')
        .setDescription('An excellent bot for excellent people')
        .setTimestamp()
        .setFooter('Here to help, anytime!', '');

        if (isAdmin)
        {
            // User tag at bottom for admin.
            exampleEmbed.setFooter("** Denote admin-only commands. Records show " + receivedMessage.author.username + " is an admin.")
        }

        for(var keyVal in helpDictionary)
        {
            // due to keyword collision, delete is 'de_lete' in dictionary
            if (keyVal == 'de_lete')
            {   
                if (isAdmin)
                {
                    exampleEmbed.addField('!delete', helpDictionary[keyVal], true);
                }  
            }
            else
            {
                // We will attempt to not show admin commands to everyone. If they see it b/c a mod
                // issued the command, oh well.
                if (keyVal == 'adddeck' || keyVal == 'removedeck' || keyVal == 'updatedeck')
                {
                    if (isAdmin)
                    {
                        exampleEmbed.addField('!' + keyVal, helpDictionary[keyVal], true);
                    }
                }
                else
                {
                    exampleEmbed.addField('!' + keyVal, helpDictionary[keyVal], true);
                }
            }    
        }

        receivedMessage.channel.send(exampleEmbed);
    }
}
