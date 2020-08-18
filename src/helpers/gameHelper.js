const bootstrap = require('../bootstrap')

module.exports = {
  async checkRegister (mentionValue, receivedMessage) {
    return new Promise((resolve, reject) => {
      const found = 0
      const notFound = 1
      const findQuery = { _mentionValue: mentionValue[0], _server: mentionValue[1].guild.id }
      bootstrap.User.findOne(findQuery, function (err, res) {
        if (res) {
          resolve(found)
        } else {
          resolve(notFound)
        }
      })
    })
  },
  async checkDeck (mentionValue, receivedMessage) {
    return new Promise((resolve, reject) => {
      const found = 0
      const notFound = 1
      const invalidDeckSet = 2
      const findQuery = { _mentionValue: mentionValue[0], _server: mentionValue[1].guild.id }
      bootstrap.User.findOne(findQuery, function (err, res) {
        if (res._currentDeck !== 'None') {
          if (res._currentDeck.slice(-8) === ' | Rogue') {
            resolve(found)
          } else {
            const deckQuery = { _server: mentionValue[1].guild.id, _name: res._currentDeck }
            bootstrap.Deck.find(deckQuery, function (err, res) {
              if (res.length > 0) {
                resolve(found)
              } else {
                resolve(invalidDeckSet)
              }
            })
          }
        } else {
          resolve(notFound)
        }
      })
    })
  },
  async checkMatchID (guild, matchID) {
    const matchQuery = { _match_id: matchID, _server: guild }
    return new Promise((resolve, reject) => {
      bootstrap.Game.find(matchQuery, function (err, res) {
        if (res.length > 0) {
          // let s4 = () => {
          //     return Math.floor((1 + Math.random()) * 0x1000).toString(16).substring(1);
          // }
          // console.log("ran")
          // let id = s4() + s4() + s4() + s4()
          // module.exports.checkMatchID(guild, id)

          // console.log(id)
        } else {
          resolve('Not found')
        }
      })
    })
  }
}
