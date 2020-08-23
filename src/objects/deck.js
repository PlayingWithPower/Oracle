const bootstrap = require('../bootstrap.js')

/**
 * Deck Object
 *
 * Functionality for decks and deck aliases.
 */
module.exports = {

  /**
     * Returns a list of all Deck Aliases registered to the server
     */
  async listDecks (receivedMessage, colorSpecified) {
    if (colorSpecified === 'no') {
      const res = await bootstrap.Deck.find({ _server: receivedMessage.guild.id })
      return res
    } else {
      const deckQuery = { _server: receivedMessage.guild.id, _colors: colorSpecified.toUpperCase() }
      const res = await bootstrap.Deck.find(deckQuery)
      return res
    }
  },
  /**
     * Returns information about a deck
     * @param {*} receivedMessage
     * @param {*} args
     */
  async deckInfo (receivedMessage, args) {
    try {
      args = args.join(' ')
        .toLowerCase()
    } catch {
      args = ''
    }
    const deckQuery = { _alias: args, _server: receivedMessage.guild.id }
    const res = await bootstrap.Deck.findOne(deckQuery)
    if (res) {
      return ['First', res]
    }
    const res2 = await bootstrap.Deck.find(
      {
        _server: receivedMessage.guild.id,
        $text: { $search: args }
      })
    if (res2) {
      return ['Second', res]
    }
    return 'Error 1'
  },
  /**
     * Returns stats about a deck alias
     */
  async deckStats (receivedMessage, args) {
    const seasonObj = await bootstrap.SeasonHelper.getCurrentSeason(receivedMessage.guild.id)
    let currentSeason = seasonObj._season_name
    const argsWithCommas = args.toString()
    const argsWithSpaces = argsWithCommas.replace(/,/g, ' ')
    const splitArgs = argsWithSpaces.split(' | ')
    if (splitArgs[0][0] === '|') {
      let query
      let seasonName
      const cleaningName = splitArgs[0]
      const checkFormat = cleaningName.indexOf('| ')
      if (checkFormat === -1) {
        return 'Bad season deckstats input'
      } else if (cleaningName.slice(2).toLowerCase() === 'all') {
        query = {
          _server: receivedMessage.guild.id,
          _Status: 'FINISHED'
        }
        seasonName = 'all'
      } else {
        seasonName = cleaningName.slice(2)
        query = {
          _server: receivedMessage.guild.id,
          _season: seasonName,
          _Status: 'FINISHED'
        }
      }

      const passingResult = await bootstrap.Game.find(query)
      if (!passingResult) {
        return 'Error 1'
      }
      if (passingResult && passingResult.length > 0) {
        const matchResults = []
        for (let i = 0; i < passingResult.length; i++) {
          let pasRes = passingResult[i]._player1Deck
          if (passingResult[i]._player1Deck === 'Rogue') {
            pasRes = passingResult[i]._player1Rogue + ' | Rogue'
          }
          const exists = matchResults.find(el => el[0] === pasRes)
          if (exists) {
            exists[1] += 1
          } else {
            matchResults.push([pasRes, 1, 0])
          }

          pasRes = passingResult[i]._player2Deck
          if (passingResult[i]._player2Deck === 'Rogue') {
            pasRes = passingResult[i]._player2Rogue + ' | Rogue'
          }
          const exists2 = matchResults.find(el => el[0] === pasRes)
          if (exists2) {
            exists2[2] += 1
          } else {
            matchResults.push([pasRes, 0, 1])
          }

          pasRes = passingResult[i]._player3Deck
          if (passingResult[i]._player3Deck === 'Rogue') {
            pasRes = passingResult[i]._player3Rogue + ' | Rogue'
          }
          const exists3 = matchResults.find(el => el[0] === pasRes)
          if (exists3) {
            exists3[2] += 1
          } else {
            matchResults.push([pasRes, 0, 1])
          }

          pasRes = passingResult[i]._player4Deck
          if (passingResult[i]._player4Deck === 'Rogue') {
            pasRes = passingResult[i]._player4Rogue + ' | Rogue'
          }
          const exists4 = matchResults.find(el => el[0] === pasRes)
          if (exists4) {
            exists4[2] += 1
          } else {
            matchResults.push([[pasRes], 0, 1])
          }
        }
        return ['Raw Deck Lookup', matchResults, seasonName]
      } else {
        const res = await bootstrap.Deck.find(
          {
            _server: receivedMessage.guild.id,
            $text: { $search: args }
          })
        if (res.length > 0) {
          return res
        }
        return "Can't find deck"
      }
    } else if (args.length === 0) {
      const query = {
        _server: receivedMessage.guild.id,
        _season: currentSeason,
        _Status: 'FINISHED'
      }

      const passingResult = await bootstrap.Game.find(query)
      if (!passingResult) {
        return 'Error 1'
      }
      if (passingResult && passingResult.length > 0) {
        const matchResults = []
        for (let i = 0; i < passingResult.length; i++) {
          let pasRes = passingResult[i]._player1Deck
          if (passingResult[i]._player1Deck === 'Rogue') {
            pasRes = passingResult[i]._player1Rogue + ' | Rogue'
          }
          const exists = matchResults.find(el => el[0] === pasRes)
          if (exists) {
            exists[1] += 1
          } else {
            matchResults.push([pasRes, 1, 0])
          }

          pasRes = passingResult[i]._player2Deck
          if (passingResult[i]._player2Deck === 'Rogue') {
            pasRes = passingResult[i]._player2Rogue + ' | Rogue'
          }
          const exists2 = matchResults.find(el => el[0] === pasRes)
          if (exists2) {
            exists2[2] += 1
          } else {
            matchResults.push([pasRes, 0, 1])
          }

          pasRes = passingResult[i]._player3Deck
          if (passingResult[i]._player3Deck === 'Rogue') {
            pasRes = passingResult[i]._player3Rogue + ' | Rogue'
          }
          const exists3 = matchResults.find(el => el[0] === pasRes)
          if (exists3) {
            exists3[2] += 1
          } else {
            matchResults.push([pasRes, 0, 1])
          }

          pasRes = passingResult[i]._player4Deck
          if (passingResult[i]._player4Deck === 'Rogue') {
            pasRes = passingResult[i]._player4Rogue + ' | Rogue'
          }
          const exists4 = matchResults.find(el => el[0] === pasRes)
          if (exists4) {
            exists4[2] += 1
          } else {
            matchResults.push([[pasRes], 0, 1])
          }
        }
        return ['Raw Deck Lookup', matchResults, currentSeason]
      }
      return "Can't find deck"
    } else if (args[0].slice(0, 2) === '<@') {
      args = args.join(' ')
      const argsWithCommas = args.toString()
      const argsWithSpaces = argsWithCommas.replace(/,/g, ' ')
      const splitArgs = argsWithSpaces.split(' | ')

      let wins = 0
      let losses = 0

      let conditionalQuery
      if (splitArgs[1] === undefined) {
        conditionalQuery = {
          _server: receivedMessage.guild.id,
          _season: currentSeason,
          _Status: 'FINISHED',
          $or: [
            { _player1: splitArgs[0].replace(/[<@!>]/g, '') },
            { _player2: splitArgs[0].replace(/[<@!>]/g, '') },
            { _player3: splitArgs[0].replace(/[<@!>]/g, '') },
            { _player4: splitArgs[0].replace(/[<@!>]/g, '') }
          ]
        }
      } else if (splitArgs[1].toLowerCase() === 'all') {
        conditionalQuery = {
          _server: receivedMessage.guild.id,
          _Status: 'FINISHED',
          $or: [
            { _player1: splitArgs[0].replace(/[<@!>]/g, '') },
            { _player2: splitArgs[0].replace(/[<@!>]/g, '') },
            { _player3: splitArgs[0].replace(/[<@!>]/g, '') },
            { _player4: splitArgs[0].replace(/[<@!>]/g, '') }
          ]
        }
        currentSeason = 'all'
      } else {
        conditionalQuery = {
          _server: receivedMessage.guild.id,
          _season: splitArgs[1],
          _Status: 'FINISHED',
          $or: [
            { _player1: splitArgs[0].replace(/[<@!>]/g, '') },
            { _player2: splitArgs[0].replace(/[<@!>]/g, '') },
            { _player3: splitArgs[0].replace(/[<@!>]/g, '') },
            { _player4: splitArgs[0].replace(/[<@!>]/g, '') }
          ]
        }
        currentSeason = splitArgs[1]
      }
      const passingResult = await bootstrap.Game.find(conditionalQuery)
      if (passingResult && passingResult.length > 0) {
        const player = splitArgs[0].replace(/[<@!>]/g, '')
        passingResult.forEach((entry) => {
          if (entry._player1 === player) {
            wins = wins + 1
          } else if (entry._player2 === player) {
            losses = losses + 1
          } else if (entry._player3 === player) {
            losses = losses + 1
          } else if (entry._player4 === player) {
            losses = losses + 1
          }
        })
        return ['User Lookup', splitArgs[0].replace(/[<@!>]/g, ''), wins, losses, currentSeason]
      }
      return "Can't find deck"
    } else {
      args = args.join(' ')
      const argsWithCommas = args.toString()
      const argsWithSpaces = argsWithCommas.replace(/,/g, ' ')
      const splitArgs = argsWithSpaces.split(' | ')
      splitArgs[0] = bootstrap.DeckHelper.toUpper(splitArgs[0])

      let query
      if (splitArgs[1] === undefined) {
        query = {
          _season: currentSeason,
          _Status: 'FINISHED',
          $or: [{ _player1Deck: splitArgs[0] }, { _player2Deck: splitArgs[0] }, { _player3Deck: splitArgs[0] }, { _player4Deck: splitArgs[0] }]

        }
      } else if (splitArgs[1].toLowerCase() === 'all') {
        query = {
          _Status: 'FINISHED',
          $or: [{ _player1Deck: splitArgs[0] }, { _player2Deck: splitArgs[0] }, { _player3Deck: splitArgs[0] }, { _player4Deck: splitArgs[0] }]
        }
      } else {
        query = {
          _season: splitArgs[1],
          _Status: 'FINISHED',
          $or: [{ _player1Deck: splitArgs[0] }, { _player2Deck: splitArgs[0] }, { _player3Deck: splitArgs[0] }, { _player4Deck: splitArgs[0] }]
        }
      }
      let wins = 0
      let losses = 0
      let deckPlayers = []
      const passingResult = await bootstrap.Game.find(query)
      if (passingResult && passingResult.length > 0) {
        passingResult.forEach((entry) => {
          if (entry._player1Deck === splitArgs[0]) {
            wins = wins + 1
            deckPlayers.push(entry._player1)
          }
          if (entry._player2Deck === splitArgs[0]) {
            losses = losses + 1
            deckPlayers.push(entry._player2)
          }
          if (entry._player3Deck === splitArgs[0]) {
            losses = losses + 1
            deckPlayers.push(entry._player3)
          }
          if (entry._player4Deck === splitArgs[0]) {
            losses = losses + 1
            deckPlayers.push(entry._player4)
          }
        })
        deckPlayers = deckPlayers.filter(function (item, index, inputArray) {
          return inputArray.indexOf(item) === index
        })
        return ['Deck Lookup', args, currentSeason, wins, losses, deckPlayers, passingResult]
      } else {
        const res = await bootstrap.Deck.find(
          {
            _server: receivedMessage.guild.id,
            $text: { $search: args }
          })
        if (res.length > 0) {
          return res
        }
        return "Can't find deck"
      }
    }
  },
  /**
     * Used in ManageReactionHelper
     * Updates the Primer of a Deck
     */
  async updatePrimer (newPrimerMessage, oldID) {
    if ((newPrimerMessage.content.toLowerCase() !== 'yes') && (newPrimerMessage.content.toLowerCase() !== 'no')) {
      return 'Error 1'
    } else {
      let newPrimer = newPrimerMessage.content
      newPrimer = bootstrap.DeckHelper.toUpper(newPrimer)
      if (newPrimer === 'Yes') {
        newPrimer = true
      } else {
        newPrimer = false
      }

      const deckQuery = { _id: oldID }
      const deckFindRes = await bootstrap.Deck.find(deckQuery)
      if (deckFindRes) {
        await bootstrap.Deck.findOneAndUpdate(deckQuery, { $set: { _hasPrimer: newPrimer } })
        return [deckFindRes[0]._name, deckFindRes[0]._hasPrimer, newPrimer]
      }
    }
  },
  /**
     * Used in ManageReactionHelper
     * Updates the Type of a Deck
     */
  async updateType (newAuthorMessage, oldID) {
    const deckQuery = { _id: oldID }

    if ((newAuthorMessage.content.toLowerCase() !== 'proactive') && (newAuthorMessage.content.toLowerCase() !== 'adaptive') && (newAuthorMessage.content.toLowerCase() !== 'disruptive')) {
      return 'Error 1'
    } else {
      let newDeckType = newAuthorMessage.content
      newDeckType = bootstrap.DeckHelper.toUpper(newDeckType)
      const deckFindRes = await bootstrap.Deck.find(deckQuery)
      if (deckFindRes) {
        await bootstrap.Deck.updateOne(deckQuery, { $set: { _deckType: newDeckType } })
        return [deckFindRes[0]._name, deckFindRes[0]._deckType, newDeckType]
      }
    }
  },
  /**
     * Used in ManageReactionHelper
     * Updates the author of a Deck
     */
  async updateAuthor (newAuthorMessage, oldID) {
    const deckQuery = { _id: oldID }

    let bulkAuthors = newAuthorMessage.content
    bulkAuthors = bulkAuthors.replace(/ /g, '')
    bulkAuthors = bulkAuthors.split(',')

    let commaAuthors = ''
    bulkAuthors.forEach(author => {
      commaAuthors += author + ', '
    })
    commaAuthors = commaAuthors.replace(/,([^,]*)$/, '$1')
    commaAuthors = commaAuthors.replace(/ ([^ ]*)$/, '$1')
    const deckFindRes = await bootstrap.Deck.find(deckQuery)
    if (deckFindRes) {
      await bootstrap.Deck.updateOne(deckQuery, { $set: { _author: commaAuthors } })
      return [deckFindRes[0]._name, deckFindRes[0]._deckType, commaAuthors]
    }
  },
  /**
     * Used in ManageReactionHelper
     * Updates the description of a Deck
     */
  async updateDescription (newDescriptionMessage, oldID) {
    const deckQuery = { _id: oldID }
    const newDescription = newDescriptionMessage.content

    if (newDescription.length > 750) {
      return 'Error 1'
    } else {
      const deckFindRes = await bootstrap.Deck.find(deckQuery)
      if (deckFindRes) {
        const deckUpdateRes = await bootstrap.Deck.updateOne(deckQuery, { $set: { _description: newDescription } })
        if (deckUpdateRes) {
          return [deckFindRes[0]._name]
        }
      }
    }
  },
  /**
     * Used in ManageReactionHelper
     * Updates the color of a Deck
     */
  async updateColors (newColorMessage, oldID) {
    const deckQuery = { _id: oldID }

    let colorIdentity = newColorMessage.content
    let catchBool = true

    for (const letter of colorIdentity.toLowerCase()) {
      if (letter !== ('w') && letter !== ('u') && letter !== ('b') && letter !== ('r') && letter !== ('g')) {
        catchBool = false
        return 'Error 1'
      }
    }
    if (catchBool === true) {
      colorIdentity = colorIdentity.toUpperCase()
      colorIdentity = colorIdentity.split('').join(' ')
      colorIdentity = colorIdentity.replace(/ /g, ', ')
      const deckFindRes = await bootstrap.Deck.find(deckQuery)
      if (deckFindRes) {
        const deckUpdateRes = await bootstrap.Deck.updateOne(deckQuery, { $set: { _colors: colorIdentity } })
        if (deckUpdateRes) {
          return [deckFindRes[0]._name, deckFindRes[0]._colors, colorIdentity]
        }
      }
    }
  },
  /**
     * Used in ManageReactionHelper
     * Updates the Commander of a Deck
     */
  async updateCommander (newNameMessage, oldID) {
    const deckQuery = { _id: oldID }

    const newName = bootstrap.DeckHelper.toUpper(newNameMessage.content)

    const deckFindRes = await bootstrap.Deck.find(deckQuery)
    if (deckFindRes) {
      const deckUpdateRes = await bootstrap.Deck.updateOne(deckQuery, { $set: { _commander: newName } })
      if (deckUpdateRes) {
        return [deckFindRes[0]._name, deckFindRes[0]._commander, newName]
      } else {
        console.log('error 1')
      }
    } else {
      console.log('error 2')
    }
  },
  /**
     * Updates the URL of a deck
     */
  async updateDeckList (newURLMessage, oldNameID) {
    const deckQuery = { _id: oldNameID }
    if (new RegExp('([a-zA-Z0-9]+://)?([a-zA-Z0-9_]+:[a-zA-Z0-9_]+@)?([a-zA-Z0-9.-]+\\.[A-Za-z]{2,4})(:[0-9]+)?(/.*)?').test(newURLMessage.content)) {
      const deckFindRes = await bootstrap.Deck.find(deckQuery)
      if (deckFindRes) {
        const deckUpdateRes = await bootstrap.Deck.updateOne(deckQuery, { $set: { _link: newURLMessage.content } })
        if (deckUpdateRes) {
          return [newURLMessage.content, deckFindRes[0]._name]
        } else {
          return 'Error 3'
        }
      } else {
        return 'Error 2'
      }
    } else {
      return 'Error 1'
    }
  },
  /**
     * Updates the URL of a deck
     */
  async updateDiscordLink (newURLMessage, oldNameID) {
    const deckQuery = { _id: oldNameID }
    if (new RegExp('([a-zA-Z0-9]+://)?([a-zA-Z0-9_]+:[a-zA-Z0-9_]+@)?([a-zA-Z0-9.-]+\\.[A-Za-z]{2,4})(:[0-9]+)?(/.*)?').test(newURLMessage.content)) {
      const deckFindRes = await bootstrap.Deck.find(deckQuery)
      if (deckFindRes) {
        const deckUpdateRes = await bootstrap.Deck.updateOne(deckQuery, { $set: { _discordLink: newURLMessage.content } })
        if (deckUpdateRes) {
          return [newURLMessage.content, deckFindRes[0]._name]
        } else {
          return 'Error 3'
        }
      } else {
        return 'Error 2'
      }
    } else {
      return 'Error 1'
    }
  },
  /**
     * Adds a new User deck to the server.
     */
  async addDeck (receivedMessage, newDeckArr) {
    let deckNick = newDeckArr[0]
    const deckAlias = newDeckArr[0].toLowerCase()
    let commanderName = newDeckArr[1]
    let colorIdentity = newDeckArr[2]
    const deckLink = newDeckArr[3]
    const author = newDeckArr[4]
    const deckDescription = newDeckArr[5]
    let deckType = newDeckArr[6]
    let hasPrimer = newDeckArr[7]
    const discordLink = newDeckArr[8]

    try {
      deckNick = bootstrap.DeckHelper.toUpper(deckNick)
    } catch { }
    colorIdentity = colorIdentity.toUpperCase()
    colorIdentity = colorIdentity.split('').join(', ')
    commanderName = bootstrap.DeckHelper.toUpper(commanderName)
    deckType = bootstrap.DeckHelper.toUpper(deckType)

    if (hasPrimer === 'no') {
      hasPrimer = false
    } else {
      hasPrimer = true
    }

    const deckAliasQuery = {
      _alias: deckAlias,
      _server: receivedMessage.guild.id
    }
    if (deckDescription.length > 750) {
      return 'Error 2'
    }
    const res = await bootstrap.Deck.findOne(deckAliasQuery)
    if (res) {
      return 'Error 1'
    } else {
      return [
        deckNick,
        commanderName,
        colorIdentity,
        deckLink,
        author,
        deckDescription,
        deckType,
        hasPrimer,
        discordLink
      ]
    }
  },
  /**
     * Takes located deck and deletes it
    */
  async removeDeck (args) {
    const argsFiltered = args.slice(9)
    const deckQuery = { _id: argsFiltered }

    const res = await bootstrap.Deck.deleteOne(deckQuery)
    if (res) {
      return res
    } else {
      // eslint-disable-next-line no-throw-literal
      throw 'Error 1'
    }
  },
  async setUpPopulate (guild) {
    for (let index = 0; index < bootstrap.Data.length; index++) {
      const decks = bootstrap.Data[index]
      let hasPrimer
      if (decks[0] === 'Y') {
        hasPrimer = true
      } else {
        hasPrimer = false
      }
      const deckSave = {
        _link: decks[3],
        _name: decks[2],
        _alias: decks[2].toLowerCase(),
        _commander: decks[4],
        _colors: decks[6],
        _author: decks[8],
        _server: guild,
        _description: decks[5],
        _discordLink: decks[7],
        _dateAdded: decks[9],
        _deckType: decks[1],
        _hasPrimer: hasPrimer
      }
      const aliasSave = {
        _name: decks[2],
        _server: guild
      }
      const findRes = await bootstrap.Deck.find(deckSave)
      if (findRes.length !== 0) { } else {
        const res = await bootstrap.Deck(deckSave).save()
        if (!res) {
          console.log('Error: Unable to save to Database, please try again')
        }
        const aliasRes = await bootstrap.Alias(aliasSave).save()
        if (!aliasRes) {
          console.log('Error: Unable to save to Database, please try again')
        }
      }
    }
  }
}
