const bootstrap = require('../bootstrap');

module.exports = {
    /**
     * This is used in !deck to quickly create 5 embeds, one for each color
     * @param {*} colorArr 
     * @param {*} colorNum 
     */
    createDeckEmbed(colorArr, colorNum){
        const someEmbed = new bootstrap.Discord.MessageEmbed()
            .setColor(bootstrap.messageColorBlue)
            .setAuthor(colorNum);
        if (colorArr.length === 0){
            someEmbed.addFields(
                { name: " \u200b",value: "No Decks of these color registered", inline: true},
            )
        }
        else{
            let holder = "";
            colorArr.forEach(entry => {
                holder = holder + entry + " \n"
            });
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
        args = args.join(' ');
        let lowerArgs = args.toString().toLowerCase();
        let deckQuery = {_alias: lowerArgs, _server: receivedMessage.guild.id};
        return new Promise((resolve, reject)=>{
            bootstrap.Deck.find(deckQuery, function(err, res){
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
     * Similar to the method above, except with small modifications to account for where it is called.
     * Update Deck related ManageReactionHelper.js functions will call this to check and get results on the
     * deck a user is trying to update.
     * @param deckName - The deck to update
     * @param guild - the guild to search for the deck in
     */
    findDeckToUpdateReactionHelper(guild, deckName){
        let lowerCaseDeck = deckName.toLowerCase();
        let deckQuery = {_alias: lowerCaseDeck, _server: guild};
        return new Promise((resolve, reject)=>{
            bootstrap.Deck.find(deckQuery, function(err, res){
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
        args = args.join(' ');
        let lowerArgs = args.toString().toLowerCase();
        let deckQuery = {_alias: lowerArgs, _server: receivedMessage.guild.id};
        return new Promise((resolve, reject)=>{
            bootstrap.Deck.find(deckQuery, function(err, res){
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
        let primerBool;
        if (args[7].value === "False"){
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
        };
        let aliasSave = {
            '_name': args[0].value, 
            '_server': message.guild.id
        };
        return new Promise ((resolve, reject)=>{
            bootstrap.Deck(deckSave).save(function(err, res){
                if (res){
                    bootstrap.Alias(aliasSave).save(function(err, res){
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
        let colorDictionary = {
            colorless: "c",
            brown: "c",

            white: "w",
            blue: "u",
            black: "b",
            red: "r",
            green: "g",

            azorius: "w, u",
            dimir: "u, b",
            rakdos: "b, r",
            gruul: "r, g",
            selesnya: "g, w",

            orzhov: "w, b",
            izzet: "u, r",
            golgari: "b, g",
            boros: "r, w",
            simic: "u, g",

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

            wubrg: "w, u, b, r, g",
            '5color': "w, u, b, r, g",
            '5c': "w, u, b, r, g",
            '5-c': "w, u, b, r, g",
            '5-color': "w, u, b, r, g",
        };
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
    },
    async commanderChecker(input, receivedMessage){
        return new Promise((resolve, reject)=>{
            input = module.exports.toUpper(input);
            bootstrap.Deck.find(
                {_server: receivedMessage.guild.id,
                    '$text':{'$search': input}
                }, 
                function(err,res){
                    if (err){console.log(err)}
                    resolve(res)
            })
        })
    }
};