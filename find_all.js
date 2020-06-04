const MongoClient = require('mongodb').MongoClient;
const User = require('../EloDiscordBot/lib/mongodb')

const url = 'mongodb+srv://firstuser:willams112@cluster0-ebhft.mongodb.net/UserData?authSource=admin&replicaSet=Cluster0-shard-0&readPreference=primary&appname=MongoDB%20Compass%20Community&ssl=true'
module.exports = {
    findAllFunc(receivedMessage){
        MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, (err, db) => {
    
            if (err) throw err;
        
            let query = { _id: receivedMessage.author}
            //console.log(receivedMessage)
            db.collection("users").count({}, function(error, numOfDocs){
                if(error) return callback(error);

                db.close();
                callback(null, numOfDocs);
            });
        })
    }
} 