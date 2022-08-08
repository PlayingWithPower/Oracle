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
            let getWinnersQuery;
          
            if (users[2] === "all"){
                getWinnersQuery = {
                    _server: server,
                    _Status: "FINISHED",
                    $or:
                        [
                            {_player1: personLookedUp},
                            {_player2: personLookedUp},
                            {_player3: personLookedUp},
                            {_player4: personLookedUp},
                        ]
                };
            }
            else{
                getWinnersQuery = {
                    _server: server,
                    _season: season,
                    _Status: "FINISHED",
                    $or:
                        [
                            {_player1: personLookedUp},
                            {_player2: personLookedUp},
                            {_player3: personLookedUp},
                            {_player4: personLookedUp},
                        ]
                };
            }
            bootstrap.Game.find(getWinnersQuery, function(err,res){
                if (err){
                    console.log("DEBUG LOG: Season Helper: lookUpUsers function: \n\
                    Unable to find users from 'Matches' collection using query: 'getWinnersQuery'\n\
                    This is either a DB connection issue or a sign of !top working incorrectly")
                }
                passingResult = res;
            }).then(function(passingResult){
                if (passingResult.length > 0){
                        for (let i=0; i <passingResult.length; i++) {
                            let pasRes = passingResult[i]._player1;
                            if (passingResult[i]._player1 === personLookedUp){
                                if (passingResult[i]._player1Points !== undefined){
                                    let exists = matchResults.find(el => el[0] === pasRes);
                                    if (exists) {
                                        if (passingResult[i]._Draw) {
                                            exists[5] += 1;
                                            exists[2] += parseInt(passingResult[i]._player1Points);
                                        } else {
                                            exists[1] += 1;
                                            exists[2] += parseInt(passingResult[i]._player1Points);
                                        }
                                    } else {
                                        if (passingResult[i]._Draw) {
                                            matchResults.push([pasRes, 0, parseInt(passingResult[i]._player1Points), 0, 0, 1]);
                                        } else {
                                            matchResults.push([pasRes, 1, parseInt(passingResult[i]._player1Points), 0, 0, 0]);
                                        }
                                    }
                                }
                                else{
                                    let exists = matchResults.find(el => el[0] === pasRes);
                                    if (exists) {
                                        exists[1] += (passingResult[i]._Draw ? 0 : 1);
                                        exists[2] += (passingResult[i]._Draw ? bootstrap.pointsDraw : bootstrap.pointsGained);
                                        exists[5] += (passingResult[i]._Draw ? 1 : 0);
                                    } else {
                                        matchResults.push([pasRes, (passingResult[i]._Draw ? 0 : 1), (passingResult[i]._Draw ? bootstrap.pointsDraw : bootstrap.pointsGained), 0, 0, (passingResult[i]._Draw ? 1 : 0)]);
                                    }
                                }
                            }


                            pasRes = passingResult[i]._player2;
                            if (passingResult[i]._player2 === personLookedUp) {
                                if (passingResult[i]._player2Points !== undefined) {
                                    let exists2 = matchResults.find(el => el[0] === pasRes);
                                    if (exists2) {
                                        if (passingResult[i]._Draw) {
                                            exists2[2] += parseInt(passingResult[i]._player2Points);
                                            exists2[5] += 1;
                                        } else {
                                            exists2[3] += 1;
                                            exists2[4] += parseInt(passingResult[i]._player2Points);
                                        }
                                    } else {
                                        if (passingResult[i]._Draw) {
                                            matchResults.push([pasRes, 0, parseInt(passingResult[i]._player2Points), 0, 0, 1]);
                                        } else {
                                            matchResults.push([pasRes, 0, 0, 1, parseInt(passingResult[i]._player2Points), 0]);
                                        }
                                    }
                                } else {
                                    let exists2 = matchResults.find(el => el[0] === pasRes);
                                    if (exists2) {
                                        if (passingResult[i]._Draw) {
                                            exists2[2] += bootstrap.pointsDraw;
                                            exists2[5] += 1;
                                        } else {
                                            exists2[3] += 1;
                                            exists2[4] += bootstrap.pointsLost;
                                        }
                                    } else {
                                        if (passingResult[i]._Draw) {
                                            matchResults.push([pasRes, 0, bootstrap.pointsDraw, 1, 0, 1]);
                                        } else {
                                            matchResults.push([pasRes, 0, 0, 1, bootstrap.pointsLost, 0]);
                                        }
                                    }
                                }
                            }
                            pasRes = passingResult[i]._player3;
                            if (passingResult[i]._player3 === personLookedUp) {
                                if (passingResult[i]._player3Points !== undefined) {
                                    let exists3 = matchResults.find(el => el[0] === pasRes);
                                    if (exists3) {
                                        if (passingResult[i]._Draw) {
                                            exists3[2] += parseInt(passingResult[i]._player3Points);
                                            exists3[5] += 1;
                                        } else {
                                            exists3[3] += 1;
                                            exists3[4] += parseInt(passingResult[i]._player3Points);
                                        }
                                    } else {
                                        if (passingResult[i]._Draw) {
                                            matchResults.push([pasRes, 0, parseInt(passingResult[i]._player3Points), 0, 0, 1]);
                                        } else {
                                            matchResults.push([pasRes, 0, 0, 1, parseInt(passingResult[i]._player3Points), 0]);
                                        }
                                    }
                                } else {
                                    let exists3 = matchResults.find(el => el[0] === pasRes);
                                    if (exists3) {
                                        if (passingResult[i]._Draw) {
                                            exists3[2] += bootstrap.pointsDraw;
                                            exists3[5] += 1;
                                        } else {
                                            exists3[3] += 1;
                                            exists3[4] += bootstrap.pointsLost;
                                        }
                                    } else {
                                        if (passingResult[i]._Draw) {
                                            matchResults.push([pasRes, 0, bootstrap.pointsDraw, 1, 0, 1]);
                                        } else {
                                            matchResults.push([pasRes, 0, 0, 1, bootstrap.pointsLost, 0]);
                                        }
                                    }
                                }
                            }
                            pasRes = passingResult[i]._player4;
                            if (passingResult[i]._player4 === personLookedUp) {
                                if (passingResult[i]._player4Points !== undefined) {
                                    let exists4 = matchResults.find(el => el[0] === pasRes);
                                    if (exists4) {
                                        if (passingResult[i]._Draw) {
                                            exists4[2] += parseInt(passingResult[i]._player4Points);
                                            exists4[5] += 1;
                                        } else {
                                            exists4[3] += 1;
                                            exists4[4] += parseInt(passingResult[i]._player4Points);
                                        }
                                    } else {
                                        if (passingResult[i]._Draw) {
                                            matchResults.push([pasRes, 0, parseInt(passingResult[i]._player4Points), 0, 0, 1]);
                                        } else {
                                            matchResults.push([pasRes, 0, 0, 1, parseInt(passingResult[i]._player4Points), 0]);
                                        }
                                    }
                                } else {
                                    let exists4 = matchResults.find(el => el[0] === pasRes);
                                    if (exists4) {
                                        if (passingResult[i]._Draw) {
                                            exists4[2] += bootstrap.pointsDraw;
                                            exists4[5] += 1;
                                        } else {
                                            exists4[3] += 1;
                                            exists4[4] += bootstrap.pointsLost;
                                        }
                                    } else {
                                        if (passingResult[i]._Draw) {
                                            matchResults.push([pasRes, 0, bootstrap.pointsDraw, 1, 0, 1]);
                                        } else {
                                            matchResults.push([pasRes, 0, 0, 1, bootstrap.pointsLost, 0]);
                                        }
                                    }
                                }
                            }
                        }
                    } else {
                        resolve("Can't find deck")
                    }
            }).then(function(){
                resolve(matchResults)
            })
        })
    },  
};