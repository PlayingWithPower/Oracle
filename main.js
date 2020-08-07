//The main hub for the bot, more comments coming soon.
//Most of the commands are labeled appropriately so far. More organization coming soon.

// Bot Configuration
const config = require('./etc/env.js');
const Discord = require('discord.js')
const client = new Discord.Client()

//Objects
const deckObj = require('./objects/Deck')
const gameObj = require('./objects/Game')
const leagueObj = require('./objects/League')
const seasonObj = require('./objects/Season')
const userObj = require('./objects/User')

//Helper files
const FunctionHelper = require('./Helpers/FunctionHelper')
const DeckHelper = require('./Helpers/DeckHelper')
const ManageReactHelper = require('./Helpers/ManageReactionHelper')
const SeasonHelper = require('./Helpers/SeasonHelper')
const GameHelper = require('./Helpers/GameHelper')
const ConfigHelper = require('./Helpers/ConfigHelper')

//Bot prefix
const botListeningPrefix = "!";

//Colors
const messageColorRed = "#af0000"
const messageColorGreen = "#5fff00"
const messageColorBlue = "#0099ff"

//MongoDB Connection
const moongoose = require('mongoose');

client.login(config.discordKey)

moongoose.connect(config.mongoConnectionUrl, { useNewUrlParser: true, useUnifiedTopology: true });

client.on('ready', (on) =>{
    console.log("Debug log: Successfully connected as " + client.user.tag)
    client.user.setPresence({
        game: { 
            name: 'my code',
            type: 'WATCHING'
        },
        status: 'online'
    })
    
    
    //Lists out the "guilds" in a discord server, these are the unique identifiers so the bot can send messages to server channels
    // client.guilds.cache.forEach((guild) => {
    //     console.log(guild.id)
    //     guild.channels.cache.forEach((channel) =>{
    //         console.log(` - ${channel.name} ${channel.type} ${channel.id}`)
    //     })
    // })
    // client.user.setUsername("PWP Bot"); 
})
client.on("guildCreate", (guild) => {
    deckObj.setUpPopulate(guild.id)
    //let channel = client.channels.get(guild.systemChannelID || channelID);
    let defaultChannel = "";
    guild.channels.cache.forEach((channel) => {
    if(channel.type == "text" && defaultChannel == "") {
        if(channel.permissionsFor(guild.me).has("SEND_MESSAGES")) {
        defaultChannel = channel;
        }
    }
    })
    tutorial(defaultChannel)
});
client.on('message', (receivedMessage) =>{
    if (receivedMessage.author == client.user){
        return 
    }
    if (receivedMessage.content.startsWith(botListeningPrefix)){
        processCommand(receivedMessage)
    }
    if (receivedMessage.content.indexOf("https://www.spelltable.com/game/") >= 0){
        let index = receivedMessage.content.indexOf("https://www.spelltable.com/game/")
        let urlSpectate = receivedMessage.content.slice(index+32)
        let urlPlayer = "https://www.spelltable.com/game/" + urlSpectate
        urlSpectate = urlSpectate + "?spectate"
        const spellTableEmbed = new Discord.MessageEmbed()
        .setColor(messageColorBlue)
        .setAuthor("Looks like you're trying to play a game on Spelltable!")
        .addFields(
            {name: "Playing in this game?", value: urlPlayer},
            {name: "Spectating this game?", value: "https://www.spelltable.com/game/"+urlSpectate}
        )
        receivedMessage.channel.send(spellTableEmbed)
    }
    else{
        let currentChannel =  client.channels.cache.get()
    }
})
/**
 * TODO: 
 */
client.on('messageReactionAdd', (reaction, user) => {
    if (reaction.message.author.id == config.clientID){
        ManageReactHelper.manageReaction(reaction, user, client.channels.cache.get(reaction.message.channel.id))
    }
})
/**
 * processCommand()
 * @param {*} receivedMessage 
 */
async function processCommand(receivedMessage){
    let fullCommand = receivedMessage.content.substr(1).toLowerCase()
    let splitCommand = fullCommand.split(" ")
    let primaryCommand = splitCommand[0]
    let arguments = splitCommand.slice(1)

    let rawFullCommand = receivedMessage.content.substr(1)
    let rawSplitCommand = rawFullCommand.split(" ")
    let rawArguments = rawSplitCommand.slice(1)


    let channel = receivedMessage.channel.id
    let channelResponseFormatted = client.channels.cache.get(channel)
    let adminGet = await ConfigHelper.checkAdminPrivs(receivedMessage)

    switch(primaryCommand){
        case "help":
            helpCommand(receivedMessage, arguments)
            break;
        case "register":
            register(receivedMessage, arguments, channelResponseFormatted)
            break;
        case "log":
            startMatch(receivedMessage, arguments)
            break;
        // case "remind":
        //     remindMatch(receivedMessage, arguments)
        //     break;
        case "deletematch":
            if (adminGet){
                deleteMatch(receivedMessage, arguments)
            }
            else{
                nonAdminAccess(receivedMessage, primaryCommand)
            }
            break;
        case "acceptmatch":
            if (adminGet){
                forceAccept(receivedMessage, arguments)
            }
            else{
                nonAdminAccess(receivedMessage, primaryCommand)
            }
            break;
        case "info":
            matchInfo(receivedMessage, arguments)
            break;
        case "profile":
            profile(receivedMessage, arguments)
            break;
        case "recent":
            recent(receivedMessage, arguments)
            break;
        case "pending":
            getPending(receivedMessage)
            break;
        case "disputed":
            getDisputed(receivedMessage)
            break;
        case "use":
            use(receivedMessage, arguments)
            break;
        case "decks":
            listDecks(receivedMessage, arguments)
            break;
        case "deckstats":
            deckStats(receivedMessage, rawArguments);
            break;
        case "deckinfo":
            deckinfo(receivedMessage, arguments);
            break;
        case "add":
            if (adminGet){
                addDeck(receivedMessage, rawArguments)
            }
            else{
                nonAdminAccess(receivedMessage, primaryCommand)
            }
            break;
        case "removedeck":
            if (adminGet){
                removeDeck(receivedMessage, arguments)
            }
            else{
                nonAdminAccess(receivedMessage, primaryCommand)
            }
            break;
        case "updatedeck":
            if (adminGet){
                updateDeck(receivedMessage, arguments)
            }
            else{
                nonAdminAccess(receivedMessage, primaryCommand)
            }
            break;
        case "top":
            top(receivedMessage, rawArguments)
            break;
        case "startseason":
            if (adminGet){
                startSeason(receivedMessage, arguments)
            }
            else{
                nonAdminAccess(receivedMessage, primaryCommand)
            }
            break;
        case "endseason":
            if (adminGet){
                endSeason(receivedMessage, arguments)
            }
            else{
                nonAdminAccess(receivedMessage, primaryCommand)
            }
            break;
        case "seasoninfo":
            seasonInfo(receivedMessage, rawArguments)
            break;
        case "setendseason":
            if (adminGet){
                setEndSeason(receivedMessage, arguments)
            }
            else{
                nonAdminAccess(receivedMessage, primaryCommand)
            }
            break;
        case "setconfig":
            if (adminGet){
                configSet(receivedMessage, rawArguments)
            }
            else{
                nonAdminAccess(receivedMessage, primaryCommand)
            }
            break;
        case "getconfig":
            if (adminGet){
                configGet(receivedMessage)
            }
            else{
                nonAdminAccess(receivedMessage, primaryCommand)
            }
            break;
        case "setseasonname":
            if (adminGet){
                setSeasonName(receivedMessage, rawArguments)
            }
            else{
                nonAdminAccess(receivedMessage, primaryCommand)
            }
            break;
        case "tutorial":
            tutorial(getChannelID(receivedMessage))
        case "credits":
            credits(receivedMessage, arguments)
            break;
        default:
            const UnknownCommandEmbed = new Discord.MessageEmbed()
            .setColor(messageColorRed)
            .setAuthor("Unknown command.")
            .setDescription("Type !help to get a list of available commands")
            receivedMessage.channel.send(UnknownCommandEmbed)
    }
}
async function tutorial(channel){
    const welcomeEmbed = new Discord.MessageEmbed()
    .setAuthor("Thank you for inviting me to your server! I am Oracle Bot and am used to track Magic The Gathering statistics and information")
    .setTitle("Want to contribute to this bot? Click here for the GitHub")
    .setURL("https://github.com/PlayingWithPower/DiscordBot")
    .setDescription("This command will help you walk through how to properly set up the bot\n\
    There are a few key steps for an Admin to perform before games can be logged, decks can be tracked and users can register\n\
    Type !tutorial at any time to find this command again")
    .setColor(messageColorGreen)
    .addFields(
        {name: "Stuck?", value: "Use out !help <Command Name> or !help to find more information about a command"},
        {name: "Step 1", value: "Start a new season for your server\nType !startseason"},
        {name: "Step 2", value: "Have users register for your new season\nTo participate, type !register "},
        {name: "Step 3", value: "Set your decks before logging a game\nUse !use <Deck Name> to set your deck\nUse !decks to see pre-loaded decks. Add more decks with !add and follow the formatting tips provided"},
        {name: "Step 4", value: "Play games of Magic and then log them\n!log @loser1 @loser2 @loser3\nThe person who logs the match is always the winner!"},
        {name: "Step 5", value: "That is it! Congrats on setting up this bot\nCheck !help to see everything it is capable of\nSubmit feature requests and fixes to the Github or the official Discord"}
    )
    .setFooter("Note: By default, 'Admin' is anyone in your server with general Discord Administrative privileges. This is configurable using !setconfig")
    channel.send(welcomeEmbed)
}
async function forceAccept(receivedMessage, args){
    let generalChannel = getChannelID(receivedMessage)
    
    if (args.length == 1){
        let returnArr= await gameObj.forceAccept(args, receivedMessage.guild.id)
        if (returnArr == "Success"){
            const successEmbed = new Discord.MessageEmbed()
            .setColor(messageColorGreen)
            .setAuthor("Match accepted")
            .setDescription("The match you have entered is now accepted\n\
            Use !pending to find other pending matches")
            generalChannel.send(successEmbed)
        }
        else if (returnArr == "Error"){
            const invalidInputEmbed = new Discord.MessageEmbed()
            .setColor(messageColorRed)
            .setAuthor("Unable to update match")
            .setDescription("Please try again")
            generalChannel.send(invalidInputEmbed)
        }
        else if (returnArr == "Match is already accepted"){
            const invalidInputEmbed = new Discord.MessageEmbed()
            .setColor(messageColorRed)
            .setAuthor("Match already accepted")
            .setDescription("The match you have entered is already accepted\n\
            Use !delete <Match ID> to delete a match")
            generalChannel.send(invalidInputEmbed)
        }
        else if (returnArr == "Can't find match"){
            const invalidInputEmbed = new Discord.MessageEmbed()
            .setColor(messageColorRed)
            .setAuthor("Can't find match")
            .setDescription("You have entered an invalid match ID\n\
            Check !help acceptmatch for more information")
            generalChannel.send(invalidInputEmbed)
        }
    }
    else{
        const invalidInputEmbed = new Discord.MessageEmbed()
        .setColor(messageColorRed)
        .setAuthor("Incorrect Input")
        .setDescription("Please type !acceptmatch <Match ID>\n\
        Check !help acceptmatch for more information")
        generalChannel.send(invalidInputEmbed)
    }
    
}
async function getDisputed(receivedMessage){
    let generalChannel = getChannelID(receivedMessage)
    let returnArr = await gameObj.getPending(receivedMessage.guild.id, "Disputed")
    if (returnArr == "No Pending"){
        const noPendingEmbed = new Discord.MessageEmbed()
        .setColor(messageColorBlue)
        .setAuthor("There are no disputed matches")
        generalChannel.send(noPendingEmbed)
    }
    else if(returnArr == "No Matches"){
        const noMatchesEmbed = new Discord.MessageEmbed()
        .setColor(messageColorRed)
        .setAuthor("No matches have been logged this season")
        .setDescription("Log matches with !log @loser1 @loser2 @loser3")
        generalChannel.send(noMatchesEmbed)
    }
    else{
        const overallEmbed = new Discord.MessageEmbed()
        .setColor(messageColorGreen)
        .setAuthor("Displaying Disputed Matches")
        generalChannel.send(overallEmbed)
        returnArr.forEach((pendingMatch)=>{
            const matchEmbed = new Discord.MessageEmbed()
            .setColor(messageColorBlue)
            .setAuthor("Match ID: " + pendingMatch._match_id)
            .addFields(
                {name: "Player 1", value: "<@"+pendingMatch._player1+">", inline: true},
                {name: "Piloting", value: pendingMatch._player1Deck, inline: true},
                {name: "\u200b", value: " \u200b"},
                {name: "Player 2", value: "<@"+pendingMatch._player2+">", inline: true},
                {name: "Piloting", value: pendingMatch._player2Deck, inline: true},
                {name: "\u200b", value: " \u200b"},
                {name: "Player 3", value: "<@"+pendingMatch._player3+">", inline: true},
                {name: "Piloting", value: pendingMatch._player3Deck, inline: true},
                {name: "\u200b", value: " \u200b"},
                {name: "Player 4", value: "<@"+pendingMatch._player4+">", inline: true},
                {name: "Piloting", value: pendingMatch._player4Deck, inline: true},
            )
            generalChannel.send(matchEmbed)
        })
    }
}
async function getPending(receivedMessage){
    let generalChannel = getChannelID(receivedMessage)
    let returnArr = await gameObj.getPending(receivedMessage.guild.id)
    if (returnArr == "No Pending"){
        const noPendingEmbed = new Discord.MessageEmbed()
        .setColor(messageColorBlue)
        .setAuthor("There are no pending matches")
        generalChannel.send(noPendingEmbed)
    }
    else if(returnArr == "No Matches"){
        const noMatchesEmbed = new Discord.MessageEmbed()
        .setColor(messageColorRed)
        .setAuthor("No matches have been logged this season")
        .setDescription("Log matches with !log @loser1 @loser2 @loser3")
        generalChannel.send(noMatchesEmbed)
    }
    else{
        const overallEmbed = new Discord.MessageEmbed()
        .setColor(messageColorGreen)
        .setAuthor("Displaying Pending Matches")
        .setFooter("'Player 1' is the logged winner of each pending match")
        generalChannel.send(overallEmbed)
        returnArr.forEach((pendingMatch)=>{
            const matchEmbed = new Discord.MessageEmbed()
            .setColor(messageColorBlue)
            .setAuthor("Match ID: " + pendingMatch._match_id)
            .addFields(
                {name: "Player 1", value: "<@"+pendingMatch._player1+">", inline: true},
                {name: "Piloting", value: pendingMatch._player1Deck, inline: true},
                {name: "\u200b", value: " \u200b"},
                {name: "Player 2", value: "<@"+pendingMatch._player2+">", inline: true},
                {name: "Piloting", value: pendingMatch._player2Deck, inline: true},
                {name: "\u200b", value: " \u200b"},
                {name: "Player 3", value: "<@"+pendingMatch._player3+">", inline: true},
                {name: "Piloting", value: pendingMatch._player3Deck, inline: true},
                {name: "\u200b", value: " \u200b"},
                {name: "Player 4", value: "<@"+pendingMatch._player4+">", inline: true},
                {name: "Piloting", value: pendingMatch._player4Deck, inline: true},
            )
            generalChannel.send(matchEmbed)
        })
    }
}
async function configGet(receivedMessage){
    let generalChannel = getChannelID(receivedMessage)
    let returnArr = await leagueObj.configGet(receivedMessage.guild.id)
    if (returnArr != "No configs"){
        var adminPrivs = returnArr._admin
        if (returnArr._admin == ""){
            adminPrivs = "\u200b"
        }
        const updatedEmbed = new Discord.MessageEmbed()
        .setColor(messageColorBlue)
        .setAuthor("Displaying information about your configurations")
        .addFields(
            {name: "Player Threshold", value: returnArr._player_threshold},
            {name: "Deck Threshold", value: returnArr._deck_threshold},
            {name: "Timeout (in minutes)", value: returnArr._timeout},
            {name: "Admin Privileges", value: adminPrivs}
        )
        .setFooter("Want to edit these values? Use !setconfig")
        generalChannel.send(updatedEmbed)
    }
    else{
        const noConfigEmbed = new Discord.MessageEmbed()
        .setColor(messageColorRed)
        .setAuthor("No current information about your configurations")
        .setDescription("Configurations are automatically generated when I join your server.")
        generalChannel.send(noConfigEmbed)
    }
}
async function configSet(receivedMessage, args){
    let generalChannel = getChannelID(receivedMessage)
    let returnArr = await leagueObj.configSet(receivedMessage, args)
    if (returnArr == "Invalid Input"){
        const errorEmbed = new Discord.MessageEmbed()
        .setColor(messageColorRed)
        .setAuthor("Incorrect Input")
        .setDescription("Please retry entering your config. I understand the format: \n\
        !setconfig <Type> | <Value>\n\
        The types of configurations are: 'Player Threshold (A number)', 'Deck Threshold (A number)', 'Timeout (Minutes, less than 60)' and 'Admin' (A list of Discord Roles seperated by commas)\n\
        Confused on what these mean? Try !help setconfig")
        .setFooter("A default set of configuration values are set for every server. Updating these configs is to fine tune your experience")
        generalChannel.send(errorEmbed)
    }
    else if (returnArr == "Error"){
        const errorEmbed = new Discord.MessageEmbed()
        .setColor(messageColorRed)
        .setAuthor("Error")
        .setDescription("An Error has occurred, please try again")
        generalChannel.send(errorEmbed)
    }
    else if (returnArr[0] == "Updated"){
        var commandType = returnArr[1]
        commandType = DeckHelper.toUpper(commandType)
        const updatedEmbed = new Discord.MessageEmbed()
        .setColor(messageColorGreen)
        .setAuthor("Succesfully updated your configs")
        .setDescription("You have updated the configuration:\n\
         **" + commandType + "** to **" + returnArr[2] + "**")
        generalChannel.send(updatedEmbed)
    }
    else if (returnArr[0] == "New Save"){
        var commandType = returnArr[1]
        commandType = DeckHelper.toUpper(commandType)
        const updatedEmbed = new Discord.MessageEmbed()
        .setColor(messageColorGreen)
        .setAuthor("Created a new set of configs for this rver")
        .setDescription("You have set the configuration:\n\
         **" + commandType + "** to **" + returnArr[2] + "**\n\
         Your other configurations have been given default values. Check those with !getconfig")
        generalChannel.send(updatedEmbed)
    }
}
async function setSeasonName(receivedMessage, args){
    let generalChannel = getChannelID(receivedMessage)
    if (args[0] === undefined){
        const errorEmbed = new Discord.MessageEmbed()
        .setColor(messageColorRed)
        .setAuthor("Please enter a new name")
        .setDescription("Example: !setnewseason <My New Season Name>")
        .setFooter("I will listen for case sensitivity")
        generalChannel.send(errorEmbed)
    }
    else{
        let returnArr = await seasonObj.setSeasonName(receivedMessage, args)
        if (returnArr == "Name in use"){
            const errorUserEmbed = new Discord.MessageEmbed()
            .setColor(messageColorRed)
            .setDescription(args.join(' ')+" has already been used for a season or is currently being used for this season")
            .setFooter("To see all season names try !seasoninfo all")
            generalChannel.send(errorUserEmbed)
        }
        else if (returnArr == "No Current"){
            const errorEmbed = new Discord.MessageEmbed()
            .setColor(messageColorRed)
            .setAuthor("There is no on-going Season")
            .setDescription("Please start a new season using !startseason")
            generalChannel.send(errorEmbed)
        }
        else{
            const successEmbed = new Discord.MessageEmbed()
            .setColor(messageColorGreen)
            .setAuthor("Successfully updated season name!")
            .setDescription("Updated current season from: **" + returnArr[1] +"** to: **"+returnArr[2]+"**")
            generalChannel.send(successEmbed)
        }
    }
}
async function setEndSeason(receivedMessage, args){
    let generalChannel = getChannelID(receivedMessage)
    if (args.length == 0){
        const errorEmbed = new Discord.MessageEmbed()
        .setColor(messageColorRed)
        .setAuthor("Please enter an end date")
        .setDescription("Please type in the format: MM/DD/YYYY\n\
        Type !help setendseason for more information")
        generalChannel.send(errorEmbed)
        return
    }
    if (args[0].length > 10){
        const errorEmbed = new Discord.MessageEmbed()
        .setColor(messageColorRed)
        .setAuthor("You have entered a non-valid date")
        .setDescription("Please type in the format: \nMM/DD/YYYY")
        generalChannel.send(errorEmbed)
        return
    }

    if (args[0].length == 10){
        var date = new Date(args)
        const currentDate = new Date()
        if (date instanceof Date && !isNaN(date.valueOf())) {
            if ((currentDate >= date)){
                const errorEmbed = new Discord.MessageEmbed()
                .setColor(messageColorRed)
                .setAuthor("You have entered a date from the past")
                .setDescription("You have used a date from the past, please set the end of the season to a date in the future\n\
                Type in the format: \nMM/DD/YYYY")
                generalChannel.send(errorEmbed)
                return
            }
            let returnArr = await seasonObj.setEndDate(receivedMessage, date)
            if (returnArr[0] == "Success"){
                    date = date.toLocaleString("en-US", {timeZone: "America/New_York"});
                    const successEmbed = new Discord.MessageEmbed()
                    .setColor(messageColorGreen)
                    .setAuthor("You have successfully set the end date for the current Season named: " + returnArr[1])
                    .setTitle("End time has been set to: " + date)
                    generalChannel.send(successEmbed)
            }
        }
    }
    else{
        const errorEmbed = new Discord.MessageEmbed()
        .setColor(messageColorRed)
        .setAuthor("You have entered a non-valid date")
        .setDescription("Please type in the format: \nMM/DD/YYYY")
        generalChannel.send(errorEmbed)
    }
}
async function seasonInfo(receivedMessage, args){
    let generalChannel = getChannelID(receivedMessage)
    if (args[0] === undefined){
        let returnArr = await seasonObj.getInfo(receivedMessage, "Current")
        if (returnArr[0] == "No Current"){
            const noSeasonEmbed = new Discord.MessageEmbed()
            .setColor(messageColorRed)
            .setAuthor("There is no on-going season")
            .setDescription("To start a new season, try !startseason\nTo see information about another season, try !seasoninfo <Season Name>")
            generalChannel.send(noSeasonEmbed)
        }
        else{
            const seasonInfo = new Discord.MessageEmbed()
            .setColor(messageColorGreen)
            .setAuthor("Displaying Season Info about the Season named: " + returnArr[0]._season_name)
            .addFields(
                {name: "Season Start", value: returnArr[0]._season_start, inline: true},
                {name: "Season End", value: returnArr[0]._season_end, inline: true},
            )
            generalChannel.send(seasonInfo)
        }
    }
    else if (args[0] == "all"){
        let returnArr = await seasonObj.getInfo(receivedMessage, "all")
        if (returnArr[0] != ""){
            returnArr[0].forEach((season)=>{
                const seasonInfo = new Discord.MessageEmbed()
                .setColor(messageColorGreen)
                .setAuthor("Displaying Season Info about the Season named: " + season._season_name)
                .addFields(
                    {name: "Season Start", value: season._season_start, inline: true},
                    {name: "Season End", value: season._season_end, inline: true},
                    {name: "Total Matches Played", value: returnArr[2], inline: true},
                )
                generalChannel.send(seasonInfo)
            })
        }
        else{
            const noSeasonEmbed = new Discord.MessageEmbed()
            .setColor(messageColorRed)
            .setAuthor("There have been no Seasons on this server")
            .setDescription("To start a new season, try !startseason")
            generalChannel.send(noSeasonEmbed)
        }
    }
    else{
        let returnArr = await seasonObj.getInfo(receivedMessage, args.join(' '))
        if (returnArr == "Can't Find Season"){
            const cantFindEmbed = new Discord.MessageEmbed()
            .setColor(messageColorRed)
            .setAuthor("Cannot Find Specified Season: " + args.join(' ').toString())
            .setDescription("To find a season, try !seasoninfo <Season Name>.\nTo find information on all seasons, try !seasoninfo all")
            generalChannel.send(cantFindEmbed)
        }
        else{
            const seasonInfo = new Discord.MessageEmbed()
            .setColor(messageColorGreen)
            .setAuthor("Displaying Season Info about the Season named: " + returnArr[0][0]._season_name)
            .addFields(
                {name: "Season Start", value: returnArr[0][0]._season_start, inline: true},
                {name: "Season End", value: returnArr[0][0]._season_end, inline: true},
                {name: "Total Matches Played", value: returnArr[2], inline: true},
            )
            generalChannel.send(seasonInfo)
        }
    }
}
async function endSeason(receivedMessage, args){
    let generalChannel = getChannelID(receivedMessage)
    let currentSeason = await SeasonHelper.getCurrentSeason(receivedMessage.guild.id)
    const confirmEndSeason = new Discord.MessageEmbed()
    if (currentSeason == "No Current"){
        confirmEndSeason
        .setColor(messageColorRed)
        .setAuthor("There is no on-going season")
        .setDescription("To start a new season, try !startseason")
        generalChannel.send(confirmEndSeason)
    }
    else{
        let returnArr = await gameObj.getPending(receivedMessage.guild.id)
        var leftPending
        confirmEndSeason
        .setColor(messageColorBlue)
        .setAuthor("WARNING: You are attempting to end the current season named: " + currentSeason._season_name)
        .setTitle("Are you sure you want to end the current season?")
        .setDescription("<@!" + receivedMessage.author.id+">"+" When a season ends: leaderboards are reset, player's personal ratings are reset and rewards are distributed\n\
        Use !pending to see pending matches")
        .setFooter("React thumbs up to end the current season, react thumbs down to cancel")
        if (returnArr.length > 0){
            if (returnArr == "No Pending"){
                leftPending = "None"
            }
            else{
                leftPending = returnArr.length
            }
            confirmEndSeason
            .addFields(
                {name: "Pending Matches Remaining", value: leftPending}
            )
        }
        generalChannel.send(confirmEndSeason)
        .then(function (message, callback){
            message.react("👍")
            message.react("👎")
        })
    }
    
}
async function startSeason(receivedMessage, args){
    let generalChannel = getChannelID(receivedMessage)
    let returnArr = await seasonObj.startSeason(receivedMessage)

    if (returnArr[0] == "Season Ongoing"){
        const ongoingEmbed = new Discord.MessageEmbed()
            .setColor(messageColorBlue)
            .setTitle("There is already an on-going Season")
            .addFields(
                {name: "Start Date", value: returnArr[1], inline: true}
            )
        if (returnArr[2] == "Not Specified"){
            ongoingEmbed.addFields(
                {name: "End Date", value: "No end date set", inline: true}
            )
            .setFooter("Looks like you don't have a set end date. \nEnd the season at any time with !endseason or set an end date in advanced with !setendseason")
        }
        else{
            ongoingEmbed.addFields(
                {name: "End Date", value: returnArr[2], inline: true}
            )
        }
            ongoingEmbed
            .addFields(
                {name: "Season Name", value: returnArr[3], inline: true},
                {name: "Current Date", value: returnArr[4], inline: true}
            )
        generalChannel.send(ongoingEmbed)
    }
    else if (returnArr[0] == "Successfully Saved"){
        const startSeason = new Discord.MessageEmbed()
            .setColor(messageColorGreen)
            .setTitle("Successfully started a new Season")
            .setDescription("By default, seasons are given a name and no end date.\nTo change this, use commands:\n!setseasonname - sets the current season name\n!setenddate - sets a pre-determined end date for the season\n!endseason - ends the current season")
            .setFooter("End the season at any time with !endseason or set an end date in advanced with !setendseason")
            .addFields(
                {name: "Start Date", value: returnArr[1], inline: true},
                {name: "End Date", value: "No end date set", inline: true},
                {name: "Season Name", value: returnArr[3], inline: true}
            )
        generalChannel.send(startSeason)
    }
}
async function top(receivedMessage, args){
    let generalChannel = getChannelID(receivedMessage)
    let returnArr = await seasonObj.leaderBoard(receivedMessage)
    var mentionValues = new Array()
    let lookUpUsers
    if (args.length == 0){
        returnArr.forEach(user =>{
            mentionValues.push([user._mentionValue, receivedMessage.guild.id])
        })
    }
    else{
        returnArr.forEach(user =>{
            mentionValues.push([user._mentionValue, receivedMessage.guild.id, args.join(' ')])
        })
    }
    
    lookUpUsers = mentionValues.map(SeasonHelper.lookUpUsers)
    
    var unsortedResults = new Array()
    const resultsMsg = new Discord.MessageEmbed()
    Promise.all(lookUpUsers).then(results => {
        for (var i = 0; i < results.length; i++){
            if (results[i] != "Can't find deck"){
                let calculatedWinrate = Math.round(results[i][0][1]/(results[i][0][1]+results[i][0][2])*100)
                let elo = (20*(results[i][0][1])) - (10*(results[i][0][2])) + 1000
                let username = results[i][0][0]
                let gamesPlayed = (results[i][0][1] + results[i][0][2])
                unsortedResults.push([username,calculatedWinrate,elo, gamesPlayed])
            }
        }
    }).then(async function(){
        unsortedResults.sort(function(a, b) {
                return parseFloat(b[2]) - parseFloat(a[2]);
        });
        let getDeckThreshold = await ConfigHelper.getDeckThreshold(receivedMessage.guild.id)
        let sortedResults = unsortedResults
        var threshold = 5
        if (getDeckThreshold != "No configs"){ threshold = getDeckThreshold._player_threshold }

        resultsMsg
             .setColor(messageColorBlue)
             .setAuthor("Displaying Top Players for the season name: " + args.join(' '))
        for (var i = 0; i < sortedResults.length; i++){
            if (sortedResults[i][3] < threshold){ }
            else if (i > 8){ }
            else{
                resultsMsg
                .addFields(
                    { name: "Username", value: "<@!"+sortedResults[i][0]+">",inline: true},
                    { name: "Winrate", value: sortedResults[i][1] + "%", inline: true},
                    { name: "Elo", value: sortedResults[i][2] , inline: true},
                )
            }
        }
        resultsMsg.setFooter("Note: The threshold to appear on this list is " + threshold.toString() + " game(s)\nAdmins can configure this using !setconfig")
        if (args.length == 0){
            resultsMsg
            .setAuthor("Displaying Top Players of the current season")
        }
        if (resultsMsg.fields.length == 0){
            resultsMsg
            .setDescription("Seasons are case sensitive! Make sure you are spelling the season name correctly. See a list of all seasons with !seasoninfo all")
            .setAuthor("No Top Players Yet")
        }
        generalChannel.send(resultsMsg)
    })
   
    
}

async function deckinfo(receivedMessage, args){
    let generalChannel = getChannelID(receivedMessage)
    let returnArr = await deckObj.deckInfo(receivedMessage, args)
    if (args.length == 0){
        const errorEmbed = new Discord.MessageEmbed()
            .setColor(messageColorRed)
            .setDescription("Please enter the name of a deck, type !deckinfo <Deck Name>.\nUse !decks to find a list of decks")
        generalChannel.send(errorEmbed)
        return
    }
    if (returnArr == "Error 1"){
        const errorEmbed = new Discord.MessageEmbed()
            .setColor(messageColorRed)
            .setDescription("Error finding the deck **" + args.join(' ') + "** \nUse !decks to find a list of decks")
        generalChannel.send(errorEmbed)
    }
    else{
        let fixedColors = returnArr._colors.replace(/,/g, ' ');
        if ((returnArr._link == "No Link Provided")||(returnArr._link == "")){
            returnArr._link = " "
        }
        if ((returnArr._discordLink == "")){
            returnArr._discordLink = "No Link Provided"
        }
        const resultEmbed = new Discord.MessageEmbed()
            .setColor(messageColorGreen)
            .setDescription("Deck Information about **"+ returnArr._name + "**")
            .setTitle("Deck Link")
            .setURL(returnArr._link)
            .addFields(
                { name: 'Commander', value: returnArr._commander},
                { name: 'Color', value: fixedColors},
                { name: 'Authors', value: returnArr._author},
                { name: 'Description', value: returnArr._description},
                { name: 'Discord Link', value: returnArr._discordLink},
                { name: 'Deck Type', value: returnArr._deckType},
                { name: 'Has Primer?', value: DeckHelper.toUpper(returnArr._hasPrimer.toString())},
            )

        generalChannel.send(resultEmbed)
    }
}

/**
 * nonAdminAccess()
 * @param {*} receivedMessage 
 * @param {*} command attempted to use.
 * 
 * Prints generic message to user that they do not have admin rights to use the command they issued.
 */
function nonAdminAccess(receivedMessage, command){
    let generalChannel = getChannelID(receivedMessage)
    const adminAccessNotGrantedEmbed = new Discord.MessageEmbed()
        .setColor(messageColorRed)
        .setDescription("It looks like you're trying to access the **" + command + "** command.\n\
        This is an **Admin Only** command.\n\
        If you would like to access this command, you need to add a **role** using !setconfig.")
    generalChannel.send(adminAccessNotGrantedEmbed)
}

/**
 * updateDeck()
 * @param {*} receivedMessage 
 * @param {*} args 
 */
async function updateDeck(receivedMessage, args){
    let generalChannel = getChannelID(receivedMessage)
    const updateDeckEmbed = new Discord.MessageEmbed()
    let promiseReturn = await DeckHelper.findDeckToUpdate(receivedMessage, args);
    if (promiseReturn == "Error 1"){
        updateDeckEmbed
        .setColor(messageColorRed) //red
        .setDescription("Error deck not found. Try !help, !decks or use the format !removedeck <deckname>")
        generalChannel.send(updateDeckEmbed)
    }
    else{
        if (promiseReturn[0]._link == "No Link Provided"){
            promiseReturn[0]._link = " "
        }
        updateDeckEmbed
        .setColor(messageColorBlue)
        .setAuthor("You are attempting to update the deck: "+ promiseReturn[0]._name)
        .setTitle('Deck ID: ' + promiseReturn[0]._id)
        .setURL(promiseReturn[0]._link)
        .setDescription("<@" + receivedMessage.author.id + ">" +" React with the **1** to update the **Commander**.\
        \nReact with the **2** to update the **Deck Colors**.\
        \nReact with the **3** to update the **Deck Link**.\
        \nReact with the **4** to update the **Author(s)**.\
        \nReact with the **5** to update the **Deck Description**.\
        \nReact with the **6** to update the **Deck Type**.\
        \nReact with the **7** to update the **Primer**.\
        \nReact with the **8** to update the **Discord Link**.\
        \nReact with the **thumbs down** at any time to cancel.")
        .setFooter("You cannot update the Deck Name due to analytics.")
        generalChannel.send(updateDeckEmbed)
        .then(function (message){
            message.react("1️⃣")//commander
            message.react("2️⃣")//colors
            message.react("3️⃣")//decklink
            message.react("4️⃣")//author
            message.react("5️⃣")//deck description
            message.react("6️⃣")//deck type
            message.react("7️⃣")//primer
            message.react("8️⃣")//discord
            message.react("👎")
        })
    }
}
/**
 * removeDeck()
 * @param {*} receivedMessage 
 * @param {*} args 
 */
async function removeDeck(receivedMessage, args){
    let generalChannel = getChannelID(receivedMessage)
    const addingDeckEmbed = new Discord.MessageEmbed()
    let promiseReturn = await DeckHelper.findDeckToRemove(receivedMessage, args);
    if (promiseReturn == "Error 1"){
        addingDeckEmbed
        .setColor(messageColorRed) //red
        .setDescription("Error deck not found\n\
        Please use the format !removedeck <Deck Name>\n\
        For more information, check !help removedeck")
        generalChannel.send(addingDeckEmbed)
    }
    else{
        if (promiseReturn[0]._link == "No Link Provided"){
            promiseReturn[0]._link = " "
        }
        addingDeckEmbed
        .setColor(messageColorBlue)
        .setAuthor("WARNING")
        .setTitle('Deck ID: ' + promiseReturn[0]._id)
        .setURL(promiseReturn[0]._link)
        .setDescription("<@!" + receivedMessage.author.id+">"+ " Are you sure you want to delete: **" + promiseReturn[0]._name + "** from your server's list of decks?")
        generalChannel.send(addingDeckEmbed)
        .then(function (message, callback){
            message.react("👍")
            message.react("👎")
        })
    }
}
/**
 * deckStats()
 * @param {*} receivedMessage 
 * @param {*} args 
 */
async function deckStats(receivedMessage, args){
    let generalChannel = getChannelID(receivedMessage)
    const deckStatsEmbed = new Discord.MessageEmbed()
    const usersList = new Discord.MessageEmbed()

    let getDeckThreshold = await ConfigHelper.getDeckThreshold(receivedMessage.guild.id)
    var threshold = 5
    if (getDeckThreshold != "No configs"){ threshold = getDeckThreshold._deck_threshold }

    let returnArr = await deckObj.deckStats(receivedMessage, args)
    if (returnArr[0] == "Deck Lookup"){
        let deckName = returnArr[1].split(" | ")
        if (deckName[1]===undefined){
            seasonName = returnArr[2]
        }else{ seasonName = deckName[1]}
        deckStatsEmbed
        .setColor(messageColorBlue)
        .setAuthor(DeckHelper.toUpper(deckName[0]) + " Deckstats")
        .setTitle("For Season Name: " + seasonName)
        .addFields(
            { name: 'Wins', value: returnArr[3], inline: true},
            { name: 'Losses', value: returnArr[4], inline: true},
            { name: 'Number of Matches', value: returnArr[6].length, inline: true}, 
            { name: 'Winrate', value: Math.round((returnArr[3]/(returnArr[3]+returnArr[4]))*100) + "%"}, 
        )
        if (seasonName == "all"){
            deckStatsEmbed
            .setTitle("Across all seasons")
        }
        usersList
            .setColor(messageColorBlue)
            .setTitle("People who've played this deck in the time frame provided.")
        for (i = 0; i < returnArr[5].length; i++){
            usersList.addFields(
                {name: " \u200b", value: "<@!"+returnArr[5][i]+">", inline: true}
            )
        }
        generalChannel.send(deckStatsEmbed)
        generalChannel.send(usersList) 
    }
    else if (returnArr[0] == "User Lookup"){
        
        deckStatsEmbed
        .setColor(messageColorBlue)
        .setTitle("Deck Stats")
        .setDescription("For user: "+ "<@!"+returnArr[1]+">"+ "\n\
        For Season Name: " + returnArr[4])
        .setFooter("Looking for detailed deck breakdown? Try !profile @user to see exactly what decks this user plays.")
        .addFields(
            { name: 'Wins', value: returnArr[2], inline: true},
            { name: 'Losses', value: returnArr[3], inline: true},
            { name: 'Number of Matches', value: returnArr[2] + returnArr[3], inline: true}, 
            { name: 'Winrate', value: Math.round((returnArr[2]/(returnArr[2]+returnArr[3]))*100) + "%"}, 
        ) 
        if (returnArr[4] == "all"){
            deckStatsEmbed.setDescription("For user: "+ "<@!"+returnArr[1]+">"+ ". Across all seasons")
        }
        generalChannel.send(deckStatsEmbed)
        
    }
    else if (returnArr[0] == "Raw Deck Lookup"){
        const allDecksEmbed = new Discord.MessageEmbed()
        .setColor(messageColorBlue)
        .setTitle("Deck Stats")
        .setDescription("Data for the season named: " + returnArr[2])
        if (returnArr[2] == "all"){
            allDecksEmbed
            .setDescription("Data across all seasons")
        }         
        var nameVar = ""
        let sortedArray = returnArr[1].sort(function(a, b) {
            return parseFloat(b[1]+b[2]) - parseFloat(a[1]+a[2]);
        });
        sortedArray.forEach((deck)=>{
            nameVar += deck[0] + "\n"
            if (deck[1] + deck[2] < threshold){ }
            else{
                allDecksEmbed
                .addFields(
                    { name: "Deck Names", value: deck[0]},
                    { name: "Wins", value: deck[1],inline: true},
                    { name: "Losses", value: deck[2],inline: true},
                    { name: 'Winrate', value: Math.round((deck[1]/(deck[1]+deck[2]))*100) + "%", inline: true}, 
                    //{ name: 'Number of Matches', value: deck[1] + deck[2], inline: true},    
                )
            }
        })
        allDecksEmbed
        .setFooter("Note: The threshold to appear on this list is " + threshold.toString() + " game(s)\nAdmins can configure this using !setconfig\nLooking for detailed deck breakdown? Try !deckinfo <deckname> to see more about specific decks")
        generalChannel.send(allDecksEmbed)

    }
    else if (returnArr == "Bad season deckstats input"){
        const errorMsg = new Discord.MessageEmbed()
        .setColor(messageColorRed)
        .setAuthor("Improper Input")
        .setDescription("It looks like you're trying to search for deckstats by season.\n\
        Proper format: !deckstats | <Season Name>")
        generalChannel.send(errorMsg)
    }
    else{
        deckStatsEmbed
        .setColor(messageColorRed) //red
        .setDescription("No games have been logged with that name in that season. \n\
         Try !decks to find a list of decks for this server \n\
         Example Commands involving deckstats: \n\
         !deckstats <deckname> to find information about a deck across all seasons.\n\
         !deckstats <deckname> | <seasonname> to find information about a deck in a specific season.\n\
         !deckstats @user to find information about a user's deckstats.")
        generalChannel.send(deckStatsEmbed)
    }
}
/**
 * use()
 * @param {*} receivedMessage 
 * @param {*} args 
 */
async function use(receivedMessage, args){
    let generalChannel = getChannelID(receivedMessage)
    let returnArr = await userObj.useDeck(receivedMessage, args)
    if (returnArr == "Success"){
        const successEmbed = new Discord.MessageEmbed()
        .setColor(messageColorGreen)
        .setAuthor("Success")
        .setDescription("Successfully set <@!" + receivedMessage.author.id + ">'s deck to: " + DeckHelper.toUpper(args.join(' ')))
        .setFooter("You’ve now set your deck for this server\nStart logging games with the !log command\nType !help log for more information")
        generalChannel.send(successEmbed)
    }
    else if (returnArr == "Not a registered deck"){
        const notRegisteredEmbed = new Discord.MessageEmbed()
        .setColor(messageColorRed)
        .setAuthor("Not a registered deck")
        .setDescription("Type !decks to see a list of available decks")
        generalChannel.send(notRegisteredEmbed)
    }
    else if (returnArr == "Can't find user"){
        const noUserEmbed = new Discord.MessageEmbed()
        .setColor(messageColorRed)
        .setAuthor("You are not registered")
        .setDescription("Make sure to type !register before trying to use a deck")
        generalChannel.send(noUserEmbed)
    }
    else if (returnArr == "Too many args"){
        const badInputEmbed = new Discord.MessageEmbed()
        .setColor(messageColorRed)
        .setAuthor("Improper input")
        .setDescription("Type !use <Deck Name> or !use <Deck Name> | Rogue")
        .setFooter("Type !help or !decks to learn more about 'Rogue'")
        generalChannel.send(badInputEmbed)
    }
}
/**
 * getUserAvatarUrl()
 * @param {*} user 
 */
function getUserAvatarUrl(user) {
    return "https://cdn.discordapp.com/avatars/" + user.id + "/" + user.avatar + ".png"
}
function getUserFromMention(mention) {
    if (!mention) return;
    return client.users.fetch(mention)

	// if (mention.startsWith('<@') && mention.endsWith('>')) {
	// 	mention = mention.slice(2, -1);

	// 	if (mention.startsWith('!')) {
	// 		mention = mention.slice(1);
    //     }
	// }
}
/**
 * recent()
 * @param {Discord Message Obj} receivedMessage 
 * @param {array} args | array of other input after command
 * 
 * TODO: Fix Bot avatar image
 *  
 * **If checking could be optimized but eh**
 * 
 * 
 *  Allows the user to view recent matches. type "server" instead of an @ to see server recent matches. Add "more" on the end of input to add more results
 */
async function recent(receivedMessage, args) {
    let generalChannel = getChannelID(receivedMessage)
    let more = false
    let allServer = false

    // checking block of DOOM
    if (args.length == 0) {
        var matches_arr = await userObj.recent(receivedMessage)
    }
    else if (args.length == 1) {
        if (args[0].toLowerCase() == "more") {
            more = true
            var matches_arr = await userObj.recent(receivedMessage)
        }
        else if ((args[0].charAt(0) != "<" || args[0].charAt(1) != "@" || args[0].charAt(2) != "!") && args[0].toLowerCase() != "server") {
            const errorEmbed = new Discord.MessageEmbed()
                .setColor(messageColorRed)
                .setAuthor("Improper Input")
                .setTitle("You're attempting to check a recent match log")
                .setDescription("Type !recent **@[user]** when searching other users recent matches or \"server\" to see server matches\n\
                Type \"more\" after the command to load more results\n\
                Check !help recent for more information on proper usage")
            generalChannel.send(errorEmbed)
            return
        }
        else if (args[0].toLowerCase() == "server") {
            var matches_arr = await userObj.recent(receivedMessage, null, true)
        }
        else {
            var matches_arr = await userObj.recent(receivedMessage, args[0])
        }
    }
    else if (args.length == 2) {
        if ((args[0].charAt(0) != "<" || args[0].charAt(1) != "@") && args[0].toLowerCase() != "server" || args[1].toLowerCase() != "more") {
            const errorEmbed = new Discord.MessageEmbed()
            .setColor(messageColorRed)
            .setAuthor("Improper Input")
            .setTitle("You're attempting to check a recent match log")
            .setDescription("Type !recent **@[user]** when searching other users recent matches or \"server\" to see server matches\n\
            Type \"more\" after the command to load more results\n\
            Check !help recent for more information on proper usage")
            generalChannel.send(errorEmbed)
            return
        }
        else if (args[0].toLowerCase() == "server") {
            more = true
            var matches_arr = await userObj.recent(receivedMessage, null, true)
        }
        else {
            more = true
            var matches_arr = await userObj.recent(receivedMessage, args[0])
        }
    }
    else {
        const errorEmbed = new Discord.MessageEmbed()
                .setColor(messageColorRed)
                .setAuthor("Improper Input")
                .setTitle("You're attempting to check a recent match log")
                .setDescription("Type !recent **@[user]** when searching other users recent matches or \"server\" to see server matches\n\
                Type \"more\" after the command to load more results\n\
                Check !help recent for more information on proper usage")
            generalChannel.send(errorEmbed)
            return
    }
    // Checking block over


    //Log only 5 most recent matches or if the user types "more" 
    matches_arr = matches_arr.reverse()
    if (more) {
        matches_arr = matches_arr.slice(0,10)
    }
    else {
        matches_arr = matches_arr.slice(0,5)
    }

    // Make sure there are matches
    if (matches_arr.length == 0) {
        const errorEmbed = new Discord.MessageEmbed()
                .setColor(messageColorBlue)
                .setAuthor("No Matches Logged")
                .setTitle("The user you're attempting to mention has no matches logged")
        generalChannel.send(errorEmbed)
        return
    }

    // Grammar fixing
    let matchGrammar = "match"
    if (matches_arr.length > 1) {
        matchGrammar = "matches"
    }
    else {
        matchGrammar = "match"
    }

    const confirmEmbed = new Discord.MessageEmbed()
        .setColor(messageColorGreen)
        .setDescription("Showing " + matches_arr.length.toString() + " recent " + matchGrammar)
    generalChannel.send(confirmEmbed)

    //Main loop
    let tempEmbed
    matches_arr.forEach(async(match) => {
        var convertedToCentralTime = match[0].toLocaleString("en-US", {timeZone: "America/Chicago"})

        //const bot = await getUserFromMention(config.clientID)
        //console.log(match)
        const winner = await getUserFromMention(match[4])
        const loser1 = await getUserFromMention(match[5])
        const loser2 = await getUserFromMention(match[6])
        const loser3 = await getUserFromMention(match[7])
        tempEmbed = new Discord.MessageEmbed()
            .setColor(messageColorBlue) //blue
            .setTitle('Game ID: ' + match[1])
            .setThumbnail(getUserAvatarUrl(winner))
            .addFields(
                { name: 'Season: ', value: match[3], inline: true},
                { name: 'Time (Converted to CST/CDT)', value:convertedToCentralTime, inline: true},
                { name: 'Winner:', value: '**'+winner.username+'**' + ' piloting ' + '**'+match[8]+'**', inline: true},
                { name: 'Opponents:', value: 
                '**'+loser1.username+'**'+ ' piloting ' + '**'+match[9]+'**' + '\n'
                + '**'+loser2.username+'**'+ ' piloting ' + '**'+match[10]+'**' + '\n' 
                + '**'+loser3.username+'**'+ ' piloting ' + '**'+match[11]+'**' }
            )
        generalChannel.send(tempEmbed)
    })
}
/**
 * listDecks()
 * @param {*} receivedMessage 
 * @param {*} args 
 * TODO: There's weird lag in this function.. someone help -noah
 * It will spit out either up to the 4th color or the 5th, lag for like 3-5 seconds then spit out the rest of the messages
 */
async function listDecks(receivedMessage, args){
    let generalChannel = getChannelID(receivedMessage)
    if (args[0] !== undefined){
        let result = await DeckHelper.checkColorDictionary(args[0])
        if (result != "Not found"){
            let colorSpecificArray = new Array()
            let returnArr = await deckObj.listDecks(receivedMessage, result)
            returnArr.forEach(entry =>{
                colorSpecificArray.push(entry._name)
            })
            receivedMessage.author.send(DeckHelper.createDeckEmbed(colorSpecificArray, args)).catch(() => receivedMessage.reply("I don't have permission to send you messages! Please change your settings under this server's *Privacy Settings* section"));
            const helperEmbed = new Discord.MessageEmbed()
            .setColor(messageColorGreen)
            .setTitle("I have Direct Messaged you decks! Don't see what you're looking for?")
            .setDescription("Using 'Rogue' when logging matches will encompass decks not on this list. \
            Try '!use <deckname> | Rogue' to be able to use **any deck**.")
            generalChannel.send(helperEmbed)
            return
        }
    }
    else{
        let returnArr = await deckObj.listDecks(receivedMessage, "no")
        let oneColorArr = new Array();
        let twoColorArr = new Array();
        let threeColorArr = new Array();
        let fourColorArr = new Array();
        let fiveColorArr = new Array();
        let combinedArr = new Array();

        returnArr.forEach(entry =>{
            var newStr = entry._colors.replace(/,/g, '');
            newStr = newStr.replace(/ /g, '');
            
            if (newStr.length == 1){
                oneColorArr.push(entry._name + " - " + entry._colors)
            }
            else if (newStr.length == 2){
                twoColorArr.push(entry._name + " - " + entry._colors)
            }
            else if (newStr.length == 3){
                threeColorArr.push(entry._name + " - " + entry._colors)
            }
            else if (newStr.length == 4){
                fourColorArr.push(entry._name + " - " + entry._colors)
            }
            else{
                fiveColorArr.push(entry._name + " - " + entry._colors)
            }
        })
        oneColorArr.sort()
        twoColorArr.sort()
        threeColorArr.sort()
        fourColorArr.sort()
        fiveColorArr.sort()
        receivedMessage.author.send(DeckHelper.createDeckEmbed(oneColorArr, "ONE COLOR")).then(msg => {
            receivedMessage.author.send(DeckHelper.createDeckEmbed(twoColorArr, "TWO COLOR"))
            receivedMessage.author.send(DeckHelper.createDeckEmbed(threeColorArr, "THREE COLOR"))
            receivedMessage.author.send(DeckHelper.createDeckEmbed(fourColorArr, "FOUR COLOR"))
            receivedMessage.author.send(DeckHelper.createDeckEmbed(fiveColorArr, "FIVE COLOR"))
            const helperEmbed = new Discord.MessageEmbed()
            .setColor(messageColorGreen)
            .setTitle("I have Direct Messaged you this server's Decks. Don't see what you're looking for?")
            .setDescription("Using 'Rogue' when logging matches will encompass decks not on this list. \
            Try '!use <deckname> | Rogue' to be able to use **any deck**.")
            .setFooter("Remember to type !startseason or no decks will appear in this list.")
            generalChannel.send(helperEmbed)
        }).catch(() => 
        receivedMessage.reply("I don't have permission to send you messages! Please change your settings under this server's *Privacy Settings* section"))
        
        
    }
}
/**
 * addDeck()
 * @param {*} receivedMessage 
 * @param {*} args 
 * 
 * Calling method checks for admin privs before getting here.
 */
async function addDeck(receivedMessage, args){
    let generalChannel = getChannelID(receivedMessage)
    
    let argsWithCommas = args.toString()
    let argsWithSpaces = argsWithCommas.replace(/,/g, ' ');
    let splitArgs = argsWithSpaces.split(" | ")

    const errorEmbed = new Discord.MessageEmbed()
            .setColor(messageColorRed)
            .setTitle("Error Adding New Deck")
            .setFooter("If you don't have a Deck or Discord Link, type 'no link' in those slots")

    if (splitArgs.length == 9){
        let deckNick = splitArgs[0]
        let commanderName = splitArgs[1]
        let colorIdentity = splitArgs[2].toLowerCase()
        let deckLink = splitArgs[3]
        let author = splitArgs[4]
        let deckDescription = splitArgs[5]
        let deckType = splitArgs[6]
        let hasPrimer = splitArgs[7]
        let discordLink = splitArgs[8]

        commanderName = commanderName.replace(/  /g, ', ')

        if((hasPrimer.toLowerCase() != "yes") && (hasPrimer.toLowerCase() !="no")){
            errorEmbed.setDescription("Incorrect input format. Try this format: \n!add Deck Alias | Commander | Color | Deck Link | Author | Deck Description | Deck Type | Has Primer? (Yes/No) | Discord Link \n \
            It looks like you're having trouble with the Primer. Make sure your primer section is 'Yes' or 'No'")
            generalChannel.send(errorEmbed)
            return
        }
        if ((deckType.toLowerCase() != "proactive")&& (deckType.toLowerCase() != "adaptive")&&(deckType.toLowerCase() != "disruptive")){
            errorEmbed.setDescription("Incorrect input format. Try this format: \n!add Deck Alias | Commander | Color | Deck Link | Author | Deck Description | Deck Type | Has Primer? (Yes/No) | Discord Link \n \
            It looks like you're having trouble with the Deck Type. The three deck types are: Proactive, Adaptive and Disruptive")
            generalChannel.send(errorEmbed)
            return
        }
        if(!(new RegExp("([a-zA-Z0-9]+://)?([a-zA-Z0-9_]+:[a-zA-Z0-9_]+@)?([a-zA-Z0-9.-]+\\.[A-Za-z]{2,4})(:[0-9]+)?(/.*)?").test(discordLink))) {
            discordLink = "No Link Provided";
        }
        if(!(new RegExp("([a-zA-Z0-9]+://)?([a-zA-Z0-9_]+:[a-zA-Z0-9_]+@)?([a-zA-Z0-9.-]+\\.[A-Za-z]{2,4})(:[0-9]+)?(/.*)?").test(deckLink))) {
            deckLink = "No Link Provided";
        }

        colorIdentity = colorIdentity.replace(/ /g, '');
        for (let letter of colorIdentity) {
            if (letter !== ("w") &&letter !== ("u") &&letter !== ("b") &&letter !== ("r") &&letter !== ("g")){
                errorEmbed.setDescription("Incorrect input format. Try this format: \n!add Deck Alias | Commander | Color | Deck Link | Author | Deck Description | Deck Type | Has Primer? (Yes/No) | Discord Link \n \
                It looks like you're having trouble with the Color. Correct input includes the 5 letters 'WUBRG' in some combination")
                generalChannel.send(errorEmbed)
                return;
            }
          }
            

        let newDeckArr = new Array();
        newDeckArr.push(deckNick, commanderName, colorIdentity, deckLink, author, deckDescription, deckType, hasPrimer, discordLink)
        let promiseReturn = await deckObj.addDeck(receivedMessage, newDeckArr)
        if (promiseReturn == "Error 1"){
            const sameNamedEmbed = new Discord.MessageEmbed()
                .setColor(messageColorRed)
                .setAuthor("Duplicate Entry")
                .setDescription("A deck with that name already exists. Please try a new name.")
            generalChannel.send(sameNamedEmbed)
            return
        }
        if (promiseReturn == "Error 2"){
            const sameNamedEmbed = new Discord.MessageEmbed()
                .setColor(messageColorRed)
                .setAuthor("Too many characters")
                .setDescription("Your description is too long, there is a 750 character limit. Please try again")
            generalChannel.send(sameNamedEmbed)
            return
        }
        else{
            const awaitReactionEmbed = new Discord.MessageEmbed()
                .setColor(messageColorBlue)
                .setAuthor("Trying to save a new deck named: " + promiseReturn[0])
                .setDescription("<@!" + receivedMessage.author.id+">"+" Please confirm the information below. \nUpvote to confirm \nDownvote to cancel")
                .addFields(
                    { name: "Deckname", value: promiseReturn[0], inline:true},
                    { name: "Commander", value: promiseReturn[1], inline:true},
                    { name: "Color Identity", value: promiseReturn[2], inline:true},
                    { name: "Deck Link", value: promiseReturn[3], inline:true},
                    { name: "Author", value: promiseReturn[4], inline:true},
                    { name: "Deck Description", value: promiseReturn[5], inline:true},
                    { name: "Deck Type", value: promiseReturn[6], inline:true},
                    { name: "Has Primer?", value: DeckHelper.toUpper(promiseReturn[7].toString()), inline:true},
                    { name: "Discord Link", value: promiseReturn[8], inline:true},
                )
                .setFooter("If you don't have a Deck or Discord Link, type 'no link' in those slots")
            
            generalChannel.send(awaitReactionEmbed).then(function(message, callback){
                message.react("👍")
                message.react("👎")
            })
        }
    }
    else{
        errorEmbed.setDescription("Incorrect input format. Try this format: \n!add Deck Alias | Commander | Color | Deck Link | Author | Deck Description | Deck Type | Has Primer? (Yes/No) | Discord Link")
        generalChannel.send(errorEmbed)
        return
    }
}
/**
 * profile()
 * @param {*} receivedMessage 
 * @param {*} args 
 */
async function profile(receivedMessage, args){
    let generalChannel = getChannelID(receivedMessage)
    let returnArr = await userObj.profile(receivedMessage, args)
    var compareDeck = 0
    var favDeck = ""
    var elo = 1000
    var overallWins = 0
    var overallLosses = 0
    if (returnArr == "Can't find user"){
        const errorUserEmbed = new Discord.MessageEmbed()
        .setColor(messageColorRed)
        .setDescription("Cannot find specified user: " + "<@!"+args[0]+">")
        .setFooter("User is not registered for this league. Make sure you are using Discord Mentions and the user is registered. Type !help profile for more information")
        generalChannel.send(errorUserEmbed)
    }
    else if (returnArr[0] == "No On-Going Season"){
        const profileEmbed = new Discord.MessageEmbed()
        .setColor(messageColorBlue)
        .addFields(
            { name: 'User', value: "<@!"+returnArr[2]+">", inline: true },
            { name: 'Current Deck', value: returnArr[4], inline: true },
            { name: 'Current Rating', value: 1000, inline: true },
        )
        generalChannel.send(profileEmbed)
        const matchesEmbed = new Discord.MessageEmbed()
        .setColor(messageColorBlue)
        .setDescription("This user has no logged matches this season")
        generalChannel.send(matchesEmbed)
    }
    else if (returnArr[0] == "Profile Look Up"){
        let getDeckThreshold = await ConfigHelper.getDeckThreshold(receivedMessage.guild.id)
        for (i=0; i<returnArr[1].length;i++){
            if (returnArr[1][i][1]+returnArr[1][i][2]>compareDeck) {
                compareDeck = returnArr[1][i][1]+returnArr[1][i][2]
                favDeck = returnArr[1][i][0]
            }
            elo += (20*(returnArr[1][i][1])) - (10*(returnArr[1][i][2]))
        }
        const profileEmbed = new Discord.MessageEmbed()
        .setColor(messageColorBlue)
        .setFooter("Showing information about the current season. Season name: " + returnArr[2] +". \nNote: 'Overall winrate' includes the games that are under the server's set threshold")
        .addFields(
            { name: 'User', value: "<@!"+returnArr[3]+">", inline: true },
            { name: 'Current Deck', value: returnArr[5], inline: true },
            { name: 'Current Rating', value: elo, inline: true },
            { name: 'Favorite Deck', value: favDeck, inline: true },
        )
        var threshold = 5
        if (getDeckThreshold != "No configs"){ threshold = getDeckThreshold._deck_threshold }
        const decksEmbed = new Discord.MessageEmbed()
        .setColor(messageColorBlue)
        .setFooter("Note: The threshold to appear on this list is " + threshold.toString() + " game(s)\nAdmins can configure this using !setconfig")
        returnArr[1].forEach((deck) =>{
            overallWins = overallWins + deck[1]
            overallLosses = overallLosses + deck[2]
            if (deck[1] + deck[2] < threshold){ }
            else{
                decksEmbed
                .addFields(
                    { name: " \u200b", value: deck[0]},
                    { name: 'Wins', value: deck[1], inline: true },
                    { name: 'Losses', value: deck[2], inline: true },
                    { name: 'Win Rate', value: Math.round((deck[1]/(deck[2]+deck[1])*100)) + "%", inline: true },
                )
            }
        })
        profileEmbed
        .addFields(
            {name: "Overall Winrate", value: Math.round((overallWins/(overallLosses+overallWins)*100)) + "%", inline: true}
        )
        generalChannel.send(profileEmbed)
        generalChannel.send(decksEmbed)
    }  
}
/**
 * startMatch()
 * @param {*} receivedMessage 
 * @param {*} args 
 * TODO:
 */
async function startMatch(receivedMessage, args){
    const user = require('./Schema/Users')
    const SeasonHelper = require('./Helpers/SeasonHelper')

    let currentSeason = await SeasonHelper.getCurrentSeason(receivedMessage.guild.id)
    let generalChannel = client.channels.cache.get(receivedMessage.channel.id)
    let sanitizedString = receivedMessage.author.id
    const UserIDs = new Array()

    //Generates random 4 char string for id
    let s4 = () => {
        return Math.floor((1 + Math.random()) * 0x1000).toString(16).substring(1);
    }
    let id = s4() + s4() + s4() + s4()

    

    // let checkMatchRet = await GameHelper.checkMatchID(receivedMessage.guild.id,"016a765d1455")
    
    // console.log(checkMatchRet)

    // Check to make sure there is a season on-going
    if (currentSeason == "No Current"){
        const errorMsg = new Discord.MessageEmbed()
            .setColor(messageColorRed)
            .setAuthor("No On-Going Season")
            .setDescription("There is no on-going season. Please start a season before logging matches")
            .setFooter("Admins can use !startseason")
        generalChannel.send(errorMsg)
        return
    }
    // Check to make sure the right amount of users tagged
    if (args.length < 3 || args.length > 3) {
        const errorMsg = new Discord.MessageEmbed()
            .setColor(messageColorRed)
            .setAuthor("Improper input")
            .setDescription("Please submit only the **3 players** who lost in the pod")
            .setFooter("Example: !log @user @user @user")
        generalChannel.send(errorMsg)
        return
    }
    // Make sure every user in message (and message sender) are different users [Block out if testing]
    // var tempArr = args
    // tempArr.push(sanitizedString)
    // if (gameObj.hasDuplicates(tempArr)){
    //     const errorMsg = new Discord.MessageEmbed()
    //             .setColor('#af0000')
    //             .setDescription("**Error**: You can't log a match with duplicate players")
    //     generalChannel.send(errorMsg)
    //     return
    // }
    // Check if User who sent the message is registered
    var someNotRegistered = false
    var mentionValues = new Array()
    var cleanedArg0 = args[0].replace(/[<@!>]/g, '');
    var cleanedArg1 = args[1].replace(/[<@!>]/g, '');
    var cleanedArg2 = args[2].replace(/[<@!>]/g, '');
    mentionValues.push([sanitizedString, receivedMessage],
        [cleanedArg0, receivedMessage],
        [cleanedArg1, receivedMessage],
        [cleanedArg2, receivedMessage])
     let registerPromiseArray = mentionValues.map(GameHelper.checkRegister);
     
     Promise.all(registerPromiseArray).then(results => {
        for (var i = 0; i < results.length; i++){
            if (results[i] == 1){
                const errorMsg = new Discord.MessageEmbed()
                .setColor(messageColorRed)
                .setAuthor("Unregistered User")
                .setDescription("<@!"+mentionValues[i][0]+">" + " isn't registered, type !register")
                .setFooter("Make sure to use the Discord Mention feature when using this command. Check !help log for more information")
                generalChannel.send(errorMsg)
                someNotRegistered = true
            }
        }
     }).then(()=>{
        if (someNotRegistered){return }
        var someDeckNotSet = false
        let currDeckPromiseArray = mentionValues.map(GameHelper.checkDeck)
        Promise.all(currDeckPromiseArray).then(results => {
            for (var i = 0; i < results.length; i++){
                if (results[i] == 1){
                    const someMsg = new Discord.MessageEmbed()
                    .setColor(messageColorRed)
                    .setAuthor("Deck not set")
                    .setDescription("<@"+mentionValues[i][0]+">" + " Looks like we don’t know what deck you’re using\n\
                    Please tell us what deck you’re using by typing: !use <Deck Name>\n\
                    To get a list of decks, type: !decks")
                    generalChannel.send(someMsg)
                    someDeckNotSet = true
                }
            }
        }).then(()=>{
            if (someDeckNotSet){ return }
            else{
                UserIDs.push(sanitizedString)
                // Check if Users tagged are registered
                let ConfirmedUsers = 0
                args.forEach(loser =>{
                            loser = loser.replace(/[<@!>]/g, '');
                            UserIDs.push(loser)
                            ConfirmedUsers++
                            if (ConfirmedUsers == 3){
                                // Double check UserID Array then create match and send messages
                                if (UserIDs.length != 4){
                                    const errorMsg = new Discord.MessageEmbed()
                                        .setColor('#af0000')
                                        .setDescription("**Error:** Code 300")
                                    generalChannel.send(errorMsg)
                                    return
                                }
                                else{
                                    gameObj.createMatch(UserIDs[0], UserIDs[1], UserIDs[2], UserIDs[3], id, receivedMessage, function(cb, err){
                                        if (cb == "FAILURE"){
                                            const errorMsg = new Discord.MessageEmbed()
                                                .setColor('#af0000')
                                                .setDescription("**Error:** Code 301")
                                            generalChannel.send(errorMsg)
                                            return
                                        }
                                        else {
                                            UserIDs.forEach(player => {
                                                findQuery = {_mentionValue: player, _server: receivedMessage.guild.id}
                                                user.findOne(findQuery, function(err, res){
                                                    const userUpvoteEmbed = new Discord.MessageEmbed()
                                                        .setAuthor("Game ID: " + id)
                                                        .setColor(messageColorBlue)
                                                        .setDescription("<@!" + res._mentionValue +">" + " used **" + res._currentDeck + "** \n **Upvote** to confirm \n **Downvote** to contest")
                                                    generalChannel.send("<@!"+res._mentionValue+">", userUpvoteEmbed)
                                                        .then(function (message, callback){
                                                        const filter = (reaction, user) => {
                                                            return ['👍', '👎'].includes(reaction.emoji.name) && user.id !== message.author.id;
                                                        };   
                                                        message.react("👍")
                                                        message.react("👎")
                                                    })
                                                })
                                            })
                                        }
                                    })
                                }
                            }
                        })
                    }
                })
            })
}
/**
 * remindMatch()
 * @param {*} receivedMessage 
 * @param {*} args 
 */
async function remindMatch(receivedMessage, args) {
    var generalChannel = getChannelID(receivedMessage)
    let playerID = receivedMessage.author.id

    //Catch Bad Input
    if (args.length != 0) {
        const errorMsg = new Discord.MessageEmbed()
                .setColor('#af0000')
                .setDescription("**Error**: Bad input")
        generalChannel.send(errorMsg)
        return
    }

    let response = await gameObj.getRemindInfo(playerID, receivedMessage.guild.id).catch((message) => {
        const errorMsg = new Discord.MessageEmbed()
                .setColor('#af0000')
                .setDescription("**Error**: Unfinished match not found")
        generalChannel.send(errorMsg)
        return
    })
    try {
        response.forEach(player => {
            if (player[1] == "N") {
                const errorMsg = new Discord.MessageEmbed()
                        .setColor(messageColorBlue)
                        .setDescription("**Alert**: " + player[0].toString() + "- remember to confirm the match above.")
                generalChannel.send(errorMsg)
            }
        })
    }
    catch {
        return
    }
    
}
/**
 * deleteMatch()
 * @param {discord message obj} receivedMessage 
 * @param {array} args Message content beyond command
 * 
 * Calling method checks for admin priv before getting here.
 */
async function deleteMatch(receivedMessage, args) {
    var generalChannel = getChannelID(receivedMessage)
    let sanitizedString = receivedMessage.author.id
    const confirmMsgEmbed = new Discord.MessageEmbed()

    //Catch bad input
    if (args.length != 1) {
        const errorMsg = new Discord.MessageEmbed()
                .setColor('#af0000')
                .setAuthor("Incorrect Input")
                .setDescription("Please type !deletematch <Match ID>\n\
                See !help deletematch for more information.")
        generalChannel.send(errorMsg)
        return
    }
    const response = await gameObj.deleteMatch(args[0], receivedMessage).catch((message) => {
        const errorMsg = new Discord.MessageEmbed()
                .setColor('#af0000')
                .setAuthor("Incorrect Match ID")
                .setDescription("Match not found")
        generalChannel.send(errorMsg)
        return
    })
    if (response == "SUCCESS") {
        const errorMsg = new Discord.MessageEmbed(confirmMsgEmbed)
                .setColor(messageColorGreen)
                .setDescription("Successfully deleted Match #" + args[0])
        generalChannel.send(errorMsg)
    }
    else if (response == "CONFIRM") {
        confirmMsgEmbed
            .setColor(messageColorBlue)
            .setAuthor("You are attempting to permanently delete a match")
            .setTitle("Match ID: "+ args[0])
            .setDescription("<@!"+sanitizedString+">" + " This is a finished match \n **Upvote** to confirm \n **Downvote** to cancel")
        generalChannel.send(confirmMsgEmbed)
        .then(function (message, callback){
            message.react("👍")
            message.react("👎")
        })
    }
    else {
        return
    }
}

/**
 * matchInfo()
 * @param {discord message obj} receivedMessage 
 * @param {array} args 
 * 
 */
async function matchInfo(receivedMessage, args) {
    var generalChannel = getChannelID(receivedMessage)

    //Catch bad input
    if (args.length != 1 || args[0].length != 12) {
        const errorMsg = new Discord.MessageEmbed()
            .setColor(messageColorRed)
            .setAuthor("Incorrect input")
            .setDescription("Use the format: !info <Match ID>")
            .setFooter("Check !help info for more information")
        generalChannel.send(errorMsg)
        return
    }
    const response = await gameObj.matchInfo(args[0], receivedMessage)
        if (response != "FAIL") {
            var convertedToCentralTime = response[0].toLocaleString("en-US", {timeZone: "America/Chicago"})
            const winner = await getUserFromMention(response[4])
            const loser1 = await getUserFromMention(response[5])
            const loser2 = await getUserFromMention(response[6])
            const loser3 = await getUserFromMention(response[7])
            tempEmbed = new Discord.MessageEmbed()
                .setColor(messageColorBlue) //blue
                .setTitle('Game ID: ' + response[1])
                .setThumbnail(getUserAvatarUrl(winner))
                .addFields(
                    { name: 'Season: ', value: response[3], inline: true},
                    { name: 'Time (Converted to CST/CDT)', value:convertedToCentralTime, inline: true},
                    { name: 'Winner:', value: '**'+winner.username+'**' + ' piloting ' + '**'+response[8]+'**'},
                    { name: 'Opponents:', value: 
                    '**'+loser1.username+'**'+ ' piloting ' + '**'+response[9]+'**' + '\n'
                    + '**'+loser2.username+'**'+ ' piloting ' + '**'+response[10]+'**' + '\n' 
                    + '**'+loser3.username+'**'+ ' piloting ' + '**'+response[11]+'**' }
                )
            generalChannel.send(tempEmbed)
        }
        else if (response == "FAIL"){
            const errorMsg = new Discord.MessageEmbed()
                .setColor(messageColorRed)
                .setDescription("**Error**: Match not found")
            generalChannel.send(errorMsg)
        }
}
/**
 * register()
 * @param {*} receivedMessage 
 * @param {*} args 
 * @param {*} channel 
 */
async function register(receivedMessage){
    let returnArr = await leagueObj.register(receivedMessage)
    let generalChannel = getChannelID(receivedMessage)
    const messageEmbed = new Discord.MessageEmbed()
    if (returnArr == "Success"){
        messageEmbed
        .setColor(messageColorGreen)
        .setDescription("<@!" + receivedMessage.author.id + ">" + " is now registered.")
        .setFooter("You are now registered for this server\nBe sure to tell us what deck you’re using with the !use <Deck Name> command\nCheck out a list of all decks on this server with the !decks command")
        generalChannel.send(messageEmbed)
    }
    if (returnArr == "Already Registered"){
        messageEmbed
        .setColor(messageColorRed)
        .setDescription("<@!" + receivedMessage.author.id + ">" + " is already registered.")
        .setFooter("Check your profile with the !profile command")
        generalChannel.send(messageEmbed)
    }
    else if (returnArr == "Error"){
        messageEmbed
        .setColor(messageColorRed)
        .setAuthor("Critical Error. Try again. If problem persists, please reach out to developers.")
        generalChannel.send(messageEmbed)
    }
}
/**
 * helpCommand()
 * @param {*} receivedMessage 
 * @param {*} arguments 
 */
function helpCommand(receivedMessage, arguments){
    if (arguments.length == 0){
        // Call FunctionHelper to with our message.
        FunctionHelper.showEmbedHelpForAllCommands(receivedMessage)
    } else{
        FunctionHelper.showEmbedHelpForCommand(receivedMessage, arguments);
    }
}
/**
 * credits()
 * @param {*} argument 
 * @param {*} receivedMessage 
 */
function credits(argument, receivedMessage){
    /* @TODO
        Give credit where credit is due 
    */
}
/**
 * getChannelID()
 * @param {Discord Message Object} receivedMessage Message user submitted
 * 
 * @returns Discord Channel obj to send message to
 */
function getChannelID(receivedMessage) {
    return client.channels.cache.get(receivedMessage.channel.id)
}