require('dotenv').config()

module.exports = {
  clientId: process.env.clientId,
  discordKey: process.env.discordKey,
  mongoConnectionUrl: process.env.mongoConnectionUrl
}
