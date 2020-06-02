const Discord = require('discord.js')
const client = new Discord.Client()
const generalChannelid = "265295950388396033"

client.on('ready', () =>{
    console.log("Connected as " + client.user.tag)
    
    client.user.setActivity("Try !help", {type: ""})
    
    client.guilds.cache.forEach((guild) => {
        console.log(guild.name)
        guild.channels.cache.forEach((channel) =>{
            console.log(` - ${channel.name} ${channel.type} ${channel.id}`)
        })
        //General channel id: 717073663324848141
        //coolboiz id: 265295950388396033
    })
    // let generalChannel = client.channels.cache.get("717073663324848141")
    // generalChannel.send("", {files: ['https://www.devdungeon.com/sites/all/themes/devdungeon2/logo.png']});
    client.user.setUsername("pepo pog"); 
})

client.on('message', (receivedMessage) =>{
    if (receivedMessage.author == client.user){
        return
    }
    if (receivedMessage.mentions.users == client.user){
        let generalChannel = client.channels.cache.get(generalChannelid)
        generalChannel.channel.send("text")
    }
    //receivedMessage.channel.send("Message receieved, " + receivedMessage.author.toString() + ": " + receivedMessage.content)
    // receivedMessage.react("🤥")
    // receivedMessage.react("😌")
    // receivedMessage.react("😬")

    if (receivedMessage.content.startsWith("!")){
        processCommand(receivedMessage)
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
    else if (primaryCommand == "simp"){
        simpCommand(arguments, receivedMessage)
    }
    else if (primaryCommand == "greekpoki"){
        greekPoki(arguments, receivedMessage)
    }
    else{
        receivedMessage.channel.send("Unknown command. Try '!help'")
    }
}
function greekPoki(arguments, receivedMessage){
    let generalChannel = client.channels.cache.get(generalChannelid)
    generalChannel.send("", {files: ['https://preview.redd.it/7q6e0zxc8og31.png?width=656&auto=webp&s=4988a88a75015329f6212538944aea59f8c938f6']})
}
function simpCommand(arguments, receivedMessage){
    let generalChannel = client.channels.cache.get(generalChannelid)
    generalChannel.send("", {files: ['https://d.newsweek.com/en/full/1571727/pokimane-twitch-deal-exclusive-stream-streaming.jpg?w=1600&h=1600&l=57&t=37&q=88&f=2bb3df1fccb5e50c6d2097c34866fb6d']});
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
    let generalChannel = client.channels.cache.get(generalChannelid)
    if (arguments.length == 0){
        const exampleEmbed = new Discord.MessageEmbed()
        .setColor('#0099ff')
        .setTitle('Pepo Pog')
        .setURL('')
        .setAuthor('Noah Saldaña', '', '')
        .setDescription('An excellent bot for excellent boys')
        .setThumbnail('')
        .addFields(
            { name: '!help', value: 'Where you are now. A list of all available commands with a brief description of each' },
            { name: '\u200B', value: '\u200B' },
            { name: '!multiply', value: 'Multiply two numbers', inline: true },
            { name: '!simp', value: 'Shows you the object of desire', inline: true },
            { name: '!greekpoki', value: 'The man who gets it all', inline: true },
        )
        .setImage('')
        .setTimestamp()
        .setFooter('Some footer text here', '');
    
    generalChannel.send(exampleEmbed);
    } else{
        receivedMessage.channel.send("It looks like you need help with " + arguments)
    }
}
client.login("NzE3MDczNzY2MDMwNTA4MDcy.XtVB7A.nTbYsWAH4dQClyLbcM6d5JocUPg")