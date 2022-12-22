const bootstrap = require('./bootstrap.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { Events, ActionRowBuilder, StringSelectMenuBuilder, SelectMenuOptionBuilder } = require('discord.js');



//MongoDB Connection
//Create initial mongoDB connection. If cloning this bot, create file named "env.js". File path: DiscordBot/etc/env.js. See Github Readme for more information.
bootstrap.Client.login(bootstrap.Env.discordKey);
bootstrap.mongoose.connect(bootstrap.Env.mongoConnectionUrl, { useNewUrlParser: true, useUnifiedTopology: true });

/**
 * ready() - Prebuilt discord function
 * Called when the bot is turned on. Sends a debug log that the bot connected and sets the presence of the bot.
 * Commented out block gives a full list of the servers the bot is in, and the channels inside of those servers.
 *
 */
bootstrap.Client.on('ready', () =>{
    console.log("Debug log: Successfully connected as " + bootstrap.Client.user.tag);
    bootstrap.Client.user.setPresence({ activity: { name: 'with !help' }, status: 'online' })
    //Lists out the "guilds" in a discord server, these are the unique identifiers so the bot can send messages to server channels
    // client.guilds.cache.forEach((guild) => {
    //     console.log(guild.id)
    //     guild.channels.cache.forEach((channel) =>{
    //         console.log(` - ${channel.name} ${channel.type} ${channel.id}`)
    //     })
    // })

    const commands = [
        new SlashCommandBuilder().setName('help').setDescription('Get info about other commands'),
        new SlashCommandBuilder().setName('server').setDescription('Replies with server info!'),
        new SlashCommandBuilder().setName('user').setDescription('Replies with user info!'),
        new SlashCommandBuilder().setName('profile').setDescription('Profile info').addUserOption(option => option.setName("user").setDescription("Who to look up")),
        new SlashCommandBuilder().setName('top').setDescription('tset'),
    ].map(command => command.toJSON());
    const rest = new REST({ version: '9' }).setToken(bootstrap.Env.discordKey);

    rest.put(Routes.applicationGuildCommands(bootstrap.Env.clientID, '727264412963962910'), { body: commands })
        .then(() => console.log('Successfully registered application commands.'))
        .catch(console.error);
});
/**
 * guildCreate() - Prebuilt discord function
 * Function is called when the bot joins a server. It first checks for the first channel it has permission to send messages in and then sends a message about how to set up the bot.
 *
 * @param {*} guild - A discord guild object. Contains information about the server the bot is joining
 */
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
/**
 * message() - Prebuilt discord function
 * This function is called whenever there is a message sent in a readable channel. It processes whether the sender of the message is the bot itself, at which point it will not respond
 * to itself. It then processes if the message has the 'botListeningPrefix' (outlined in bootstrap.js) and finally if it has a Spelltable link. It then returns, sends information to processCommand() (see below)
 * or spits out a message about Spell Table, in that order.
 *
 * @param {*} receivedMessage - The bot reads in every message sent in readable channels. This is the discord message obj read in
 */
bootstrap.Client.on('message', (receivedMessage) =>{
    if (receivedMessage.author === bootstrap.Client.user){
        return 
    }
    if (receivedMessage.content.startsWith(bootstrap.botListeningPrefix)){
        processCommand(receivedMessage)
    }
    if (receivedMessage.content.indexOf("https://www.spelltable.com/game/") >= 0){
        const getUrls = require('get-urls');
        for (let item of getUrls(receivedMessage.content)){
            let urlSpectate = item;
            urlSpectate = urlSpectate + "?spectate=true";
            const spellTableEmbed = new bootstrap.Discord.MessageEmbed()
                .setColor(bootstrap.messageColorBlue)
                .addFields(
                    {name: "Click this link to spectate this game", value:urlSpectate}
                );
            receivedMessage.channel.send({embeds: [spellTableEmbed] });
        }

    }
});
/**
 * messageReactionAdd() - Prebuilt discord function
 * This function is called whenever there is a reaction in a readable channel for the bot. It first makes a check that the person reacting to the message is the bot, as the only functionality
 * ATM for the bot is listening to its own messages. It then sends all necessary information off to a helper file (Helpers/ManageReactHelper.js), which processes exactly what is happening.
 *
 * @param {*} reaction - The received reaction and the message that the reaction is on. A discord message obj
 * @param {*} user - Information about the user sending the reaction. A discord user obj
 */
bootstrap.Client.on('messageReactionAdd', async (reaction, user) => {
    if (reaction.message.author.id === bootstrap.Env.clientID){
        bootstrap.ManageReactHelper.manageReaction(reaction, user, bootstrap.Client.channels.cache.get(reaction.message.channel.id))
    }
});
/**
 * processCommand()
 * This is the central system of processing bot commands. This function is called when the bot receives a message that contains the bot listening prefix (outlined in bootstrap.js).
 * This function will chop up the full discord message it receives into usable parts that are then sent off to their respective functions in Oracle.JS, based on a switch statement.
 * @param {*} receivedMessage - The contents of the message the bot receives. The full statement is sliced up and processed to a form we understand. "!", "<Actual Command>", "<Parameters>"
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
                bootstrap.OracleObj.startSeason(receivedMessage);
            }
            else{
                bootstrap.OracleObj.nonAdminAccess(receivedMessage, primaryCommand);
            }
            break;
        case "endseason":
            if (adminGet){
                bootstrap.OracleObj.endSeason(receivedMessage);
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
        case "admin":
            if (adminGet){
                bootstrap.OracleObj.adminSet(receivedMessage, rawArguments);
            }
            else{
                bootstrap.OracleObj.nonAdminAccess(receivedMessage, primaryCommand);
            }
            break;
        case "setconfig":
            if (adminGet){
                bootstrap.OracleObj.setConfig(receivedMessage, rawArguments);
            }
            else{
                bootstrap.OracleObj.nonAdminAccess(receivedMessage, primaryCommand);
            }
            break;
        case "getconfig":
            if (adminGet){
                bootstrap.OracleObj.getConfig(receivedMessage);
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
            bootstrap.OracleObj.setup(bootstrap.MessageHelper.getChannelID(receivedMessage));
            break;
        case "tutorial":
            bootstrap.OracleObj.tutorial(receivedMessage);
            break;
        case "credits":
            bootstrap.OracleObj.credits(receivedMessage, arguments);
            break;
        default:
            console.log("DEBUG LOG: Could not find command: '" + primaryCommand +"'")
    }
}
bootstrap.Client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'help') {
        const menu = new ActionRowBuilder().setComponents(
            new StringSelectMenuBuilder()
            .setCustomId('select')
            .setPlaceholder('Click Me')
            .setMinValues(1)
            .setMaxValues(1)
            .setOptions([
                {
                    label: 'Decks',
                    description: "Lists all available decks",
                    value: 'decks',
                },
                {
                    label: 'Deckstats',
                    description: "Lists stats information about decks",
                    value: 'deckstats',
                },
                {
                    label: 'Deckinfo',
                    description: "Provides detailed information about a deck",
                    value: 'deckinfo',
                },
                {
                    label: 'Log',
                    description: "Logs a game to this server's league",
                    value: 'log',
                },
                {
                    label: 'Pending',
                    description: "Lists all unfinished matches",
                    value: 'pending',
                },
                {
                    label: 'Disputed',
                    description: "Lists all disputed matches",
                    value: 'disputed',
                },
                {
                    label: 'Info',
                    description: "Provides detailed information on a match",
                    value: 'info',
                },
            ])
        );

        await interaction.reply({components: [menu]})
    }
    else if (interaction.commandName === 'profile'){
        let user;
        if (typeof interaction.options._hoistedOptions[0] === "undefined"){
            user = interaction.user.id
        }else{
            user = interaction.options._hoistedOptions[0].value.toString()
        }
        const oracleResponse = await bootstrap.OracleObj.profileSlash(interaction, user);
        await interaction.reply({ embeds: [oracleResponse] });
    }

});
bootstrap.Client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isStringSelectMenu()) return;

    const selected = interaction.values[0];

    const oracleResponse = await bootstrap.OracleObj.helpCommand(interaction, selected);
    await interaction.update({embeds:[oracleResponse]});

    // if (selected === 'deckstats') {
    //     await interaction.update('The Ping option has been selected!');
    // } else if (selected === 'decks') {
    //     await interaction.update('The Pong option has been selected!');
    // }
});