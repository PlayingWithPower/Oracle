const User = require('../Schema/Users')
const Matches = require('../Schema/Games')
const { match } = require('assert')

module.exports = {
    async checkRegister(mentionValue, receivedMessage){
        return new Promise((resolve, reject)=>{
            
            var found = 0
            var notFound = 1
            let findQuery = {_mentionValue: mentionValue[0], _server: mentionValue[1].guild.id}
            User.findOne(findQuery, function(err, res){
                if (res) {
                    resolve(found)
                    }
                else{
                    resolve(notFound)
                }
            })
        })
    },
    async checkDeck(mentionValue, receivedMessage){
        return new Promise((resolve, reject)=>{
            var found = 0
            var notFound = 1
            let findQuery = {_mentionValue: mentionValue[0], _server: mentionValue[1].guild.id}
            User.findOne(findQuery, function(err, res){
                if (res._currentDeck != "None") {
                    resolve(found)
                    }
                else{
                    resolve(notFound)
                }
            })
        })
    },
    async checkMatchID(guild, matchID){
        let matchQuery = {_match_id: matchID, _server: guild}
        return new Promise((resolve, reject)=>{
            Matches.find(matchQuery, function(err,res){
                if (res.length > 0){
                    // let s4 = () => {
                    //     return Math.floor((1 + Math.random()) * 0x1000).toString(16).substring(1);
                    // }
                    // console.log("ran")
                    // let id = s4() + s4() + s4() + s4()
                    // module.exports.checkMatchID(guild, id)

                    // console.log(id)
                }
                else{
                    resolve("Not found")
                }
            })
        })
    }
}