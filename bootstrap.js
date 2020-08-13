// Bot Configuration
const config = require('./etc/env.js');
const Discord = require('discord.js');
const client = new Discord.Client();

//Objects
const oracleObj = require('./objects/Oracle');
const deckObj = require('./objects/Deck');
const gameObj = require('./objects/Game');
const leagueObj = require('./objects/League');
const seasonObj = require('./objects/Season');
const userObj = require('./objects/User');

//Schemas
const User = require('./Schema/Users');
const Deck = require('./Schema/Decks');
const Game = require('./Schema/Games');
const Config = require('./Schema/Config');
const Season = require('./Schema/Seasons');
const Alias = require('./Schema/Alias');

//Helper files
const FunctionHelper = require('./Helpers/FunctionHelper');
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

//Bot Config Export
exports.config = config;
exports.Discord = Discord;
exports.client = client;

//Objects Export
exports.oracleObj = oracleObj;
exports.deckObj = deckObj;
exports.gameObj = gameObj;
exports.leagueObj = leagueObj;
exports.seasonObj = seasonObj;
exports.userObj = userObj;

//Schema Export
exports.User = User;
exports.Deck = Deck;
exports.Game = Game;
exports.Config = Config;
exports.Season = Season;
exports.Alias = Alias;


//Helper Export
exports.FunctionHelper = FunctionHelper;
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
