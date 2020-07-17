const Discord = require('discord.js')
const client = new Discord.Client()

module.exports = {
    getChannelID(receivedMessage) {
        return new Promise((resolve, reject)=>{
            client.channels.cache.get(receivedMessage.channel.id)
        }) 
    }
}