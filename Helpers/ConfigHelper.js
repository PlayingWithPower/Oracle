const bootstrap = require('../bootstrap')

module.exports = {
    async checkAdminPrivs(receivedMessage){
        return new Promise (async (resolve, reject)=>{
            let configGet = await bootstrap.LeagueObj.configGet(receivedMessage.guild.id);
            let isAdmin = this.isUserAdmin(receivedMessage, configGet._admin);
            resolve(isAdmin)
        })
    },
    /**
     * isUserAdmin()
     * @param {*} receivedMessage
     *
     * Simple check for issuer admin rights.
     * @param roleName
     */
   isUserAdmin(receivedMessage, roleName)
   {
       // Admin check from issuer.
       let isAdmin = receivedMessage.member.roles.cache.some(role => role.name === roleName);
        if (!isAdmin){
            if (receivedMessage.member.hasPermission("ADMINISTRATOR")){
                isAdmin = true
            }
        }
       return isAdmin;
   },
   async getDeckThreshold(guild){
       return new Promise (async (resolve, reject)=>{
            let configGet = await bootstrap.LeagueObj.configGet(guild);
            resolve(configGet)
       })
   }
}