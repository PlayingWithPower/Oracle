const Discord = require('discord.js')
const client = new Discord.Client()
const leagueObj = require('../objects/League')

module.exports = {
    async checkAdminPrivs(receivedMessage){
        return new Promise (async (resolve, reject)=>{
            let configGet = await leagueObj.configGet(receivedMessage.guild.id)
            let isAdmin = this.isUserAdmin(receivedMessage, configGet._admin)
            resolve(isAdmin)
        })
    },
    /**
    * isUserAdmin()
    * @param {*} receivedMessage 
    * 
    * Simple check for issuer admin rights.
    */
   isUserAdmin(receivedMessage, roleName)
   {
       // Admin check from issuer.
       let isAdmin = receivedMessage.member.roles.cache.some(role => role.name === roleName);

       return isAdmin;
   },
}