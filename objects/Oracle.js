const bootstrap = require('../bootstrap.js');

module.exports = {
    tutorial(receivedMessage){
        const tutorialEmbed = new bootstrap.Discord.MessageEmbed()
            .setAuthor("Welcome to my tutorial!")
            .setTitle("Super lost? Check out our Discord")
            .setURL("https://discord.gg/UCMMMbk")
            .setDescription("This command helps newcomers get their bearings with Oracle bot and gain a basic understanding of how it works.\n\n\
        At its core, Oracle Bot is a Magic the Gathering statistics and information bot, aimed at the CEDH community, but can easily be used\
        for EDH. A few basic steps must be taken for every user trying to use this bot. If you've gotten this far, congrats! You've learned to use\
        Discord Bot Commands. A general guideline of steps to take follows")
            .setColor(bootstrap.messageColorGreen)
            .addFields(
                {name: "Stuck?", value: "Use out **!help <Command Name>** or **!help** to find more information about a command"},
                {name: "Step 1", value: "**Register** yourself for this server. You should receieved a congratulatory message back from the bot\nType **!register**"},
                {name: "Step 2", value: "**Set** what deck you are using. The bot holds information about the deck you're using\n\
            To find information about what decks are available, type **!decks** \n\
            Once you find a deck you want to use, type **!use <Deck Name Here>**"},
                {name: "Step 3: You're done!", value: "You have successfully given the bot the information it needs! From here, there are many roads you can take\n\n\
            Check out analytics on the server with commands like !deckstats, !profile and !top\n\
            Check out specific decks and their information with commands like !deckinfo and !decks\n\
            Log matches and climb the leaderboard with !log\n\n\
            With all of these commands, please type !help <Command Name Here> to learn more. Thank you for joining the community!"},
            );
        receivedMessage.channel.send(tutorialEmbed);
    },
    setup(channel){
        const welcomeEmbed = new bootstrap.Discord.MessageEmbed()
            .setAuthor("Thank you for inviting me to your server! I am Oracle Bot and am used to track Magic The Gathering statistics and information")
            .setTitle("Want to contribute to this bot? Click here for the GitHub")
            .setURL("https://github.com/PlayingWithPower/DiscordBot")
            .setDescription("This command will help you walk through how to properly set up the bot\n\
    There are a few key steps for an Admin to perform before games can be logged, decks can be tracked and users can register\n\
    Type !setup at any time to find this command again")
            .setColor(bootstrap.messageColorGreen)
            .addFields(
                {name: "Stuck?", value: "Use out !help <Command Name> or !help to find more information about a command"},
                {name: "Step 1", value: "Start a new season for your server\nType !startseason"},
                {name: "Step 2", value: "Have users register for your new season\nTo participate, type !register "},
                {name: "Step 3", value: "Set your decks before logging a game\nUse !use <Deck Name> to set your deck\nUse !decks to see pre-loaded decks. Add more decks with !add and follow the formatting tips provided"},
                {name: "Step 4", value: "Play games of Magic and then log them\n!log @loser1 @loser2 @loser3\nThe person who logs the match is always the winner!"},
                {name: "Step 5", value: "That is it! Congrats on setting up this bot\nCheck !help to see everything it is capable of\nSubmit feature requests and fixes to the Github or the official Discord"}
            )
            .setFooter("Note: By default, 'Admin' is anyone in your server with general Discord Administrative privileges. This is configurable using !setconfig");
        channel.send(welcomeEmbed);
    },
    async forceAccept(receivedMessage, args){
        let generalChannel = bootstrap.MessageHelper.getChannelID(receivedMessage);

        if (args.length === 1){
            let returnArr= await bootstrap.GameObj.forceAccept(args, receivedMessage.guild.id);
            if (returnArr === "Success"){
                const successEmbed = new bootstrap.Discord.MessageEmbed()
                    .setColor(bootstrap.messageColorGreen)
                    .setAuthor("Match accepted")
                    .setDescription("The match you have entered is now accepted\n\
            Use !pending to find other pending matches");
                generalChannel.send(successEmbed)
            }
            else if (returnArr === "Error"){
                const invalidInputEmbed = new bootstrap.Discord.MessageEmbed()
                    .setColor(bootstrap.messageColorRed)
                    .setAuthor("Unable to update match")
                    .setDescription("Please try again");
                generalChannel.send(invalidInputEmbed)
            }
            else if (returnArr === "Match is already accepted"){
                const invalidInputEmbed = new bootstrap.Discord.MessageEmbed()
                    .setColor(bootstrap.messageColorRed)
                    .setAuthor("Match already accepted")
                    .setDescription("The match you have entered is already accepted\n\
            Use !delete <Match ID> to delete a match");
                generalChannel.send(invalidInputEmbed)
            }
            else if (returnArr === "Can't find match"){
                const invalidInputEmbed = new bootstrap.Discord.MessageEmbed()
                    .setColor(bootstrap.messageColorRed)
                    .setAuthor("Can't find match")
                    .setDescription("You have entered an invalid match ID\n\
            Check !help acceptmatch for more information");
                generalChannel.send(invalidInputEmbed)
            }
        }
        else{
            const invalidInputEmbed = new bootstrap.Discord.MessageEmbed()
                .setColor(bootstrap.messageColorRed)
                .setAuthor("Incorrect Input")
                .setDescription("Please type !acceptmatch <Match ID>\n\
        Check !help acceptmatch for more information");
            generalChannel.send(invalidInputEmbed)
        }

    },
    async getDisputed(receivedMessage){
        let generalChannel = bootstrap.MessageHelper.getChannelID(receivedMessage);
        let returnArr = await bootstrap.GameObj.getPending(receivedMessage.guild.id, "Disputed");
        if (returnArr === "No Pending"){
            const noPendingEmbed = new bootstrap.Discord.MessageEmbed()
                .setColor(bootstrap.messageColorBlue)
                .setAuthor("There are no disputed matches");
            generalChannel.send(noPendingEmbed)
        }
        else if(returnArr === "No Matches"){
            const noMatchesEmbed = new bootstrap.Discord.MessageEmbed()
                .setColor(bootstrap.messageColorRed)
                .setAuthor("No matches have been logged this season")
                .setDescription("Log matches with !log @loser1 @loser2 @loser3");
            generalChannel.send(noMatchesEmbed)
        }
        else{
            const overallEmbed = new bootstrap.Discord.MessageEmbed()
                .setColor(bootstrap.messageColorGreen)
                .setAuthor("Displaying Disputed Matches");
            generalChannel.send(overallEmbed);
            returnArr.forEach((pendingMatch)=>{
                const matchEmbed = new bootstrap.Discord.MessageEmbed()
                    .setColor(bootstrap.messageColorBlue)
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
                    );
                generalChannel.send(matchEmbed)
            })
        }
    },
    async getPending(receivedMessage){
        let generalChannel = bootstrap.MessageHelper.getChannelID(receivedMessage);
        let returnArr = await bootstrap.GameObj.getPending(receivedMessage.guild.id);
        if (returnArr === "No Pending"){
            const noPendingEmbed = new bootstrap.Discord.MessageEmbed()
                .setColor(bootstrap.messageColorBlue)
                .setAuthor("There are no pending matches");
            generalChannel.send(noPendingEmbed)
        }
        else if(returnArr === "No Matches"){
            const noMatchesEmbed = new bootstrap.Discord.MessageEmbed()
                .setColor(bootstrap.messageColorRed)
                .setAuthor("No matches have been logged this season")
                .setDescription("Log matches with !log @loser1 @loser2 @loser3");
            generalChannel.send(noMatchesEmbed)
        }
        else{
            const overallEmbed = new bootstrap.Discord.MessageEmbed()
                .setColor(bootstrap.messageColorGreen)
                .setAuthor("Displaying Pending Matches")
                .setFooter("'Player 1' is the logged winner of each pending match");
            generalChannel.send(overallEmbed);
            returnArr.forEach((pendingMatch)=>{
                const matchEmbed = new bootstrap.Discord.MessageEmbed()
                    .setColor(bootstrap.messageColorBlue)
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
                    );
                generalChannel.send(matchEmbed)
            })
        }
    },
    async configGet(receivedMessage){
        let generalChannel = bootstrap.MessageHelper.getChannelID(receivedMessage);
        let returnArr = await bootstrap.LeagueObj.configGet(receivedMessage.guild.id);
        if (returnArr !== "No configs"){
            let adminPrivs = returnArr._admin;
            if (returnArr._admin === ""){
                adminPrivs = "None"
            }
            const updatedEmbed = new bootstrap.Discord.MessageEmbed()
                .setColor(bootstrap.messageColorBlue)
                .setAuthor("Displaying information about your configurations")
                .addFields(
                    {name: "Player Threshold", value: returnArr._player_threshold},
                    {name: "Deck Threshold", value: returnArr._deck_threshold},
                    {name: "Timeout (in minutes)", value: returnArr._timeout},
                    {name: "Admin Privileges", value: adminPrivs}
                )
                .setFooter("Confused by what these thresholds mean? Use !help setconfig \n\Want to edit these values? Use !setconfig");
            generalChannel.send(updatedEmbed)
        }
        else{
            const noConfigEmbed = new bootstrap.Discord.MessageEmbed()
                .setColor(bootstrap.messageColorRed)
                .setAuthor("No current information about your configurations")
                .setDescription("Configurations are automatically generated when I join your server.");
            generalChannel.send(noConfigEmbed)
        }
    },
    async configSet(receivedMessage, args){
        let generalChannel = bootstrap.MessageHelper.getChannelID(receivedMessage);
        let returnArr = await bootstrap.LeagueObj.configSet(receivedMessage, args);
        if (returnArr === "Invalid Input"){
            const errorEmbed = new bootstrap.Discord.MessageEmbed()
                .setColor(bootstrap.messageColorRed)
                .setAuthor("Incorrect Input")
                .setDescription("Please retry entering your config. I understand the format: \n\
        !setconfig <Type> | <Value>\n\
        The types of configurations are:\n\
        'Player Threshold (A **number**)', \n\
        'Deck Threshold (A **number**)', \n\
        'Timeout (**Minutes**, less than 60)' \n\
        'Admin' (A list of **Discord Roles** seperated by commas)\n\n\
        **Confused on what these mean? Try !help setconfig**")
                .setFooter("A default set of configuration values are set for every server. Update these configs to fine tune your experience");
            generalChannel.send(errorEmbed)
        }
        else if (returnArr === "Error"){
            const errorEmbed = new bootstrap.Discord.MessageEmbed()
                .setColor(bootstrap.messageColorRed)
                .setAuthor("Error")
                .setDescription("An Error has occurred, please try again");
            generalChannel.send(errorEmbed)
        }
        else if (returnArr[0] === "Updated"){
            let commandType = returnArr[1];
            commandType = bootstrap.DeckHelper.toUpper(commandType);
            const updatedEmbed = new bootstrap.Discord.MessageEmbed()
                .setColor(bootstrap.messageColorGreen)
                .setAuthor("Succesfully updated your configs")
                .setDescription("You have updated the configuration:\n\
         **" + commandType + "** to **" + returnArr[2] + "**");
            generalChannel.send(updatedEmbed)
        }
        else if (returnArr[0] === "New Save"){
            let commandType = returnArr[1];
            commandType = bootstrap.DeckHelper.toUpper(commandType);
            const updatedEmbed = new bootstrap.Discord.MessageEmbed()
                .setColor(bootstrap.messageColorGreen)
                .setAuthor("Created a new set of configs for this server")
                .setDescription("You have set the configuration:\n\
         **" + commandType + "** to **" + returnArr[2] + "**\n\
         Your other configurations have been given default values. Type !getconfig to see your changes");
            generalChannel.send(updatedEmbed)
        }
    },
    async setSeasonName(receivedMessage, args){
        let generalChannel = bootstrap.MessageHelper.getChannelID(receivedMessage);
        if (args[0] === undefined){
            const errorEmbed = new bootstrap.Discord.MessageEmbed()
                .setColor(bootstrap.messageColorRed)
                .setAuthor("Please enter a new name")
                .setDescription("Example: !setnewseason <My New Season Name>")
                .setFooter("I will listen for case sensitivity");
            generalChannel.send(errorEmbed)
        }
        else{
            let returnArr = await bootstrap.SeasonObj.setSeasonName(receivedMessage, args);
            if (returnArr === "Name in use"){
                const errorUserEmbed = new bootstrap.Discord.MessageEmbed()
                    .setColor(bootstrap.messageColorRed)
                    .setDescription(args.join(' ')+" has already been used for a season or is currently being used for this season")
                    .setFooter("To see all season names try !seasoninfo all");
                generalChannel.send(errorUserEmbed)
            }
            else if (returnArr === "No Current"){
                const errorEmbed = new bootstrap.Discord.MessageEmbed()
                    .setColor(bootstrap.messageColorRed)
                    .setAuthor("There is no on-going Season")
                    .setDescription("Please start a new season using !startseason");
                generalChannel.send(errorEmbed)
            }
            else{
                const successEmbed = new bootstrap.Discord.MessageEmbed()
                    .setColor(bootstrap.messageColorGreen)
                    .setAuthor("Successfully updated season name!")
                    .setDescription("Updated current season from: **" + returnArr[1] +"** to: **"+returnArr[2]+"**");
                generalChannel.send(successEmbed)
            }
        }
    },
    async setEndSeason(receivedMessage, args){
        let generalChannel = bootstrap.MessageHelper.getChannelID(receivedMessage);
        if (args.length === 0){
            const errorEmbed = new bootstrap.Discord.MessageEmbed()
                .setColor(bootstrap.messageColorRed)
                .setAuthor("Please enter an end date")
                .setDescription("Please type in the format: MM/DD/YYYY\n\
        Type !help setendseason for more information");
            generalChannel.send(errorEmbed);
            return
        }
        if (args[0].length > 10){
            const errorEmbed = new bootstrap.Discord.MessageEmbed()
                .setColor(bootstrap.messageColorRed)
                .setAuthor("You have entered a non-valid date")
                .setDescription("Please type in the format: \nMM/DD/YYYY");
            generalChannel.send(errorEmbed);
            return
        }

        if (args[0].length === 10 && args.length === 1){
            let date = new Date(args);
            const currentDate = new Date();
            if (date instanceof Date && !isNaN(date.valueOf())) {
                if ((currentDate >= date)){
                    const errorEmbed = new bootstrap.Discord.MessageEmbed()
                        .setColor(bootstrap.messageColorRed)
                        .setAuthor("You have entered a date from the past")
                        .setDescription("You have used a date from the past, please set the end of the season to a date in the future\n\
                Type in the format: \nMM/DD/YYYY");
                    generalChannel.send(errorEmbed);
                    return
                }
                let returnArr = await bootstrap.SeasonObj.setEndDate(receivedMessage, date);
                if (returnArr[0] === "Success"){
                    date = date.toLocaleString("en-US", {timeZone: "America/New_York"});
                    const successEmbed = new bootstrap.Discord.MessageEmbed()
                        .setColor(bootstrap.messageColorGreen)
                        .setAuthor("You have successfully set the end date for the current Season named: " + returnArr[1])
                        .setTitle("End time has been set to: " + date);
                    generalChannel.send(successEmbed)
                }
            }
        }
        else{
            const errorEmbed = new bootstrap.Discord.MessageEmbed()
                .setColor(bootstrap.messageColorRed)
                .setAuthor("You have entered a non-valid date")
                .setDescription("Please type in the format: \nMM/DD/YYYY");
            generalChannel.send(errorEmbed)
        }
    },
    async seasonInfo(receivedMessage, args){
        let generalChannel = bootstrap.MessageHelper.getChannelID(receivedMessage);
        if (args[0] === undefined){
            let returnArr = await bootstrap.SeasonObj.getInfo(receivedMessage, "Current");
            if (returnArr[0] === "No Current"){
                const noSeasonEmbed = new bootstrap.Discord.MessageEmbed()
                    .setColor(bootstrap.messageColorRed)
                    .setAuthor("There is no on-going season")
                    .setDescription("To start a new season, try !startseason\nTo see information about another season, try !seasoninfo <Season Name>");
                generalChannel.send(noSeasonEmbed)
            }
            else{
                const seasonInfo = new bootstrap.Discord.MessageEmbed()
                    .setColor(bootstrap.messageColorGreen)
                    .setAuthor("Displaying Season Info about the Season named: " + returnArr[0]._season_name)
                    .addFields(
                        {name: "Season Start", value: returnArr[0]._season_start, inline: true},
                        {name: "Season End", value: returnArr[0]._season_end, inline: true},
                        {name: "Total Matches Played", value: returnArr[2], inline: true},
                    );
                generalChannel.send(seasonInfo)
            }
        }
        else if (args[0] === "all"){
            let returnArr = await bootstrap.SeasonObj.getInfo(receivedMessage, "all");
            if (returnArr[0] !== ""){
                returnArr[0].forEach((season)=>{
                    const seasonInfo = new bootstrap.Discord.MessageEmbed()
                        .setColor(bootstrap.messageColorGreen)
                        .setAuthor("Displaying Season Info about the Season named: " + season._season_name)
                        .addFields(
                            {name: "Season Start", value: season._season_start, inline: true},
                            {name: "Season End", value: season._season_end, inline: true},
                        );
                    generalChannel.send(seasonInfo)
                })
            }
            else{
                const noSeasonEmbed = new bootstrap.Discord.MessageEmbed()
                    .setColor(bootstrap.messageColorRed)
                    .setAuthor("There have been no Seasons on this server")
                    .setDescription("To start a new season, try !startseason");
                generalChannel.send(noSeasonEmbed)
            }
        }
        else{
            let returnArr = await bootstrap.SeasonObj.getInfo(receivedMessage, args.join(' '));
            if (returnArr === "Can't Find Season"){
                const cantFindEmbed = new bootstrap.Discord.MessageEmbed()
                    .setColor(bootstrap.messageColorRed)
                    .setAuthor("Cannot Find Specified Season: " + args.join(' ').toString())
                    .setDescription("To find a season, try !seasoninfo <Season Name>.\nTo find information on all seasons, try !seasoninfo all");
                generalChannel.send(cantFindEmbed)
            }
            else{
                const seasonInfo = new bootstrap.Discord.MessageEmbed()
                    .setColor(bootstrap.messageColorGreen)
                    .setAuthor("Displaying Season Info about the Season named: " + returnArr[0][0]._season_name)
                    .addFields(
                        {name: "Season Start", value: returnArr[0][0]._season_start, inline: true},
                        {name: "Season End", value: returnArr[0][0]._season_end, inline: true},
                        {name: "Total Matches Played", value: returnArr[2], inline: true},
                    );
                generalChannel.send(seasonInfo)
            }
        }
    },
    async endSeason(receivedMessage){
        let generalChannel = bootstrap.MessageHelper.getChannelID(receivedMessage);
        let currentSeason = await bootstrap.SeasonHelper.getCurrentSeason(receivedMessage.guild.id);
        const confirmEndSeason = new bootstrap.Discord.MessageEmbed();
        if (currentSeason === "No Current"){
            confirmEndSeason
                .setColor(bootstrap.messageColorRed)
                .setAuthor("There is no on-going season")
                .setDescription("To start a new season, try !startseason");
            generalChannel.send(confirmEndSeason)
        }
        else{
            let returnArr = await bootstrap.GameObj.getPending(receivedMessage.guild.id);
            let leftPending;
            confirmEndSeason
                .setColor(bootstrap.messageColorBlue)
                .setAuthor("WARNING: You are attempting to end the current season named: " + currentSeason._season_name)
                .setTitle("Are you sure you want to end the current season?")
                .setDescription("<@!" + receivedMessage.author.id+">"+" When a season ends: leaderboards are reset, player's personal ratings are reset and rewards are distributed\n\
        Use !pending to see pending matches")
                .setFooter("React thumbs up to end the current season, react thumbs down to cancel");
            if (returnArr.length > 0){
                if (returnArr === "No Pending"){
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
                .then(function (message){
                    message.react("👍");
                    message.react("👎");
                })
        }

    },
    async startSeason(receivedMessage){
        let generalChannel = bootstrap.MessageHelper.getChannelID(receivedMessage);
        let returnArr = await bootstrap.SeasonObj.startSeason(receivedMessage);

        if (returnArr[0] === "Season Ongoing"){
            const ongoingEmbed = new bootstrap.Discord.MessageEmbed()
                .setColor(bootstrap.messageColorBlue)
                .setTitle("There is already an on-going Season")
                .addFields(
                    {name: "Start Date", value: returnArr[1], inline: true}
                );
            if (returnArr[2] === "Not Specified"){
                ongoingEmbed
                    .addFields(
                    {name: "End Date", value: "No end date set", inline: true}
                    )
                    .setFooter("Looks like you don't have a set end date. \nEnd the season at any time with !endseason or set an end date in advanced with !setendseason");
            }
            else{
                ongoingEmbed
                    .addFields(
                    {name: "End Date", value: returnArr[2], inline: true}
                    );
            }
            ongoingEmbed
                .addFields(
                    {name: "Season Name", value: returnArr[3], inline: true},
                    {name: "Current Date", value: returnArr[4], inline: true}
                )
                .setFooter("Current date is converted to CST/UTC-6");
            generalChannel.send(ongoingEmbed)
        }
        else if (returnArr[0] === "Successfully Saved"){
            const startSeason = new bootstrap.Discord.MessageEmbed()
                .setColor(bootstrap.messageColorGreen)
                .setTitle("Successfully started a new Season")
                .setDescription("By default, seasons are given a name and no end date.\nTo change this, use commands:\n!setseasonname - sets the current season name\n!setenddate - sets a pre-determined end date for the season\n!endseason - ends the current season")
                .setFooter("End the season at any time with !endseason or set an end date in advanced with !setendseason")
                .addFields(
                    {name: "Start Date", value: returnArr[1], inline: true},
                    {name: "End Date", value: "No end date set", inline: true},
                    {name: "Season Name", value: returnArr[3], inline: true}
                );
            generalChannel.send(startSeason)
        }
    },
    async top(receivedMessage, args){
        let generalChannel = bootstrap.MessageHelper.getChannelID(receivedMessage);
        let returnArr = await bootstrap.SeasonObj.leaderBoard(receivedMessage);
        let mentionValues = [];
        let lookUpUsers;
        if (args.length === 0){
            returnArr.forEach(user =>{
                mentionValues.push([user._mentionValue, receivedMessage.guild.id])
            })
        }
        else{
            returnArr.forEach(user =>{
                mentionValues.push([user._mentionValue, receivedMessage.guild.id, args.join(' ')])
            })
        }

        lookUpUsers = await mentionValues.map(bootstrap.SeasonHelper.lookUpUsers);

        let unsortedResults = [];
        const resultsMsg = new bootstrap.Discord.MessageEmbed();
        Promise.all(lookUpUsers).then(results => {
            for (let i = 0; i < results.length; i++){
                if (results[i] !== "Can't find deck"){
                    let calculatedWinrate = Math.round(results[i][0][1]/(results[i][0][1]+results[i][0][2])*100);
                    let elo = (30*(results[i][0][1])) - (10*(results[i][0][2])) + 1000;
                    let username = results[i][0][0];
                    let gamesPlayed = (results[i][0][1] + results[i][0][2]);
                    unsortedResults.push([username,calculatedWinrate,elo, gamesPlayed]);
                }
            }
        }).then(async function(){

            unsortedResults.sort(function(a, b) {
                return parseFloat(b[2]) - parseFloat(a[2]);
            });

            let getDeckThreshold = await bootstrap.ConfigHelper.getDeckThreshold(receivedMessage.guild.id);
            let sortedResults = unsortedResults;
            let threshold = 5;
            let topPlayersThreshold = 10;
            let listOfPlayers = "";
            let listOfWinrates = "";
            let listOfScores = "";
            let maxEmbedSize = 975;
            let playersOnList = 0;
            if (getDeckThreshold !== "No configs"){ threshold = getDeckThreshold._player_threshold }

            resultsMsg
                .setColor(bootstrap.messageColorBlue)
                .setAuthor("Displaying Top Players for the season name: " + args.join(' '));
            for (let i = 0; i < sortedResults.length; i++){
                if (playersOnList >= topPlayersThreshold){break}
                if (sortedResults[i][3] < threshold){continue}
                if ((listOfPlayers + listOfWinrates + listOfScores).length > maxEmbedSize) {
                    break;
                }else{
                    listOfPlayers += "<@"+sortedResults[i][0]+">" + "\n" ;
                    listOfWinrates += sortedResults[i][1] + "% \n";
                    listOfScores += sortedResults[i][2] + "\n";
                    playersOnList += 1;
                }
            }
            if (!(listOfWinrates === "" || listOfPlayers === "" || listOfScores === "")){
                resultsMsg.addFields(
                    {name: "Username", value: listOfPlayers, inline: true},
                    {name: "Winrate", value: listOfWinrates, inline: true},
                    {name: "Score", value: listOfScores, inline: true},
                );
            }
            resultsMsg.setFooter("Note: The threshold to appear on this list is " + threshold.toString() + " game(s)\n" +
                "This list displays the top " +topPlayersThreshold.toString() +" players \nAdmins can configure both of these using !setconfig");
            if (args.length === 0){
                resultsMsg
                    .setAuthor("Displaying Top Players of the current season")
            }
            if (resultsMsg.fields.length === 0){
                resultsMsg
                    .setDescription("Seasons are case sensitive! Make sure you are spelling the season name correctly. See a list of all seasons with !seasoninfo all")
                    .setAuthor("No Top Players yet for the specified season")
            }
            generalChannel.send(resultsMsg)
        })


    },
    async deckinfo(receivedMessage, args, rawArgs){
        let generalChannel = bootstrap.MessageHelper.getChannelID(receivedMessage);
        let returnArr = await bootstrap.DeckObj.deckInfo(receivedMessage, args);
        if (args.length === 0){
            const errorEmbed = new bootstrap.Discord.MessageEmbed()
                .setColor(bootstrap.messageColorRed)
                .setDescription("Please enter the name of a deck, type !deckinfo <Deck Name>.\nUse !decks to find a list of decks");
            generalChannel.send(errorEmbed);
            return
        }
        if (returnArr === "Error 1"){
            const errorEmbed = new bootstrap.Discord.MessageEmbed()
                .setColor(bootstrap.messageColorRed)
                .setDescription("Error finding the deck **" + args.join(' ') + "** \nUse !decks to find a list of decks");
            generalChannel.send(errorEmbed);
        }
        else{
            if (returnArr[0] === "First"){
                let fixedColors = returnArr[1]._colors.replace(/,/g, ' ');
                if ((returnArr[1]._link === "No Link Provided")||(returnArr[1]._link === "")){
                    returnArr[1]._link = " "
                }
                if ((returnArr[1]._discordLink === "")){
                    returnArr[1]._discordLink = "No Link Provided"
                }
                const resultEmbed = new bootstrap.Discord.MessageEmbed()
                    .setColor(bootstrap.messageColorGreen)
                    .setDescription("Deck Information about **"+ returnArr[1]._name + "**")
                    .setTitle("Deck Link")
                    .setURL(returnArr[1]._link)
                    .addFields(
                        { name: 'Commander', value: returnArr[1]._commander},
                        { name: 'Color', value: fixedColors},
                        { name: 'Authors', value: returnArr[1]._author},
                        { name: 'Description', value: returnArr[1]._description},
                        { name: 'Discord Link', value: returnArr[1]._discordLink},
                        { name: 'Deck Type', value: returnArr[1]._deckType},
                        { name: 'Has Primer?', value: bootstrap.DeckHelper.toUpper(returnArr[1]._hasPrimer.toString())},
                    );

                generalChannel.send(resultEmbed)
            }
            else{
                if (returnArr[1].length === 0){
                    const noRes = new bootstrap.Discord.MessageEmbed()
                        .setColor(bootstrap.messageColorRed)
                        .setDescription("You typed: '" + rawArgs.join(' ') + "' I didn't find any results for that query. Try changing your wording and searching again");
                    generalChannel.send(noRes);
                    return
                }
                const closeToResEmbed = new bootstrap.Discord.MessageEmbed()
                    .setColor(bootstrap.messageColorBlue)
                    .setDescription("You typed: '" + rawArgs.join(' ') + "' I didn't quite understand that. Did you mean to type any of the following?\
                The !deckinfo command searches by deck name. Type !help deckinfo for more information")
                    .setFooter("Decks are displayed in the format: \nDeck Name\nCommander(s) Name(s)");
                for (let key in returnArr[1]) {
                    closeToResEmbed
                        .addFields(
                            {name: returnArr[1][key]._name, value: returnArr[1][key]._commander}
                        )
                }
                generalChannel.send(closeToResEmbed)
            }
        }
    },
    /**
     * nonAdminAccess()
     * @param {*} receivedMessage
     * @param {*} command attempted to use.
     *
     * Prints generic message to user that they do not have admin rights to use the command they issued.
     */
    nonAdminAccess(receivedMessage, command){
        let generalChannel = bootstrap.MessageHelper.getChannelID(receivedMessage);
        const adminAccessNotGrantedEmbed = new bootstrap.Discord.MessageEmbed()
            .setColor(bootstrap.messageColorRed)
            .setDescription("It looks like you're trying to access the **" + command + "** command.\n\
            This is an **Admin Only** command.\n\
            If you would like to access this command, you need to add a **role** using !setconfig.");
        generalChannel.send(adminAccessNotGrantedEmbed)
    },
    async updateDeck(receivedMessage, args){
        let generalChannel = bootstrap.MessageHelper.getChannelID(receivedMessage);
        const updateDeckEmbed = new bootstrap.Discord.MessageEmbed();
        let promiseReturn = await bootstrap.DeckHelper.findDeckToUpdate(receivedMessage, args);
        if (promiseReturn === "Error 1"){
            updateDeckEmbed
                .setColor(bootstrap.messageColorRed) //red
                .setDescription("Error deck not found. Try !help, !decks or use the format !removedeck <deckname>");
            generalChannel.send(updateDeckEmbed)
        }
        else{
            if (promiseReturn[0]._link === "No Link Provided"){
                promiseReturn[0]._link = " "
            }
            updateDeckEmbed
                .setColor(bootstrap.messageColorBlue)
                .setAuthor("You are attempting to update the deck: "+ promiseReturn[0]._name)
                .setTitle('Deck Link')
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
                .setFooter("You cannot update the Deck Name due to analytics.");
            generalChannel.send(updateDeckEmbed)
                .then(function (message){
                    message.react("1️⃣");//commander
                    message.react("2️⃣");//colors
                    message.react("3️⃣");//decklink
                    message.react("4️⃣");//author
                    message.react("5️⃣");//deck description
                    message.react("6️⃣");//deck type
                    message.react("7️⃣");//primer
                    message.react("8️⃣");//discord
                    message.react("👎");
                })
        }
    },
    async removeDeck(receivedMessage, args){
        let generalChannel = bootstrap.MessageHelper.getChannelID(receivedMessage);
        const addingDeckEmbed = new bootstrap.Discord.MessageEmbed();
        let promiseReturn = await bootstrap.DeckHelper.findDeckToRemove(receivedMessage, args);
        if (promiseReturn === "Error 1"){
            addingDeckEmbed
                .setColor(bootstrap.messageColorRed) //red
                .setDescription("Error deck not found\n\
        Please use the format !removedeck <Deck Name>\n\
        For more information, check !help removedeck");
            generalChannel.send(addingDeckEmbed)
        }
        else{
            if (promiseReturn[0]._link === "No Link Provided"){
                promiseReturn[0]._link = " "
            }
            addingDeckEmbed
                .setColor(bootstrap.messageColorBlue)
                .setAuthor("WARNING")
                .setTitle('Deck ID: ' + promiseReturn[0]._id)
                .setURL(promiseReturn[0]._link)
                .setDescription("<@!" + receivedMessage.author.id+">"+ " Are you sure you want to delete: **" + promiseReturn[0]._name + "** from your server's list of decks?")
            generalChannel.send(addingDeckEmbed)
                .then(function (message){
                    message.react("👍");
                    message.react("👎");
                })
        }
    },
    async deckStats(receivedMessage, args){
        let generalChannel = bootstrap.MessageHelper.getChannelID(receivedMessage);
        const deckStatsEmbed = new bootstrap.Discord.MessageEmbed();
        const usersList = new bootstrap.Discord.MessageEmbed();

        let getDeckThreshold = await bootstrap.ConfigHelper.getDeckThreshold(receivedMessage.guild.id);
        let threshold = 5;
        if (getDeckThreshold !== "No configs"){ threshold = getDeckThreshold._deck_threshold }

        let returnArr = await bootstrap.DeckObj.deckStats(receivedMessage, args);
        if (returnArr[0] === "Deck Lookup"){
            let deckName = returnArr[1].split(" | ");
            let seasonName;
            if (deckName[1]=== undefined){
                seasonName = returnArr[2]
            }else{ seasonName = deckName[1]}
            deckStatsEmbed
                .setColor(bootstrap.messageColorBlue)
                .setAuthor(bootstrap.DeckHelper.toUpper(deckName[0]) + " Deckstats")
                .setTitle("For Season Name: " + seasonName)
                .addFields(
                    { name: 'Wins', value: returnArr[3], inline: true},
                    { name: 'Losses', value: returnArr[4], inline: true},
                    { name: 'Number of Matches', value: returnArr[6].length, inline: true},
                    { name: 'Winrate', value: Math.round((returnArr[3]/(returnArr[3]+returnArr[4]))*100) + "%"},
                );
            if (seasonName === "all"){
                deckStatsEmbed
                    .setTitle("Across all seasons")
            }
            usersList
                .setColor(bootstrap.messageColorBlue)
                .setTitle("People who've played this deck in the time frame provided.");
            for (i = 0; i < returnArr[5].length; i++){
                usersList.addFields(
                    {name: " \u200b", value: "<@!"+returnArr[5][i]+">", inline: true}
                )
            }
            generalChannel.send(deckStatsEmbed);
            generalChannel.send(usersList)
        }
        else if (returnArr[0] === "User Lookup"){
            deckStatsEmbed
                .setColor(bootstrap.messageColorBlue)
                .setTitle("Deck Stats")
                .setDescription("For user: "+ "<@!"+returnArr[1]+">"+ "\n\
        For Season Name: " + returnArr[4] + "\n\
        Looking for more info? Add ' | <Season Name> ' or ' | all ' to your query to find more information")
                .setFooter("Looking for detailed deck breakdown? Try !profile @user to see exactly what decks this user plays.")
                .addFields(
                    { name: 'Wins', value: returnArr[2], inline: true},
                    { name: 'Losses', value: returnArr[3], inline: true},
                    { name: 'Number of Matches', value: returnArr[2] + returnArr[3], inline: true},
                    { name: 'Winrate', value: Math.round((returnArr[2]/(returnArr[2]+returnArr[3]))*100) + "%"},
                );
            if (returnArr[4] === "all"){
                deckStatsEmbed.setDescription("For user: "+ "<@!"+returnArr[1]+">"+ ". Across all seasons")
            }
            generalChannel.send(deckStatsEmbed)
        }
        else if (returnArr[0] === "Raw Deck Lookup"){
            const allDecksEmbed = new bootstrap.Discord.MessageEmbed()
                .setColor(bootstrap.messageColorBlue)
                .setTitle("Deck Stats")
                .setDescription("Data for the season named: " + returnArr[2]);
            if (returnArr[2] === "all"){
                allDecksEmbed
                    .setDescription("Data across all seasons")
            }
            let listOfDeckNames = "";
            let listOfGamesPlayed = "";
            let listOfPercentages = "";
            let sortedArray = returnArr[1].sort(function(a, b) {
                return parseFloat(b[1]+b[2]) - parseFloat(a[1]+a[2]);
            });
            for (let i = 0; i < sortedArray.length; i++){
                if (sortedArray[i][1] + sortedArray[i][2] < threshold){break}
                if ((listOfDeckNames + listOfGamesPlayed + listOfPercentages).length > 975) {
                    break;
                }else{
                    listOfDeckNames += sortedArray[i][0] + "\n" ;
                    listOfGamesPlayed += Math.round(sortedArray[i][1]+sortedArray[i][2]) + "\n";
                    listOfPercentages += Math.round((sortedArray[i][1]/(sortedArray[i][1]+sortedArray[i][2]))*100) + "% \n";
                }
            }
            allDecksEmbed.addFields(
                {name: "Deck Name", value: listOfDeckNames, inline: true},
                {name: "Games Played", value: listOfGamesPlayed, inline: true},
                {name: "Winrate", value: listOfPercentages, inline: true},

            );
            allDecksEmbed
                .setFooter("Note: The threshold to appear on this list is " + threshold.toString() + " game(s)\nAdmins can configure this using !setconfig\nLooking for detailed deck breakdown? Try !deckinfo <deckname> to see more about specific decks");

            generalChannel.send(allDecksEmbed)
        }
        else if (returnArr === "Bad season deckstats input"){
            const errorMsg = new bootstrap.Discord.MessageEmbed()
                .setColor(bootstrap.messageColorRed)
                .setAuthor("Improper Input")
                .setDescription("It looks like you're trying to search for deckstats by season.\n\
        Proper format: !deckstats | <Season Name>");
            generalChannel.send(errorMsg)
        }
        else if (returnArr === "Can't find deck"){
            deckStatsEmbed
                .setColor(bootstrap.messageColorRed) //red
                .setDescription("No games have been logged with that name in that season. \n\
         Try !decks to find a list of decks for this server \n\
         Example Commands involving deckstats: \n\
         !deckstats <deckname> to find information about a deck across all seasons.\n\
         !deckstats <deckname> | <seasonname> to find information about a deck in a specific season.\n\
         !deckstats @user to find information about a user's deckstats.");
            generalChannel.send(deckStatsEmbed)
        }
        else{
            const closeToResEmbed = new bootstrap.Discord.MessageEmbed()
                .setColor(bootstrap.messageColorBlue)
                .setAuthor("The deck: " + args.join(' ') + " has no logged matches this Season.")
                .setDescription("You typed: '" + args.join(' ') + "' I didn't quite understand the deck you inputted. Did you mean to type any of the following?\n\
            The !deckstats command will give suggestions when it doesn't understand exactly what you typed")
                .setFooter("Decks are displayed in the format: \nDeck Name\nCommander(s) Name(s)");
            for (let key in returnArr) {
                closeToResEmbed
                    .addFields(
                        {name: returnArr[key]._name, value: returnArr[key]._commander}
                    )
            }
            generalChannel.send(closeToResEmbed)
        }
    },
    async use(receivedMessage, args, rawArgs){
        let generalChannel = bootstrap.MessageHelper.getChannelID(receivedMessage);
        if (args.length === 0){
            const noLengthEmbed = new bootstrap.Discord.MessageEmbed()
                .setColor(bootstrap.messageColorRed)
                .setDescription("You have entered no arguments to this command. Please type !use <Deck Name> to set your deck\n\
        Type !help use for more information");
            generalChannel.send(noLengthEmbed)
        }
        else{
            let returnArr = await bootstrap.UserObj.useDeck(receivedMessage, args);
            if (returnArr === "Success"){
                const successEmbed = new bootstrap.Discord.MessageEmbed()
                    .setColor(bootstrap.messageColorGreen)
                    .setAuthor("Success")
                    .setDescription("Successfully set <@!" + receivedMessage.author.id + ">'s deck to: " + bootstrap.DeckHelper.toUpper(args.join(' ')))
                    .setFooter("You’ve now set your deck for this server\nStart logging games with the !log command\nType !help log for more information");
                generalChannel.send(successEmbed)
            }
            else if (returnArr === "Not a registered deck"){
                const notRegisteredEmbed = new bootstrap.Discord.MessageEmbed()
                    .setColor(bootstrap.messageColorRed)
                    .setAuthor("No suggestions on your input could be made. Please try again")
                    .setDescription("Type !decks to see a list of available decks");
                generalChannel.send(notRegisteredEmbed)
            }
            else if (returnArr === "Can't find user"){
                const noUserEmbed = new bootstrap.Discord.MessageEmbed()
                    .setColor(bootstrap.messageColorRed)
                    .setAuthor("You are not registered")
                    .setDescription("Make sure to type !register before trying to use a deck");
                generalChannel.send(noUserEmbed)
            }
            else if (returnArr === "Too many args"){
                const badInputEmbed = new bootstrap.Discord.MessageEmbed()
                    .setColor(bootstrap.messageColorRed)
                    .setAuthor("Improper input")
                    .setDescription("Type !use <Deck Name> or !use <Deck Name> | Rogue")
                    .setFooter("Type !help or !decks to learn more about 'Rogue'");
                generalChannel.send(badInputEmbed)
            }
            else{
                const closeToResEmbed = new bootstrap.Discord.MessageEmbed()
                    .setColor(bootstrap.messageColorBlue)
                    .setDescription("You typed: '" + rawArgs.join(' ') + "' I didn't quite understand that. Did you mean to type any of the following?\
                The !use command will give suggestions when it doesn't understand exactly what you typed")
                    .setFooter("Decks are displayed in the format: \nDeck Name\nCommander(s) Name(s)");
                for (let key in returnArr) {
                    closeToResEmbed
                        .addFields(
                            {name: returnArr[key]._name, value: returnArr[key]._commander}
                        )
                }
                generalChannel.send(closeToResEmbed)
            }
        }
    },
    /**
     * recent()
     * @param {object} receivedMessage - Discord Message Obj
     * @param {array} args | array of other input after command
     *
     *  Allows the user to view recent matches. type "server" instead of an @ to see server recent matches. Add "more" on the end of input to add more results
     */
    async recent(receivedMessage, args) {
        let generalChannel = bootstrap.MessageHelper.getChannelID(receivedMessage);
        let more = false;
        let matches_arr;

        if (args.length === 0) {
            matches_arr = await bootstrap.UserObj.recent(receivedMessage)
        }
        else if (args.length === 1) {
            if (args[0].toLowerCase() === "more") {
                more = true;
                matches_arr = await bootstrap.UserObj.recent(receivedMessage)
            }
            else if ((args[0].charAt(0) !== "<" || args[0].charAt(1) !== "@" || args[0].charAt(2) !== "!") && args[0].toLowerCase() !== "server") {
                const errorEmbed = new bootstrap.Discord.MessageEmbed()
                    .setColor(bootstrap.messageColorRed)
                    .setAuthor("Improper Input")
                    .setTitle("You're attempting to check a recent match log")
                    .setDescription("Type !recent **@user** when searching other users recent matches or 'server' to see server matches\n\
                    Type \"more\" after the command to load more results\n\n\
                    It looks like you're having trouble with !recent @user. Make sure to mention the user and type nothing after \n\n\
                    Check !help recent for more information on proper usage");
                generalChannel.send(errorEmbed);
                return
            }
            else if (args[0].toLowerCase() === "server") {
                matches_arr = await bootstrap.UserObj.recent(receivedMessage, null, true)
            }
            else {
                matches_arr = await bootstrap.UserObj.recent(receivedMessage, args[0])
            }
        }
        else if (args.length === 2) {
            if ((args[0].charAt(0) !== "<" || args[0].charAt(1) !== "@") && args[0].toLowerCase() !== "server" || args[1].toLowerCase() !== "more") {
                const errorEmbed = new bootstrap.Discord.MessageEmbed()
                    .setColor(bootstrap.messageColorRed)
                    .setAuthor("Improper Input")
                    .setTitle("You're attempting to check a recent match log")
                    .setDescription("Type !recent **@user** when searching other users recent matches or 'server' to see server matches\n\
                Type \"more\" after the command to load more results\n\n\
                It looks lke you're having trouble with !recent @user more or !recent @user server. Make sure to mention the user and only write 'server' or 'more' after\n\n\
                Check !help recent for more information on proper usage");
                generalChannel.send(errorEmbed);
                return
            }
            else if (args[0].toLowerCase() === "server") {
                more = true;
                matches_arr = await bootstrap.UserObj.recent(receivedMessage, null, true)
            }
            else {
                more = true;
                matches_arr = await bootstrap.UserObj.recent(receivedMessage, args[0])
            }
        }
        else {
            const errorEmbed = new bootstrap.Discord.MessageEmbed()
                .setColor(bootstrap.messageColorRed)
                .setAuthor("Improper Input")
                .setTitle("You're attempting to check a recent match log")
                .setDescription("Type !recent **@user** when searching other users recent matches or 'server' to see server matches\n\
                    Type \"more\" after the command to load more results\n\
                    Check !help recent for more information on proper usage");
            generalChannel.send(errorEmbed);
            return
        }
        // Checking block over


        //Log only 5 most recent matches or if the user types "more"
        matches_arr = matches_arr.reverse();
        if (more) {
            matches_arr = matches_arr.slice(0,10)
        }
        else {
            matches_arr = matches_arr.slice(0,5)
        }

        // Make sure there are matches
        if (matches_arr.length === 0) {
            const errorEmbed = new bootstrap.Discord.MessageEmbed()
                .setColor(bootstrap.messageColorBlue)
                .setAuthor("No Matches Logged")
                .setTitle("The user you're attempting to mention has no matches logged");
            generalChannel.send(errorEmbed);
            return
        }

        // Grammar fixing
        let matchGrammar = "match";
        if (matches_arr.length > 1) {
            matchGrammar = "matches"
        }
        else {
            matchGrammar = "match"
        }

        const confirmEmbed = new bootstrap.Discord.MessageEmbed()
            .setColor(bootstrap.messageColorGreen)
            .setDescription("Showing " + matches_arr.length.toString() + " recent " + matchGrammar);
        generalChannel.send(confirmEmbed);

        //Main loop
        let tempEmbed;
        matches_arr.forEach(async(match) => {
            let convertedToCentralTime = match[0].toLocaleString("en-US", {timeZone: "America/Chicago"});

            //const bot = await getUserFromMention(Config.clientID)
            const winner = await bootstrap.LeagueHelper.getUserFromMention(match[4]);
            const loser1 = await bootstrap.LeagueHelper.getUserFromMention(match[5]);
            const loser2 = await bootstrap.LeagueHelper.getUserFromMention(match[6]);
            const loser3 = await bootstrap.LeagueHelper.getUserFromMention(match[7]);
            tempEmbed = new bootstrap.Discord.MessageEmbed()
                .setColor(bootstrap.messageColorBlue) //blue
                .setTitle('Game ID: ' + match[1])
                .setThumbnail(bootstrap.LeagueHelper.getUserAvatarUrl(winner))
                .addFields(
                    { name: 'Season: ', value: match[3], inline: true},
                    { name: 'Time (Converted to CST/CDT)', value:convertedToCentralTime, inline: true},
                    { name: 'Winner:', value: '**'+winner.username+'**' + ' piloting ' + '**'+match[8]+'**', inline: true},
                    { name: 'Opponents:', value:
                            '**'+loser1.username+'**'+ ' piloting ' + '**'+match[9]+'**' + '\n'
                            + '**'+loser2.username+'**'+ ' piloting ' + '**'+match[10]+'**' + '\n'
                            + '**'+loser3.username+'**'+ ' piloting ' + '**'+match[11]+'**' }
                );
            generalChannel.send(tempEmbed)
        })
    },
    async startMatch(receivedMessage, args){
        let currentSeason = await bootstrap.SeasonHelper.getCurrentSeason(receivedMessage.guild.id);
        let generalChannel = bootstrap.Client.channels.cache.get(receivedMessage.channel.id);
        let sanitizedString = receivedMessage.author.id;
        const UserIDs = [];

        //Generates random 4 char string for id
        let s4 = () => {
            return Math.floor((1 + Math.random()) * 0x1000).toString(16).substring(1);
        };
        let id = s4() + s4() + s4() + s4();

        // let checkMatchRet = await GameHelper.checkMatchID(receivedMessage.guild.id,"016a765d1455")


        // Check to make sure there is a season on-going
        if (currentSeason === "No Current"){
            const errorMsg = new bootstrap.Discord.MessageEmbed()
                .setColor(bootstrap.messageColorRed)
                .setAuthor("No On-Going Season")
                .setDescription("There is no on-going season. Please start a season before logging matches")
                .setFooter("Admins can use !startseason");
            generalChannel.send(errorMsg);
            return
        }
        // Check to make sure the right amount of users tagged
        if (args.length < 3 || args.length > 3) {
            const errorMsg = new bootstrap.Discord.MessageEmbed()
                .setColor(bootstrap.messageColorRed)
                .setAuthor("Improper input")
                .setDescription("Please submit only the **3 players** who lost in the pod")
                .setFooter("Example: !log @user @user @user \n" +
                    "Tip: Have one space between each @use tag");
            generalChannel.send(errorMsg);
            return
        }
        // Make sure every user in message (and message sender) are different users
        let tempArr = [];
        args.forEach((userMentionValue)=>{
            tempArr.push(userMentionValue)
        });
        let addedMentionValues = "<@!" + sanitizedString + ">";
        tempArr.push(addedMentionValues);
        if ((!bootstrap.Env.allowedLoggedDuplicates) && (await bootstrap.GameHelper.hasDuplicates(tempArr))) {
            const errorMsg = new bootstrap.Discord.MessageEmbed()
                .setColor(bootstrap.messageColorRed)
                .setAuthor("Improper input")
                .setDescription("You can't log a match with duplicate players");
            generalChannel.send(errorMsg);
            return
        }
        // Check if User who sent the message is registered
        let someNotRegistered = false;
        let mentionValues = [];
        let cleanedArg0 = args[0].replace(/[<@!>]/g, '');
        let cleanedArg1 = args[1].replace(/[<@!>]/g, '');
        let cleanedArg2 = args[2].replace(/[<@!>]/g, '');
        mentionValues.push([sanitizedString, receivedMessage],
            [cleanedArg0, receivedMessage],
            [cleanedArg1, receivedMessage],
            [cleanedArg2, receivedMessage]);
        let registerPromiseArray = mentionValues.map(bootstrap.GameHelper.checkRegister);

        Promise.all(registerPromiseArray).then(results => {
            for (let i = 0; i < results.length; i++){
                if (results[i] === 1){
                    const errorMsg = new bootstrap.Discord.MessageEmbed()
                        .setColor(bootstrap.messageColorRed)
                        .setAuthor("Unregistered User")
                        .setDescription("<@!"+mentionValues[i][0]+">" + " isn't registered, type !register")
                        .setFooter("Make sure to use the Discord Mention feature when using this command. Check !help log for more information");
                    generalChannel.send(errorMsg);
                    someNotRegistered = true
                }
            }
        }).then(()=>{
            if (someNotRegistered){return}
            let someDeckNotSet = false;
            let currDeckPromiseArray = mentionValues.map(bootstrap.GameHelper.checkDeck);
            Promise.all(currDeckPromiseArray).then(results => {
                for (var i = 0; i < results.length; i++){
                    if (results[i] === 1){
                        const someMsg = new bootstrap.Discord.MessageEmbed()
                            .setColor(bootstrap.messageColorRed)
                            .setAuthor("Deck not set")
                            .setDescription("<@"+mentionValues[i][0]+">" + " Looks like we don’t know what deck you’re using\n\
                    Please tell us what deck you’re using by typing: !use <Deck Name>\n\
                    To get a list of decks, type: !decks");
                        generalChannel.send(someMsg);
                        someDeckNotSet = true
                    }
                    if (results[i] === 2){
                        const someMsg = new bootstrap.Discord.MessageEmbed()
                            .setColor(bootstrap.messageColorRed)
                            .setAuthor("Deck now Invalid")
                            .setDescription("<@"+mentionValues[i][0]+">" + " Looks like you're using a deck that was deleted from the server\n\
                    Please set a new deck by typing: !use <Deck Name>\n\
                    To get a list of decks, type: !decks");
                        generalChannel.send(someMsg);
                        someDeckNotSet = true
                    }
                }
            }).then(()=>{
                if (someDeckNotSet){ }
                else{
                    UserIDs.push(sanitizedString);
                    // Check if Users tagged are registered
                    let ConfirmedUsers = 0;
                    args.forEach(loser =>{
                        loser = loser.replace(/[<@!>]/g, '');
                        UserIDs.push(loser);
                        ConfirmedUsers++;
                        if (ConfirmedUsers === 3){
                            // Double check UserID Array then create match and send messages
                            if (UserIDs.length !== 4){
                                const errorMsg = new bootstrap.Discord.MessageEmbed()
                                    .setColor('#af0000')
                                    .setDescription("**Error:** Code 300");
                                generalChannel.send(errorMsg);
                            }
                            else{
                                bootstrap.GameObj.createMatch(UserIDs[0], UserIDs[1], UserIDs[2], UserIDs[3], id, receivedMessage, function(cb){
                                    if (cb === "FAILURE"){
                                        const errorMsg = new bootstrap.Discord.MessageEmbed()
                                            .setColor('#af0000')
                                            .setDescription("**Error:** Code 301");
                                        generalChannel.send(errorMsg);
                                    }
                                    else {
                                        UserIDs.forEach(player => {
                                            let findQuery = {_mentionValue: player, _server: receivedMessage.guild.id};
                                            bootstrap.User.findOne(findQuery, function(err, res){
                                                const userUpvoteEmbed = new bootstrap.Discord.MessageEmbed()
                                                    .setAuthor("Game ID: " + id)
                                                    .setColor(bootstrap.messageColorBlue)
                                                    .setDescription("<@!" + res._mentionValue +">" + " used **" + res._currentDeck + "** \n **Upvote** to confirm \n **Downvote** to contest");
                                                generalChannel.send("<@!"+res._mentionValue+">", userUpvoteEmbed)
                                                    .then(function (message){
                                                        message.react("👍");
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
    },
    /**
     * listDecks()
     * @param {*} receivedMessage
     * @param {*} args
     * It will spit out either up to the 4th color or the 5th, lag for like 3-5 seconds then spit out the rest of the messages
     */
    async listDecks(receivedMessage, args){
        let generalChannel = bootstrap.MessageHelper.getChannelID(receivedMessage);
        if (args[0] !== undefined){
            let colorRes = await bootstrap.DeckHelper.checkColorDictionary(args[0]);
            if (colorRes !== "Not found"){
                let colorSpecificArray = [];
                let returnArr = await bootstrap.DeckObj.listDecks(receivedMessage, colorRes);
                returnArr.forEach(entry =>{
                    colorSpecificArray.push(entry._name)
                });
                receivedMessage.author.send(bootstrap.DeckHelper.createDeckEmbed(colorSpecificArray, bootstrap.DeckHelper.toUpper(args.toString()))).catch(() => receivedMessage.reply("I don't have permission to send you messages! Please change your settings under this server's *Privacy Settings* section"));
                const helperEmbed = new bootstrap.Discord.MessageEmbed()
                    .setColor(bootstrap.messageColorGreen)
                    .setTitle("I have Direct Messaged you decks! Don't see what you're looking for?")
                    .setDescription("Using 'Rogue' when logging matches will encompass decks not on this list. \
            Try '!use <deckname> | Rogue' to be able to use **any deck**.")
                    .setFooter("Looking for a specific color combination? Check !help decks to learn what I search by.");
                generalChannel.send(helperEmbed);
                return;
            }
            let commanderRes = await bootstrap.DeckHelper.commanderChecker(args.join(' '), receivedMessage);
            if (commanderRes !== "Not found"){
                if (commanderRes.length === 0){
                    const noResEmbed = new bootstrap.Discord.MessageEmbed()
                        .setColor(bootstrap.messageColorRed)
                        .setAuthor("No results found on this server")
                        .setDescription("We could not find any information on the key word(s): '" + args.join(' ') + "' for this server.\n\
                Please refine your search and try again.")
                        .setFooter("Searching for partners? Type either name or search for both by separating them with a '/'. Ex: !decks tymna / thrasios");
                    generalChannel.send(noResEmbed)
                }
                else{
                    const newEmbed = new bootstrap.Discord.MessageEmbed()
                        .setColor(bootstrap.messageColorBlue)
                        .setDescription("Displaying decks searching with the key word(s): '" + args.join(' ') + "'\n\
                Displaying: " + commanderRes.length + " results")
                        .setFooter("Decks are displayed in the format: \nDeck Name\nCommander(s) Name(s)");
                    for (let key in commanderRes) {
                        newEmbed
                            .addFields(
                                {name: commanderRes[key]._name, value: commanderRes[key]._commander}
                            )
                    }
                    generalChannel.send(newEmbed)
                }
                return;
            }
        }
        let returnArr = await bootstrap.DeckObj.listDecks(receivedMessage, "no");
        let oneColorArr = [];
        let twoColorArr = [];
        let threeColorArr = [];
        let fourColorArr = [];
        let fiveColorArr = [];

        returnArr.forEach(entry =>{
            let newStr = entry._colors.replace(/,/g, '');
            newStr = newStr.replace(/ /g, '');

            if (newStr.length === 1){
                oneColorArr.push(entry._name + " - " + entry._colors)
            }
            else if (newStr.length === 2){
                twoColorArr.push(entry._name + " - " + entry._colors)
            }
            else if (newStr.length === 3){
                threeColorArr.push(entry._name + " - " + entry._colors)
            }
            else if (newStr.length === 4){
                fourColorArr.push(entry._name + " - " + entry._colors)
            }
            else{
                fiveColorArr.push(entry._name + " - " + entry._colors)
            }
        });
        oneColorArr.sort();
        twoColorArr.sort();
        threeColorArr.sort();
        fourColorArr.sort();
        fiveColorArr.sort();
        receivedMessage.author.send(bootstrap.DeckHelper.createDeckEmbed(oneColorArr, "ONE COLOR")).then(msg => {
            receivedMessage.author.send(bootstrap.DeckHelper.createDeckEmbed(twoColorArr, "TWO COLOR"));
            receivedMessage.author.send(bootstrap.DeckHelper.createDeckEmbed(threeColorArr, "THREE COLOR"));
            receivedMessage.author.send(bootstrap.DeckHelper.createDeckEmbed(fourColorArr, "FOUR COLOR"));
            receivedMessage.author.send(bootstrap.DeckHelper.createDeckEmbed(fiveColorArr, "FIVE COLOR"));
            const helperEmbed = new bootstrap.Discord.MessageEmbed()
                .setColor(bootstrap.messageColorGreen)
                .setTitle("I have Direct Messaged you this server's Decks. Don't see what you're looking for?")
                .setDescription("Using 'Rogue' when logging matches will encompass decks not on this list. \
        Try '!use <deckname> | Rogue' to be able to use **any deck**.")
                .setFooter("Looking for a specific color combination? Check !help decks to learn what I search by.");
            generalChannel.send(helperEmbed)
        }).catch(() =>
            receivedMessage.reply("I don't have permission to send you messages! Please change your settings under this server's *Privacy Settings* section"))
    },
    /**
     * addDeck()
     * @param {*} receivedMessage
     * @param {*} args
     *
     * Calling method checks for admin privs before getting here.
     */
    async addDeck(receivedMessage, args){
        let generalChannel = bootstrap.MessageHelper.getChannelID(receivedMessage);
        let nicknameArr = args.slice(0,args.indexOf("|"));
        let deckNickname = "";
        nicknameArr.forEach((entry) =>{
            deckNickname = deckNickname + entry + " "
        });
        let argsWithCommas = args.toString();
        let argsWithSpaces = argsWithCommas.replace(/,/g, ' ');
        let splitArgs = argsWithSpaces.split(" | ");

        const errorEmbed = new bootstrap.Discord.MessageEmbed()
            .setColor(bootstrap.messageColorRed)
            .setTitle("Error Adding New Deck")
            .setFooter("If you don't have a Deck or Discord Link, type 'no link' in those slots");

        if (splitArgs.length === 9){
            let deckNick = deckNickname;
            let commanderName = splitArgs[1];
            let colorIdentity = splitArgs[2].toLowerCase();
            let deckLink = splitArgs[3];
            let author = splitArgs[4];
            let deckDescription = splitArgs[5];
            let deckType = splitArgs[6];
            let hasPrimer = splitArgs[7];
            let discordLink = splitArgs[8];
            commanderName = commanderName.replace(/  /g, ', ');

            if((hasPrimer.toLowerCase() !== "yes") && (hasPrimer.toLowerCase() !== "no")){
                errorEmbed.setDescription("Incorrect input format. Try this format: \n!add Deck Alias | Commander | Color | Deck Link | Author | Deck Description | Deck Type | Has Primer? (Yes/No) | Discord Link \n \
            It looks like you're having trouble with the Primer. Make sure your primer section is 'Yes' or 'No'");
                generalChannel.send(errorEmbed);
                return
            }
            if ((deckType.toLowerCase() !== "proactive")&& (deckType.toLowerCase() !== "adaptive")&&(deckType.toLowerCase() !== "disruptive")){
                errorEmbed.setDescription("Incorrect input format. Try this format: \n!add Deck Alias | Commander | Color | Deck Link | Author | Deck Description | Deck Type | Has Primer? (Yes/No) | Discord Link \n \
            It looks like you're having trouble with the Deck Type. The three deck types are: Proactive, Adaptive and Disruptive");
                generalChannel.send(errorEmbed);
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
                It looks like you're having trouble with the Color. Correct input includes the 5 letters 'WUBRG' in some combination");
                    generalChannel.send(errorEmbed);
                    return;
                }
            }
            let newDeckArr = [];
            newDeckArr.push(deckNick, commanderName, colorIdentity, deckLink, author, deckDescription, deckType, hasPrimer, discordLink);
            let promiseReturn = await bootstrap.DeckObj.addDeck(receivedMessage, newDeckArr);
            if (promiseReturn === "Error 1"){
                const sameNamedEmbed = new bootstrap.Discord.MessageEmbed()
                    .setColor(bootstrap.messageColorRed)
                    .setAuthor("Duplicate Entry")
                    .setDescription("A deck with that name already exists. Please try a new name.");
                generalChannel.send(sameNamedEmbed);
                return
            }
            if (promiseReturn === "Error 2"){
                const sameNamedEmbed = new bootstrap.Discord.MessageEmbed()
                    .setColor(bootstrap.messageColorRed)
                    .setAuthor("Too many characters")
                    .setDescription("Your description is too long, there is a 750 character limit. Please try again");
                generalChannel.send(sameNamedEmbed);
            }
            else{
                const awaitReactionEmbed = new bootstrap.Discord.MessageEmbed()
                    .setColor(bootstrap.messageColorBlue)
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
                        { name: "Has Primer?", value: bootstrap.DeckHelper.toUpper(promiseReturn[7].toString()), inline:true},
                        { name: "Discord Link", value: promiseReturn[8], inline:true},
                    )
                    .setFooter("If you don't have a Deck or Discord Link, type 'no link' in those slots");

                generalChannel.send(awaitReactionEmbed).then(function(message){
                    message.react("👍");
                    message.react("👎");
                })
            }
        }
        else{
            errorEmbed.setDescription("Incorrect input format. Try this format: \n!add Deck Alias | Commander | Color | Deck Link | Author | Deck Description | Deck Type | Has Primer? (Yes/No) | Discord Link \n\n\
        It looks like you have the incorrect number of inputs. I recommend copy and pasting the line above and filling out your information");
            generalChannel.send(errorEmbed);
        }
    },
    async profile(receivedMessage, args){
        let generalChannel = bootstrap.MessageHelper.getChannelID(receivedMessage);
        let returnArr = await bootstrap.UserObj.profile(receivedMessage, args);
        let compareDeck = 0;
        let favDeck = "";
        let elo = 1000;
        let overallWins = 0;
        let overallLosses = 0;
        if (returnArr === "Can't find user"){
            const errorUserEmbed = new bootstrap.Discord.MessageEmbed()
                .setColor(bootstrap.messageColorRed)
                .setDescription("Cannot find specified user: " +args[0])
                .setFooter("User is not registered for this league. Make sure you are using Discord Mentions and the user is registered. Type !help profile for more information");
            generalChannel.send(errorUserEmbed)
        }
        else if (returnArr[0] === "No On-Going Season"){
            const profileEmbed = new bootstrap.Discord.MessageEmbed()
                .setColor(bootstrap.messageColorBlue)
                .addFields(
                    { name: 'User', value: "<@"+returnArr[2]+">", inline: true },
                    { name: 'Current Deck', value: returnArr[4], inline: true },
                    { name: 'Score', value: 1000, inline: true },
                );
            generalChannel.send(profileEmbed);
            const matchesEmbed = new bootstrap.Discord.MessageEmbed()
                .setColor(bootstrap.messageColorBlue)
                .setDescription("This user has no logged matches this season");
            generalChannel.send(matchesEmbed)
        }
        else if (returnArr[0] === "Profile Look Up"){
            let getDeckThreshold = await bootstrap.ConfigHelper.getDeckThreshold(receivedMessage.guild.id);
            for (let i=0; i<returnArr[1].length;i++){
                if (returnArr[1][i][1]+returnArr[1][i][2]>compareDeck) {
                    compareDeck = returnArr[1][i][1]+returnArr[1][i][2];
                    favDeck = returnArr[1][i][0]
                }
                elo += (30*(returnArr[1][i][1])) - (10*(returnArr[1][i][2]))
            }
            const profileEmbed = new bootstrap.Discord.MessageEmbed()
                .setColor(bootstrap.messageColorBlue)
                .setFooter("Showing information about the current season. Season name: " + returnArr[2] +". \nNote: 'Overall winrate' includes the games that are under the server's set threshold")
                .addFields(
                    { name: 'User', value: "<@"+returnArr[3]+">", inline: true },
                    { name: 'Current Deck', value: returnArr[5], inline: true },
                    { name: 'Current Rating', value: elo, inline: true },
                    { name: 'Favorite Deck', value: favDeck, inline: true },
                );
            let threshold = 5;
            if (getDeckThreshold !== "No configs"){ threshold = getDeckThreshold._deck_threshold }
            const decksEmbed = new bootstrap.Discord.MessageEmbed()
                .setColor(bootstrap.messageColorBlue)
                .setFooter("Note: The threshold to appear on this list is " + threshold.toString() + " game(s)\nAdmins can configure this using !setconfig");
            let sortedArray = returnArr[1].sort(function(a, b) {
                return parseFloat(b[1]+b[2]) - parseFloat(a[1]+a[2]);
            });
            sortedArray.forEach((deck) =>{
                overallWins = overallWins + deck[1];
                overallLosses = overallLosses + deck[2];
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
            });
            profileEmbed
                .addFields(
                    {name: "Overall Winrate", value: Math.round((overallWins/(overallLosses+overallWins)*100)) + "%", inline: true}
                );
            generalChannel.send(profileEmbed);
            generalChannel.send(decksEmbed);
        }
    },
    async remindMatch(receivedMessage, args) {
        let generalChannel = bootstrap.MessageHelper.getChannelID(receivedMessage);
        let playerID = receivedMessage.author.id;

        //Catch Bad Input
        if (args.length !== 0) {
            const errorMsg = new bootstrap.Discord.MessageEmbed()
                .setColor('#af0000')
                .setDescription("**Error**: Bad input");
            generalChannel.send(errorMsg);
            return
        }

        let response = await bootstrap.GameObj.getRemindInfo(playerID, receivedMessage.guild.id).catch((message) => {
            const errorMsg = new bootstrap.Discord.MessageEmbed()
                .setColor('#af0000')
                .setDescription("**Error**: Unfinished match not found");
            generalChannel.send(errorMsg);
            return
        });
        try {
            response.forEach(player => {
                if (player[1] === "N") {
                    const errorMsg = new bootstrap.Discord.MessageEmbed()
                        .setColor(bootstrap.messageColorBlue)
                        .setDescription("**Alert**: " + player[0].toString() + "- remember to confirm the match above.");
                    generalChannel.send(errorMsg)
                }
            })
        }
        catch {

        }

    },
    /**
     * deleteMatch()
     * @param {object} receivedMessage - discord message obj
     * @param {array} args Message content beyond command
     *
     * Calling method checks for admin priv before getting here.
     */
    async deleteMatch(receivedMessage, args) {
        let generalChannel = bootstrap.MessageHelper.getChannelID(receivedMessage);
        let sanitizedString = receivedMessage.author.id;
        const confirmMsgEmbed = new bootstrap.Discord.MessageEmbed();

        //Catch bad input
        if (args.length !== 1) {
            const errorMsg = new bootstrap.Discord.MessageEmbed()
                .setColor('#af0000')
                .setAuthor("Incorrect Input")
                .setDescription("Please type !deletematch <Match ID>\n\
                See !help deletematch for more information.");
            generalChannel.send(errorMsg);
            return
        }
        const response = await bootstrap.GameObj.deleteMatch(args[0], receivedMessage).catch((message) => {
            const errorMsg = new bootstrap.Discord.MessageEmbed()
                .setColor('#af0000')
                .setAuthor("Incorrect Match ID")
                .setDescription("Match not found");
            generalChannel.send(errorMsg);
        });
        if (response === "SUCCESS") {
            const errorMsg = new bootstrap.Discord.MessageEmbed(confirmMsgEmbed)
                .setColor(bootstrap.messageColorGreen)
                .setDescription("Successfully deleted Match #" + args[0]);
            generalChannel.send(errorMsg)
        }
        else if (response === "CONFIRM") {
            confirmMsgEmbed
                .setColor(bootstrap.messageColorBlue)
                .setAuthor("You are attempting to permanently delete a match")
                .setTitle("Match ID: "+ args[0])
                .setDescription("<@!"+sanitizedString+">" + " This is a finished match \n **Upvote** to confirm \n **Downvote** to cancel");
            generalChannel.send(confirmMsgEmbed)
                .then(function (message){
                    message.react("👍");
                    message.react("👎");
                })
        }
    },
    async matchInfo(receivedMessage, args) {
        let generalChannel = bootstrap.MessageHelper.getChannelID(receivedMessage);

        //Catch bad input
        if (args.length !== 1 || args[0].length !== 12) {
            const errorMsg = new bootstrap.Discord.MessageEmbed()
                .setColor(bootstrap.messageColorRed)
                .setAuthor("Incorrect input")
                .setDescription("Use the format: !info <Match ID>")
                .setFooter("Check !help info for more information");
            generalChannel.send(errorMsg);
            return
        }
        const response = await bootstrap.GameObj.matchInfo(args[0], receivedMessage);
        if (response !== "FAIL") {
            let convertedToCentralTime = response[0].toLocaleString("en-US", {timeZone: "America/Chicago"});
            const winner = await bootstrap.LeagueHelper.getUserFromMention(response[4]);
            const loser1 = await bootstrap.LeagueHelper.getUserFromMention(response[5]);
            const loser2 = await bootstrap.LeagueHelper.getUserFromMention(response[6]);
            const loser3 = await bootstrap.LeagueHelper.getUserFromMention(response[7]);
            let tempEmbed = new bootstrap.Discord.MessageEmbed()
                .setColor(bootstrap.messageColorBlue) //blue
                .setTitle('Game ID: ' + response[1])
                .setThumbnail(bootstrap.LeagueHelper.getUserAvatarUrl(winner));
            if (response[12] === "Finished Match"){
                tempEmbed
                    .setAuthor("This is a finished match. All parties have accepted the match log.")
                    .addFields(
                        { name: 'Season: ', value: response[3], inline: true},
                        { name: 'Time (Converted to CST/CDT)', value:convertedToCentralTime, inline: true},
                        { name: 'Winner:', value: '**'+winner.username+'**' + ' piloting ' + '**'+response[8]+'**'},
                        { name: 'Opponents:', value:
                                '**'+loser1.username+'**'+ ' piloting ' + '**'+response[9]+'**' + '\n'
                                + '**'+loser2.username+'**'+ ' piloting ' + '**'+response[10]+'**' + '\n'
                                + '**'+loser3.username+'**'+ ' piloting ' + '**'+response[11]+'**' }
                    );
                generalChannel.send(tempEmbed)
            }else if (response[12] === "Disputed Match"){
                tempEmbed
                    .setAuthor("This is a disputed match. Some or all of the parties have disputed the outcome of this match.")
                    .addFields(
                        { name: 'Season: ', value: response[3], inline: true},
                        { name: 'Time (Converted to CST/CDT)', value:convertedToCentralTime, inline: true},
                        { name: 'Winner (if match is accepted):', value: '**'+winner.username+'**' + ' piloting ' + '**'+response[8]+'**'},
                        { name: 'Opponents:', value:
                                '**'+loser1.username+'**'+ ' piloting ' + '**'+response[9]+'**' + '\n'
                                + '**'+loser2.username+'**'+ ' piloting ' + '**'+response[10]+'**' + '\n'
                                + '**'+loser3.username+'**'+ ' piloting ' + '**'+response[11]+'**' }
                    );
                generalChannel.send(tempEmbed)
            }else if (response[12] === "Pending Match"){
                tempEmbed
                    .setAuthor("This is a pending match. Some or all of the parties have not finished logging this match.")
                    .addFields(
                        { name: 'Season: ', value: response[3], inline: true},
                        { name: 'Time (Converted to CST/CDT)', value:convertedToCentralTime, inline: true},
                        { name: 'Winner (if match is accepted):', value: '**'+winner.username+'**' + ' piloting ' + '**'+response[8]+'**'},
                        { name: 'Opponents:', value:
                                '**'+loser1.username+'**'+ ' piloting ' + '**'+response[9]+'**' + '\n'
                                + '**'+loser2.username+'**'+ ' piloting ' + '**'+response[10]+'**' + '\n'
                                + '**'+loser3.username+'**'+ ' piloting ' + '**'+response[11]+'**' }
                    );
                generalChannel.send(tempEmbed)
            }
        }
        else if (response === "FAIL"){
            const errorMsg = new bootstrap.Discord.MessageEmbed()
                .setColor(bootstrap.messageColorRed)
                .setAuthor("Match not found")
                .setDescription("Cannot find the specified match. Please re-enter the MatchID");
            generalChannel.send(errorMsg)
        }
    },
    async register(receivedMessage){
        let generalChannel = bootstrap.MessageHelper.getChannelID(receivedMessage);
        let returnArr = await bootstrap.LeagueObj.register(receivedMessage);
        const messageEmbed = new bootstrap.Discord.MessageEmbed();
        if (returnArr === "Success"){
            messageEmbed
                .setColor(bootstrap.messageColorGreen)
                .setDescription("<@!" + receivedMessage.author.id + ">" + " is now registered.")
                .setFooter("You are now registered for this server\nBe sure to tell us what deck you’re using with the !use <Deck Name> command\nCheck out a list of all decks on this server with the !decks command");
            generalChannel.send(messageEmbed)
        }
        if (returnArr === "Already Registered"){
            messageEmbed
                .setColor(bootstrap.messageColorRed)
                .setDescription("<@!" + receivedMessage.author.id + ">" + " is already registered.")
                .setFooter("Check your profile with the !profile command");
            generalChannel.send(messageEmbed)
        }
        else if (returnArr === "Error"){
            messageEmbed
                .setColor(bootstrap.messageColorRed)
                .setAuthor("Critical Error. Try again. If problem persists, please reach out to developers.");
            generalChannel.send(messageEmbed)
        }
    },
    helpCommand(receivedMessage, arguments){
        if (arguments.length === 0){
            // Call FunctionHelper to with our message.
            bootstrap.FunctionHelper.showEmbedHelpForAllCommands(receivedMessage)
        } else{
            bootstrap.FunctionHelper.showEmbedHelpForCommand(receivedMessage, arguments);
        }
    },
    credits(argument, receivedMessage){
    /* @TODO
        Give credit where credit is due
    */
    }
};
