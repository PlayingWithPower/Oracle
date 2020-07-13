
const Discord = require('discord.js')

//Colors
const messageColorRed = "#af0000"
const messageColorGreen = "#5fff00"
const messageColorBlue = "#0099ff"

//Objects
const deckObj = require('../objects/Deck')
const gameObj = require('../objects/Game')

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
    async manageReaction(reaction, user) {
        const msg = reaction.message.content.toString().split(' ');
        var embeds = reaction.message.embeds[0]
        var upperLevelEmbeds = reaction.message.embeds[0]
        //Resolving issues where a user would upvote/downvote, then do it again. It would cause embeds.author to be null
        //  causing error log later on
        //console.log(embeds)
        if (embeds.author === null){
            return
        }
        else{
            embeds = embeds.author.name.toString().split(' ')
        }
        //console.log(upperLevelEmbeds.description.toString().split(' '))
        let sanitizedString = "<@!"+user.id+">"
        
        // Catch impersonators block -- Remove if you want bot to react to reactions on non-bot messages
        if (reaction.message.author.id != "717073766030508072") {
            return
        }
        // Game Block
        if (embeds.length > 1 && embeds[0] == "Game" && embeds[1] == "ID:" && reaction.emoji.name === '👍' && user.id != "717073766030508072") {
            grabMentionValue = upperLevelEmbeds.description.toString().split(' ')[0]
            grabMatchID =  embeds[2]
            if (sanitizedString !=  grabMentionValue){
                return
            }
            // 1 = name Ga
            // 2 = ID: 
            // 3 = match ID
            //
            //const result = await gameObj.confirmMatch(msg[3], sanitizedString).catch((message) => {
            //})
            gameObj.confirmMatch(grabMatchID, sanitizedString).then(function() {
                    gameObj.checkMatch(grabMatchID).then(function(next) {
                        if (next == "SUCCESS") {
                            gameObj.logMatch(grabMatchID).then(function(final) {
                                gameObj.finishMatch(grabMatchID).then(function(){
                                    let generalChannel = getChannelID(reaction.message)
                                    const logMessage = new Discord.MessageEmbed()
                                            .setColor(messageColorGreen)
                                            .setDescription("Match logged!")
                                    generalChannel.send(logMessage)
                                    final.forEach(message => {
                                        const confirmMessage = new Discord.MessageEmbed()
                                            .setColor(messageColorGreen)
                                            .setDescription(message)
                                        generalChannel.send(confirmMessage)
                                    })
                                    console.log("Game #" + grabMatchID + " success")
                                    return
                                }).catch((message) => {
                                    console.log("Finishing Game #" + grabMatchID + " failed. ERROR:", message)
                                    })

                            }).catch((message) => {
                                console.log("ERROR: " + message)
                                return
                                })
                        }
                    }).catch((message) => {
                        console.log("ERROR: " + message)
                        return
                        })
            }).catch((message) => {
                console.log("ERROR: " + message)
                return
                })
        }
        
        else if ((embeds.length > 1 && embeds[0] == "Game" && embeds[1] == "ID:" && reaction.emoji.name === '👎' && user.id != "717073766030508072")){
            grabMentionValue = upperLevelEmbeds.description.toString().split(' ')[0]
            grabMatchID =  embeds[2]
            if (sanitizedString !=  grabMentionValue){
                console.log("not the right user")
                return
            }
            const result = await gameObj.closeMatch(grabMatchID).catch((message) => {
                console.log("Closing Game #" + grabMatchID + " failed.")
            })
            if (result == 'SUCCESS'){
                let generalChannel = getChannelID(reaction.message)
                const cancelledEmbed = new Discord.MessageEmbed()
                    .setColor(messageColorGreen)
                    .setDescription(grabMentionValue + " cancelled the Match Log")
                generalChannel.send(cancelledEmbed)
            }
            else {
                return
            }
        }
        //end of game block
        //Confirm Delete Match Block
        else if ((embeds.length > 1 && embeds[5] == "delete" && reaction.emoji.name === '👍' && user.id != "717073766030508072")) {
            grabMentionValue = upperLevelEmbeds.description.toString().split(' ')
            grabMatchID = upperLevelEmbeds.title.toString().split(' ')
            if (sanitizedString != grabMentionValue[0]) {
                return
            }
            var generalChannel = getChannelID(reaction.message)
            console.log(grabMatchID)
            gameObj.confirmedDeleteMatch(grabMatchID[2], reaction.message).then((message) => {  
                const successEmbed = new Discord.MessageEmbed()
                    .setColor(messageColorGreen)
                    .setAuthor("Successfully deleted")
                    .setDescription(grabMentionValue[0] + " Match ID:" + grabMatchID[2] + " was deleted")
                reaction.message.edit(successEmbed)
            }).catch((message) => {
                const errorEmbed = new Discord.MessageEmbed()
                    .setColor(messageColorRed)
                    .setAuthor("Error Deleting")
                    .setDescription("Match already deleted")
                reaction.message.edit(errorEmbed)
            })
        }
        else if ((embeds.length > 1 && embeds[5] == "delete" && reaction.emoji.name === '👎' && user.id != "717073766030508072")) {
            grabMentionValue = upperLevelEmbeds.description.toString().split(' ')
            grabMatchID = upperLevelEmbeds.title.toString().split(' ')
            if (sanitizedString != grabMentionValue[0]) {
                return
            }
            const errorEmbed = new Discord.MessageEmbed()
                .setColor(messageColorRed)
                .setAuthor("Delete Cancelled")
                .setDescription(grabMentionValue[0] + " you have **cancelled** deleteting Match ID: **" + grabMatchID[2]+"**")
            reaction.message.edit(errorEmbed);
        }
        //End of Confirm Delete Match Block
        
        //Start of Remove Deck Reacts
        else if((embeds.length == 1 && embeds == "WARNING" && reaction.emoji.name === '👍' && user.id != "717073766030508072")){
        
        let removeDeckResult = await deckObj.removeDeck(reaction.message.embeds[0].title)

        if (removeDeckResult.deletedCount >= 1 ){
            const editedWarningEmbed = new Discord.MessageEmbed()
                .setColor(messageColorGreen) //green
                .setTitle("Successfully Deleted Deck")
            reaction.message.edit(editedWarningEmbed);
        }
        else{
            const editedWarningEmbed = new Discord.MessageEmbed()
                .setColor(messageColorRed) //red
                .setTitle("Unknown Error Occurred. Please try again. Check !deck for the deck you're trying to delete.")
            reaction.message.edit(editedWarningEmbed);
        }
        
        }
        
        else if((embeds.length == 1 && embeds == "WARNING" && reaction.emoji.name === '👎' && user.id != "717073766030508072")){
            const editedWarningEmbed = new Discord.MessageEmbed()
                .setColor(messageColorRed) //red
                .setTitle("Delete Deck Cancelled")
            reaction.message.edit(editedWarningEmbed);
        }
        //End of Remove Deck Reacts

        //Start of Update Deck Reacts
        else if((embeds.length > 4 && embeds[0] == "You" && reaction.emoji.name === '1️⃣' && user.id != "717073766030508072")){
            let channel = reaction.message.channel
            let deckID = upperLevelEmbeds.title.slice(9)
            var oldDeckName = ""
            var newDeckName = ""

            const collector = new Discord.MessageCollector(channel, m => m.author.id === user.id, {time: 10000, max: 1 })
            
            const selectedEditEmbed = new Discord.MessageEmbed(reaction.message.embeds[0])
                .setColor(messageColorBlue)
                .setDescription("**Selected Deck Name**. Please **type** the new deck name.")
            reaction.message.edit(selectedEditEmbed);

            collector.on('collect', async(message) => {
                var grabEmbed = reaction.message.embeds[0]
                if (grabEmbed.title.toString().split(' ')[0] == "Update"){
                    return
                }
                else{
                    let promiseReturn = await deckObj.updateDeckName(message, deckID)
                    if (promiseReturn){
                        newDeckName = promiseReturn[0][1]
                        oldDeckName = promiseReturn[1][1] 

                        const updatedDeckEmbed = new Discord.MessageEmbed(selectedEditEmbed)
                            .setColor(messageColorGreen)
                            .setAuthor("Success!")
                            .setDescription("**Updated** deck name of **" + oldDeckName + "** to **" + newDeckName + "**")
                        reaction.message.edit(updatedDeckEmbed);
                    }
                    else{
                        const errorDeckEmbed = new Discord.MessageEmbed(selectedEditEmbed)
                            .setColor(messageColorRed)
                            .setAuthor("Error")
                            .setDescription("An error has occurred. Please try again.")
                        reaction.message.edit(errorDeckEmbed);
                    }
                }
            })
            collector.on('end', collected =>{
                if (reaction.message.embeds[0].author != null){
                    let editedEmbed = reaction.message.embeds[0].author.name.toString().split(' ')
                    if (collected.size == 0 && editedEmbed[0] == "You"){
                        const editedEndingMessage = new Discord.MessageEmbed()
                            .setColor(messageColorRed)
                            .setTitle("Update Deck Timeout. Please type !updatedeck <deckname> again.")
                        reaction.message.edit(editedEndingMessage);
                    }
                }
                else{
                    return
                }
            })
    
        }
        else if((embeds.length > 4 && embeds[0] == "You" && reaction.emoji.name === '2️⃣' && user.id != "717073766030508072")){
            let channel = reaction.message.channel
            let deckID = upperLevelEmbeds.title.slice(9)

            const collector = new Discord.MessageCollector(channel, m => m.author.id === user.id, {time: 10000, max: 1 })
            
            const selectedEditEmbed = new Discord.MessageEmbed(reaction.message.embeds[0])
                .setColor(messageColorBlue)
                .setDescription("**Selected Deck Link**. Please **enter** the new deck link.")
            reaction.message.edit(selectedEditEmbed);

            collector.on('collect', async(message) => {
                if (grabEmbed.title.toString().split(' ')[0] == "Update"){
                    return
                }
                else{
                    let promiseReturn = await deckObj.updateDeckList(message, deckID)
                    if (promiseReturn == "Error 1"){
                        const nonValidURLEmbed = new Discord.MessageEmbed(selectedEditEmbed)
                            .setColor(messageColorRed)
                            .setAuthor("Error")
                            .setDescription("You have entered a non-valid url. Please try again")
                        reaction.message.edit(nonValidURLEmbed);
                    }
                    else if (promiseReturn){
                        const updatedDeckEmbed = new Discord.MessageEmbed(selectedEditEmbed)
                            .setColor(messageColorGreen)
                            .setAuthor("Success!")
                            .setURL(promiseReturn[0])
                            .setDescription("**Updated** deck list of **" + promiseReturn[1] + "**")
                        reaction.message.edit(updatedDeckEmbed);
                    }
                    else{
                        const errorDeckEmbed = new Discord.MessageEmbed(selectedEditEmbed)
                            .setColor(messageColorRed)
                            .setAuthor("Error")
                            .setDescription("An error has occurred. Please try again.")
                        reaction.message.edit(errorDeckEmbed);
                    }
                }
            })
            collector.on('end', collected =>{
                if (reaction.message.embeds[0].author != null){
                    let editedEmbed = reaction.message.embeds[0].author.name.toString().split(' ')
                    if (collected.size == 0 && editedEmbed[0] == "You"){
                        const editedEndingMessage = new Discord.MessageEmbed()
                            .setColor(messageColorRed)
                            .setTitle("Update Link Timeout. Please type !updatedeck <deckname> again.")
                        reaction.message.edit(editedEndingMessage);
                    }
                }
                else{
                    return
                }
            })
    
        }
        else if((embeds.length > 4 && embeds[4] == "update" && reaction.emoji.name === '👎' && user.id != "717073766030508072")){
            const editedWarningEmbed = new Discord.MessageEmbed()
                .setColor(messageColorRed)
                .setTitle("Update Deck Cancelled")
            reaction.message.edit(editedWarningEmbed);
        }
        //End of Update Deck Block
        
        //Start of Add Deck Block
        else if ((embeds.length > 4 && embeds[0] == "Trying"&& reaction.emoji.name === '👍' && user.id != "717073766030508072")){
            let promiseReturn = await deckObj.addDeckHelper(reaction.message, upperLevelEmbeds.fields)
            if (promiseReturn == ""){
                const editedWarningEmbed = new Discord.MessageEmbed()
                .setColor(messageColorRed)
                .setTitle("Error saving deck, please try again. ")
            reaction.message.edit(editedWarningEmbed);
            }
            else{
                const editedSuccessEmbed = new Discord.MessageEmbed()
                .setColor(messageColorGreen)
                .setTitle("Successfully saved the new deck: " + promiseReturn)
            reaction.message.edit(editedSuccessEmbed)
            }
        }
        else if ((embeds.length > 4 && embeds[0] == "Trying"&& reaction.emoji.name === '👎' && user.id != "717073766030508072")){
            const editedWarningEmbed = new Discord.MessageEmbed()
                .setColor(messageColorRed)
                .setTitle("Add Deck Cancelled")
            reaction.message.edit(editedWarningEmbed);
        }
        else {
            
            return
        }
        
    }
}