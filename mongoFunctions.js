const MongoClient = require('mongodb').MongoClient;
const user = require('./lib/mongodb')
const url = 'mongodb+srv://firstuser:e76BLigCnHWPOckS@cluster0-ebhft.mongodb.net/UserData?authSource=admin&replicaSet=Cluster0-shard-0&readPreference=primary&appname=MongoDB%20Compass&ssl=true'

module.exports = {
    //function to change elo
    addDeckList(receivedMessage, args){

    },
    profile(receivedMessage, args){
        MongoClient.connect(url, { useUnifiedTopology: true }, function (err, db){
            var dbo = db.db("UserData")
            let query = {_name: receivedMessage.author.username}
            dbo.collection("users").findOne(query, function(err, res){
                console.log(res)
            })
        });
    },
    //Test by typing in !addelo and @ing someone who is registered.
    //There are 2 queries being made: A query to lookup the losers' information and one to look up the winners' information.
    //dbo connects to "UserData" db(not sure what to call this in Mongo?) and then makes a call to the "users" collection. FindOne returns a single entry when provided a query. The query is the
    //  arg passed into it (who you are mentioning). Afterwards an updateOne() call is made with the same query. updateOne(), as I understand it, will make a new entry if none exist, or will
    //  update an entry if one does exist. In this case, it is updating. The same process is applied below to the winnery's query
    //So far, only works with @ing one person
    //Things to add: 
    //          - edge cases for if someone isn't registered
    //          - "valToGive" cannot be edited inside of the "loserQuery" and then passed to the "winnerQuery", this is probably a misunderstanding on my part on how these variables work in these scopes
    log(receivedMessage, args, callback){
        MongoClient.connect(url, { useUnifiedTopology: true }, function (err, db){
            var dbo = db.db("UserData")
            var valToGive = 0;
            var percentageToLose = 0.010
            var losersArray = new Array ();
            if (args.length < 1){
                //return error message, not sure how to pass back variables yet
                return
            }
            else{
                //This below is close. It is defintely working in some ways. It's getting all 3 IDs and I think should be updating them, but it is only updating the last one written on discord
                // in the list of 3
                args.forEach(loser => {
                    let loserQuery = {_id: loser.toString()};
                    dbo.collection("users").findOne(loserQuery, function(err, res){
                        if(err) throw err;
                        try{
                            var newValue = {$set: {_elo: Math.round(Number(res._elo) - Number(res._elo)*(percentageToLose)), _losses: Number(res._losses) + 1}}//lose 10% per loss
                        }catch (error){
                            return error
                        }
                        valToGive = Number(res._elo)*(percentageToLose)
                        var singleLoserArray = new Array();
                                singleLoserArray.push(loser.toString())
                                singleLoserArray.push(valToGive.toString())
                        user.updateOne(loserQuery, newValue, function(err, result){
                            if (result){
                                callback(singleLoserArray)
                            }
                            else{
                                callback("Unknown error, try again.")
                            }
                        })
                    })
                });

                // var winnerQuery = {_name: receivedMessage.author.username};
                // //console.log("Number that is being passed: " + valToGive) //valToGive here does not match up with valToGive above ^ check output logs, it should be 
                // dbo.collection("users").findOne(winnerQuery, function(err, res){
                //     if(err) throw err;
                //     var newValue = {$set: {_elo: Math.round(Number(res._elo) + Number(res._elo)*(.010)), _wins: Number(res._wins) + 1}}
                //     dbo.collection("users").updateOne(winnerQuery, newValue, function(err, result){
                //         if(err) throw err;
                //         //console.log("ID of winner: " + receivedMessage.author.id);
                //     })
                // })
            }
        });
    },
    //this function registers a user to the league, it sends their "id" (used to mention a person) and their discord name to the server and saves it in the 'Users' collection
    registerFunc(receivedMessage, callback){
        var queryFound = false
            //ran into problems above if the users aren't saved in the id format below... I'm not sure if this will hurt us later but probably not. This format is the format for @ing people on discord in their own codebase
            user({'_id' : "<@!" + receivedMessage.author.id +">", '_name' : receivedMessage.author.username, '_elo' : 1000, '_wins' : 0, '_losses' : 0}).save(function(err, result){
                if(result){
                    callback("1")
                }
                else {
                    callback("2")
                }
            });
    },
    //messy and not finished, trying to send a callback
    //this function will count the number of users and return that value, useful for adminstrative and stats
    listAll(receivedMessage, callback){
            user.countDocuments(function(err, result){
                if (result){
                    callback(result)
                }
                else{
                    callback(result)
              }
            
            });
            
        }
} 