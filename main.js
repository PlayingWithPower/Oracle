const bootstrap = require('./bootstrap.js')

//MongoDB Connection
const moongoose = require('mongoose');
bootstrap.client.login(bootstrap.config.discordKey)
moongoose.connect(bootstrap.config.mongoConnectionUrl, { useNewUrlParser: true, useUnifiedTopology: true });

bootstrap.client.on('ready', (on) =>{
    console.log("Debug log: Successfully connected as " + bootstrap.client.user.tag)
    bootstrap.client.user.setPresence({ activity: { name: 'with !help' }, status: 'online' })
    //Lists out the "guilds" in a discord server, these are the unique identifiers so the bot can send messages to server channels
    // client.guilds.cache.forEach((guild) => {
    //     console.log(guild.id)
    //     guild.channels.cache.forEach((channel) =>{
    //         console.log(` - ${channel.name} ${channel.type} ${channel.id}`)
    //     })
    // })
})
bootstrap.client.on("guildCreate", (guild) => {
    bootstrap.deckObj.setUpPopulate(guild.id);
    let defaultChannel = "";
    guild.channels.cache.forEach((channel) => {
        if(channel.type === "text" && defaultChannel === "") {
            if(channel.permissionsFor(guild.me).has("SEND_MESSAGES")) {
                defaultChannel = channel;
            };
        };
    });
    bootstrap.oracleObj.setup(defaultChannel)
});
bootstrap.client.on('message', (receivedMessage) =>{
    if (receivedMessage.author === bootstrap.client.user){
        return 
    };
    if (receivedMessage.content.startsWith(bootstrap.botListeningPrefix)){
        processCommand(receivedMessage)
    };
    if (receivedMessage.content.indexOf("https://www.spelltable.com/game/") >= 0){
        let index = receivedMessage.content.indexOf("https://www.spelltable.com/game/");
        let urlSpectate = receivedMessage.content.slice(index+32);
        let urlPlayer = "https://www.spelltable.com/game/" + urlSpectate;
        urlSpectate = urlSpectate + "?spectate";
        const spellTableEmbed = new Discord.MessageEmbed()
            .setColor(bootstrap.messageColorBlue)
            .setAuthor("Looks like you're trying to play a game on Spelltable!")
            .addFields(
                {name: "Playing in this game?", value: urlPlayer},
                {name: "Spectating this game?", value: "https://www.spelltable.com/game/"+urlSpectate}
            );
        receivedMessage.channel.send(spellTableEmbed);
    };
});
bootstrap.client.on('messageReactionAdd', (reaction, user) => {
    if (reaction.message.author.id == bootstrap.config.clientID){
        bootstrap.ManageReactHelper.manageReaction(reaction, user, bootstrap.client.channels.cache.get(reaction.message.channel.id))
    }
})
/**
 * processCommand()
 * @param {*} receivedMessage 
 */
async function processCommand(receivedMessage){
    let fullCommand = receivedMessage.content.substr(1).toLowerCase();
    let splitCommand = fullCommand.split(" ");
    let primaryCommand = splitCommand[0];
    let arguments = splitCommand.slice(1);

    let rawFullCommand = receivedMessage.content.substr(1);
    let rawSplitCommand = rawFullCommand.split(" ");
    let rawArguments = rawSplitCommand.slice(1);

    let channel = receivedMessage.channel.id;
    let channelResponseFormatted = bootstrap.client.channels.cache.get(channel);
    let adminGet = await bootstrap.ConfigHelper.checkAdminPrivs(receivedMessage);

    switch(primaryCommand){
        case "help":
            bootstrap.oracleObj.helpCommand(receivedMessage, arguments);
            break;
        case "register":
            bootstrap.oracleObj.register(receivedMessage, arguments, channelResponseFormatted);
            break;
        case "log":
            bootstrap.oracleObj.startMatch(receivedMessage, arguments);
            break;
        // case "remind":
        //     remindMatch(receivedMessage, arguments)
        //     break;
        case "deletematch":
            if (adminGet){
                bootstrap.oracleObj.deleteMatch(receivedMessage, arguments);
            }
            else{
                bootstrap.oracleObj.nonAdminAccess(receivedMessage, primaryCommand);
            }
            break;
        case "acceptmatch":
            if (adminGet){
                bootstrap.oracleObj.forceAccept(receivedMessage, arguments);
            }
            else{
                bootstrap.oracleObj.nonAdminAccess(receivedMessage, primaryCommand);
            }
            break;
        case "info":
            bootstrap.oracleObj.matchInfo(receivedMessage, arguments);
            break;
        case "profile":
            bootstrap.oracleObj.profile(receivedMessage, arguments);
            break;
        case "recent":
            bootstrap.oracleObj.recent(receivedMessage, arguments);
            break;
        case "pending":
            bootstrap.oracleObj.getPending(receivedMessage);
            break;
        case "disputed":
            bootstrap.oracleObj.getDisputed(receivedMessage);
            break;
        case "use":
            bootstrap.oracleObj.use(receivedMessage, arguments, rawArguments);
            break;
        case "decks":
            bootstrap.oracleObj.listDecks(receivedMessage, arguments);
            break;
        case "deckstats":
            bootstrap.oracleObj.deckStats(receivedMessage, rawArguments);
            break;
        case "deckinfo":
            bootstrap.oracleObj.deckinfo(receivedMessage, arguments, rawArguments);
            break;
        case "add":
            if (adminGet){
                bootstrap.oracleObj.addDeck(receivedMessage, rawArguments);
            }
            else{
                bootstrap.oracleObj.nonAdminAccess(receivedMessage, primaryCommand);
            }
            break;
        case "removedeck":
            if (adminGet){
                bootstrap.oracleObj.removeDeck(receivedMessage, arguments);
            }
            else{
                bootstrap.oracleObj.nonAdminAccess(receivedMessage, primaryCommand);
            }
            break;
        case "updatedeck":
            if (adminGet){
                bootstrap.oracleObj.updateDeck(receivedMessage, arguments);
            }
            else{
                bootstrap.oracleObj.nonAdminAccess(receivedMessage, primaryCommand);
            }
            break;
        case "top":
            bootstrap.oracleObj.top(receivedMessage, rawArguments);
            break;
        case "startseason":
            if (adminGet){
                bootstrap.oracleObj.startSeason(receivedMessage, arguments);
            }
            else{
                bootstrap.oracleObj.nonAdminAccess(receivedMessage, primaryCommand);
            }
            break;
        case "endseason":
            if (adminGet){
                bootstrap.oracleObj.endSeason(receivedMessage, arguments);
            }
            else{
                bootstrap.oracleObj.nonAdminAccess(receivedMessage, primaryCommand);
            }
            break;
        case "seasoninfo":
            bootstrap.oracleObj.seasonInfo(receivedMessage, rawArguments);
            break;
        case "setendseason":
            if (adminGet){
                bootstrap.oracleObj.setEndSeason(receivedMessage, arguments);
            }
            else{
                bootstrap.oracleObj.nonAdminAccess(receivedMessage, primaryCommand);
            }
            break;
        case "setconfig":
            if (adminGet){
                bootstrap.oracleObj.configSet(receivedMessage, rawArguments);
            }
            else{
                bootstrap.oracleObj.nonAdminAccess(receivedMessage, primaryCommand);
            }
            break;
        case "getconfig":
            if (adminGet){
                bootstrap.oracleObj.configGet(receivedMessage);
            }
            else{
                bootstrap.oracleObj.nonAdminAccess(receivedMessage, primaryCommand);
            }
            break;
        case "setseasonname":
            if (adminGet){
                bootstrap.oracleObj.setSeasonName(receivedMessage, rawArguments);
            }
            else{
                bootstrap.oracleObj.nonAdminAccess(receivedMessage, primaryCommand);
            }
            break;
        case "setup":
            bootstrap.oracleObj.setup(getChannelID(receivedMessage));
            break;
        case "tutorial":
            bootstrap.oracleObj.tutorial(receivedMessage);
            break;
        case "credits":
            bootstrap.oracleObj.credits(receivedMessage, arguments);
            break;
        default:
            const UnknownCommandEmbed = new bootstrap.Discord.MessageEmbed()
                .setColor(bootstrap.messageColorRed)
                .setAuthor("Unknown command.")
                .setDescription("Type !help to get a list of available commands");
            receivedMessage.channel.send(UnknownCommandEmbed);
    }
}