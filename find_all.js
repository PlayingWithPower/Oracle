//This is an old file, ignore for now. I was testing having multiple module.exports, but it seems they all need to be in the same file. 
//Looking more into this if I have time
const MongoClient = require('mongodb').MongoClient;
const User = require('../EloDiscordBot/lib/mongodb')

const url = 'mongodb+srv://firstuser:willams112@cluster0-ebhft.mongodb.net/UserData?authSource=admin&replicaSet=Cluster0-shard-0&readPreference=primary&appname=MongoDB%20Compass%20Community&ssl=true'
module.exports = {
    
} 