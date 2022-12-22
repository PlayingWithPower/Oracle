const { Client, GatewayIntentBits } = require('discord.js');


// Bot Configuration
const Env = require('./etc/env.js');
const Discord = require('discord.js');


const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions
    ]
});

const Mongoose = require('mongoose');

//Objects
const OracleObj = require('./objects/Oracle');
const DeckObj = require('./objects/Deck');
const GameObj = require('./objects/Game');
const LeagueObj = require('./objects/League');
const SeasonObj = require('./objects/Season');
const UserObj = require('./objects/User');

//Schemas
const User = require('./Schema/Users');
const Deck = require('./Schema/Decks');
const Game = require('./Schema/Games');
const Config = require('./Schema/Config');
const Season = require('./Schema/Seasons');
const Alias = require('./Schema/Alias');

//Helper files
const CommandHelper = require('./Helpers/CommandHelper');
const DeckHelper = require('./Helpers/DeckHelper');
const ManageReactHelper = require('./Helpers/ManageReactionHelper');
const SeasonHelper = require('./Helpers/SeasonHelper');
const GameHelper = require('./Helpers/GameHelper');
const ConfigHelper = require('./Helpers/ConfigHelper');
const MessageHelper = require('./Helpers/MessageHelper');
const LeagueHelper = require('./Helpers/LeagueHelper');

//Bot prefix
const botListeningPrefix = "!";

//Colors
const messageColorRed = "#af0000";
const messageColorGreen = "#5fff00";
const messageColorBlue = "#0099ff";

//Points
const pointsGained = 30;
const pointsLost = 10;
const startingElo = 1000;

//Data
const Data = require('./data/decklists.json');

//Bot Config Export
exports.Env = Env;
exports.Discord = Discord;
exports.Client = client;
exports.mongoose = Mongoose;

//Objects Export
exports.OracleObj = OracleObj;
exports.DeckObj = DeckObj;
exports.GameObj = GameObj;
exports.LeagueObj = LeagueObj;
exports.SeasonObj = SeasonObj;
exports.UserObj = UserObj;

//Schema Export
exports.User = User;
exports.Deck = Deck;
exports.Game = Game;
exports.Config = Config;
exports.Season = Season;
exports.Alias = Alias;


//Helper Export
exports.CommandHelper = CommandHelper;
exports.DeckHelper = DeckHelper;
exports.ManageReactHelper = ManageReactHelper;
exports.SeasonHelper = SeasonHelper;
exports.GameHelper = GameHelper;
exports.ConfigHelper = ConfigHelper;
exports.MessageHelper = MessageHelper;
exports.LeagueHelper = LeagueHelper;

//Bot Prefix Export
exports.botListeningPrefix = botListeningPrefix;

//Color Export
exports.messageColorRed = messageColorRed;
exports.messageColorGreen = messageColorGreen;
exports.messageColorBlue = messageColorBlue;

//Points Export
exports.pointsGained = pointsGained;
exports.pointsLost = pointsLost;
exports.startingElo = startingElo;

//Data Export
exports.Data = Data;
