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
    return new Promise((resolve, reject) => {
      bootstrap.Season.updateOne(currentSeason, { $set: { _season_end: currentDate } }, function (err, seasonUpdateRes) {
        if (seasonUpdateRes) {
          const resolveArr = []
          resolveArr.push('Success', currentSeason, currentDate)
          resolve(resolveArr)
        }
      })
    })
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
    return new Promise((resolve, reject) => {
      bootstrap.Season.updateOne(currentSeason, { $set: { _season_end: date } }, function (err, seasonUpdateRes) {
        if (seasonUpdateRes) {
          const resolveArr = []
          resolveArr.push('Success', currentSeason._season_name)
          resolve(resolveArr)
        }
      })
    })
  },

  /**
     * Summary info for the season
     */
  async getInfo (receivedMessage, args) {
    if (args === 'Current') {
      const seasonReturn = await bootstrap.SeasonHelper.getCurrentSeason(receivedMessage.guild.id)
      const userQuery = { _server: receivedMessage.guild.id }
      const matchQuery = { _server: receivedMessage.guild.id, _season: seasonReturn._season_name, _Status: 'FINISHED' }
      const resolveArr = []
      return new Promise((resolve, reject) => {
        resolveArr.push(seasonReturn)
        bootstrap.User.find(userQuery, function (err, userRes) {
          if (userRes) {
            resolveArr.push(userRes.length)
            bootstrap.Game.find(matchQuery, function (err, matchRes) {
              if (matchRes) {
                resolveArr.push(matchRes.length)
                resolve(resolveArr)
              } else {
                resolve("Can't Find Season")
              }
            })
          } else {
            resolve("Can't Find Season")
          }
        })
      })
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
      return new Promise((resolve, reject) => {
        const resolveArr = []
        bootstrap.Season.find(seasonQuery, function (err, seasonRes) {
          if (seasonRes.length > 0) {
            resolveArr.push(seasonRes)
            bootstrap.User.find(userQuery, function (err, userRes) {
              if (userRes) {
                resolveArr.push(userRes.length)
                bootstrap.Game.find(matchQuery, function (err, matchRes) {
                  if (matchRes) {
                    resolveArr.push(matchRes.length)
                    resolve(resolveArr)
                  } else {
                    resolve("Can't Find Season")
                  }
                })
              } else {
                resolve("Can't Find Season")
              }
            })
          } else {
            resolve("Can't Find Season")
          }
        })
      })
    }
  },

  /**
     * Get leaderboard info for a number of different data points
     * Top games, score, winrate
     */
  leaderBoard (receivedMessage) {
    const userQuery = { _server: receivedMessage.guild.id }
    return new Promise(async (resolve, reject) => {
      bootstrap.User.find(userQuery, function (err, res) {
        if (res) {
          resolve(res)
        } else {
          resolve('Error 1')
        }
      })
    })
  },
  /**
     * Sets the season name
     */
  async setSeasonName (receivedMessage, args) {
    const currentSeason = await bootstrap.SeasonHelper.getCurrentSeason(receivedMessage.guild.id)
    return new Promise((resolve, reject) => {
      if (currentSeason !== 'No Current') {
        bootstrap.Season.findOne({ _server: receivedMessage.guild.id, _season_name: args.join(' ') }, function (err, res) {
          if (res) {
            resolve('Name in use')
          } else {
            bootstrap.Season.updateOne(currentSeason, { $set: { _season_name: args.join(' ') } }, function (err, seasonUpdateRes) {
              if (seasonUpdateRes) {
                const updateMatches = {
                  _server: receivedMessage.guild.id,
                  _season: currentSeason._season_name
                }
                bootstrap.Game.updateMany(updateMatches, { $set: { _season: args.join(' ') } }, function (err, matchUpdateRes) {
                  if (matchUpdateRes) {
                    bootstrap.Deck.updateMany(updateMatches, { $set: { _season: args.join(' ') } }, function (err, deckUpdateRes) {
                      if (deckUpdateRes) {
                        const resolveArr = []
                        resolveArr.push('Success', currentSeason._season_name, args.join(' '))
                        resolve(resolveArr)
                      }
                    })
                  }
                })
              }
            })
          }
        })
      } else {
        resolve('No Current')
      }
    })
  }
}
