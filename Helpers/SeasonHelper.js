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
                    if ((entry._season_end == "Not Specified") || (new Date(entry._season_end) >= new Date(currentDate))){
                        currentSeasonObj = res
                    }
                })
                if (currentSeasonObj._season_end !== undefined){
                    console.log(currentSeasonObj)
                }
            })
            resolve(currentSeasonObj)
        })
        
    }
}