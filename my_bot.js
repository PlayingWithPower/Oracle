//The main hub for the bot, more comments coming soon.
//Most of the commands are labeled apprioriately so far. More organization coming soon.

const Discord = require('discord.js')
const client = new Discord.Client()

const Module = require('./mongoFunctions')
const generalID = require('../EloDiscordBot/constants')
const moongoose = require('mongoose')
const url = 'mongodb+srv://firstuser:willams112@cluster0-ebhft.mongodb.net/UserData?authSource=admin&replicaSet=Cluster0-shard-0&readPreference=primary&appname=MongoDB%20Compass%20Community&ssl=true'

moongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });

client.on('ready', (on) =>{
    // var MongoClient = require('mongodb').MongoClient
    // var url = 'mongodb+srv://firstuser:willams112@cluster0-ebhft.mongodb.net/UserData?authSource=admin&replicaSet=Cluster0-shard-0&readPreference=primary&appname=MongoDB%20Compass%20Community&ssl=true'
    // MongoClient.connect(url)
    // .then(function (db) { // <- db as first argument
    //     console.log(db)
    // })
    // .catch(function (err) {})
    console.log("Connected as " + client.user.tag)
    
    client.user.setActivity("Try !help", {type: ""})
    
    //Lists out the "guilds" in a discord server, these are the unique identifiers so the bot can send messages to server channels

    // client.guilds.cache.forEach((guild) => {
    //     console.log(guild.name)
    //     guild.channels.cache.forEach((channel) =>{
    //         console.log(` - ${channel.name} ${channel.type} ${channel.id}`)
    //     })
    // })
    // client.user.setUsername("PWP Bot"); 
})
const prefix = "!";
client.on('message', (receivedMessage) =>{
    if (receivedMessage.author == client.user){
        return
    }
    if (receivedMessage.mentions.users == client.user){
        let generalChannel = client.channels.cache.get(generalID.getGeneralChatID())
        generalChannel.channel.send("text")
    }
    // receivedMessage.channel.send("Message receieved, " + receivedMessage.author.toString() + ": " + receivedMessage.content)
    // receivedMessage.react("🤥")
    // receivedMessage.react("😌")
    // receivedMessage.react("😬")

    if (receivedMessage.content.startsWith("!") && receivedMessage.channel == (client.channels.cache.get(generalID.getGeneralChatID()))){
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

    if (primaryCommand == "help"){
        helpCommand(arguments, receivedMessage)
    }
    else if (primaryCommand == "multiply"){
        multiplyCommand(arguments, receivedMessage)
    }
    else if (primaryCommand == "send"){
        sendMessage(arguments, receivedMessage)
    }
    else if (primaryCommand == "register"){
        register(arguments, receivedMessage)
    }
    else if (primaryCommand == "users"){
        users(arguments, receivedMessage)
    }
    else if(primaryCommand == "addelo"){
        changeElo(receivedMessage, true, arguments)
    }
    else if (primaryCommand == "subtractelo"){
        changeElo(receivedMessage, false)
    }
    else{
        receivedMessage.channel.send(">>> Unknown command. Try '!help'")
    }
}
function changeElo(receivedMessage, add, args){
    //console.log("arguments passed: " + arguments)
    const user = receivedMessage.mentions.users
    let generalChannel = client.channels.cache.get(generalID.getGeneralChatID())
    Module.changeElo(receivedMessage, add, args);
    generalChannel.send(">>> Elo Updated!")
}
function users(arguments, receivedMessage){
    //not functioning right now
    let generalChannel = client.channels.cache.get(generalID.getGeneralChatID())
    generalChannel.send(">>> pepo users")
}
function register(arguments, receivedMessage){
    let generalChannel = client.channels.cache.get(generalID.getGeneralChatID())
    Module.registerFunc(receivedMessage, function(err,msg){
        if (err){
            console.log(msg)
        }
        else{
            console.log("test1")
            console.log(msg)
        }
    })
    generalChannel.send(">>> " + receivedMessage.author.username + " is Registered")
}
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

function helpCommand(arguments, receivedMessage){
    let generalChannel = client.channels.cache.get(generalID.getGeneralChatID())
    if (arguments.length == 0){
        const exampleEmbed = new Discord.MessageEmbed()
        .setColor('#0099ff')
        .setTitle('Pepo Pog')
        .setURL('')
        .setAuthor('Noah Saldaña', '', '')
        .setDescription('An excellent bot for excellent boys')
        .setThumbnail('')
        .addFields(
            { name: '!help', value: 'Where you are now. A list of all available commands with a brief description of each.' },
            { name: '\u200B', value: '\u200B' },
            { name: '!multiply', value: 'Multiply two numbers.', inline: true },
            { name: '!send', value: 'Bot will tell your friends what you really think of them.', inline: true },
            { name: '!addelo', value: 'Testing function, adds elo to an account. ', inline: true },
        )
        .setImage('')
        .setTimestamp()
        .setFooter('Some footer text here', '');
    
    generalChannel.send(exampleEmbed);
    } else{
        receivedMessage.channel.send("It looks like you need help with " + arguments)
    }
}
client.login("NzE3MDczNzY2MDMwNTA4MDcy.XtZgRg.k9uZEusoc7dXsZ1UFkwtPewA72U")