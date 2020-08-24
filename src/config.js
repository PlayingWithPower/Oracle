require('dotenv').config()

module.exports = {
  clientId: process.env.DISCORD_CLIENT_ID,
  discordKey: process.env.DISCORD_TOKEN,
  mongoConnectionUrl: process.env.MONGO_CONNECTION_URL
}
