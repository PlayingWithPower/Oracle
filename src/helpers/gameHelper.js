const bootstrap = require('../bootstrap')

module.exports = {
  async checkRegister (mentionValue, receivedMessage) {
    const findQuery = { _mentionValue: mentionValue[0], _server: mentionValue[1].guild.id }
    const res = await bootstrap.User.findOne(findQuery)
    return res
  },
  async checkDeck (mentionValue, receivedMessage) {
    const found = 0
    const notFound = 1
    const invalidDeckSet = 2
    const findQuery = { _mentionValue: mentionValue[0], _server: mentionValue[1].guild.id }
    const res = await bootstrap.User.findOne(findQuery)
    if (res._currentDeck !== 'None') {
      if (res._currentDeck.slice(-8) === ' | Rogue') {
        return found
      }
      const deckQuery = { _server: mentionValue[1].guild.id, _name: res._currentDeck }
      const res1 = bootstrap.Deck.find(deckQuery)
      if (res1.length > 0) {
        return found
      }
      return invalidDeckSet
    }
    return notFound
  },
  async checkMatchID (guild, matchID) {
    const matchQuery = { _match_id: matchID, _server: guild }
    const res = await bootstrap.Game.find(matchQuery)
    if (!res || res.length <= 0) {
      return 'Not found'
    }
    // let s4 = () => {
    //     return Math.floor((1 + Math.random()) * 0x1000).toString(16).substring(1);
    // }
    // console.log("ran")
    // let id = s4() + s4() + s4() + s4()
    // module.exports.checkMatchID(guild, id)

    // console.log(id)
  }
}
