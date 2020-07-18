const Discord = require('discord.js')
const { resolve } = require('path')
const { rejects } = require('assert')
const { currentDeck } = require('../objects/User')



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
    }
}