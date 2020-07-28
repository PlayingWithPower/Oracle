const Discord = require('discord.js')
const matches = require('../Schema/Games')

module.exports = {
    async getCurrentSeason(guild){
        const season = require('../Schema/Seasons')
        const currentDate = new Date()
        let query = {
            '_server': guild
        }
        var currentSeasonObj
        return new Promise((resolve, reject)=>{
            season.find(query,function(err, res){
                res.forEach((entry) =>{
                    if ((entry._season_end == "Not Specified") || (new Date(entry._season_end) >= currentDate)){
                        currentSeasonObj = entry
                    }
                })
                if (currentSeasonObj !== undefined){
                    resolve(currentSeasonObj)
                }
                else{
                    currentSeasonObj = "No Current"
                    resolve(currentSeasonObj)
                }
            })
        })   
    },
    async newSeasonName(guild){
        const season = require('../Schema/Seasons')

        let query = {
            '_server': guild
        }
        return new Promise((resolve, reject)=>{
            season.find(query, function(err, res){
                resolve(res.length + 1)
            })
            
        })
    },
    async lookUpUsers(users){
        // const seasonObj = await module.exports.getCurrentSeason(users[1])
        // var seasonName = seasonObj._season_name
        return new Promise(async (resolve, reject) => {
            let seasonObj = await module.exports.getCurrentSeason(users[1])
            var seasonName = seasonObj._season_name

            if (users[2] != undefined){
                seasonName = users[2]
            }

            var passingResult
            var matchResults = []
            var season = seasonName
            var server = users[1]
            var personLookedUp = users[0]
                let getWinnersQuery = {
                    _server: server, 
                    _season: season,
                    $or: 
                    [{_player1: personLookedUp}, 
                    {_player2: personLookedUp},
                    {_player3: personLookedUp},
                    {_player4: personLookedUp},]
                }
                matches.find(getWinnersQuery, function(err,res){
                    if (err){
                        throw err;
                    }
                    passingResult = res;
                }).then(function(passingResult){
                    if (passingResult != ""){
                            for (var i=0; i <passingResult.length; i++){
                                var pasRes = passingResult[i]._player1
                                if (passingResult[i]._player1 == personLookedUp){
                                    var exists = matchResults.find(el => el[0] === pasRes)
                                    if (exists) {
                                        exists[1] += 1;
                                    } else {
                                        matchResults.push([pasRes, 1, 0]);
                                    }
                                }

                                var pasRes = passingResult[i]._player2
                                if (passingResult[i]._player2 == personLookedUp){
                                var exists2 = matchResults.find(el => el[0] === pasRes)
                                if (exists2) {
                                    exists2[2] += 1;
                                    } else {
                                    matchResults.push([pasRes, 0, 1]);
                                    } 
                                }

                                var pasRes = passingResult[i]._player3
                                if (passingResult[i]._player3 == personLookedUp){
                                var exists3 = matchResults.find(el => el[0] === pasRes)
                                if (exists3) {
                                    exists3[2] += 1;
                                    } else {
                                    matchResults.push([pasRes, 0, 1]);
                                    }
                                }

                                var pasRes = passingResult[i]._player4
                                if (passingResult[i]._player4 == personLookedUp){
                                var exists4 = matchResults.find(el => el[0] === pasRes)
                                if (exists4) {
                                    exists4[2] += 1;
                                    } else {
                                    matchResults.push([pasRes, 0, 1]);
                                    }
                            }
                        }
                    }else{
                        resolve("Can't find deck")
                    }  
                }).then(function(){
                    resolve(matchResults)
                })
        })
    },  
}