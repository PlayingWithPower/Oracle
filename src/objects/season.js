const bootstrap = require('../bootstrap')

/**
 * Season Object
 *
 * Season commands and data
 */

module.exports = {

  /**
     * Starts a new season
     */
  async startSeason (receivedMessage, args) {
    let currentDate = new Date()
    currentDate = currentDate.toLocaleString('en-US', { timeZone: 'America/New_York' })

    const getSeasonReturn = await bootstrap.SeasonHelper.getCurrentSeason(receivedMessage.guild.id)
    const newSeasonNameReturn = await bootstrap.SeasonHelper.newSeasonName(receivedMessage.guild.id)
    const seasonName = newSeasonNameReturn.toString()

    const checkCurrent = {
      _server: getSeasonReturn._server,
      _season_name: getSeasonReturn._season_name
    }
    return new Promise((resolve, reject) => {
      bootstrap.Season.findOne(checkCurrent, function (err, result) {
        if (err) {
          resolve('Error 1')
        }
        if (result) {
          if ((result._season_end === 'Not Specified') || (new Date(result._season_end) >= currentDate)) {
            const ongoingSeasonArr = []
            ongoingSeasonArr.push('Season Ongoing', result._season_start, result._season_end, result._season_name, currentDate)
            resolve(ongoingSeasonArr)
          } else {
            const newSeason = {
              _server: receivedMessage.guild.id,
              _season_name: seasonName,
              _season_start: currentDate,
              _season_end: 'Not Specified'
            }
            bootstrap.Season(newSeason).save(function (err, otherRes) {
              if (err) {
                resolve('Error 2')
              }
              const successSave = []
              successSave.push('Successfully Saved', currentDate, 'Not Specified', seasonName)
              resolve(successSave)
            })
          }
        } else {
          const newSeason = {
            _server: receivedMessage.guild.id,
            _season_name: seasonName,
            _season_start: currentDate,
            _season_end: 'Not Specified'
          }
          bootstrap.Season(newSeason).save(function (err, otherRes) {
            if (err) {
              resolve('Error 2')
            }
            const seasonArr = []
            seasonArr.push('Successfully Saved', currentDate, 'Not Specified', seasonName)
            resolve(seasonArr)
          })
        }
      })
    })
  },

  /**
     * Ends the current Season
     */
  async endSeason (receivedMessage, args) {
    let currentDate = new Date()
    currentDate = currentDate.toLocaleString('en-US', { timeZone: 'America/New_York' })

    const currentSeason = await bootstrap.SeasonHelper.getCurrentSeason(receivedMessage.guild.id)
    const seasonUpdateRes = await bootstrap.Season.updateOne(currentSeason, { $set: { _season_end: currentDate } })
    if (seasonUpdateRes) {
      return ['Success', currentSeason, currentDate]
    }
  },

  /**
     * Sets a pre-determined start date for the season.  This creates an "automatic start" of the league, without
     * having to manually start it.
     */
  setStartDate () {

  },

  /**
     * Sets a pre-determined end date for the season.  This creates an "automatic end" of the league, without having
     * to manually end it.
     */
  async setEndDate (receivedMessage, date) {
    const currentSeason = await bootstrap.SeasonHelper.getCurrentSeason(receivedMessage.guild.id)
    date = date.toLocaleString('en-US', { timeZone: 'America/New_York' })
    const seasonUpdateRes = await bootstrap.Season.updateOne(currentSeason, { $set: { _season_end: date } })
    if (seasonUpdateRes) {
      return ['Success', currentSeason._season_name]
    }
  },

  /**
     * Summary info for the season
     */
  async getInfo (receivedMessage, args) {
    if (args === 'Current') {
      const seasonReturn = await bootstrap.SeasonHelper.getCurrentSeason(receivedMessage.guild.id)
      const userQuery = { _server: receivedMessage.guild.id }
      const matchQuery = { _server: receivedMessage.guild.id, _season: seasonReturn._season_name, _Status: 'FINISHED' }
      const userRes = await bootstrap.User.find(userQuery)
      if (userRes) {
        const matchRes = await bootstrap.Game.find(matchQuery)
        if (matchRes) {
          return [seasonReturn, userRes.length, matchRes.length]
        } else {
          return "Can't Find Season"
        }
      } else {
        return "Can't Find Season"
      }
    } else {
      let seasonQuery
      const userQuery = { _server: receivedMessage.guild.id }
      let matchQuery
      if (args.toLowerCase() === 'all') {
        seasonQuery = { _server: receivedMessage.guild.id }
        matchQuery = { _server: receivedMessage.guild.id, _Status: 'FINISHED' }
      } else {
        seasonQuery = { _server: receivedMessage.guild.id, _season_name: args }
        matchQuery = { _server: receivedMessage.guild.id, _season: args, _Status: 'FINISHED' }
      }
      const seasonRes = await bootstrap.Season.find(seasonQuery)
      if (seasonRes.length > 0) {
        const userRes = await bootstrap.User.find(userQuery)
        if (userRes) {
          const matchRes = await bootstrap.Game.find(matchQuery)
          if (matchRes) {
            return [seasonRes, userRes.length, matchRes.length]
          } else {
            return "Can't Find Season"
          }
        } else {
          return "Can't Find Season"
        }
      } else {
        return "Can't Find Season"
      }
    }
  },

  /**
     * Get leaderboard info for a number of different data points
     * Top games, score, winrate
     */
  async leaderBoard (receivedMessage) {
    const userQuery = { _server: receivedMessage.guild.id }
    const res = await bootstrap.User.find(userQuery)
    if (res) {
      return res
    } else {
      return 'Error 1'
    }
  },
  /**
     * Sets the season name
     */
  async setSeasonName (receivedMessage, args) {
    const currentSeason = await bootstrap.SeasonHelper.getCurrentSeason(receivedMessage.guild.id)
    if (currentSeason !== 'No Current') {
      const res = await bootstrap.Season.findOne({ _server: receivedMessage.guild.id, _season_name: args.join(' ') })
      if (res) {
        return 'Name in use'
      } else {
        const seasonUpdateRes = await bootstrap.Season.updateOne(currentSeason, { $set: { _season_name: args.join(' ') } })
        if (seasonUpdateRes) {
          const updateMatches = {
            _server: receivedMessage.guild.id,
            _season: currentSeason._season_name
          }
          const matchUpdateRes = await bootstrap.Game.updateMany(updateMatches, { $set: { _season: args.join(' ') } })
          if (matchUpdateRes) {
            const deckUpdateRes = await bootstrap.Deck.updateMany(updateMatches, { $set: { _season: args.join(' ') } })
            if (deckUpdateRes) {
              return ['Success', currentSeason._season_name, args.join(' ')]
            }
          }
        }
      }
    } else {
      return 'No Current'
    }
  }
}
