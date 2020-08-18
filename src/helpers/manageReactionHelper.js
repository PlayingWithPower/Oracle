const bootstrap = require('../bootstrap')

module.exports = {
/**
 * manageReaction()
 * @param {*} reaction - discord reaction obj
 * @param {*} user  - discord user obj
 *
 * This is the async manager function for whenever a reaction is submitted.
 * Atm it only cares about upvotes and downvotes on Game messages
 *
 * TODO: Confirm with current deck user is using
 */
  /**
     * getChannelID()
     *
     * @returns Discord Channel obj to send message to
     * @param reaction
     * @param user
     * @param channel
     */
  async manageReaction (reaction, user, channel) {
    const msg = reaction.message.content.toString().split(' ')
    let embeds = reaction.message.embeds[0]
    const upperLevelEmbeds = reaction.message.embeds[0]
    // Resolving issues where a user would upvote/downvote, then do it again. It would cause embeds.author to be null
    //  causing error log later on
    if (embeds.author == null) {
      return
    } else {
      embeds = embeds.author.name.toString().split(' ')
    }
    const sanitizedString = user.id
    // Catch impersonators block -- Remove if you want bot to react to reactions on non-bot messages
    if (reaction.message.author.id !== bootstrap.Env.clientId) {
      return
    }
    const grabMentionValue = upperLevelEmbeds.description.toString().split(' ')[0].replace(/[<@!>]/g, '')
    if (sanitizedString !== grabMentionValue) {
      return
    }
    // Game Block
    if (embeds.length > 1 && embeds[0] === 'Game' && embeds[1] === 'ID:' && reaction.emoji.name === '👍' && user.id !== bootstrap.Env.clientId) {
      const grabMatchID = embeds[2]
      bootstrap.GameObj.confirmMatch(grabMatchID, sanitizedString).then(function () {
        bootstrap.GameObj.checkMatch(grabMatchID).then(function (next) {
          if (next === 'SUCCESS') {
            bootstrap.GameObj.logMatch(grabMatchID, reaction.message).then(function (final) {
              bootstrap.GameObj.finishMatch(grabMatchID, reaction.message).then(function () {
                const confirmMessage = new bootstrap.Discord.MessageEmbed()
                  .setColor(bootstrap.messageColorGreen)
                  .setAuthor('Sucessfully Logged Match!')
                  .setDescription("Type **!profile** to see changes to your score\n\
                                        Type **!top** to see changes to this season's leaderboard")
                channel.send(confirmMessage)
                // console.log("Game #" + grabMatchID + " success")
              }).catch((message) => {
                // console.log("Finishing Game #" + grabMatchID + " failed. ERROR:", message)
              })
            }).catch((message) => {
              // console.log("ERROR: " + message)
            })
          }
        }).catch((message) => {
          // console.log("ERROR: " + message)
        })
      }).catch((message) => {
        // console.log("ERROR: " + message)
      })
    } else if (embeds.length > 1 && embeds[0] === 'Game' && embeds[1] === 'ID:' && reaction.emoji.name === '👎' && user.id !== bootstrap.Env.clientId) {
      const grabMatchID = embeds[2]
      if (sanitizedString !== grabMentionValue) {
        // console.log("not the right user")
        return
      }
      const result = await bootstrap.GameObj.closeMatch(grabMatchID).catch((message) => {
        // console.log("Closing Game #" + grabMatchID + " failed.")
      })
      if (result === 'SUCCESS') {
        const cancelledEmbed = new bootstrap.Discord.MessageEmbed()
          .setColor(bootstrap.messageColorGreen)
          .setDescription('<@!' + grabMentionValue + '>' + ' cancelled the Match Log')
        channel.send(cancelledEmbed)
      } else { }
    }
    // end of game block
    // Confirm Delete Match Block
    else if ((embeds.length > 1 && embeds[5] === 'delete' && reaction.emoji.name === '👍' && user.id !== bootstrap.Env.clientId)) {
      const grabMatchID = upperLevelEmbeds.title.toString().split(' ')
      bootstrap.GameObj.confirmedDeleteMatch(grabMatchID[2], reaction.message).then((message) => {
        const successEmbed = new bootstrap.Discord.MessageEmbed()
          .setColor(bootstrap.messageColorGreen)
          .setAuthor('Successfully deleted')
          .setDescription('<@!' + grabMentionValue + '>' + ' Match ID:' + grabMatchID[2] + ' was deleted')
        reaction.message.edit(successEmbed)
      }).catch((message) => {
        const errorEmbed = new bootstrap.Discord.MessageEmbed()
          .setColor(bootstrap.messageColorRed)
          .setAuthor('Error Deleting')
          .setDescription('Match already deleted')
        reaction.message.edit(errorEmbed)
      })
    } else if ((embeds.length > 1 && embeds[5] === 'delete' && reaction.emoji.name === '👎' && user.id !== bootstrap.Env.clientId)) {
      const grabMatchID = upperLevelEmbeds.title.toString().split(' ')
      const errorEmbed = new bootstrap.Discord.MessageEmbed()
        .setColor(bootstrap.messageColorRed)
        .setAuthor('Delete Cancelled')
        .setDescription('<@!' + grabMentionValue + '>' + ' you have **cancelled** deleteting Match ID: **' + grabMatchID[2] + '**')
      reaction.message.edit(errorEmbed)
    }
    // End of Confirm Delete Match Block

    // Start of Remove Deck Reacts
    else if ((embeds.length === 1 && embeds === 'WARNING' && reaction.emoji.name === '👍' && user.id !== bootstrap.Env.clientId)) {
      const removeDeckResult = await bootstrap.DeckObj.removeDeck(reaction.message.embeds[0].title)
      if (removeDeckResult.deletedCount >= 1) {
        const editedWarningEmbed = new bootstrap.Discord.MessageEmbed()
          .setColor(bootstrap.messageColorGreen)
          .setTitle('Successfully Deleted Deck')
        reaction.message.edit(editedWarningEmbed)
      } else {
        const editedWarningEmbed = new bootstrap.Discord.MessageEmbed()
          .setColor(bootstrap.messageColorRed)
          .setTitle("Unknown Error Occurred. Please try again. Check !decks for the deck you're trying to delete.")
        reaction.message.edit(editedWarningEmbed)
      }
    } else if ((embeds.length === 1 && embeds === 'WARNING' && reaction.emoji.name === '👎' && user.id !== bootstrap.Env.clientId)) {
      const editedWarningEmbed = new bootstrap.Discord.MessageEmbed()
        .setColor(bootstrap.messageColorRed)
        .setTitle('Delete Deck Cancelled')
      reaction.message.edit(editedWarningEmbed)
    }
    // End of Remove Deck Reacts

    // Start of Update Deck Reacts
    // Commander
    else if ((embeds.length > 1 && embeds[0] === 'You' && reaction.emoji.name === '1️⃣' && user.id !== bootstrap.Env.clientId)) {
      const channel = reaction.message.channel
      const deckID = upperLevelEmbeds.title.slice(9)

      const collector = new bootstrap.Discord.MessageCollector(channel, m => m.author.id === user.id, { time: 10000, max: 1 })
      const selectedEditEmbed = new bootstrap.Discord.MessageEmbed(reaction.message.embeds[0])
        .setColor(bootstrap.messageColorBlue)
        .setDescription('**Selected Commander**. Please **type** the new Commander.')
      reaction.message.edit(selectedEditEmbed)

      collector.on('collect', async (message) => {
        const grabEmbed = reaction.message.embeds[0]
        if (grabEmbed.title.toString().split(' ')[0] === 'Update') { } else {
          const promiseReturn = await bootstrap.DeckObj.updateCommander(message, deckID)
          if (promiseReturn) {
            const updatedDeckEmbed = new bootstrap.Discord.MessageEmbed(selectedEditEmbed)
              .setColor(bootstrap.messageColorGreen)
              .setAuthor('Success!')
              .setDescription('Updated Commander of the deck: **' + promiseReturn[0] + '**  \
                            from **' + promiseReturn[1] + '** to **' + promiseReturn[2] + '**')
            reaction.message.edit(updatedDeckEmbed)
          } else {
            const errorDeckEmbed = new bootstrap.Discord.MessageEmbed(selectedEditEmbed)
              .setColor(bootstrap.messageColorRed)
              .setAuthor('Error')
              .setDescription('An error has occurred. Please try again.')
            reaction.message.edit(errorDeckEmbed)
          }
        }
      })
      collector.on('end', collected => {
        if (reaction.message.embeds[0].author != null) {
          const editedEmbed = reaction.message.embeds[0].author.name.toString().split(' ')
          if (collected.size === 0 && editedEmbed[0] === 'You') {
            const editedEndingMessage = new bootstrap.Discord.MessageEmbed()
              .setColor(bootstrap.messageColorRed)
              .setTitle('Update Commander Timeout. Please type !updatedeck <deckname> again.')
            reaction.message.edit(editedEndingMessage)
          }
        } else { }
      })
    }
    // Colors
    else if ((embeds.length > 4 && embeds[0] === 'You' && reaction.emoji.name === '2️⃣' && user.id !== bootstrap.Env.clientId)) {
      const channel = reaction.message.channel
      const deckID = upperLevelEmbeds.title.slice(9)

      const collector = new bootstrap.Discord.MessageCollector(channel, m => m.author.id === user.id, { time: 10000, max: 1 })

      const selectedEditEmbed = new bootstrap.Discord.MessageEmbed(reaction.message.embeds[0])
        .setColor(bootstrap.messageColorBlue)
        .setDescription('**Selected Deck Colors**. Please **type** the new Deck Colors \
                \nBe careful of formatting. I understand WUBRG and combinations of it. \
                \n**Example Input:** UBG')
      reaction.message.edit(selectedEditEmbed)

      collector.on('collect', async (message) => {
        const grabEmbed = reaction.message.embeds[0]
        if (grabEmbed.title.toString().split(' ')[0] === 'Update') { } else {
          const promiseReturn = await bootstrap.DeckObj.updateColors(message, deckID)
          if (promiseReturn === 'Error 1') {
            const nonValidURLEmbed = new bootstrap.Discord.MessageEmbed(selectedEditEmbed)
              .setColor(bootstrap.messageColorRed)
              .setAuthor('Error')
              .setDescription('You have entered a non-valid Color combination. Please try again. \
                            \nI understand WUBRG and combinations of it')
            reaction.message.edit(nonValidURLEmbed)
          } else if (promiseReturn) {
            const updatedDeckEmbed = new bootstrap.Discord.MessageEmbed(selectedEditEmbed)
              .setColor(bootstrap.messageColorGreen)
              .setAuthor('Success!')
              .setDescription('Updated Deck Colors of the deck: **' + promiseReturn[0] + '**  \
                            from **' + promiseReturn[1] + '** to **' + promiseReturn[2] + '**')
            reaction.message.edit(updatedDeckEmbed)
          } else {
            const errorDeckEmbed = new bootstrap.Discord.MessageEmbed(selectedEditEmbed)
              .setColor(bootstrap.messageColorRed)
              .setAuthor('Error')
              .setDescription('An error has occurred. Please try again.')
            reaction.message.edit(errorDeckEmbed)
          }
        }
      })
      collector.on('end', collected => {
        if (reaction.message.embeds[0].author != null) {
          const editedEmbed = reaction.message.embeds[0].author.name.toString().split(' ')
          if (collected.size === 0 && editedEmbed[0] === 'You') {
            const editedEndingMessage = new bootstrap.Discord.MessageEmbed()
              .setColor(bootstrap.messageColorRed)
              .setTitle('Update Color Timeout. Please type !updatedeck <deckname> again.')
            reaction.message.edit(editedEndingMessage)
          }
        } else { }
      })
    }
    // Deck Link
    else if ((embeds.length > 4 && embeds[0] === 'You' && reaction.emoji.name === '3️⃣' && user.id !== bootstrap.Env.clientId)) {
      const channel = reaction.message.channel
      const deckID = upperLevelEmbeds.title.slice(9)

      const collector = new bootstrap.Discord.MessageCollector(channel, m => m.author.id === user.id, { time: 10000, max: 1 })

      const selectedEditEmbed = new bootstrap.Discord.MessageEmbed(reaction.message.embeds[0])
        .setColor(bootstrap.messageColorBlue)
        .setDescription('**Selected Deck Link**. Please **enter** the new deck link.')
      reaction.message.edit(selectedEditEmbed)

      collector.on('collect', async (message) => {
        const grabEmbed = reaction.message.embeds[0]
        if (grabEmbed.title.toString().split(' ')[0] === 'Update') { } else {
          const promiseReturn = await bootstrap.DeckObj.updateDeckList(message, deckID)
          if (promiseReturn === 'Error 1') {
            const nonValidURLEmbed = new bootstrap.Discord.MessageEmbed(selectedEditEmbed)
              .setColor(bootstrap.messageColorRed)
              .setAuthor('Error')
              .setDescription('You have entered a non-valid url. Please try again')
            reaction.message.edit(nonValidURLEmbed)
          } else if (promiseReturn) {
            const updatedDeckEmbed = new bootstrap.Discord.MessageEmbed(selectedEditEmbed)
              .setColor(bootstrap.messageColorGreen)
              .setAuthor('Success!')
              .setURL(promiseReturn[0])
              .setDescription('Updated Deck List of the deck: **' + promiseReturn[1] + '**')
            reaction.message.edit(updatedDeckEmbed)
          } else {
            const errorDeckEmbed = new bootstrap.Discord.MessageEmbed(selectedEditEmbed)
              .setColor(bootstrap.messageColorRed)
              .setAuthor('Error')
              .setDescription('An error has occurred. Please try again.')
            reaction.message.edit(errorDeckEmbed)
          }
        }
      })
      collector.on('end', collected => {
        if (reaction.message.embeds[0].author != null) {
          const editedEmbed = reaction.message.embeds[0].author.name.toString().split(' ')
          if (collected.size === 0 && editedEmbed[0] === 'You') {
            const editedEndingMessage = new bootstrap.Discord.MessageEmbed()
              .setColor(bootstrap.messageColorRed)
              .setTitle('Update Link Timeout. Please type !updatedeck <deckname> again.')
            reaction.message.edit(editedEndingMessage)
          }
        } else { }
      })
    }
    // Author
    else if ((embeds.length > 4 && embeds[0] === 'You' && reaction.emoji.name === '4️⃣' && user.id !== bootstrap.Env.clientId)) {
      const channel = reaction.message.channel
      const deckID = upperLevelEmbeds.title.slice(9)

      const collector = new bootstrap.Discord.MessageCollector(channel, m => m.author.id === user.id, { time: 10000, max: 1 })

      const selectedEditEmbed = new bootstrap.Discord.MessageEmbed(reaction.message.embeds[0])
        .setColor(bootstrap.messageColorBlue)
        .setDescription('**Selected Author**. Please **type** the new author(s).\n\
                Seperate Authors with a comma. \n Example Input: Gnarwhal, PWP Bot')
      reaction.message.edit(selectedEditEmbed)

      collector.on('collect', async (message) => {
        const grabEmbed = reaction.message.embeds[0]
        if (grabEmbed.title.toString().split(' ')[0] === 'Update') { } else {
          const promiseReturn = await bootstrap.DeckObj.updateAuthor(message, deckID)
          if (promiseReturn) {
            const updatedDeckEmbed = new bootstrap.Discord.MessageEmbed(selectedEditEmbed)
              .setColor(bootstrap.messageColorGreen)
              .setAuthor('Success!')
              .setDescription('Updated Author(s) of the deck: **' + promiseReturn[0] + '**  \
                            from **' + promiseReturn[1] + '** to **' + promiseReturn[2] + '**')
            reaction.message.edit(updatedDeckEmbed)
          } else {
            const errorDeckEmbed = new bootstrap.Discord.MessageEmbed(selectedEditEmbed)
              .setColor(bootstrap.messageColorRed)
              .setAuthor('Error')
              .setDescription('An error has occurred. Please try again.')
            reaction.message.edit(errorDeckEmbed)
          }
        }
      })
      collector.on('end', collected => {
        if (reaction.message.embeds[0].author != null) {
          const editedEmbed = reaction.message.embeds[0].author.name.toString().split(' ')
          if (collected.size === 0 && editedEmbed[0] === 'You') {
            const editedEndingMessage = new bootstrap.Discord.MessageEmbed()
              .setColor(bootstrap.messageColorRed)
              .setTitle('Update Author Timeout. Please type !updatedeck <deckname> again.')
            reaction.message.edit(editedEndingMessage)
          }
        } else { }
      })
    }
    // Deck Description
    else if ((embeds.length > 4 && embeds[0] === 'You' && reaction.emoji.name === '5️⃣' && user.id !== bootstrap.Env.clientId)) {
      const channel = reaction.message.channel
      const deckID = upperLevelEmbeds.title.slice(9)

      const collector = new bootstrap.Discord.MessageCollector(channel, m => m.author.id === user.id, { time: 20000, max: 1 })

      const selectedEditEmbed = new bootstrap.Discord.MessageEmbed(reaction.message.embeds[0])
        .setColor(bootstrap.messageColorBlue)
        .setDescription('**Selected Description**. Please **type** the new Description.\n\
                **Recommendation:** Write description elsewhere and copy and paste in \n\
                **Warning:** Character limit of 750.')
      reaction.message.edit(selectedEditEmbed)

      collector.on('collect', async (message) => {
        const grabEmbed = reaction.message.embeds[0]
        if (grabEmbed.title.toString().split(' ')[0] === 'Update') { } else {
          const promiseReturn = await bootstrap.DeckObj.updateDescription(message, deckID)
          if (promiseReturn === 'Error 1') {
            const tooManyCharsEmbed = new bootstrap.Discord.MessageEmbed(selectedEditEmbed)
              .setColor(bootstrap.messageColorRed)
              .setAuthor('Error')
              .setDescription('Your message is above the character count. \
                         Your new description had: **' + message.content.length + '** characters \n\
                         The character limit is **750**')
            reaction.message.edit(tooManyCharsEmbed)
          } else if (promiseReturn) {
            const updatedDeckEmbed = new bootstrap.Discord.MessageEmbed(selectedEditEmbed)
              .setColor(bootstrap.messageColorGreen)
              .setAuthor('Success!')
              .setDescription('Updated Deck Description of the deck: **' + promiseReturn[0] + '**  \n\
                            Check **!deckinfo ' + promiseReturn[0] + '** to see your new description')
            reaction.message.edit(updatedDeckEmbed)
          } else {
            const errorDeckEmbed = new bootstrap.Discord.MessageEmbed(selectedEditEmbed)
              .setColor(bootstrap.messageColorRed)
              .setAuthor('Error')
              .setDescription('An error has occurred. Please try again.')
            reaction.message.edit(errorDeckEmbed)
          }
        }
      })
      collector.on('end', collected => {
        if (reaction.message.embeds[0].author != null) {
          const editedEmbed = reaction.message.embeds[0].author.name.toString().split(' ')
          if (collected.size === 0 && editedEmbed[0] === 'You') {
            const editedEndingMessage = new bootstrap.Discord.MessageEmbed()
              .setColor(bootstrap.messageColorRed)
              .setTitle('Update Description Timeout. Please type !updatedeck <deckname> again.')
            reaction.message.edit(editedEndingMessage)
          }
        } else { }
      })
    }
    // Deck Type
    else if ((embeds.length > 4 && embeds[0] === 'You' && reaction.emoji.name === '6️⃣' && user.id !== bootstrap.Env.clientId)) {
      const channel = reaction.message.channel
      const deckID = upperLevelEmbeds.title.slice(9)

      const collector = new bootstrap.Discord.MessageCollector(channel, m => m.author.id === user.id, { time: 20000, max: 1 })

      const selectedEditEmbed = new bootstrap.Discord.MessageEmbed(reaction.message.embeds[0])
        .setColor(bootstrap.messageColorBlue)
        .setDescription('**Selected Deck Type**. Please **type** the new Type.\n\
                The three types of decks are: **Proactive, Adaptive and Disruptive**')
      reaction.message.edit(selectedEditEmbed)

      collector.on('collect', async (message) => {
        const grabEmbed = reaction.message.embeds[0]
        if (grabEmbed.title.toString().split(' ')[0] === 'Update') { } else {
          const promiseReturn = await bootstrap.DeckObj.updateType(message, deckID)
          if (promiseReturn === 'Error 1') {
            const tooManyCharsEmbed = new bootstrap.Discord.MessageEmbed(selectedEditEmbed)
              .setColor(bootstrap.messageColorRed)
              .setAuthor('Error')
              .setDescription('You have entered an invalid Deck Type\n\
                        The three types of decks are: **Proactive, Adaptive and Disruptive**')
            reaction.message.edit(tooManyCharsEmbed)
          } else if (promiseReturn) {
            const updatedDeckEmbed = new bootstrap.Discord.MessageEmbed(selectedEditEmbed)
              .setColor(bootstrap.messageColorGreen)
              .setAuthor('Success!')
              .setDescription('Updated Deck Type of the deck: **' + promiseReturn[0] + '**  \
                            from **' + promiseReturn[1] + '** to **' + promiseReturn[2] + '**')
            reaction.message.edit(updatedDeckEmbed)
          } else {
            const errorDeckEmbed = new bootstrap.Discord.MessageEmbed(selectedEditEmbed)
              .setColor(bootstrap.messageColorRed)
              .setAuthor('Error')
              .setDescription('An error has occurred. Please try again.')
            reaction.message.edit(errorDeckEmbed)
          }
        }
      })
      collector.on('end', collected => {
        if (reaction.message.embeds[0].author != null) {
          const editedEmbed = reaction.message.embeds[0].author.name.toString().split(' ')
          if (collected.size === 0 && editedEmbed[0] === 'You') {
            const editedEndingMessage = new bootstrap.Discord.MessageEmbed()
              .setColor(bootstrap.messageColorRed)
              .setTitle('Update Link Timeout. Please type !updatedeck <deckname> again.')
            reaction.message.edit(editedEndingMessage)
          }
        } else { }
      })
    }
    // Primer
    else if ((embeds.length > 4 && embeds[0] === 'You' && reaction.emoji.name === '7️⃣' && user.id !== bootstrap.Env.clientId)) {
      const channel = reaction.message.channel
      const deckID = upperLevelEmbeds.title.slice(9)

      const collector = new bootstrap.Discord.MessageCollector(channel, m => m.author.id === user.id, { time: 20000, max: 1 })

      const selectedEditEmbed = new bootstrap.Discord.MessageEmbed(reaction.message.embeds[0])
        .setColor(bootstrap.messageColorBlue)
        .setDescription('**Selected Primer**. Please type **Yes** or **No**.\n\
                Note: This category is simply to indicate whether a deck **has** a primer in the \
                **Deck List Link** provided. It is not where you **link to** a primer.')
      reaction.message.edit(selectedEditEmbed)

      collector.on('collect', async (message) => {
        const grabEmbed = reaction.message.embeds[0]
        if (grabEmbed.title.toString().split(' ')[0] === 'Update') { } else {
          const promiseReturn = await bootstrap.DeckObj.updatePrimer(message, deckID)
          if (promiseReturn === 'Error 1') {
            const tooManyCharsEmbed = new bootstrap.Discord.MessageEmbed(selectedEditEmbed)
              .setColor(bootstrap.messageColorRed)
              .setAuthor('Error')
              .setDescription('You have entered an invalid Primer input\n\
                        The two input types are:**Yes** and **No**')
            reaction.message.edit(tooManyCharsEmbed)
          } else if (promiseReturn) {
            const updatedDeckEmbed = new bootstrap.Discord.MessageEmbed(selectedEditEmbed)
              .setColor(bootstrap.messageColorGreen)
              .setAuthor('Success!')
              .setDescription('Updated Deck Type of the deck: **' + promiseReturn[0] + '**  \
                            from **' + promiseReturn[1] + '** to **' + promiseReturn[2] + '**')
            reaction.message.edit(updatedDeckEmbed)
          } else {
            const errorDeckEmbed = new bootstrap.Discord.MessageEmbed(selectedEditEmbed)
              .setColor(bootstrap.messageColorRed)
              .setAuthor('Error')
              .setDescription('An error has occurred. Please try again.')
            reaction.message.edit(errorDeckEmbed)
          }
        }
      })
      collector.on('end', collected => {
        if (reaction.message.embeds[0].author !== null) {
          const editedEmbed = reaction.message.embeds[0].author.name.toString().split(' ')
          if (collected.size === 0 && editedEmbed[0] === 'You') {
            const editedEndingMessage = new bootstrap.Discord.MessageEmbed()
              .setColor(bootstrap.messageColorRed)
              .setTitle('Update Link Timeout. Please type !updatedeck <deckname> again.')
            reaction.message.edit(editedEndingMessage)
          }
        } else { }
      })
    }
    // Discord Link
    else if ((embeds.length > 4 && embeds[0] === 'You' && reaction.emoji.name === '8️⃣' && user.id !== bootstrap.Env.clientId)) {
      const channel = reaction.message.channel
      const deckID = upperLevelEmbeds.title.slice(9)

      const collector = new bootstrap.Discord.MessageCollector(channel, m => m.author.id === user.id, { time: 10000, max: 1 })

      const selectedEditEmbed = new bootstrap.Discord.MessageEmbed(reaction.message.embeds[0])
        .setColor(bootstrap.messageColorBlue)
        .setDescription('**Selected Discord Link**. Please **enter** the new Discord Link.')
      reaction.message.edit(selectedEditEmbed)

      collector.on('collect', async (message) => {
        const grabEmbed = reaction.message.embeds[0]
        if (grabEmbed.title.toString().split(' ')[0] === 'Update') { } else {
          const promiseReturn = await bootstrap.DeckObj.updateDiscordLink(message, deckID)
          if (promiseReturn === 'Error 1') {
            const nonValidURLEmbed = new bootstrap.Discord.MessageEmbed(selectedEditEmbed)
              .setColor(bootstrap.messageColorRed)
              .setAuthor('Error')
              .setDescription('You have entered a non-valid url. Please try again')
            reaction.message.edit(nonValidURLEmbed)
          } else if (promiseReturn) {
            const updatedDeckEmbed = new bootstrap.Discord.MessageEmbed(selectedEditEmbed)
              .setColor(bootstrap.messageColorGreen)
              .setAuthor('Success!')
              .setURL(promiseReturn[0])
              .setDescription('Updated Discord Link of the deck: **' + promiseReturn[1] + '**')
            reaction.message.edit(updatedDeckEmbed)
          } else {
            const errorDeckEmbed = new bootstrap.Discord.MessageEmbed(selectedEditEmbed)
              .setColor(bootstrap.messageColorRed)
              .setAuthor('Error')
              .setDescription('An error has occurred. Please try again.')
            reaction.message.edit(errorDeckEmbed)
          }
        }
      })
      collector.on('end', collected => {
        if (reaction.message.embeds[0].author !== null) {
          const editedEmbed = reaction.message.embeds[0].author.name.toString().split(' ')
          if (collected.size === 0 && editedEmbed[0] === 'You') {
            const editedEndingMessage = new bootstrap.Discord.MessageEmbed()
              .setColor(bootstrap.messageColorRed)
              .setTitle('Update Link Timeout. Please type !updatedeck <deckname> again.')
            reaction.message.edit(editedEndingMessage)
          }
        } else { }
      })
    }
    // Update Deck Cancelled
    else if ((embeds.length > 4 && embeds[4] === 'update' && reaction.emoji.name === '👎' && user.id !== bootstrap.Env.clientId)) {
      const editedWarningEmbed = new bootstrap.iscord.MessageEmbed()
        .setColor(bootstrap.messageColorRed)
        .setTitle('Update Deck Cancelled')
      reaction.message.edit(editedWarningEmbed)
    }
    // End of Update Deck Block

    // Start of Add Deck Block
    else if ((embeds.length > 4 && embeds[0] === 'Trying' && reaction.emoji.name === '👍' && user.id !== bootstrap.Env.clientId)) {
      const promiseReturn = await bootstrap.DeckHelper.addDeckHelper(reaction.message, upperLevelEmbeds.fields)
      if (promiseReturn === '') {
        const editedWarningEmbed = new bootstrap.Discord.MessageEmbed()
          .setColor(bootstrap.messageColorRed)
          .setTitle('Error saving deck, please try again. ')
        reaction.message.edit(editedWarningEmbed)
      } else {
        const editedSuccessEmbed = new bootstrap.Discord.MessageEmbed()
          .setColor(bootstrap.messageColorGreen)
          .setTitle('Successfully saved the new deck: ' + promiseReturn)
        reaction.message.edit(editedSuccessEmbed)
      }
    } else if ((embeds.length > 4 && embeds[0] === 'Trying' && reaction.emoji.name === '👎' && user.id !== bootstrap.Env.clientId)) {
      const editedWarningEmbed = new bootstrap.Discord.MessageEmbed()
        .setColor(bootstrap.messageColorRed)
        .setTitle('Add Deck Cancelled')
      reaction.message.edit(editedWarningEmbed)
    }
    // End of Add Deck Block
    // Start of End Season Block
    else if ((embeds.length > 4 && embeds[0] === 'WARNING:' && reaction.emoji.name === '👍' && user.id !== bootstrap.Env.clientId)) {
      const returnArr = await bootstrap.SeasonObj.endSeason(reaction.message)
      const successEditedEmbed = new bootstrap.Discord.MessageEmbed()
      if (returnArr[0] === 'Success') {
        successEditedEmbed
          .setAuthor('Successfully Ended Current Season')
          .setColor(bootstrap.messageColorGreen)
          .addFields(
            { name: 'Season Name', value: returnArr[1]._season_name, inline: true },
            { name: 'Season Start Date', value: returnArr[1]._season_start, inline: true },
            { name: 'Season End Date', value: returnArr[2], inline: true }
          )
        reaction.message.edit(successEditedEmbed)
      }
    } else if ((embeds.length > 4 && embeds[0] === 'WARNING:' && reaction.emoji.name === '👎' && user.id !== bootstrap.Env.clientId)) {
      const editedWarningEmbed = new bootstrap.Discord.MessageEmbed()
        .setColor(bootstrap.messageColorRed)
        .setTitle('End Season Cancelled')
      reaction.message.edit(editedWarningEmbed)
    } else { }
  }
}
