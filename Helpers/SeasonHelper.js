const Discord = require('discord.js')
const { resolve } = require('path')
const { rejects } = require('assert')



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
                    console.log(entry._season_end)
                    if ((entry._season_end == "Not Specified") || (new Date(entry._season_end) >= new Date(currentDate))){
                        currentSeasonObj = entry
                    }
                })
            }).then(function(){
                if (currentSeasonObj !== undefined){
                    resolve(currentSeasonObj)
                }
                else{
                    console.log("no current")
                    currentSeasonObj = "No Current"
                    resolve(currentSeasonObj)
                }
                
            })
            
        })
        
    }
}