const bootstrap = require('../bootstrap')

module.exports = {
    async getCurrentSeason(guild){
        const currentDate = new Date();
        let query = {
            '_server': guild
        };
        let currentSeasonObj;
        return new Promise((resolve, reject)=>{
            bootstrap.Season.find(query,function(err, res){
                res.forEach((entry) =>{
                    if ((entry._season_end === "Not Specified") || (new Date(entry._season_end) >= currentDate)){
                        currentSeasonObj = entry
                    }
                });
                if (currentSeasonObj !== undefined){
                    resolve(currentSeasonObj)
                }
                else{
                    currentSeasonObj = "No Current";
                    resolve(currentSeasonObj)
                }
            })
        })   
    },
    async newSeasonName(guild){
        let query = {
            '_server': guild
        };
        return new Promise((resolve, reject)=>{
            bootstrap.Season.find(query, function(err, res){
                resolve(res.length + 1)
            })
            
        })
    },
    async lookUpUsers(users){
        return new Promise(async (resolve, reject) => {
            let seasonObj = await module.exports.getCurrentSeason(users[1]);
            let seasonName = seasonObj._season_name;

            if (users[2] !== undefined){
                seasonName = users[2]
            }

            let passingResult;
            let matchResults = [];
            let season = seasonName;
            let server = users[1];
            let personLookedUp = users[0];
                let getWinnersQuery = {
                    _server: server,
                    _season: season,
                    _Status: "FINISHED",
                    $or: 
                    [{_player1: personLookedUp}, 
                    {_player2: personLookedUp},
                    {_player3: personLookedUp},
                    {_player4: personLookedUp},]
                };
                bootstrap.Game.find(getWinnersQuery, function(err,res){
                    if (err){
                        throw err;
                    }
                    passingResult = res;
                }).then(function(passingResult){
                    if (passingResult.length > 0){
                            for (let i=0; i <passingResult.length; i++){
                                let pasRes = passingResult[i]._player1;
                                let exists = matchResults.find(el => el[0] === pasRes);
                                if (passingResult[i]._player1 === personLookedUp){
                                    if (exists) {
                                        exists[1] += 1;
                                    } else {
                                        matchResults.push([pasRes, 1, 0]);
                                    }
                                }

                                pasRes = passingResult[i]._player2;
                                if (passingResult[i]._player2 === personLookedUp){
                                let exists2 = matchResults.find(el => el[0] === pasRes);
                                if (exists2) {
                                    exists2[2] += 1;
                                    } else {
                                    matchResults.push([pasRes, 0, 1]);
                                    } 
                                }

                                pasRes = passingResult[i]._player3;
                                if (passingResult[i]._player3 === personLookedUp){
                                let exists3 = matchResults.find(el => el[0] === pasRes);
                                if (exists3) {
                                    exists3[2] += 1;
                                    } else {
                                    matchResults.push([pasRes, 0, 1]);
                                    }
                                }

                                pasRes = passingResult[i]._player4;
                                if (passingResult[i]._player4 === personLookedUp){
                                let exists4 = matchResults.find(el => el[0] === pasRes);
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
};