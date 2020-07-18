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

//Bot prefix
const botListeningPrefix = "!";

//Colors
const messageColorRed = "#af0000"
const messageColorGreen = "#5fff00"
const messageColorBlue = "#0099ff"

const Module = require('./mongoFunctions')
const generalID = require('./constants')
const moongoose = require('mongoose');
const { getInfo } = require('./objects/League');

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
client.on('message', (receivedMessage) =>{
    if (receivedMessage.author == client.user){
        return 
    }
    if (receivedMessage.mentions.users == client.user){
        let generalChannel = client.channels.cache.get(generalID.getGeneralChatID())
        generalChannel.channel.send("text")
    }
    if (receivedMessage.content.startsWith(botListeningPrefix)){
        processCommand(receivedMessage)
    }
    else{
        let currentChannel =  client.channels.cache.get()
    }
    //deckObj.populateDecks(receivedMessage)
})
/**
 * TODO: 
 */
client.on('messageReactionAdd', (reaction, user) => {
    ManageReactHelper.manageReaction(reaction, user, client.channels.cache.get(reaction.message.channel.id))
})

/**
 * processCommand()
 * @param {*} receivedMessage 
 */
function processCommand(receivedMessage){
    let fullCommand = receivedMessage.content.substr(1).toLowerCase()
    let splitCommand = fullCommand.split(" ")
    let primaryCommand = splitCommand[0]
    let arguments = splitCommand.slice(1)

    let channel = receivedMessage.channel.id
    let channelResponseFormatted = client.channels.cache.get(channel)

    switch(primaryCommand){
        case "setup":
            deckObj.setUpPopulate(receivedMessage)
            break;
        case "help":
            helpCommand(receivedMessage, arguments)
            break;
        case "register":
            register(receivedMessage, arguments, channelResponseFormatted)
            break;
        case "users":
            users(receivedMessage, arguments)
            break;
        case "log":
            startMatch(receivedMessage, arguments)
            break;
        case "remind":
            remindMatch(receivedMessage, arguments)
            break;
        case "delete":
            if (FunctionHelper.isUserAdmin(receivedMessage)){
                deleteMatch(receivedMessage, arguments)
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
        case "match":
            matchInfo(receivedMessage, arguments)
            break;
        case "use":
            use(receivedMessage, arguments)
            break;
        case "current":
            current(receivedMessage, arguments)
            break;
        // case "add":
        //     addToCollection(receivedMessage, arguments)
        //     break;
        case "decks":
            listDecks(receivedMessage, arguments)
            break;
        // case "decksdetailed":
        //     listDecksDetailed(receivedMessage, responseFormatted);
        //     break;
        case "deckstats":
            deckStats(receivedMessage, arguments);
            break;
        case "deckinfo":
            deckinfo(receivedMessage, arguments);
            break;
        case "mydecks":
            listUserDecks(receivedMessage, arguments);
            break;
        case "add":
            if (FunctionHelper.isUserAdmin(receivedMessage)){
                addDeck(receivedMessage, arguments)
            }
            else{
                nonAdminAccess(receivedMessage, primaryCommand)
            }
            break;
        case "removedeck":
            if (FunctionHelper.isUserAdmin(receivedMessage)){
                removeDeck(receivedMessage, arguments)
            }
            else{
                nonAdminAccess(receivedMessage, primaryCommand)
            }
            break;
        case "updatedeck":
            if (FunctionHelper.isUserAdmin(receivedMessage)){
                updateDeck(receivedMessage, arguments)
            }
            else{
                nonAdminAccess(receivedMessage, primaryCommand)
            }
            break;
        case "top":
            top(receivedMessage)
            break;
        case "startseason":
            startSeason(receivedMessage, arguments)
            break;
        case "endseason":
            endSeason(receivedMessage, arguments)
            break;
        case "seasoninfo":
            seasonInfo(receivedMessage, arguments)
            break;
        case "credits":
            credits(receivedMessage, arguments)
            break;
        default:
            receivedMessage.channel.send(">>> Unknown command. Try '!help'")
    }
}
async function seasonInfo(receivedMessage, args){
    let generalChannel = getChannelID(receivedMessage)
    if (args[0] === undefined){
        let returnArr = await seasonObj.getInfo(receivedMessage, "Current")
        if (returnArr == "No Current"){
            const noSeasonEmbed = new Discord.MessageEmbed()
            .setColor(messageColorRed)
            .setAuthor("There is no ongoing season")
            .setDescription("To start a new season, try !startseason\nTo see information about another season, try !seasoninfo <Season Name>")
            generalChannel.send(noSeasonEmbed)
        }
        else{
            const seasonInfo = new Discord.MessageEmbed()
            .setColor(messageColorGreen)
            .setAuthor("Displaying Season Info about the Season named: " + returnArr._season_name)
            .addFields(
                {name: "Season Start", value: returnArr._season_start, inline: true},
                {name: "Season End", value: returnArr._season_end, inline: true},
            )
            generalChannel.send(seasonInfo)
        }
    }
    else if (args[0] == "all"){
        let returnArr = await seasonObj.getInfo(receivedMessage, "all")

        if (returnArr != ""){
            returnArr.forEach((season)=>{
                const seasonInfo = new Discord.MessageEmbed()
                .setColor(messageColorGreen)
                .setAuthor("Displaying Season Info about the Season named: " + season._season_name)
                .addFields(
                    {name: "Season Start", value: season._season_start, inline: true},
                    {name: "Season End", value: season._season_end, inline: true},
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
        let returnArr = await seasonObj.getInfo(receivedMessage, args)
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
            .setAuthor("Displaying Season Info about the Season named: " + returnArr._season_name)
            .addFields(
                {name: "Season Start", value: returnArr._season_start, inline: true},
                {name: "Season End", value: returnArr._season_end, inline: true},
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
        .setAuthor("There is no ongoing season")
        .setDescription("To start a new season, try !startseason")
        generalChannel.send(confirmEndSeason)
    }
    else{
        confirmEndSeason
        .setColor(messageColorBlue)
        .setAuthor("WARNING: You are attempting to end the current season named: " + currentSeason._season_name)
        .setDescription("Are you sure you want to end the current season? React below according")
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
            .setTitle("There is already an ongoing Season")
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
            .setDescription("By default, seasons are given a name and no end date.\nTo change this, use commands:\n!setseasonName - sets the current season name\n!setenddate - sets a pre-determined end date for the season\n!endseason - ends the current season")
            .setFooter("End the season at any time with !endseason or set an end date in advanced with !setendseason")
            .addFields(
                {name: "Start Date", value: returnArr[1], inline: true},
                {name: "End Date", value: "No end date set", inline: true},
                {name: "Season Name", value: returnArr[3], inline: true}
            )
        generalChannel.send(startSeason)
    }
    // else if (returnArr[0] == "First Season"){
    //     const startSeason = new Discord.MessageEmbed()
    //         .setColor(messageColorGreen)
    //         .setAuthor("Congrats on starting your first season!")
    //         .setTitle("Successfully started a new Season")
    //         .setDescription("By default, seasons are given a name and no end date.\nTo change this, use commands:\n!setseasonName - sets the current season name\n!setenddate - sets a pre-determined end date for the season\n!endseason - ends the current season")
    //         .setFooter("End the season at any time with !endseason or set an end date in advanced with !setendseason")
    //         .addFields(
    //             {name: "Start Date", value: returnArr[1], inline: true},
    //             {name: "End Date", value: "No end date set", inline: true},
    //             {name: "Season Name", value: returnArr[3], inline: true}
    //         )
    //     generalChannel.send(startSeason)
    // }
}
async function top(receivedMessage){
    let generalChannel = getChannelID(receivedMessage)
    let returnArr = await seasonObj.leaderBoard(receivedMessage)
    const returnEmbed = new Discord.MessageEmbed()
        
    if (returnArr == "Error 1"){
        returnEmbed
            .setColor(messageColorRed)
        generalChannel.send(returnEmbed)
    }
    else{
        returnArr.sort(function(a, b) {
            return parseFloat(b._elo) - parseFloat(a._elo);
        });
        returnEmbed
            .setColor(messageColorGreen)

        returnArr.forEach(user =>{
            let calculatedWinrate = ((user._wins)/(user._wins+user._losses))*100
            if (isNaN(calculatedWinrate)){
                calculatedWinrate = 0
            }
            else{
                calculatedWinrate = Math.round(calculatedWinrate)
            }
            returnEmbed.addFields(
                { name: "Username", value: user._name, inline: true},
                { name: "Elo", value: user._elo, inline: true},
                //{ name: "Games Played", value: user._wins+user._losses, inline: true},
                { name: "Winrate", value: calculatedWinrate + "%", inline: true},
            )
        })
        generalChannel.send(returnEmbed)
    }
}

async function deckinfo(receivedMessage, args){
    let generalChannel = getChannelID(receivedMessage)
    let returnArr = await deckObj.deckInfo(receivedMessage, args)
    if (returnArr == "Error 1"){
        const errorEmbed = new Discord.MessageEmbed()
            .setColor(messageColorRed)
            .setDescription("Error finding the deck **" + args.join(' ') + "** \n Try !decks to find a list of decks")
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
        .setDescription("It looks like you're trying to access the **" + command + "** command. This is an **Admin Only** command. If you would like to access this command, you need a **role** with the 'Administrator' tag on Discord.")
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
        .setDescription("React with the **1** to update the **Commander**.\
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
        .then(function (message, callback){
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
        .setDescription("Error deck not found. Try !help, !decks or use the format !removedeck <deckname>")
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
        .setDescription("Are you sure you want to delete: **" + promiseReturn[0]._name + "** from your server's list of decks?")
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
    let returnArr = await deckObj.deckStats(receivedMessage, args)
    if (returnArr[0] == "Deck Lookup"){
        let deckName = returnArr[1].split(" | ")
        if (deckName[1]===undefined){
            seasonName = returnArr[2]
        }else{ seasonName = deckName[1]}
        deckStatsEmbed
        .setColor(messageColorBlue)
        .setAuthor(deckName[0] + " Deckstats")
        .setTitle("For Season Name: " + seasonName)
        .addFields(
            { name: 'Wins', value: returnArr[3], inline: true},
            { name: 'Losses', value: returnArr[4], inline: true},
            { name: 'Number of Matches', value: returnArr[3] + returnArr[4], inline: true}, 
            { name: 'Winrate', value: Math.round((returnArr[3]/(returnArr[3]+returnArr[4]))*100) + "%"}, 
        )
        usersList
            .setColor(messageColorBlue)
            .setTitle("People who've played this deck in the time frame provided.")
        for (i = 0; i < returnArr[5].length; i++){
            usersList.addFields(
                {name: " \u200b", value: returnArr[5][i], inline: true}
            )
        }
        generalChannel.send(deckStatsEmbed)
        generalChannel.send(usersList) 
    }
    else if (returnArr[0] == "User Lookup"){
        deckStatsEmbed
        .setColor(messageColorBlue)
        .setTitle("Deck Stats")
        .setDescription("For user: "+ returnArr[1])
        .setFooter("For Season Name: " + returnArr[4] + "\nLooking for detailed deck breakdown? Try !profile @user to see exactly what decks this user plays.")
        .addFields(
            { name: 'Wins', value: returnArr[2], inline: true},
            { name: 'Losses', value: returnArr[3], inline: true},
            { name: 'Number of Matches', value: returnArr[2] + returnArr[3], inline: true}, 
            { name: 'Winrate', value: Math.round((returnArr[2]/(returnArr[2]+returnArr[3]))*100) + "%"}, 
        ) 
        generalChannel.send(deckStatsEmbed)
        
    }
    else if (returnArr[0] == "Raw Deck Lookup"){
        const allDecksEmbed = new Discord.MessageEmbed()
        .setColor(messageColorBlue)
        .setTitle("Deck Stats")
        .setFooter("Data for the current season. Season Name: " + returnArr[2] + "\nLooking for detailed deck breakdown? Try !deckinfo <deckname> to see exactly what decks this user plays.")
         
        var nameVar = ""
        var winVar = ""
        var lossVar = ""
        returnArr[1].forEach((deck)=>{
            // nameVar += deck[0] + "\n"
            // if (deck[1] + deck[2] > 1){//THRESHOLD CONFIG HERE
            //     winVar += deck[1] + "\n"
            //     lossVar += deck[2] + "\n"
            // }
            allDecksEmbed
            .addFields(
                { name: "Deck Names", value: deck[0]},
                { name: "Wins", value: deck[1],inline: true},
                { name: "Losses", value: deck[2],inline: true},
                { name: 'Number of Matches', value: deck[1] + deck[2], inline: true}, 
                { name: 'Winrate', value: Math.round((deck[1]/(deck[1]+deck[2]))*100) + "%", inline: true}, 
            )
        })
        generalChannel.send(allDecksEmbed)

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
 * listCollection()
 * @param {*} receivedMessage 
 * @param {*} args 
 */
function listCollection(receivedMessage, args){
    var callbackName = new Array();
    var callbackWins = new Array();
    var callbackLosses = new Array();
    const profileEmbed = new Discord.MessageEmbed()
        .setColor(messageColorBlue)
            .setURL('')

    let generalChannel = getChannelID(receivedMessage)
    userObj.profile(receivedMessage, args, function(callback, err){
            callback._deck.forEach(callbackItem =>{
                callbackName.push(DeckHelper.toUpper(callbackItem.Deck))
                callbackWins.push(callbackItem.Wins)
                callbackLosses.push(callbackItem.Losses)
            })
            if (callbackName.length > 1){
                for (i = 1; i < callbackName.length; i++){
                    var calculatedWinrate = (callbackWins[i]/((callbackLosses[i])+(callbackWins[i])))*100
                    if (isNaN(calculatedWinrate)){
                        calculatedWinrate = 0;
                    }

                    profileEmbed.addFields(
                        { name: " \u200b", value: callbackName[i]},
                        { name: 'Wins', value: callbackWins[i], inline: true },
                        { name: 'Losses', value: callbackLosses[i], inline: true },
                        { name: 'Winrate', value: calculatedWinrate + "%", inline: true },
                    )
                }
                generalChannel.send(profileEmbed)
            }
            else{
                generalChannel.send(">>> No decks in "+"<@!"+receivedMessage.author.id+">"+"'s collection. Please add decks using !addtoprofile <deckname>")
            }
        })
        
            
}
/**
 * addToCollection()
 * @param {*} receivedMessage 
 * @param {*} args 
 */
function addToCollection(receivedMessage, args){
    let generalChannel = client.channels.cache.get(generalID.getGeneralChatID())
    userObj.addToCollection(receivedMessage, args, function(callback, err){
        generalChannel.send(">>> " + callback)
    })
}
/**
 * use()
 * @param {*} receivedMessage 
 * @param {*} args 
 */
function use(receivedMessage, args){
    let generalChannel = getChannelID(receivedMessage)
    const useEmbed = new Discord.MessageEmbed()
    .setColor(messageColorGreen)
        .setURL('')
    userObj.useDeck(receivedMessage, args, function(callback, err){
            if (callback == "1"){
                useEmbed
                .setColor(messageColorRed) //red
                .setDescription(receivedMessage.author.username + " is not registered. Register with !register")
                generalChannel.send(useEmbed)
            }
            else if (callback[0] == "2"){
                useEmbed
                .setColor(messageColorRed)
                .setDescription("**"+callback[1]+"**" + " is not a registered alias. \n Try !decks and choose an alias or !use <deckname> | Rogue ")
                generalChannel.send(useEmbed)
            }
            else if (callback == "3"){
                useEmbed
                .setColor(messageColorRed)
                .setDescription("Error setting deck. Please try again.")
                generalChannel.send(useEmbed)
            }
            else if (callback[0] == "4"){
                useEmbed
                .setColor(messageColorGreen) //green
                .setDescription("Successfully set " + "**"+callback[1]+"**"+ " as the Current Deck for " + "<@!" + receivedMessage.author.id + ">")
                generalChannel.send(useEmbed)
            }
            else if (callback == "5"){
                useEmbed
                .setColor(messageColorRed) 
                .setDescription("Please provide a deck name to differentiate between your 'Rogue' decks. Try !use <deckname> | Rogue")
                generalChannel.send(useEmbed)
            }
            else if (callback[0] == "5"){
                useEmbed
                .setColor(messageColorRed) 
                .setDescription("You are attempting to use a registered alias: " + "**" + callback[1] + "**" + ". Please try !use <deckname> | Rogue if your list deviates greatly from the primer. Otherwise, try !use " + "**" + callback[1]+"**")
                generalChannel.send(useEmbed)
            }
    });
}
/**
 * current()
 * @param {*} receivedMessage 
 * @param {*} args 
 */
function current(receivedMessage, args){
    let generalChannel = client.channels.cache.get(generalID.getGeneralChatID())
    var callBackArray = new Array();
    const profileEmbed = new Discord.MessageEmbed()
    .setColor(messageColorBlue)
        .setURL('')

    userObj.currentDeck(receivedMessage, args, function(callback, err){
        if (callback == "Error: 1"){
            generalChannel.send(">>> User not found.")
        }
        else if (callback == "Error: 2"){
            generalChannel.send(">>> No deck found for that user")
        }
        else{
            callback.forEach(item =>{
                callBackArray.push(item)
            })
            profileEmbed.addFields(
                { name: 'Deck Name', value: callBackArray[1]},
                { name: 'URL', value: callBackArray[0], inline: true },

            )
            generalChannel.send(profileEmbed)
        }
    })
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

	if (mention.startsWith('<@') && mention.endsWith('>')) {
		mention = mention.slice(2, -1);

		if (mention.startsWith('!')) {
			mention = mention.slice(1);
		}
		return client.users.fetch(mention)
	}
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
                .setDescription("Use **@[user]** when searching other users recent matches or \"server\" to see server matches and type \"more\" after the command to load more results")
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
        if ((args[0].charAt(0) != "<" || args[0].charAt(1) != "@" || args[0].charAt(2) != "!") && args[0].toLowerCase() != "server" || args[1].toLowerCase() != "more") {
            const errorEmbed = new Discord.MessageEmbed()
                .setColor(messageColorRed)
                .setDescription("Use **@[user]** when searching other users recent matches or \"server\" to see server matches and type \"more\" after the command to load more results")
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
                .setDescription("**Error**: Bad Input")
        generalChannel.send(errorEmbed)
        return
    }
    // Checking block over


    //Log only 5 most recent matches or if the user types "more" 
    if (more) {
        matches_arr = matches_arr.slice(0,10)
    }
    else {
        matches_arr = matches_arr.slice(0,5)
    }

    // Make sure there are matches
    if (matches_arr.length == 0) {
        const errorEmbed = new Discord.MessageEmbed()
                .setColor(messageColorRed)
                .setDescription("**Error:** User has no matches in the system")
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

        //const bot = await getUserFromMention('<@!717073766030508072>')
        const winner = await getUserFromMention(match[4])
        //const loser1 = await getUserFromMention(match[5])
        //const loser2 = await getUserFromMention(match[6])
        //const loser3 = await getUserFromMention(match[7])
        tempEmbed = new Discord.MessageEmbed()
            .setColor(messageColorBlue) //blue
            .setTitle('Game ID: ' + match[1])
            //.setThumbnail(getUserAvatarUrl(winner))
            .addFields(
                { name: 'Season: ', value: match[3], inline: true},
                { name: 'Time (Converted to CST/CDT)', value:convertedToCentralTime, inline: true},
                { name: 'Winner:', value: '**'+winner.username+'**' + ' piloting ' + '**'+match[8]+'**', inline: true},
                //{ name: 'Opponents:', value: 
                //'**'+loser1.username+'**'+ ' piloting ' + '**'+match[9]+'**' + '\n'
                //+ '**'+loser2.username+'**'+ ' piloting ' + '**'+match[10]+'**' + '\n' 
                //+ '**'+loser3.username+'**'+ ' piloting ' + '**'+match[11]+'**' }
            )
        generalChannel.send(tempEmbed)
    })
}
/**
 * listUserDecks()
 * @param {*} receivedMessage 
 * @param {*} args 
 */
async function listUserDecks(receivedMessage, args){
    let generalChannel = getChannelID(receivedMessage)
    let returnArr = await deckObj.listUserDecks(receivedMessage)

    let userDecksEmbed = new Discord.MessageEmbed()
        .setColor(messageColorBlue)
        .setDescription(returnArr[0]._mentionValue + ' **Deckstats**')
        for (i = 1; i < returnArr[0]._deck.length; i++){
            let winrate = Math.round((returnArr[0]._deck[i].Wins/(returnArr[0]._deck[i].Wins+returnArr[0]._deck[i].Losses))*100)
            if (isNaN(winrate)){
                winrate = 0
            }
            //Check if there's no data
            if ((returnArr[0]._deck[i].Wins + returnArr[0]._deck[i].Losses) == 0 ){ }
            else{
                userDecksEmbed.addFields(
                    { name: " \u200b",value: returnArr[0]._deck[i].Deck},
                    { name: "Wins",value: returnArr[0]._deck[i].Wins, inline: true},
                    { name: "Losses",value: returnArr[0]._deck[i].Losses, inline: true},
                    { name: "Winrate", value: winrate + "%", inline: true},
                )
            }
        }
        generalChannel.send(userDecksEmbed)
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
    let returnArr = await deckObj.listDecks(receivedMessage)

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
            oneColorArr.push(entry._name)
        }
        else if (newStr.length == 2){
            twoColorArr.push(entry._name)
        }
        else if (newStr.length == 3){
            threeColorArr.push(entry._name)
        }
        else if (newStr.length == 4){
            fourColorArr.push(entry._name)
        }
        else{
            fiveColorArr.push(entry._name)
        }
    })
    const helperEmbed = new Discord.MessageEmbed()
    .setColor(messageColorGreen)
    .setTitle("Don't see what you're looking for here?")
    .setDescription("Using 'Rogue' when logging matches will encompass decks not on this list. \
    Try '!use <deckname> | Rogue' to be able to use **any deck**.")

    generalChannel.send(DeckHelper.createDeckEmbed(oneColorArr, "ONE COLOR"))
    generalChannel.send(DeckHelper.createDeckEmbed(twoColorArr, "TWO COLOR"))
    generalChannel.send(DeckHelper.createDeckEmbed(threeColorArr, "THREE COLOR"))
    generalChannel.send(DeckHelper.createDeckEmbed(fourColorArr, "FOUR COLOR"))
    generalChannel.send(DeckHelper.createDeckEmbed(fiveColorArr, "FIVE COLOR"))
    generalChannel.send(helperEmbed)
}
/**
 * listDecksDetailed()
 * @param {*} channel 
 */
function listDecksDetailed(receivedMessage, channel){
    deckObj.listDecks(receivedMessage, function(callback,err){
        const listedDecksEmbed = new Discord.MessageEmbed()
            .setColor(messageColorBlue)
            .setURL('')
       for(i = 0; i < callback.length; i++){
            listedDecksEmbed.addFields(
                { name: " \u200b",value: callback[i]._name},
                { name: 'Created By', value: callback[i]._user, inline: true},
                { name: 'Wins', value: "Update me", inline: true},
                { name: 'Losses', value: "Update me", inline: true},
            )
        }
        channel.send(listedDecksEmbed)
    });
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
    let argsLowerCase = argsWithSpaces.toLowerCase()
    let splitArgs = argsLowerCase.split(" | ")

    const errorEmbed = new Discord.MessageEmbed()
            .setColor(messageColorRed)
            .setTitle("Error Adding New Deck")

    if (splitArgs.length == 9){
        let deckNick = splitArgs[0]
        let commanderName = splitArgs[1]
        let colorIdentity = splitArgs[2]
        let deckLink = splitArgs[3]
        let author = splitArgs[4]
        let deckDescription = splitArgs[5]
        let deckType = splitArgs[6]
        let hasPrimer = splitArgs[7]
        let discordLink = splitArgs[8]

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
                .setTitle("Error. A deck with that name already exists. Please try a new name.")
            generalChannel.send(sameNamedEmbed)
        }
        else{
            const awaitReactionEmbed = new Discord.MessageEmbed()
                .setColor(messageColorGreen)
                .setAuthor("Trying to save a new deck named: " + promiseReturn[0])
                .setDescription("Please confirm the information below. \nUpvote to confirm \nDownvote to cancel")
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
            
            generalChannel.send(awaitReactionEmbed).then(function(message, callback){
                message.react("👍")
                message.react("👎")
            })
        }
    }
    else{
        errorEmbed.setDescription("Incorrect input format. Try this format: \n!add Deck Alias | Commander | Color | Deck Link | Author | Deck Description | Deck Type | Has Primer? (Yes/No) | Discord Link")
        generalChannel.send(errorEmbed)
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
    var overallWins = 0
    var overallLosses = 0
    if (returnArr == "Can't find user"){
        const errorUserEmbed = new Discord.MessageEmbed()
        .setColor(messageColorRed)
        .setDescription("Cannot find specified user: " + args)
        .setFooter("User is not registered for this league. Have them type !register")
        generalChannel.send(errorUserEmbed)
    }
    else if (returnArr[0] == "Profile Look Up"){
        for (i=0; i<returnArr[1].length;i++){
            if (returnArr[1][i][1]+returnArr[1][i][2]>compareDeck) {
                compareDeck = returnArr[1][i][1]+returnArr[1][i][2]
                favDeck = returnArr[1][i][0]
            }
        }
        const profileEmbed = new Discord.MessageEmbed()
        .setColor(messageColorBlue)
        .setFooter("Showing information about the current season. Season name: " + returnArr[2] +". \nNote: 'Overall winrate' includes the games that are under your set threshold")
        .addFields(
            { name: 'User', value: returnArr[3], inline: true },
            { name: 'Current Deck', value: returnArr[5], inline: true },
            { name: 'Current Rating', value: returnArr[4], inline: true },
            { name: 'Favorite Deck', value: favDeck, inline: true },
        )
        const decksEmbed = new Discord.MessageEmbed()
        .setColor(messageColorBlue)
        .setFooter("Note: The threshold to appear on this list is X games, this is configurable.")
        returnArr[1].forEach((deck) =>{
            overallWins = overallWins + deck[1]
            overallLosses = overallLosses + deck[2]
            if (deck[1] + deck[2] < 5){ }
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
 * logLosers()
 * @param {*} receivedMessage 
 * @param {*} args 
 */
async function logLosers(receivedMessage, args){
    var callBackArray = new Array();
    //var lostEloArray = new Array();
    let generalChannel = client.channels.cache.get(generalID.getGeneralChatID())

    Module.logLosers(args, function(callback,err){
        callback.forEach(item => {
            callBackArray.push(item)
        });
        generalChannel.send(">>> " + callback[0] + " upvote to confirm this game. Downvote to contest. Make sure to $use <deckname> before reacting.")
        .then(function (message, callback){
            const filter = (reaction, user) => {
                return ['👍', '👎'].includes(reaction.emoji.name) && user.id !== message.author.id;
            };   

            message.react("👍")
            message.react("👎")
            // @TODO: 
            // Look into time of awaitReactions (configurable?)
            // Log points only after upvotes are seen. Right now we are logging THEN checking upvotes
            message.awaitReactions(filter, { max: 1, time: 60000, errors: ['time'] })
                .then(collected => {
                    const reaction = collected.first();

                    if (reaction.emoji.name === '👍') {
                        receivedMessage.reply("received confirmation for logging");
                        //console.log(reaction.users)
                    }
                    else {
                        receivedMessage.reply('received contest on game. Please resolve issue then log game again.');
                        return
                    }
                })
        })
        callback.shift()
        // Module.logWinners(receivedMessage, callback, function(callback, err){
        //     //console.log(callback)
        // })
        
    })
   
}

/**
 * startMatch()
 * @param {*} receivedMessage 
 * @param {*} args 
 * TODO:
 */
function startMatch(receivedMessage, args){
    const user = require('./Schema/Users')
    let generalChannel = client.channels.cache.get(receivedMessage.channel.id)

    let sanitizedString = "<@!"+receivedMessage.author.id+">"
    const UserIDs = new Array()

    //Generates random 4 char string for id
    let s4 = () => {
        return Math.floor((1 + Math.random()) * 0x1000).toString(16).substring(1);
    }
    let id = s4() + s4() + s4() + s4()

    // Check to make sure the right amount of users tagged
    if (args.length < 3 || args.length > 3) {
        const errorMsg = new Discord.MessageEmbed()
                .setColor('#af0000')
                .setDescription("**Error**: Submit only the 3 players who lost in the pod")
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
    let findQuery = {_mentionValue: sanitizedString}
    user.findOne(findQuery, function(err, res){
        if (res){
            // Check if user who sent the message has a deck used
            if (res._currentDeck == "None") {
                const errorMsg = new Discord.MessageEmbed()
                    .setColor('#af0000')
                    .setDescription("**Error**: " + res._mentionValue + " doesn't have a deck in use, type !use <deckname>")
                generalChannel.send(errorMsg)
                return
            }
            UserIDs.push(sanitizedString)

            // Check if Users tagged are registered
            let ConfirmedUsers = 0
            args.forEach(loser =>{
                let findQuery = {_mentionValue: loser.toString()}
                user.findOne(findQuery, function(err, res){
                    if (res){
                        // Check if users tagged have a deck used
                        if (res._currentDeck == "None") {
                            const errorMsg = new Discord.MessageEmbed()
                                .setColor('#af0000')
                                .setDescription("**Error**: " + res._mentionValue + " doesn't have a deck in use, type !use <deckname>")
                            generalChannel.send(errorMsg)
                            return
                        }
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
                                            findQuery = {_mentionValue: player}
                                            user.findOne(findQuery, function(err, res){
                                                const userUpvoteEmbed = new Discord.MessageEmbed()
                                                    .setAuthor("Game ID: " + id)
                                                    .setColor(messageColorBlue)
                                                    .setDescription(res._mentionValue + " used **" + res._currentDeck + "** \n **Upvote** to confirm \n **Downvote** to contest")
                                                generalChannel.send(res._mentionValue, userUpvoteEmbed)
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
                    }
                    else{
                        const errorMsg = new Discord.MessageEmbed()
                            .setColor('#af0000')
                            .setDescription("**Error**: " + loser + " isn't registered, type !register")
                        generalChannel.send(errorMsg)
                        return
                    }
                })
            })
        }
        else{
            const errorMsg = new Discord.MessageEmbed()
                .setColor('#af0000')
                .setDescription("**Error**: " + sanitizedString + " isn't registered, type !register")
            generalChannel.send(errorMsg)
            return
        }
    })
}
/**
 * remindMatch()
 * @param {*} receivedMessage 
 * @param {*} args 
 */
async function remindMatch(receivedMessage, args) {
    var generalChannel = getChannelID(receivedMessage)
    let playerID = "<@!"+receivedMessage.author.id+">"

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
    let sanitizedString = "<@!"+receivedMessage.author.id+">"
    const confirmMsgEmbed = new Discord.MessageEmbed()

    //Catch bad input
    if (args.length != 1) {
        const errorMsg = new Discord.MessageEmbed()
                .setColor('#af0000')
                .setDescription("**Error**: Bad input")
        generalChannel.send(errorMsg)
        return
    }

    const response = await gameObj.deleteMatch(args[0], receivedMessage).catch((message) => {
        const errorMsg = new Discord.MessageEmbed()
                .setColor('#af0000')
                .setDescription("**Error**: Match not found")
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
            .setDescription(sanitizedString + " This is a finished match \n **Upvote** to confirm \n **Downvote** to cancel")
        generalChannel.send(confirmMsgEmbed)
        .then(function (message, callback){
            // const filter = (reaction, user) => {
            //     return ['👍', '👎'].includes(reaction.emoji.name) && user.id !== message.author.id;
            // };  
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
    let sanitizedString = "<@!"+receivedMessage.author.id+">"

    //Catch bad input
    if (args.length != 1 || args[0].length != 12) {
        const errorMsg = new Discord.MessageEmbed()
                .setColor(messageColorRed)
                .setDescription("**Error**: Bad input")
        generalChannel.send(errorMsg)
        return
    }
    let failed = false
    const response = await gameObj.matchInfo(args[0], receivedMessage).catch((message) => {
        const errorMsg = new Discord.MessageEmbed()
                .setColor(messageColorRed)
                .setDescription("**Error**: Match not found")
        generalChannel.send(errorMsg)
        failed = true
        return
    }).then(async(match) => {
        if (!failed) {
            var convertedToCentralTime = match[0].toLocaleString("en-US", {timeZone: "America/Chicago"})

            const bot = await getUserFromMention('<@!717073766030508072>')
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
                    { name: 'Winner:', value: '**'+winner.username+'**' + ' piloting ' + '**'+match[8]+'**'},
                    { name: 'Opponents:', value: 
                    '**'+loser1.username+'**'+ ' piloting ' + '**'+match[9]+'**' + '\n'
                    + '**'+loser2.username+'**'+ ' piloting ' + '**'+match[10]+'**' + '\n' 
                    + '**'+loser3.username+'**'+ ' piloting ' + '**'+match[11]+'**' }
                )
            generalChannel.send(tempEmbed)
        }
    })
}
/**
 * logMatch()
 * @param {*} receivedMessage 
 * @param {*} args 
 */
function logMatch(receivedMessage, args){
    const user = require('./Schema/Users')
    let generalChannel = client.channels.cache.get(generalID.getGeneralChatID())
    let arg
    callbackArr = new Array()
    cbArr = new Array()


    if (args.length < 3 || args.length > 3) {
        generalChannel.send(">>> **Error**: Submit only the 3 players who lost in the pod")
        return
    }

    args.forEach(loser =>{
        let findQuery = {_id: loser.toString()}
        console.log(findQuery)
        user.findOne(findQuery, function(err, res){
            if (res){
                generalChannel.send(">>> " + res._id + " upvote to confirm this game. Downvote to contest. Make sure to $use <deckname> before reacting.")
                    .then(function (message, callback){
                    const filter = (reaction, user) => {
                        return ['👍', '👎'].includes(reaction.emoji.name) && user.id !== message.author.id;
                    };   

                    message.react("👍")
                    message.react("👎")

                    message.awaitReactions(filter, { max: 1, time: 60000, errors: ['time'] })
                        .then(collected => {
                        const reaction = collected.first();

                        if (reaction.emoji.name === '👍') {
                            console.log(reaction.author)
                            generalChannel.send(loser + " received confirmation for logging");
                            arg = res._id.toString()
                            gameObj.logLoser(arg, function(cb, err){
                                cbArr.push(cb)
                                if (cb == "Error: FAIL"){
                                    callbackArr.push("Error: FAIL " + " " + loser)
                                }
                                else if (cb == "Error: NO-REGISTER"){
                                    callbackArr.push("Error: NO-REGISTER " + " " + loser)
                                }
                                else {
                                    callbackArr.push("LOSS: " + loser + ":" + " Current Points: " + cb)
                                    if (callbackArr.length == 4){
                                        callbackArr.forEach(cb => {
                                                generalChannel.send(">>> " + cb)
                                            });
                                        }
                                }
                            })
                        }
                        else {
                            receivedMessage.reply('received contest on game. Please resolve issue then log game again.');
                            return
                        }
                    }).catch(collected => {
                        return
                    })
                })
            }
            else {
                callbackArr.push("USER NOT FOUND ", + " " + loser)
            }
        })
    });
    arg = receivedMessage.author.id.toString()
    gameObj.logWinner(arg, function(cb, err){
        cbArr.push(cb)
        if (cb == "Error: FAIL"){
            callbackArr.push("Error: FAIL " + " " + receivedMessage.author.id)
        }
        else if (cb == "Error: NO-REGISTER"){
            callbackArr.push("Error: NO-REGISTER " + " " + receivedMessage.author.id)
        }
        else {
            let sanitizedString = "<@!"+receivedMessage.author.id+">"
            generalChannel.send(">>> " + sanitizedString + " upvote to confirm this game. Downvote to contest. Make sure to $use <deckname> before reacting.")
            .then(function (message, callback){
                const filter = (reaction, user) => {
                    return ['👍', '👎'].includes(reaction.emoji.name) && user.id !== message.author.id;
                };   

                message.react("👍")
                message.react("👎")
                // @TODO: 
                // Look into time of awaitReactions (configurable?)
                // Log points only after upvotes are seen. Right now we are logging THEN checking upvotes
                message.awaitReactions(filter, { max: 1, time: 60000, errors: ['time'] })
                    .then(collected => {
                        const reaction = collected.first();

                        if (reaction.emoji.name === '👍') {
                            generalChannel.send(sanitizedString + " received confirmation for logging");
                            callbackArr.push("WIN: " + sanitizedString + ":" + " Current Points: " + cb)
                            if (callbackArr.length == 4){
                                callbackArr.forEach(cb => {
                                        generalChannel.send(">>> " + cb)
                                    });
                            }
                        }
                        else {
                            receivedMessage.reply('received contest on game. Please resolve issue then log game again.');
                            return
                        }
                    })
            })
        }
    })
}
/**
 * users()
 * @param {*} receivedMessage 
 * @param {*} args 
 */
function users(receivedMessage, args){
    /* @TODO
    This function can be useful for other aspects of the project, it should be converted to a general count function. ATM it only 
    counts the number of documents in the user collection, but it can be expanded to a lot more.
    */
    let generalChannel = client.channels.cache.get(generalID.getGeneralChatID())
    Module.listAll(receivedMessage, function(callback, err){
        generalChannel.send(">>> There are " + callback + " registered users in this league.")
    })
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
        .setDescription(receivedMessage.author.username + " is now registered.")
        generalChannel.send(messageEmbed)
    }
    if (returnArr == "Already Registered"){
        messageEmbed
        .setColor(messageColorRed)
        .setDescription(receivedMessage.author.username + " is already registered.")
        generalChannel.send(messageEmbed)
    }
    else if (returnArr == "Error"){
        messageEmbed
        .setColor(messageColorRed)
        .setDescription("Critical Error. Try again. If problem persists, please reach out to developers.")
        generalChannel.send(messageEmbed)
    }
}
/**
 * helpCommand()
 * @param {*} receivedMessage 
 * @param {*} arguments 
 */
function helpCommand(receivedMessage, arguments){
    let generalChannel = client.channels.cache.get(generalID.getGeneralChatID())
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
