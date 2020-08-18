// Bot Configuration
const Env = require('./etc/env.js');
const Discord = require('discord.js');
const Client = new Discord.Client();
const Mongoose = require('mongoose');

//Objects
const OracleObj = require('./objects/oracle');
const DeckObj = require('./objects/deck');
const GameObj = require('./objects/game');
const LeagueObj = require('./objects/league');
const SeasonObj = require('./objects/season');
const UserObj = require('./objects/user');

//Schemas
const User = require('./schema/users');
const Deck = require('./schema/decks');
const Game = require('./schema/games');
const Config = require('./schema/config');
const Season = require('./schema/seasons');
const Alias = require('./schema/alias');

//Helper files
const FunctionHelper = require('./helpers/functionHelper');
const DeckHelper = require('./helpers/deckHelper');
const ManageReactHelper = require('./helpers/manageReactionHelper');
const SeasonHelper = require('./helpers/seasonHelper');
const GameHelper = require('./helpers/gameHelper');
const ConfigHelper = require('./helpers/configHelper');
const MessageHelper = require('./helpers/messageHelper');
const LeagueHelper = require('./helpers/leagueHelper');

//Bot prefix
const botListeningPrefix = "!";

//Colors
const messageColorRed = "#af0000";
const messageColorGreen = "#5fff00";
const messageColorBlue = "#0099ff";

//Data
const Data = require('../data/decklists.json');

//Bot Config Export
exports.Env = Env;
exports.Discord = Discord;
exports.Client = Client;
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

//Data Export
exports.Data = Data
