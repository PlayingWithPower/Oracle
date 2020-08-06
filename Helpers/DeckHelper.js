const Discord = require('discord.js')
const { resolve } = require('path')

//Colors
const messageColorRed = "#af0000"
const messageColorGreen = "#5fff00"
const messageColorBlue = "#0099ff"

module.exports = {
    /**
     * Counts the number of times of a value occurrs
     */
    getOccurrence(array, value) {
        return array.filter((v) => (v === value)).length;
    },
    /**
     * This is used in !deck to quickly create 5 embeds, one for each color
     * @param {*} colorArr 
     * @param {*} colorNum 
     */
    createDeckEmbed(colorArr, colorNum){
        const someEmbed = new Discord.MessageEmbed()
            .setColor(messageColorBlue)
            .setAuthor(colorNum)
        if (colorArr.length == 0){
            someEmbed.addFields(
                { name: " \u200b",value: "No Decks of these color registered", inline: true},
            )
        }
        else{
            someEmbed.addFields(
                { name: " \u200b", value: colorArr}
            )
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
    toUpper(str) {
    return str
        .toLowerCase()
        .split(' ')
        .map(function(word) {
            return word[0].toUpperCase() + word.substr(1);
        })
        .join(' ');
    },
    /**
     * Checks if the deck a user is trying to update is valid. 
     * Helper Function to the two below updateDeckName() and updateDeckList()
     */
    findDeckToUpdate(receivedMessage, args){
        const deck = require('../Schema/Deck')
        args = args.join(' ')
        let lowerArgs = args.toString().toLowerCase()
        let deckQuery = {_alias: lowerArgs, _server: receivedMessage.guild.id}
        return new Promise((resolve, reject)=>{
            deck.find(deckQuery, function(err, res){
                if (res.length > 0){
                    resolve(res)
                }
                else{
                    resolve("Error 1")
                }
            })
        })
    },
    /** 
     * Locates the deck to remove. Then waits for user reaction
     */
    findDeckToRemove(receivedMessage, args){
        const deck = require('../Schema/Deck')
        args = args.join(' ')
        let lowerArgs = args.toString().toLowerCase()
        let deckQuery = {_alias: lowerArgs, _server: receivedMessage.guild.id}
        return new Promise((resolve, reject)=>{
            deck.find(deckQuery, function(err, res){
                if (res.length > 0){
                    resolve(res)
                }
                else{
                    resolve("Error 1")
                }
            })
        })
    },
    addDeckHelper(message, args){
        const deck = require('../Schema/Deck')
        const alias = require('../Schema/Alias')
        let primerBool
        if (args[7].value == "False"){
            primerBool = false
        }
        else{
            primerBool = true
        }
        let deckSave = {
            '_link': args[3].value, 
            '_name': args[0].value, 
            '_alias': args[0].value.toLowerCase(),
            '_commander': args[1].value,
            '_colors': args[2].value,
            '_author': args[4].value,
            '_server': message.guild.id, 
            '_season': "1",
            '_description': args[5].value,
            '_discordLink': args[8].value,
            '_dateAdded': "",
            '_deckType': args[6].value,
            '_hasPrimer': primerBool
        }
        let aliasSave = {
            '_name': args[0].value, 
            '_server': message.guild.id
        }
        return new Promise ((resolve, reject)=>{
            deck(deckSave).save(function(err, res){
                if (res){
                    alias(aliasSave).save(function(err, res){
                        if (res){
                            resolve(args[0].value)
                            //DEBUG: console.log("DEBUG: Successfully saved to ALIAS DB")
                        }
                        else{
                            resolve("Error 1")
                        }
                    })
                    //DEBUG: console.log("DEBUG: Successfully saved to DECK DB")
                }
                else{
                    resolve("Error 1")
                }
            })
        })
    },
    async checkColorDictionary(input){
        colorDictionary = {
            white: "w",
            blue: "u",
            black: "b",
            red: "r",
            green: "g",

            azorious: "w, u",
            dimir: "u, b",
            rakdos: "b, r",
            gruul: "r, g",
            selesnya: "g, w",

            orzhov: "w, b",
            izzet: "u, r",
            golgari: "b, g",
            boros: "r, w",
            simic: "u, b",

            bant: "w, u, g",
            esper: "w, u, b",
            grixis: "u, b, r",
            jund: "b, r, g",
            naya: "w, r, g",

            abzan: "w, b, g",
            jeskai: "w, b, r",
            sultai: "u, b, g",
            mardu: "w, b, r",
            temur: "u, r, g",

            sansgreen: "w, u, b, r",
            sanswhite: "u, b, r, g",
            sansblue: "w, b, r, g",
            sansblack: "w, u, r, g",
            sansred: "w, u, b, g",
        }
        if (colorDictionary.hasOwnProperty(input.toLowerCase())) {
            return new Promise((resolve, reject)=>{
                resolve(colorDictionary[input.toLowerCase()])
            })
            
        }
        else{
            return new Promise((resolve, reject)=>{
                resolve("Not found")
            })
        }
    }
}