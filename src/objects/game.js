/**
 * Game Object
 *
 * Holds all functionality to record matches (games).
 *
 * Steps:
 * 1. Log match, (creates match number, sets pending status, and adds 4 users in pending status)
 * 2. Confirm Match (each user confirms their standings in the match.  This is called 4 times total)
 * 3. Commit Match (this puts the match into an accepted status and performs match calculations)
 */
const bootstrap = require('../bootstrap.js')

module.exports = {

  async logWinner (id, receivedMessage) {
    const findQuery = { _mentionValue: id, _server: receivedMessage.guild.id }
    const res = await bootstrap.User.findOne(findQuery)
    if (res) {
      return '**' + id + "**'s won. Check !profile to see your update score"
    } else {
      // eslint-disable-next-line no-throw-literal
      throw 'PLAYER NOT FOUND'
    }
  },

  async logLoser (id, receivedMessage) {
    const findQuery = { _mentionValue: id, _server: receivedMessage.guild.id }
    const res = await bootstrap.User.findOne(findQuery)
    if (res) {
      return '**' + id + "**'s lost. Check !profile to see your update score"
    } else {
      // eslint-disable-next-line no-throw-literal
      throw 'PLAYER NOT FOUND'
    }
  },

  async logMatch (id, receivedMessage) {
    const findQuery = { _match_id: id, _Status: 'STARTED' }
    const res = await bootstrap.Game.findOne(findQuery)
    if (res) {
      const promises = await Promise.all([
        module.exports.logWinner(res._player1, receivedMessage),
        module.exports.logLoser(res._player2, receivedMessage),
        module.exports.logLoser(res._player3, receivedMessage),
        module.exports.logLoser(res._player4, receivedMessage)
      ])
      return promises
    } else {
      // eslint-disable-next-line no-throw-literal
      throw 'NO GAME'
    }
  },
  /**
     * Confirms match against for user.
     */
  async confirmMatch (id, player) {
    const findQuery = { _match_id: id }

    const res = await bootstrap.Game.findOne(findQuery)
    if (res) {
      if (res._player1Confirmed === 'N' && res._player1 === player) {
        const result = await bootstrap.Game.updateOne(findQuery, { $set: { _player1Confirmed: 'Y' } })
        if (result) {
          return 'SUCCESS'
        } else {
          // eslint-disable-next-line no-throw-literal
          throw '1'
        }
      } else if (res._player2Confirmed === 'N' && res._player2 === player) {
        const result = await bootstrap.Game.updateOne(findQuery, { $set: { _player2Confirmed: 'Y' } })
        if (result) {
          return 'SUCCESS'
        } else {
          // eslint-disable-next-line no-throw-literal
          throw '2'
        }
      } else if (res._player3Confirmed === 'N' && res._player3 === player) {
        const result = await bootstrap.Game.updateOne(findQuery, { $set: { _player3Confirmed: 'Y' } })
        if (result) {
          return 'SUCCESS'
        } else {
          // eslint-disable-next-line no-throw-literal
          throw '3'
        }
      } else if (res._player4Confirmed === 'N' && res._player4 === player) {
        const result = await bootstrap.Game.updateOne(findQuery, { $set: { _player4Confirmed: 'Y' } })
        if (result) {
          return 'SUCCESS'
        } else {
          // eslint-disable-next-line no-throw-literal
          throw '4'
        }
      } else {
        throw player
      }
    } else {
      // eslint-disable-next-line no-throw-literal
      throw 'NO PLAYER FOUND'
    }
  },
  /**
     * Check if all players have confirmed
     *
     */
  async checkMatch (id) {
    const findQuery = { _match_id: id }
    const res = await bootstrap.Game.findOne(findQuery)
    if (res) {
      if (res._player1Confirmed === 'Y' && res._player2Confirmed === 'Y' && res._player3Confirmed === 'Y' && res._player4Confirmed === 'Y') {
        return 'SUCCESS'
      } else {
        // eslint-disable-next-line no-throw-literal
        throw 'Match Not Confirmed'
      }
    } else {
      // console.log ("Match #:" + id + " not found")
    }
  },
  /**
     * Creates match
     */
  async findUserDeck (id, receivedMessage) {
    const findQuery = { _mentionValue: id, _server: receivedMessage.guild.id }
    const res = await bootstrap.User.findOne(findQuery)
    if (res) {
      return res._currentDeck
    } else {
      // eslint-disable-next-line no-throw-literal
      throw 'ERROR'
    }
  },
  async createMatch (player1, player2, player3, player4, id, receivedMessage, callback) {
    const currentSeasonObj = await bootstrap.SeasonHelper.getCurrentSeason(receivedMessage.guild.id)
    const currentSeasonName = currentSeasonObj._season_name

    let player1R = 'None'
    let player2R = 'None'
    let player3R = 'None'
    let player4R = 'None'

    const [deck1, deck2, deck3, deck4] = Promise.all([
      module.exports.findUserDeck(player1, receivedMessage),
      module.exports.findUserDeck(player2, receivedMessage),
      module.exports.findUserDeck(player3, receivedMessage),
      module.exports.findUserDeck(player4, receivedMessage)
    ])

    let player1Deck = deck1
    let player2Deck = deck2
    let player3Deck = deck3
    let player4Deck = deck4

    let deckTest = deck1.split(' | ')
    if (deckTest[1] === 'Rogue') {
      player1R = deckTest[0]
      player1Deck = deckTest[1]
    }
    deckTest = deck2.split(' | ')
    if (deckTest[1] === 'Rogue') {
      player2R = deckTest[0]
      player2Deck = deckTest[1]
    }
    deckTest = deck3.split(' | ')
    if (deckTest[1] === 'Rogue') {
      player3R = deckTest[0]
      player3Deck = deckTest[1]
    }
    deckTest = deck4.split(' | ')
    if (deckTest[1] === 'Rogue') {
      player4R = deckTest[0]
      player4Deck = deckTest[1]
    }
    const matchSave = {
      _match_id: id,
      _server: receivedMessage.guild.id,
      _season: currentSeasonName,
      _player1: player1,
      _player2: player2,
      _player3: player3,
      _player4: player4,
      _player1Deck: player1Deck,
      _player2Deck: player2Deck,
      _player3Deck: player3Deck,
      _player4Deck: player4Deck,
      _Status: 'STARTED',
      _player1Confirmed: 'N',
      _player2Confirmed: 'N',
      _player3Confirmed: 'N',
      _player4Confirmed: 'N',
      _player1Rogue: player1R,
      _player2Rogue: player2R,
      _player3Rogue: player3R,
      _player4Rogue: player4R
    }
    const result = await bootstrap.Game(matchSave).save()
    if (result) {
      // console.log("Successfully created Game #" + id)
      // eslint-disable-next-line standard/no-callback-literal
      callback('SUCCESS')
    } else {
      console.log('Game creation failed for Game #' + id)
      // eslint-disable-next-line standard/no-callback-literal
      callback('FAILURE')
    }
  },

  /**
     * Deletes an unconfirmed match
     */
  async deleteMatch (id, receivedMessage) {
    const currentSeasonObj = await bootstrap.SeasonHelper.getCurrentSeason(receivedMessage.guild.id)
    const currentSeasonName = currentSeasonObj._season_name
    const server = receivedMessage.guild.id
    const findQuery = { _match_id: id, _server: server, _season: currentSeasonName }
    const res = await bootstrap.Game.findOne(findQuery)
    if (res) {
      return 'CONFIRM'
    } else {
      // eslint-disable-next-line no-throw-literal
      throw 'ERROR'
    }
  },

  async confirmedDeleteMatch (id, receivedMessage) {
    const currentSeasonObj = await bootstrap.SeasonHelper.getCurrentSeason(receivedMessage.guild.id)
    const currentSeasonName = currentSeasonObj._season_name
    const server = receivedMessage.guild.id

    const findQuery = { _match_id: id, _server: server, _season: currentSeasonName }
    const res = await bootstrap.Game.findOne(findQuery)
    if (res) {
      await bootstrap.Game.deleteOne(findQuery)
      return 'SUCCESS'
    } else {
      // eslint-disable-next-line no-throw-literal
      throw 'ERROR'
    }
  },

  /**
     * Display info about a match
     */
  async matchInfo (id, receivedMessage) {
    const currentSeasonObj = await bootstrap.SeasonHelper.getCurrentSeason(receivedMessage.guild.id)
    const currentSeasonName = currentSeasonObj._season_name
    const matchId = id
    const serverId = receivedMessage.guild.id

    const findQuery = { _match_id: matchId, _server: serverId, _season: currentSeasonName }
    const res = await bootstrap.Game.findOne(findQuery)
    if (res) {
      const timestamp = res._id.toString().substring(0, 8)
      const date = new Date(parseInt(timestamp, 16) * 1000)

      let status
      if (res._Status === 'FINISHED') {
        status = 'Finished Match'
      }
      if (res._Status === 'CLOSED') {
        status = 'Disputed Match'
      }
      if (res._Status === 'STARTED') {
        status = 'Pending Match'
      }

      return [
        date,
        res._match_id,
        res._server,
        res._season,
        res._player1,
        res._player2,
        res._player3,
        res._player4,
        res._player1Deck,
        res._player2Deck,
        res._player3Deck,
        res._player4Deck,
        status
      ]
    } else {
      // eslint-disable-next-line no-throw-literal
      throw 'FAIL'
    }
  },

  /**
     *  returns a 2D array of players and their respective confirmed value (Y or N)
     */
  async getRemindInfo (player, serverId) {
    const currentSeasonObj = await bootstrap.SeasonHelper.getCurrentSeason(serverId)
    const currentSeasonName = currentSeasonObj._season_name

    const findQuery = {
      $and: [
        {
          _server: serverId,
          _season: currentSeasonName,
          _Status: 'STARTED'
        },
        {
          $or: [
            { _player1: player },
            { _player2: player },
            { _player3: player },
            { _player4: player }
          ]
        }
      ]
    }
    const res = await bootstrap.Game.findOne(findQuery)
    if (res) {
      return [
        [res._player1, res._player1Confirmed],
        [res._player2, res._player2Confirmed],
        [res._player3, res._player3Confirmed],
        [res._player4, res._player4Confirmed]
      ]
    } else {
      // eslint-disable-next-line no-throw-literal
      throw []
    }
  },
  async finishMatch (id, message) {
    const findQuery = { _match_id: id, _server: message.guild.id }
    const res = await bootstrap.Game.findOne(findQuery)
    if (res) {
      if (res._Status === 'STARTED') {
        const newStatus = { $set: { _Status: 'FINISHED' } }
        const result = await bootstrap.Game.updateOne(findQuery, newStatus)
        if (result) {
          return 'SUCCESS'
        } else {
          // eslint-disable-next-line no-throw-literal
          throw 'FAIL FINISH'
        }
      } else {
        return 'CLOSED'
      }
    } else {
      // eslint-disable-next-line no-throw-literal
      throw 'FAIL FIND'
    }
  },
  async closeMatch (id) {
    const findQuery = { _match_id: id, _Status: 'STARTED' }
    const res = await bootstrap.Game.findOne(findQuery)
    if (res) {
      const newStatus = { $set: { _Status: 'CLOSED' } }
      const result = await bootstrap.Game.updateOne(findQuery, newStatus)
      if (result) {
        return 'SUCCESS'
      } else {
        // eslint-disable-next-line no-throw-literal
        throw 'FAIL CLOSE'
      }
    } else {
      // eslint-disable-next-line no-throw-literal
      throw 'FAIL FIND'
    }
  },
  async getPending (guild, disputedTag) {
    const seasonObj = await bootstrap.SeasonHelper.getCurrentSeason(guild)
    const seasonName = seasonObj._season_name

    let statusSearch = 'STARTED'

    if (disputedTag === 'Disputed') {
      statusSearch = 'CLOSED'
    }
    const matchQuery = { _server: guild, _season: seasonName }
    const foundMatches = await bootstrap.Game.find(matchQuery)
    if (foundMatches) {
      const pending = foundMatches.filter(match => match._Status === statusSearch)
      if (pending.length > 0) {
        return pending
      } else {
        return 'No Pending'
      }
    } else {
      return 'No Matches'
    }
  },
  async forceAccept (matchID, guild) {
    const seasonObj = await bootstrap.SeasonHelper.getCurrentSeason(guild)
    const seasonName = seasonObj._season_name

    const findQuery = { _server: guild, _season: seasonName, _match_id: matchID }

    const res = await bootstrap.Game.findOne(findQuery)
    if (res) {
      if (res._Status === 'STARTED' || res._Status === 'CLOSED') {
        const toUpdate = { $set: { _Status: 'FINISHED' } }
        const update = await bootstrap.Game.updateOne(findQuery, toUpdate)
        if (update) {
          return 'Success'
        } else {
          return 'Error'
        }
      } else {
        return 'Match is already accepted'
      }
    } else {
      return "Can't find match"
    }
  }

}
