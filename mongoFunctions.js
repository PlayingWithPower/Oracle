const MongoClient = require('mongodb').MongoClient;
const user = require('./Schema/User')
const url = 'mongodb+srv://firstuser:e76BLigCnHWPOckS@cluster0-ebhft.mongodb.net/UserData?authSource=admin&replicaSet=Cluster0-shard-0&readPreference=primary&appname=MongoDB%20Compass&ssl=true'
const percentageToLose = 0.010

module.exports = {
    //function to change elo
    addDeckList(receivedMessage, args){
        return new Promise(function(resolve, reject){
            resolve("2")
            reject("1")
        })
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
    logLosers(args, callback){
        MongoClient.connect(url, { useUnifiedTopology: true }, function (err, db){
            var dbo = db.db("UserData")
            var valToGive = 0;
            if (args.length < 1){ //MAKE SURE TO CHANGE TO 3 AFTER TESTING
                //@TODO
                return
            }
            else{
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
                            singleLoserArray.push((Math.round(valToGive)).toString())
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
            }
        });
    },
    logWinners(receivedMessage, lostEloArray, callback){
        MongoClient.connect(url, { useUnifiedTopology: true }, function (err, db){
            console.log(Number(lostEloArray.toString()))
            var winnerQuery = {_name: receivedMessage.author.username};
            var dbo = db.db("UserData")
                    //console.log("Number that is being passed: " + valToGive) //valToGive here does not match up with valToGive above ^ check output logs, it should be 
                    dbo.collection("users").findOne(winnerQuery, function(err, res){
                        if(err) throw err;
                        try{
                            var newValue = {$set: {_elo: Math.round(Number(res._elo) + Number(lostEloArray.toString())), _wins: Number(res._wins) + 1}}//lose 10% per loss
                        }catch (error){
                            return error
                        }
                        var singleLoserArray = new Array();
                        user.updateOne(winnerQuery, newValue, function(err, result){
                            if (result){
                                callback("successful")
                            }
                            else{
                                callback("Unknown error, try again.")
                            }
                        })
                    })
            })
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