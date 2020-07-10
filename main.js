//The main hub for the bot, more comments coming soon.
//Most of the commands are labeled apprioriately so far. More organization coming soon.
const Discord = require('discord.js')
const client = new Discord.Client()

//Objects
const deckObj = require('./objects/Deck')
const gameObj = require('./objects/Game')
const leagueObj = require('./objects/League')
const seaonObj = require('./objects/Season')
const userObj = require('./objects/User')

//Helper files
const FunctionHelper = require('./Helpers/FunctionHelper')
const DeckHelper = require('./Helpers/DeckHelper')

//Bot prefix
const botListeningPrefix = "!";

//Colors
const messageColorRed = "#af0000"
const messageColorGreen = "#5fff00"
const messageColorBlue = "#0099ff"

const Module = require('./mongoFunctions')
const generalID = require('./constants')
const moongoose = require('mongoose')
const url = 'mongodb+srv://firstuser:e76BLigCnHWPOckS@cluster0-ebhft.mongodb.net/UserData?authSource=admin&replicaSet=Cluster0-shard-0&readPreference=primary&appname=MongoDB%20Compass&ssl=true'

moongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
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
    manageReaction(reaction, user)
})
/**
 * manageReaction()
 * @param {*} reaction - discord reaction obj
 * @param {*} user  - discord user obj
 * 
 * This is the async manager function for whenever a reaction is submitted. 
 * Atm it only cares about upvotes and downvotes on Game messages
 * 
 * TODO: Confirm with current deck user is using
 */
async function manageReaction(reaction, user) {
    const msg = reaction.message.content.toString().split(' ');
    var embeds = reaction.message.embeds[0]
    var upperLevelEmbeds = reaction.message.embeds[0]
    //Resolving issues where a user would upvote/downvote, then do it again. It would cause embeds.author to be null
    //  causing error log later on
    //console.log(embeds)
    if (embeds.author === null){
        return
    }
    else{
        embeds = embeds.author.name.toString().split(' ')
    }
    //console.log(upperLevelEmbeds.description.toString().split(' '))
    let sanitizedString = "<@!"+user.id+">"
    
    // Catch impersonators block -- Remove if you want bot to react to reactions on non-bot messages
    if (reaction.message.author.id != "717073766030508072") {
        return
    }

    // Game Block
    if (embeds.length > 1 && embeds[0] == "Game" && embeds[1] == "ID:" && reaction.emoji.name === '👍' && user.id != "717073766030508072") {
        grabMentionValue = upperLevelEmbeds.description.toString().split(' ')[0]
        grabMatchID =  embeds[2]
        if (sanitizedString !=  grabMentionValue){
            return
        }
        // 1 = name Ga
        // 2 = ID: 
        // 3 = match ID
        //
        //const result = await gameObj.confirmMatch(msg[3], sanitizedString).catch((message) => {
        //})
        gameObj.confirmMatch(grabMatchID, sanitizedString).then(function() {
                gameObj.checkMatch(grabMatchID).then(function(next) {
                    if (next == "SUCCESS") {
                        gameObj.logMatch(grabMatchID).then(function(final) {
                            gameObj.finishMatch(grabMatchID).then(function(){
                                let generalChannel = getChannelID(reaction.message)
                                const logMessage = new Discord.MessageEmbed()
                                        .setColor(messageColorGreen)
                                        .setDescription("Match logged!")
                                generalChannel.send(logMessage)
                                final.forEach(message => {
                                    const confirmMessage = new Discord.MessageEmbed()
                                        .setColor(messageColorGreen)
                                        .setDescription(message)
                                    generalChannel.send(confirmMessage)
                                })
                                console.log("Game #" + grabMatchID + " success")
                                return
                            }).catch((message) => {
                                console.log("Finishing Game #" + grabMatchID + " failed. ERROR:", message)
                                })

                        }).catch((message) => {
                            console.log("ERROR: " + message)
                            return
                            })
                    }
                }).catch((message) => {
                    console.log("ERROR: " + message)
                    return
                    })
        }).catch((message) => {
            console.log("ERROR: " + message)
            return
            })
    }
    
    else if ((embeds.length > 1 && embeds[0] == "Game" && embeds[1] == "ID:" && reaction.emoji.name === '👎' && user.id != "717073766030508072")){
        grabMentionValue = upperLevelEmbeds.description.toString().split(' ')[0]
        grabMatchID =  embeds[2]
        if (sanitizedString !=  grabMentionValue){
            console.log("not the right user")
            return
        }
        const result = await gameObj.closeMatch(grabMatchID).catch((message) => {
            console.log("Closing Game #" + grabMatchID + " failed.")
        })
        if (result == 'SUCCESS'){
            let generalChannel = getChannelID(reaction.message)
            const cancelledEmbed = new Discord.MessageEmbed()
                .setColor(messageColorGreen)
                .setDescription(grabMentionValue + " cancelled the Match Log")
            generalChannel.send(cancelledEmbed)
        }
        else {
            return
        }
    }
    //end of game block
    //Confirm Delete Match Block
    else if ((embeds.length > 1 && embeds[5] == "delete" && reaction.emoji.name === '👍' && user.id != "717073766030508072")) {
        grabMentionValue = upperLevelEmbeds.description.toString().split(' ')
        grabMatchID = upperLevelEmbeds.title.toString().split(' ')
        if (sanitizedString != grabMentionValue[0]) {
            return
        }
        var generalChannel = getChannelID(reaction.message)
        console.log(grabMatchID)
        gameObj.confirmedDeleteMatch(grabMatchID[2], reaction.message).then((message) => {  
            const successEmbed = new Discord.MessageEmbed()
                .setColor(messageColorGreen)
                .setAuthor("Successfully deleted")
                .setDescription(grabMentionValue[0] + " Match ID:" + grabMatchID[2] + " was deleted")
            reaction.message.edit(successEmbed)
        }).catch((message) => {
            const errorEmbed = new Discord.MessageEmbed()
                .setColor(messageColorRed)
                .setAuthor("Error Deleting")
                .setDescription("Match already deleted")
            reaction.message.edit(errorEmbed)
        })
    }
    else if ((embeds.length > 1 && embeds[5] == "delete" && reaction.emoji.name === '👎' && user.id != "717073766030508072")) {
        grabMentionValue = upperLevelEmbeds.description.toString().split(' ')
        grabMatchID = upperLevelEmbeds.title.toString().split(' ')
        if (sanitizedString != grabMentionValue[0]) {
            return
        }
        const errorEmbed = new Discord.MessageEmbed()
            .setColor(messageColorRed)
            .setAuthor("Delete Cancelled")
            .setDescription(grabMentionValue[0] + " you have **cancelled** deleteting Match ID: **" + grabMatchID[2]+"**")
        reaction.message.edit(errorEmbed);
    }
    //End of Confirm Delete Match Block
    
    //Start of Remove Deck Reacts
    else if((embeds.length == 1 && embeds == "WARNING" && reaction.emoji.name === '👍' && user.id != "717073766030508072")){
       
       let removeDeckResult = await deckObj.removeDeck(reaction.message.embeds[0].title)

       if (removeDeckResult.deletedCount >= 1 ){
        const editedWarningEmbed = new Discord.MessageEmbed()
            .setColor(messageColorGreen) //green
            .setTitle("Successfully Deleted Deck")
        reaction.message.edit(editedWarningEmbed);
       }
       else{
        const editedWarningEmbed = new Discord.MessageEmbed()
            .setColor(messageColorRed) //red
            .setTitle("Unknown Error Occurred. Please try again. Check !deck for the deck you're trying to delete.")
        reaction.message.edit(editedWarningEmbed);
       }
       
    }
    
    else if((embeds.length == 1 && embeds == "WARNING" && reaction.emoji.name === '👎' && user.id != "717073766030508072")){
        const editedWarningEmbed = new Discord.MessageEmbed()
            .setColor(messageColorRed) //red
            .setTitle("Delete Deck Cancelled")
        reaction.message.edit(editedWarningEmbed);
    }
    //End of Remove Deck Reacts

    //Start of Update Deck Reacts
    else if((embeds.length > 4 && embeds[0] == "You" && reaction.emoji.name === '1️⃣' && user.id != "717073766030508072")){
        let channel = reaction.message.channel
        let deckID = upperLevelEmbeds.title.slice(9)
        var oldDeckName = ""
        var newDeckName = ""

        const collector = new Discord.MessageCollector(channel, m => m.author.id === user.id, {time: 10000, max: 1 })
        
        const selectedEditEmbed = new Discord.MessageEmbed(reaction.message.embeds[0])
            .setColor(messageColorBlue)
            .setDescription("**Selected Deck Name**. Please **type** the new deck name.")
        reaction.message.edit(selectedEditEmbed);

        collector.on('collect', async(message) => {
            var grabEmbed = reaction.message.embeds[0]
            if (grabEmbed.title.toString().split(' ')[0] == "Update"){
                return
            }
            else{
                let promiseReturn = await deckObj.updateDeckName(message, deckID)
                if (promiseReturn){
                    newDeckName = promiseReturn[0][1]
                    oldDeckName = promiseReturn[1][1] 

                    const updatedDeckEmbed = new Discord.MessageEmbed(selectedEditEmbed)
                        .setColor(messageColorGreen)
                        .setAuthor("Success!")
                        .setDescription("**Updated** deck name of **" + oldDeckName + "** to **" + newDeckName + "**")
                    reaction.message.edit(updatedDeckEmbed);
                }
                else{
                    const errorDeckEmbed = new Discord.MessageEmbed(selectedEditEmbed)
                        .setColor(messageColorRed)
                        .setAuthor("Error")
                        .setDescription("An error has occurred. Please try again.")
                    reaction.message.edit(errorDeckEmbed);
                }
            }
        })
        collector.on('end', collected =>{
            if (reaction.message.embeds[0].author != null){
                let editedEmbed = reaction.message.embeds[0].author.name.toString().split(' ')
                if (collected.size == 0 && editedEmbed[0] == "You"){
                    const editedEndingMessage = new Discord.MessageEmbed()
                        .setColor(messageColorRed)
                        .setTitle("Update Deck Timeout. Please type !updatedeck <deckname> again.")
                    reaction.message.edit(editedEndingMessage);
                }
            }
            else{
                return
            }
        })
  
    }
    else if((embeds.length > 4 && embeds[0] == "You" && reaction.emoji.name === '2️⃣' && user.id != "717073766030508072")){
        let channel = reaction.message.channel
        let deckID = upperLevelEmbeds.title.slice(9)

        const collector = new Discord.MessageCollector(channel, m => m.author.id === user.id, {time: 10000, max: 1 })
        
        const selectedEditEmbed = new Discord.MessageEmbed(reaction.message.embeds[0])
            .setColor(messageColorBlue)
            .setDescription("**Selected Deck Link**. Please **enter** the new deck link.")
        reaction.message.edit(selectedEditEmbed);

        collector.on('collect', async(message) => {
            if (grabEmbed.title.toString().split(' ')[0] == "Update"){
                return
            }
            else{
                let promiseReturn = await deckObj.updateDeckList(message, deckID)
                if (promiseReturn == "Error 1"){
                    const nonValidURLEmbed = new Discord.MessageEmbed(selectedEditEmbed)
                        .setColor(messageColorRed)
                        .setAuthor("Error")
                        .setDescription("You have entered a non-valid url. Please try again")
                    reaction.message.edit(nonValidURLEmbed);
                }
                else if (promiseReturn){
                    const updatedDeckEmbed = new Discord.MessageEmbed(selectedEditEmbed)
                        .setColor(messageColorGreen)
                        .setAuthor("Success!")
                        .setURL(promiseReturn[0])
                        .setDescription("**Updated** deck list of **" + promiseReturn[1] + "**")
                    reaction.message.edit(updatedDeckEmbed);
                }
                else{
                    const errorDeckEmbed = new Discord.MessageEmbed(selectedEditEmbed)
                        .setColor(messageColorRed)
                        .setAuthor("Error")
                        .setDescription("An error has occurred. Please try again.")
                    reaction.message.edit(errorDeckEmbed);
                }
            }
        })
        collector.on('end', collected =>{
            if (reaction.message.embeds[0].author != null){
                let editedEmbed = reaction.message.embeds[0].author.name.toString().split(' ')
                if (collected.size == 0 && editedEmbed[0] == "You"){
                    const editedEndingMessage = new Discord.MessageEmbed()
                        .setColor(messageColorRed)
                        .setTitle("Update Link Timeout. Please type !updatedeck <deckname> again.")
                    reaction.message.edit(editedEndingMessage);
                }
            }
            else{
                return
            }
        })
  
    }
    else if((embeds.length > 4 && embeds[4] == "update" && reaction.emoji.name === '👎' && user.id != "717073766030508072")){
        const editedWarningEmbed = new Discord.MessageEmbed()
            .setColor(messageColorRed) //red
            .setTitle("Update Deck Cancelled")
        reaction.message.edit(editedWarningEmbed);
    }
    else {
        
        return
    }
    
}

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

    let server = receivedMessage.guild.id
    //console.log(server)
    let responseFormatted = client.channels.cache.get(channel)

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
        case "decksdetailed":
            listDecksDetailed(receivedMessage, responseFormatted);
            break;
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
        case "credits":
            credits(receivedMessage, arguments)
            break;
        default:
            receivedMessage.channel.send(">>> Unknown command. Try '!help'")
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
                { name: 'Has Primer?', value: returnArr._hasPrimer.toString()},
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
    let promiseReturn = await deckObj.findDeckToUpdate(receivedMessage, args);
    if (promiseReturn == "Error 1"){
        updateDeckEmbed
        .setColor(messageColorRed) //red
        .setDescription("Error deck not found. Try !help, !decks or use the format !removedeck <deckname>")
        generalChannel.send(updateDeckEmbed)
    }
    else{
        updateDeckEmbed
        .setColor(messageColorBlue)
        .setAuthor("You are attempting to update the deck: "+ promiseReturn[0]._name)
        .setTitle('Deck ID: ' + promiseReturn[0]._id)
        .setURL(promiseReturn[0]._link)
        .setDescription("React with the **1** to update the **Deck Name**.\nReact with the **2** to update the **Deck Link**.\nReact with the **thumbs down** at any time to cancel.")
        generalChannel.send(updateDeckEmbed)
        .then(function (message, callback){
            message.react("1️⃣")
            message.react("2️⃣")
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
    let promiseReturn = await deckObj.findDeckToRemove(receivedMessage, args);
    if (promiseReturn == "Error 1"){
        addingDeckEmbed
        .setColor(messageColorRed) //red
        .setDescription("Error deck not found. Try !help, !decks or use the format !removedeck <deckname>")
        generalChannel.send(addingDeckEmbed)
    }
    else{
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
async function deckStats(receivedMessage,args){
    let generalChannel = getChannelID(receivedMessage)
    const useEmbed = new Discord.MessageEmbed()
    const usersList = new Discord.MessageEmbed()
    let returnArr = await deckObj.deckStats(receivedMessage, args)
    if (returnArr != "Can't find deck"){
        useEmbed
        .setColor(messageColorBlue) //blue
        .setTitle(returnArr[0] + " Deckstats")
        .addFields(
            { name: 'Wins', value: returnArr[1], inline: true},
            { name: 'Losses', value: returnArr[2], inline: true},
            { name: 'Number of Matches', value: returnArr[1] + returnArr[2], inline: true}, 
            { name: 'Winrate', value: Math.round((returnArr[1]/(returnArr[1]+returnArr[2]))*100) + "%", inline: true}, 
            
        )

        usersList
            .setColor(messageColorBlue) //blue
            .setTitle("People who play this deck")
        for (i = 0; i < returnArr[3].length; i++){
            usersList.addFields(
                {name: " \u200b", value: returnArr[3][i], inline: true}
            )
        }
        generalChannel.send(useEmbed)
        generalChannel.send(usersList)
    }
    else{
        useEmbed
        .setColor(messageColorRed) //red
        .setDescription("No games have been logged with that name. \n Try !decks to find a list of decks for this server \n Or !deckstats <deckname> to find information about a deck.")
        generalChannel.send(useEmbed)
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
                        { name: 'Deck Name', value: callbackName[i]},
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
    var promiseReturnArr = new Array();
    let generalChannel = getChannelID(receivedMessage)

    let argsWithCommas = args.toString()
    let argsWithSpaces = argsWithCommas.replace(/,/g, ' ');
    let argsLowerCase = argsWithSpaces.toLowerCase()
    let splitArgs = argsLowerCase.split(" | ")

    const errorEmbed = new Discord.MessageEmbed()
            .setColor(messageColorRed)
            .setTitle("Error Adding New Deck")

    const addingDeckEmbed = new Discord.MessageEmbed()
    .setColor(messageColorBlue)

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

        if(hasPrimer.toLowerCase() != ("yes" || "no")){
            errorEmbed.setDescription("Incorrect input format. Try this format: \n!add Deck Alias | Commander | Color | Deck Link | Author | Deck Description | Deck Type | Has Primer? (Yes/No) | Discord Link \n \
            It looks like you're having trouble with the Primer. Make sure your primer section is 'Yes' or 'No'")
            generalChannel.send(errorEmbed)
            return
        }
        if (deckType.toLowerCase() != ("proactive" || "adapative" || "disruptive")){
            errorEmbed.setDescription("Incorrect input format. Try this format: \n!add Deck Alias | Commander | Color | Deck Link | Author | Deck Description | Deck Type | Has Primer? (Yes/No) | Discord Link \n \
            It looks like you're having trouble with the Deck Type. The three deck types are: Proactive, Adapative and Disruptive")
            generalChannel.send(errorEmbed)
            return
        }
        if(!(new RegExp("([a-zA-Z0-9]+://)?([a-zA-Z0-9_]+:[a-zA-Z0-9_]+@)?([a-zA-Z0-9.-]+\\.[A-Za-z]{2,4})(:[0-9]+)?(/.*)?").test(discordLink))) {
            discordLink = "";
        }   

        let newDeckArr = new Array();
        newDeckArr.push(deckNick, commanderName, colorIdentity, deckLink, author, deckDescription, deckType, hasPrimer, discordLink)
        let promiseReturn = await deckObj.addDeck(receivedMessage, newDeckArr)
    }
    else{
        errorEmbed.setDescription("Incorrect input format. Try this format: \n!add Deck Alias | Commander | Color | Deck Link | Author | Deck Description | Deck Type | Has Primer? (Yes/No) | Discord Link")
        generalChannel.send(errorEmbed)
    }

    


    //let promiseReturn = await deckObj.addDeck(receivedMessage, args);
        // if (promiseReturn == "Error 1"){
        //     addingDeckEmbed
        //     .setColor(messageColorRed) //red
        //     .setDescription("Deck name already used. Try !decks to see a list of in use names.")
        // }
        // else if (promiseReturn == "Error 2"){
        //     addingDeckEmbed
        //     .setColor(messageColorRed) //red
        //     .setDescription("Unable to save to Database, please try again later.")
        // }
        // else if (promiseReturn == "Error 3"){
        //     addingDeckEmbed
        //     .setColor(messageColorRed) //red
        //     .setDescription("Not a valid URL, please follow the format !adddeck <url> <deck name>.")
        // }
        // !add {Deck Nickname} | {Commander Name} | {Color Identity} | {Deck Link} | {Deck Author} | {Deck Description}
            // promiseReturn.forEach(item => {
            //     promiseReturnArr.push(item)
            // });

            // var grabURL = promiseReturnArr[0].toString()
            // var grabName = promiseReturnArr[1].toString()
            
            // addingDeckEmbed
            // .setTitle("Successfully uploaded new Decklist!")
            // .setColor(messageColorGreen) //green
            // .addFields(
            //     { name: 'Decklist', value: "[Link]("+grabURL+")"},
            //     { name: 'Name', value: grabName},
            // )
        
            // generalChannel.send(addingDeckEmbed)   
             
}
/**
 * profile()
 * @param {*} receivedMessage 
 * @param {*} args 
 */
function profile(receivedMessage, args){
    var generalChannel = getChannelID(receivedMessage)
    userObj.profile(receivedMessage, args, function(callback, err){
        var embedOutput;
        var highest = Number.NEGATIVE_INFINITY;
        var output;
        var tmp;
        for (var i= callback._deck.length-1; i>=1; i--) {
            tmp = (callback._deck[i].Wins) + (callback._deck[i].Losses);
            if (tmp > highest){
                highest = tmp;
                output = callback._deck[i]
            }
        }
        if (output === undefined || highest == 0){
            embedOutput = "No Data Yet."
        }
        else{
            embedOutput = output.Deck
        }

        var calculatedWinrate = (callback._wins/((callback._losses)+(callback._wins)))*100
        if (isNaN(calculatedWinrate)){
            calculatedWinrate = 0;
        }

        const profileEmbed = new Discord.MessageEmbed()
        .setColor(messageColorBlue)
            .setURL('')
            .addFields(
                { name: 'User', value: callback._mentionValue, inline: true },
                { name: 'Season', value: callback._season, inline: true },
                { name: 'Current Deck', value: callback._currentDeck, inline: true },
                { name: 'Current Rating', value: callback._elo, inline: true },
                { name: 'Wins', value:  callback._wins, inline: true },
                { name: 'Losses', value:  callback._losses, inline: true },
                { name: 'Winrate', value: calculatedWinrate + "%", inline: true },
                { name: 'Favorite Deck', value: embedOutput, inline: true },
            )
        generalChannel.send(profileEmbed)
    });
    
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
function register(receivedMessage, args, channel){
    leagueObj.register(receivedMessage, function(callback,err){
        const messageEmbed = new Discord.MessageEmbed()
        if (callback == "1"){ 
            messageEmbed
            .setColor(messageColorGreen)
            .setDescription(receivedMessage.author.username + " is now registered.")
            channel.send(messageEmbed)
        }
        else if (callback == "2"){
            messageEmbed
            .setColor(messageColorRed)
            .setDescription(receivedMessage.author.username + " is already registered.")
            channel.send(messageEmbed)
        }
        else if (callback == "3"){
            messageEmbed
            .setColor(messageColorRed)
            .setDescription("Critical Error. Try again. If problem persists, please reach out to developers.")
            channel.send(messageEmbed)
        }
    })
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
client.login("NzE3MDczNzY2MDMwNTA4MDcy.XtZgRg.k9uZEusoc7dXsZ1UFkwtPewA72U")
