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
    async lookUpUsers(users, guild){
        const seasonObj = await this.getCurrentSeason(guild)
        var seasonName = seasonObj._season_name
        return new Promise((resolve, reject) => {
            let wins = 0
            let losses = 0
            var passingResult
            var passedArray = new Array();
            users.forEach(user =>{
                let getWinnersQuery = {_server: guild, _season: seasonName, $or: 
                    [
                    {_player1: user._mentionValue}, 
                    {_player2: user._mentionValue},
                    {_player3: user._mentionValue},
                    {_player4: user._mentionValue},
                    ]
                }
                matches.find(getWinnersQuery, function(err,res){
                    if (err){
                        throw err;
                    }
                    passingResult = res;
                }).then(function(passingResult){
                    if (passingResult != ""){
                        passingResult.forEach((entry)=>{   
                            if (entry._player1 == user._mentionValue){
                                wins = wins + 1
                            }
                            else if (entry._player2 == user._mentionValue){
                                losses = losses + 1
                            }
                            else if (entry._player3 == user._mentionValue){
                                losses = losses + 1
                            }
                            else if (entry._player4 == user._mentionValue){
                                losses = losses + 1
                            }
                        })
                        passedArray.push(user,wins,losses, seasonName)
                    }else{
                        resolve("Can't find deck")
                    }
                    
                })
                
            }).then(function(){
                resolve(passedArray)
            })
        })
    }
}