const Discord = require('discord.js')

//Colors
const messageColorRed = "#af0000"
const messageColorGreen = "#5fff00"
const messageColorBlue = "#0099ff"

module.exports = {

    /**
     * This is used in !deck to quickly create 5 embeds, one for each color
     * @param {*} colorArr 
     * @param {*} colorNum 
     */
    createDeckEmbed(colorArr, colorNum){
        const someEmbed = new Discord.MessageEmbed()
            .setColor(messageColorBlue)
            .setAuthor(colorNum)
        for(i = 0; i < colorArr.length; i++){
            someEmbed.addFields(
                { name: " \u200b",value: colorArr[i], inline: true},
            )
        }
        return someEmbed
    },
    /**
     * toUpper()
     * @param {*} str 
     */
    toUpper(str) {
    return str
        .toLowerCase()
        .split(' ')
        .map(function(word) {
            return word[0].toUpperCase() + word.substr(1);
        })
        .join(' ');
    }

}