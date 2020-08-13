const bootstrap = require('../bootstrap.js')
module.exports = {
    /**
     * getChannelID()
     * @param {Discord Message Object} receivedMessage Message user submitted
     *
     * @returns Discord Channel obj to send message to
     */
    getChannelID(receivedMessage) {
        return bootstrap.client.channels.cache.get(receivedMessage.channel.id)
    }
}