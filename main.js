const bootstrap = require('./bootstrap.js')

//MongoDB Connection
bootstrap.Client.login(bootstrap.Env.discordKey);
bootstrap.mongoose.connect(bootstrap.Env.mongoConnectionUrl, { useNewUrlParser: true, useUnifiedTopology: true });

bootstrap.Client.on('ready', (on) =>{
    console.log("Debug log: Successfully connected as " + bootstrap.Client.user.tag)
    bootstrap.Client.user.setPresence({ activity: { name: 'with !help' }, status: 'online' })
    //Lists out the "guilds" in a discord server, these are the unique identifiers so the bot can send messages to server channels
    // client.guilds.cache.forEach((guild) => {
    //     console.log(guild.id)
    //     guild.channels.cache.forEach((channel) =>{
    //         console.log(` - ${channel.name} ${channel.type} ${channel.id}`)
    //     })
    // })
});
bootstrap.Client.on("guildCreate", (guild) => {
    bootstrap.DeckObj.setUpPopulate(guild.id);
    let defaultChannel = "";
    guild.channels.cache.forEach((channel) => {
        if(channel.type === "text" && defaultChannel === "") {
            if(channel.permissionsFor(guild.me).has("SEND_MESSAGES")) {
                defaultChannel = channel;
            }
        }
    });
    bootstrap.OracleObj.setup(defaultChannel)
});
bootstrap.Client.on('message', (receivedMessage) =>{
    if (receivedMessage.author === bootstrap.Client.user){
        return 
    }
    if (receivedMessage.content.startsWith(bootstrap.botListeningPrefix)){
        processCommand(receivedMessage)
    }
    if (receivedMessage.content.indexOf("https://www.spelltable.com/game/") >= 0){
        let index = receivedMessage.content.indexOf("https://www.spelltable.com/game/");
        let urlSpectate = receivedMessage.content.slice(index+32);
        let urlPlayer = "https://www.spelltable.com/game/" + urlSpectate;
        urlSpectate = urlSpectate + "?spectate";
        const spellTableEmbed = new bootstrap.Discord.MessageEmbed()
            .setColor(bootstrap.messageColorBlue)
            .setAuthor("Looks like you're trying to play a game on Spelltable!")
            .addFields(
                {name: "Playing in this game?", value: urlPlayer},
                {name: "Spectating this game?", value: "https://www.spelltable.com/game/"+urlSpectate}
            );
        receivedMessage.channel.send(spellTableEmbed);
    }
});
bootstrap.Client.on('messageReactionAdd', (reaction, user) => {
    if (reaction.message.author.id === bootstrap.Env.clientID){
        bootstrap.ManageReactHelper.manageReaction(reaction, user, bootstrap.Client.channels.cache.get(reaction.message.channel.id))
    }
});
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
    let channelResponseFormatted = bootstrap.Client.channels.cache.get(channel);
    let adminGet = await bootstrap.ConfigHelper.checkAdminPrivs(receivedMessage);

    switch(primaryCommand){
        case "help":
            bootstrap.OracleObj.helpCommand(receivedMessage, arguments);
            break;
        case "register":
            bootstrap.OracleObj.register(receivedMessage, arguments, channelResponseFormatted);
            break;
        case "log":
            bootstrap.OracleObj.startMatch(receivedMessage, arguments);
            break;
        // case "remind":
        //     remindMatch(receivedMessage, arguments)
        //     break;
        case "deletematch":
            if (adminGet){
                bootstrap.OracleObj.deleteMatch(receivedMessage, arguments);
            }
            else{
                bootstrap.OracleObj.nonAdminAccess(receivedMessage, primaryCommand);
            }
            break;
        case "acceptmatch":
            if (adminGet){
                bootstrap.OracleObj.forceAccept(receivedMessage, arguments);
            }
            else{
                bootstrap.OracleObj.nonAdminAccess(receivedMessage, primaryCommand);
            }
            break;
        case "info":
            bootstrap.OracleObj.matchInfo(receivedMessage, arguments);
            break;
        case "profile":
            bootstrap.OracleObj.profile(receivedMessage, arguments);
            break;
        case "recent":
            bootstrap.OracleObj.recent(receivedMessage, arguments);
            break;
        case "pending":
            bootstrap.OracleObj.getPending(receivedMessage);
            break;
        case "disputed":
            bootstrap.OracleObj.getDisputed(receivedMessage);
            break;
        case "use":
            bootstrap.OracleObj.use(receivedMessage, arguments, rawArguments);
            break;
        case "decks":
            bootstrap.OracleObj.listDecks(receivedMessage, arguments);
            break;
        case "deckstats":
            bootstrap.OracleObj.deckStats(receivedMessage, rawArguments);
            break;
        case "deckinfo":
            bootstrap.OracleObj.deckinfo(receivedMessage, arguments, rawArguments);
            break;
        case "add":
            if (adminGet){
                bootstrap.OracleObj.addDeck(receivedMessage, rawArguments);
            }
            else{
                bootstrap.OracleObj.nonAdminAccess(receivedMessage, primaryCommand);
            }
            break;
        case "removedeck":
            if (adminGet){
                bootstrap.OracleObj.removeDeck(receivedMessage, arguments);
            }
            else{
                bootstrap.OracleObj.nonAdminAccess(receivedMessage, primaryCommand);
            }
            break;
        case "updatedeck":
            if (adminGet){
                bootstrap.OracleObj.updateDeck(receivedMessage, arguments);
            }
            else{
                bootstrap.OracleObj.nonAdminAccess(receivedMessage, primaryCommand);
            }
            break;
        case "top":
            bootstrap.OracleObj.top(receivedMessage, rawArguments);
            break;
        case "startseason":
            if (adminGet){
                bootstrap.OracleObj.startSeason(receivedMessage, arguments);
            }
            else{
                bootstrap.OracleObj.nonAdminAccess(receivedMessage, primaryCommand);
            }
            break;
        case "endseason":
            if (adminGet){
                bootstrap.OracleObj.endSeason(receivedMessage, arguments);
            }
            else{
                bootstrap.OracleObj.nonAdminAccess(receivedMessage, primaryCommand);
            }
            break;
        case "seasoninfo":
            bootstrap.OracleObj.seasonInfo(receivedMessage, rawArguments);
            break;
        case "setendseason":
            if (adminGet){
                bootstrap.OracleObj.setEndSeason(receivedMessage, arguments);
            }
            else{
                bootstrap.OracleObj.nonAdminAccess(receivedMessage, primaryCommand);
            }
            break;
        case "setconfig":
            if (adminGet){
                bootstrap.OracleObj.configSet(receivedMessage, rawArguments);
            }
            else{
                bootstrap.OracleObj.nonAdminAccess(receivedMessage, primaryCommand);
            }
            break;
        case "getconfig":
            if (adminGet){
                bootstrap.OracleObj.configGet(receivedMessage);
            }
            else{
                bootstrap.OracleObj.nonAdminAccess(receivedMessage, primaryCommand);
            }
            break;
        case "setseasonname":
            if (adminGet){
                bootstrap.OracleObj.setSeasonName(receivedMessage, rawArguments);
            }
            else{
                bootstrap.OracleObj.nonAdminAccess(receivedMessage, primaryCommand);
            }
            break;
        case "setup":
            bootstrap.OracleObj.setup(getChannelID(receivedMessage));
            break;
        case "tutorial":
            bootstrap.OracleObj.tutorial(receivedMessage);
            break;
        case "credits":
            bootstrap.OracleObj.credits(receivedMessage, arguments);
            break;
        default:
            const UnknownCommandEmbed = new bootstrap.Discord.MessageEmbed()
                .setColor(bootstrap.messageColorRed)
                .setAuthor("Unknown command.")
                .setDescription("Type !help to get a list of available commands");
            receivedMessage.channel.send(UnknownCommandEmbed);
    }
}