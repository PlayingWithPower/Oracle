const bootstrap = require('../bootstrap')

module.exports = {
  async getCurrentSeason (guild) {
    const currentDate = new Date()
    const query = {
      _server: guild
    }
    let currentSeasonObj
    const res = await bootstrap.Season.find(query)
    res.forEach((entry) => {
      if ((entry._season_end === 'Not Specified') || (new Date(entry._season_end) >= currentDate)) {
        currentSeasonObj = entry
      }
    })
    if (currentSeasonObj !== undefined) {
      return currentSeasonObj
    }
    currentSeasonObj = 'No Current'
    return currentSeasonObj
  },
  async newSeasonName (guild) {
    const query = {
      _server: guild
    }
    const res = await bootstrap.Season.find(query)
    return res.length + 1
  },
  async lookUpUsers (users) {
    const seasonObj = await module.exports.getCurrentSeason(users[1])
    let seasonName = seasonObj._season_name

    if (users[2] !== undefined) {
      seasonName = users[2]
    }

    const matchResults = []
    const season = seasonName
    const server = users[1]
    const personLookedUp = users[0]
    const getWinnersQuery = {
      _server: server,
      _season: season,
      _Status: 'FINISHED',
      $or: [
        { _player1: personLookedUp },
        { _player2: personLookedUp },
        { _player3: personLookedUp },
        { _player4: personLookedUp }
      ]
    }
    const passingResult = await bootstrap.Game.find(getWinnersQuery)
    if (!passingResult || passingResult.length <= 0) {
      return "Can't find deck"
    }
    for (let i = 0; i < passingResult.length; i++) {
      let pasRes = passingResult[i]._player1
      const exists = matchResults.find(el => el[0] === pasRes)
      if (passingResult[i]._player1 === personLookedUp) {
        if (exists) {
          exists[1] += 1
        } else {
          matchResults.push([pasRes, 1, 0])
        }
      }

      pasRes = passingResult[i]._player2
      if (passingResult[i]._player2 === personLookedUp) {
        const exists2 = matchResults.find(el => el[0] === pasRes)
        if (exists2) {
          exists2[2] += 1
        } else {
          matchResults.push([pasRes, 0, 1])
        }
      }

      pasRes = passingResult[i]._player3
      if (passingResult[i]._player3 === personLookedUp) {
        const exists3 = matchResults.find(el => el[0] === pasRes)
        if (exists3) {
          exists3[2] += 1
        } else {
          matchResults.push([pasRes, 0, 1])
        }
      }

      pasRes = passingResult[i]._player4
      if (passingResult[i]._player4 === personLookedUp) {
        const exists4 = matchResults.find(el => el[0] === pasRes)
        if (exists4) {
          exists4[2] += 1
        } else {
          matchResults.push([pasRes, 0, 1])
        }
      }
    }
    return matchResults
  }
}
