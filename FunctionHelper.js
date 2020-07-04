// This file should provide assistance for the help() command.
// It will save the default "help" strings for each of the supported commands,
// as well as an example of the command that further assists the user.
//
const Discord = require('discord.js')

var helpDictionary = Object();

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
    de_lete : "Command to delete a record from the elo bot records.",
    info : "Command to get info about a match.",
    profile : "Command to check a profile of a user.",
    recent : "Command to see recent matches.",
    use : "Command to set the deck you are using.",
    current : "Command to show the deck you are currently using.",
    add : "Command to add a deck to the collection.",
    decks : "Command to show the decks currently registered.",
    decksdetailed : "Command to show detailed info on the decks registered.",
    removedeck : "Command to remove a deck from the list.",
    mydecks : "List decks registered to you.",
    credits : "Roll the credits!",
    unknown : "We have no real clue what we can do to help you after that command. =)"
}

module.exports = {
    test()
    {
        console.log("Testing other file.")
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
        .setTitle('PWP Bot - !help ' + [arguments])
        .setURL('')
        .addFields(
            { name: "Command: !" + [arguments], value: helpDictionary[arguments] },
        )
        .setTimestamp()
        .setFooter('Here to help, anytime!', '');

        receivedMessage.channel.send(exampleEmbed);
    },

    /**
     * showEmbedHelpForAllCommands()
     * @param {*} receivedMessage 
     * 
     * Loops through command help dictionary and prints
     * out all commands supported in an embed message.
     */
    showEmbedHelpForAllCommands(receivedMessage)
    {
        const exampleEmbed = new Discord.MessageEmbed()
        .setColor(messageColorBlue)
        .setTitle('PWP Bot')
        .setURL('')
        .setAuthor('Noah Saldaña', '', '')
        .setDescription('An excellent bot for excellent people')
        .setTimestamp()
        .setFooter('Here to help, anytime!', '');

        for(var keyVal in helpDictionary)
        {
            exampleEmbed.addField('!' + keyVal, helpDictionary[keyVal], true);
        }

        receivedMessage.channel.send(exampleEmbed);
    }
}
