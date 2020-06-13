//The main hub for the bot, more comments coming soon.
//Most of the commands are labeled apprioriately so far. More organization coming soon.
const Discord = require('discord.js')
const client = new Discord.Client()

const deckObj = require('./objects/Deck')
const gameObj = require('./objects/Game')
const leagueObj = require('./objects/League')
const seaonObj = require('./objects/Season')
const userObj = require('./objects/User')

const botListeningPrefix = "!";

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

    deckObj.populateDecks()

    //Lists out the "guilds" in a discord server, these are the unique identifiers so the bot can send messages to server channels
    // client.guilds.cache.forEach((guild) => {
    //     console.log(guild.name)
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
    if (receivedMessage.content.startsWith(botListeningPrefix) && receivedMessage.channel == (client.channels.cache.get(generalID.getGeneralChatID()))){
        processCommand(receivedMessage)
    }
    else{
        let currentChannel =  client.channels.cache.get()
    }
})
function processCommand(receivedMessage){
    let fullCommand = receivedMessage.content.substr(1)
    let splitCommand = fullCommand.split(" ")
    let primaryCommand = splitCommand[0]
    let arguments = splitCommand.slice(1)

    switch(primaryCommand){
        case "help":
            helpCommand(receivedMessage, arguments)
            break;
        case "register":
            register(receivedMessage, arguments)
            break;
        case "users":
            users(receivedMessage, arguments)
            break;
        case "log":
            //logLosers(receivedMessage, arguments)
            logMatch(receivedMessage, arguments)
            break;
        case "profile":
            profile(receivedMessage, arguments)
            break;
        case "adddeck":
            addDeck(receivedMessage, arguments)
            break;
        case "listdecks":
            listDecks();
            break;
        case "credits":
            credits(receivedMessage, arguments)
            break;
        default:
            receivedMessage.channel.send(">>> Unknown command. Try '!help'")
    }
}
function listDecks(){
    let generalChannel = client.channels.cache.get(generalID.getGeneralChatID())
    var callBackArray = new Array();
    deckObj.listDecks(function(callback,err){
        const listedDecksEmbed = new Discord.MessageEmbed()
            .setColor('#0099ff')
            .setURL('')
       for(i = 0; i < callback.length; i++){
            listedDecksEmbed.addFields(
                { name: " \u200b",value: callback[i]._name},
                { name: 'User', value: callback[i]._user, inline: true},
                { name: 'Wins', value: "Update me", inline: true},
                { name: 'Losses', value: "Update me", inline: true},
            )
        }
        generalChannel.send(listedDecksEmbed)        
        
    });
}
function addDeck(receivedMessage, args){
    var callBackArray = new Array();
    let generalChannel = client.channels.cache.get(generalID.getGeneralChatID())
    
    deckObj.addDeck(receivedMessage, args, function(callback,err){
        if ((callback != ("Error: Deck name already used"))&& 
        (callback != ("Error: Unable to save to Database, please try again"))&&
        (callback != ("Error: Not a valid URL, please follow the format !adddeck <url> <name>"))
        ){
            callback.forEach(item => {
                callBackArray.push(item)
            });

            var grabURL = callBackArray[0].toString()
            var grabName = callBackArray[1].toString()
            
            const exampleEmbed = new Discord.MessageEmbed()
            .setColor('#0099ff')
            .setURL('')
            .addFields(
                { name: 'Decklist', value: "[Link]("+grabURL+")"},
                { name: 'Name', value: grabName},
            )
            generalChannel.send("Successfully uploaded new Decklist to Decklists!")
            generalChannel.send(exampleEmbed)
        }
        else{
            generalChannel.send(callback)
        }
    });
}
function profile(receivedMessage, args){
    // @TODO
    // Send this information in a nicer format to discord
    let generalChannel = client.channels.cache.get(generalID.getGeneralChatID())
    Module.profile(receivedMessage, args);
    generalChannel.send(">>> Listed profile in console")
}
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
function logMatch(receivedMessage, args){
    const user = require ('../DiscordBot/Schema/Users')
    let generalChannel = client.channels.cache.get(generalID.getGeneralChatID())
    let arg
    callbackArr = new Array()
    cbArr = new Array()

    args.forEach(loser =>{
        let findQuery = {_id: loser.toString()}
        user.findOne(findQuery, function(err, res){
            if (res){
                arg = res._name.toString()
                Module.logLoser(arg, function(cb, err){
                    cbArr.push(cb)
                    if (cb == "Error: FAIL"){
                        callbackArr.push("Error: FAIL " + " " + loser)
                    }
                    else if (cb == "Error: NO-REGISTER"){
                        callbackArr.push("Error: NO-REGISTER " + " " + loser)
                    }
                    else {
                        callbackArr.push("SUCCESS" + " " + loser)
                    }
                })
            }
            else {
                callbackArr.push("USER NOT FOUND ", + " " + loser)
            }
        })
    });
    arg = receivedMessage.author.id.toString()
    Module.logWinner(arg, function(cb, err){
        cbArr.push(cb)
        if (cb == "Error: FAIL"){
            callbackArr.push("Error: FAIL " + " " + receivedMessage.author.id)
        }
        else if (cb == "Error: NO-REGISTER"){
            callbackArr.push("Error: NO-REGISTER " + " " + receivedMessage.author.id)
        }
        else {
            callbackArr.push("SUCCESS" + " " + receivedMessage.author.id)
        }
    })
    
    console.log(callbackArr)
    console.log(cbArr)
    callbackArr.forEach(cb => {
        generalChannel.send(">>> " + cb)
    });
}
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
function register(receivedMessage, args){
    let generalChannel = client.channels.cache.get(generalID.getGeneralChatID())
    leagueObj.register(receivedMessage, function(callback,err){
        //Case 1: User is not registered and becomes registered
        if (callback == "1"){ 
            generalChannel.send(">>> " + receivedMessage.author.username + " is now registered.")
        }
        //Case 2: User is already registered and the bot tells the user they are already registered
        else{
            generalChannel.send(">>> " + receivedMessage.author.username + " is already registered.")
        }
    })
}
function helpCommand(receivedMessage, arguments){
    let generalChannel = client.channels.cache.get(generalID.getGeneralChatID())
    if (arguments.length == 0){
        const exampleEmbed = new Discord.MessageEmbed()
        .setColor('#0099ff')
        .setTitle('PWP Bot')
        .setURL('')
        .setAuthor('Noah Saldaña', '', '')
        .setDescription('An excellent bot for excellent people')
        .setThumbnail('')
        .addFields(
            { name: '!help', value: 'Where you are now. A list of all available commands with a brief description of each.' },
            { name: '\u200B', value: '\u200B' },
            { name: '!multiply', value: 'Multiply two numbers.', inline: true },
            { name: '!send', value: 'Bot will tell your friends what you really think of them.', inline: true },
            { name: '!log', value: 'Testing function, adds elo to an account. ', inline: true },
            /* @TODO
                Add other commands manually or find a way to programmatically list all commands available + a blurb
            */
        )
        .setImage('')
        .setTimestamp()
        .setFooter('Some footer text here', '');
    
    generalChannel.send(exampleEmbed);
    } else{
        receivedMessage.channel.send("It looks like you need help with " + arguments)

        //@TODO
        //  Take argument user has mentioned and spit back information on it. EX: user types: !help test. Spit back information about test command.
    }
}
function credits(argument, receivedMessage){
    /* @TODO
        Give credit where credit is due 
    */
}
client.login("NzE3MDczNzY2MDMwNTA4MDcy.XtZgRg.k9uZEusoc7dXsZ1UFkwtPewA72U")





//Outdated or old testing commands. Not commented out so they can be collapsed.

//Sends a message to a user. Mention them and then your message and the bot will
//   take the mentioned person and repeat your message to them
function sendMessage(arguments, receivedMessage){
    let generalChannel = client.channels.cache.get(generalID.getGeneralChatID())
    let count = 0
    msg = receivedMessage.content.toLowerCase();
    mention = receivedMessage.mentions.users
    if (mention == null){ return; }
    if (msg.startsWith (prefix + "send")){
        mention.forEach((users) => {
            count++;
        }) 
    }
    if (count > 1){ 
        generalChannel.send(">>> Error, try again and only mention 1 person.")
        generalChannel.send(">>> Try: !send @Username Hello my dear friend!")
        return; 
    }
    else{
        mention.forEach((users) => {
            let fullMessage =  receivedMessage.content.substr(6)
            let splitCommand = fullMessage.split(" ")
            let mentionedAndMessage = splitCommand.slice(1)
            let finishedString = mentionedAndMessage.join(" ");
            generalChannel.send(">>> **psst " + users.toString() + " " + receivedMessage.author.toString() + " says: **")
            generalChannel.send(">>> " + finishedString)
        }) 
    }
}
//Multiplies two numbers. Tutorial stuff 
function multiplyCommand(arguments, receivedMessage){
    if (arguments.length < 2){
        receivedMessage.channel.send("Not enough arguments. Try '!multiply 2 10'")
        return
    }
    let product = 1
    arguments.forEach((value) =>{
        product = product * parseFloat(value)
    })
    receivedMessage.channel.send("The product of " + arguments + " is " + product.toString())
}