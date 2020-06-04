const MongoClient = require('mongodb').MongoClient;
const user = require('../EloDiscordBot/lib/mongodb')

const url = 'mongodb+srv://firstuser:willams112@cluster0-ebhft.mongodb.net/UserData?authSource=admin&replicaSet=Cluster0-shard-0&readPreference=primary&appname=MongoDB%20Compass%20Community&ssl=true'
module.exports = {
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