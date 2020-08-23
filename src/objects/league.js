const bootstrap = require('../bootstrap.js')

/**
 * League Object
 *
 * Holds league commands, and configuration getters/setters.
 *
 * Configurations available:
 *  - Player Threshold (minimum matches before a player appears on the leaderboard)
 *  - Deck Threshold (mimimum matches before a deck appears on the leaderboard)
 *  - Timeout (how long before a match is considered timed out and nullified)
 *  - Alias Required (this setting allows you to require a deck alias when registering a user deck)
 *  - Admin (users who have admin privileges on your server)
 */
module.exports = {
  /**
     * Register a new user to the league.
     */
  async register (receivedMessage) {
    const findQuery = {
      _mentionValue: receivedMessage.author.id,
      _server: receivedMessage.guild.id
    }
    const toSave = {
      _mentionValue: receivedMessage.author.id,
      _server: receivedMessage.guild.id,
      _name: receivedMessage.author.username,
      _currentDeck: 'None',
      _elo: 1000,
      _wins: 0,
      _losses: 0,
      _deck: {
        _id: 0,
        Deck: 'Default Deck. Ignore.',
        Wins: 1,
        Losses: 1
      }
    }
    const res = await bootstrap.User.findOne(findQuery)
    if (res) {
      return 'Already Registered'
    } else {
      const result = await bootstrap.User(toSave).save()
      if (result) {
        return 'Success'
      } else {
        return 'Error'
      }
    }
  },

  /**
     * Sets a configuration
     */
  async configSet (receivedMessage, args) {
    const argsWithCommas = args.toString()
    const argsWithSpaces = argsWithCommas.replace(/,/g, ' ')
    const splitArgs = argsWithSpaces.split(' | ')
    splitArgs[0] = splitArgs[0].toLowerCase()

    let conditionalQuery
    let playerThreshold = 10
    let deckThreshold = 10
    let timeout = 60
    let admin = ''
    let adminList
    if ((splitArgs[0] !== 'player threshold') && (splitArgs[0] !== 'deck threshold') &&
          (splitArgs[0] !== 'timeout') && (splitArgs[0] !== 'admin')) {
      return 'Invalid Input'
    } else if (splitArgs.length === 1) {
      return 'Invalid Input'
    } else {
      if ((splitArgs[0] === 'player threshold')) {
        if (parseInt(splitArgs[1])) {
          if (!isNaN(splitArgs[1])) {
            conditionalQuery = {
              _server: receivedMessage.guild.id,
              $set: {
                _player_threshold: splitArgs[1]
              }
            }
            playerThreshold = splitArgs[1]
          }
        }
      } else if ((splitArgs[0] === 'deck threshold')) {
        if (parseInt(splitArgs[1])) {
          if (!isNaN(splitArgs[1])) {
            conditionalQuery = {
              _server: receivedMessage.guild.id,
              $set: {
                _deck_threshold: splitArgs[1]
              }
            }
            deckThreshold = splitArgs[1]
          }
        }
      } else if ((splitArgs[0] === 'timeout')) {
        if (parseInt(splitArgs[1])) {
          if (!isNaN(splitArgs[1])) {
            if (splitArgs[1] > 60) {
              return 'Timeout too large'
            } else {
              conditionalQuery = {
                _server: receivedMessage.guild.id,
                $set: {
                  _timeout: splitArgs[1]
                }
              }
              timeout = splitArgs[1]
            }
          }
        }
      } else if ((splitArgs[0] === 'admin')) {
        adminList = splitArgs[1]
        adminList = adminList.replace(/ {2}/g, ', ')
        conditionalQuery = {
          _server: receivedMessage.guild.id,
          _admin: adminList
        }
        admin = adminList
      } else {
        return 'Invalid Input'
      }
      const newSave = {
        _server: receivedMessage.guild.id,
        _player_threshold: playerThreshold,
        _deck_threshold: deckThreshold,
        _timeout: timeout,
        _admin: admin
      }
      const res = await bootstrap.Config.updateOne({ _server: receivedMessage.guild.id }, conditionalQuery)
      if (res.n > 0) {
        let savedValue = splitArgs[1]
        if (splitArgs[0] === 'admin') {
          savedValue = adminList
        }
        return ['Updated', splitArgs[0], savedValue]
      } else {
        await bootstrap.Config(newSave).save({ _server: receivedMessage.guild.id })
        if (res) {
          let savedValue = splitArgs[1]
          if (splitArgs[0] === 'admin') {
            savedValue = adminList
          }
          return ['New Save', splitArgs[0], savedValue]
        } else {
          return 'Error'
        }
      }
    }
  },

  /**
     * gets a configuration
     */
  async configGet (guild) {
    const checkForConfig = { _server: guild }
    const foundRes = await bootstrap.Config.findOne(checkForConfig)
    if (foundRes) {
      return foundRes
    } else {
      return 'No configs'
    }
  }
}
