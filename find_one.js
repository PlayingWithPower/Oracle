const MongoClient = require('mongodb').MongoClient;
const user = require('../EloDiscordBot/lib/mongodb')

const url = 'mongodb+srv://firstuser:willams112@cluster0-ebhft.mongodb.net/UserData?authSource=admin&replicaSet=Cluster0-shard-0&readPreference=primary&appname=MongoDB%20Compass%20Community&ssl=true'
module.exports = {
    //this function registers a user to the league, it sends their "id" (used to mention a person) and their discord name to the server and saves it in the 'Users' collection
    registerFunc(receivedMessage, callback){
        var queryFound = false
            user({'_id' : receivedMessage.author, '_name' : receivedMessage.author.username}).save(function(err, result){
                if(err){
                    callback("1")
                }
                else {
                    callback("2")
                }
            });
    },
    //messy and not finished, trying to send a callback
    //this function will count the number of users and return that value, useful for adminstrative and stats
    promise1(receivedMessage, callback){
            user.countDocuments(function(err, result, cb){
                if (err){
                    callback("1")
                }
                else{
                    callback("2")
                }
            });
            
        },
    generalChatID: "717073663324848141"
} 