const bootstrap = require('../bootstrap')

module.exports = {
  /**
     * This is used in !deck to quickly create 5 embeds, one for each color
     * @param {*} colorArr
     * @param {*} colorNum
     */
  createDeckEmbed (colorArr, colorNum) {
    const someEmbed = new bootstrap.Discord.MessageEmbed()
      .setColor(bootstrap.messageColorBlue)
      .setAuthor(colorNum)
    if (colorArr.length === 0) {
      someEmbed.addFields(
        { name: ' \u200b', value: 'No Decks of these color registered', inline: true }
      )
    } else {
      let holder = ''
      colorArr.forEach(entry => {
        holder = holder + entry + ' \n'
      })
      // someEmbed.addFields(
      //     { name: " \u200b", value: colorArr}
      // )
      someEmbed.setDescription(holder)
      // for(i = 0; i < colorArr.length; i++){
      //     someEmbed.addFields(
      //         { name: " \u200b",value: colorArr[i], inline: true},
      //     )
      // }
    }
    return someEmbed
  },
  /**
     * toUpper()
     * @param {*} str
     */
  toUpper (str) {
    return str
      .toLowerCase()
      .split(' ')
      .map(function (word) {
        return word[0].toUpperCase() + word.substr(1)
      })
      .join(' ')
  },
  /**
     * Checks if the deck a user is trying to update is valid.
     * Helper Function to the two below updateDeckName() and updateDeckList()
     */
  async findDeckToUpdate (receivedMessage, args) {
    args = args.join(' ')
    const lowerArgs = args.toString().toLowerCase()
    const deckQuery = { _alias: lowerArgs, _server: receivedMessage.guild.id }
    const res = await bootstrap.Deck.find(deckQuery)
    if (!res || res.length <= 0) {
      throw new Error('Error 1')
    }
    return res
  },
  /**
     * Locates the deck to remove. Then waits for user reaction
     */
  async findDeckToRemove (receivedMessage, args) {
    args = args.join(' ')
    const lowerArgs = args.toString().toLowerCase()
    const deckQuery = { _alias: lowerArgs, _server: receivedMessage.guild.id }
    const res = await bootstrap.Deck.find(deckQuery)
    if (!res || res.length <= 0) {
      throw new Error('Error 1')
    }
    return res
  },
  async addDeckHelper (message, args) {
    let primerBool
    if (args[7].value === 'False') {
      primerBool = false
    } else {
      primerBool = true
    }
    const deckSave = {
      _link: args[3].value,
      _name: args[0].value,
      _alias: args[0].value.toLowerCase(),
      _commander: args[1].value,
      _colors: args[2].value,
      _author: args[4].value,
      _server: message.guild.id,
      _season: '1',
      _description: args[5].value,
      _discordLink: args[8].value,
      _dateAdded: '',
      _deckType: args[6].value,
      _hasPrimer: primerBool
    }
    const aliasSave = {
      _name: args[0].value,
      _server: message.guild.id
    }
    const res = await bootstrap.Deck(deckSave).save()
    if (!res || res.length <= 0) {
      throw new Error('Error 1')
    }

    const res2 = bootstrap.Alias(aliasSave).save
    if (!res2 || res2.length <= 0) {
      throw new Error('Error 1')
    }
    return args[0].value
  },
  async checkColorDictionary (input) {
    const colorDictionary = {
      white: 'w',
      blue: 'u',
      black: 'b',
      red: 'r',
      green: 'g',

      azorius: 'w, u',
      dimir: 'u, b',
      rakdos: 'b, r',
      gruul: 'r, g',
      selesnya: 'g, w',

      orzhov: 'w, b',
      izzet: 'u, r',
      golgari: 'b, g',
      boros: 'r, w',
      simic: 'u, g',

      bant: 'w, u, g',
      esper: 'w, u, b',
      grixis: 'u, b, r',
      jund: 'b, r, g',
      naya: 'w, r, g',

      abzan: 'w, b, g',
      jeskai: 'w, b, r',
      sultai: 'u, b, g',
      mardu: 'w, b, r',
      temur: 'u, r, g',

      sansgreen: 'w, u, b, r',
      sanswhite: 'u, b, r, g',
      sansblue: 'w, b, r, g',
      sansblack: 'w, u, r, g',
      sansred: 'w, u, b, g'
    }
    if (colorDictionary.hasOwnProperty(input.toLowerCase())) {
      return new Promise((resolve, reject) => {
        resolve(colorDictionary[input.toLowerCase()])
      })
    } else {
      return new Promise((resolve, reject) => {
        resolve('Not found')
      })
    }
  },
  async commanderChecker (input, receivedMessage) {
    return new Promise((resolve, reject) => {
      input = module.exports.toUpper(input)
      bootstrap.Deck.find(
        {
          _server: receivedMessage.guild.id,
          $text: { $search: input }
        },
        function (err, res) {
          if (err) { console.log(err) }
          resolve(res)
        })
    })
  }
}
