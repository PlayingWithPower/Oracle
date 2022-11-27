const bootstrap = require('../bootstrap')

module.exports = {
    async checkRegister(mentionValue, receivedMessage){
        return new Promise((resolve, reject)=>{
            
            let found = 0;
            let notFound = 1;
            let findQuery = {_mentionValue: mentionValue[0], _server: mentionValue[1].guild.id};
            bootstrap.User.findOne(findQuery, function(err, res){
                if (res) {
                    resolve(found)
                    }
                else{
                    resolve(notFound)
                }
            })
        })
    },
    async checkDeck(mentionValue, receivedMessage){
        return new Promise((resolve, reject)=>{
            let found = 0;
            let notFound = 1;
            let invalidDeckSet = 2;
            let findQuery = {_mentionValue: mentionValue[0], _server: mentionValue[1].guild.id};
            bootstrap.User.findOne(findQuery, function(err, res){
                if (res._currentDeck !== "None") {
                    if (res._currentDeck.slice(-8) === " | Rogue"){
                        resolve(found)
                    }
                    else{
                        let deckQuery = {_server: mentionValue[1].guild.id, _name: res._currentDeck};
                        bootstrap.Deck.find(deckQuery, function (err,res){
                                if (res.length > 0){
                                    resolve(found)
                                }
                                else{
                                    resolve(invalidDeckSet)
                                }
                            })
                        }
                    }
                else{
                    resolve(notFound)
                }
            })
        })
    },
    async checkMatchID(guild, matchID){
        let matchQuery = {_match_id: matchID, _server: guild};
        return new Promise((resolve, reject)=>{
            bootstrap.Game.find(matchQuery, function(err,res){
                if (res.length > 0){
                    // let s4 = () => {
                    //     return Math.floor((1 + Math.random()) * 0x1000).toString(16).substring(1);
                    // }
                    // console.log("ran")
                    // let id = s4() + s4() + s4() + s4()
                    // module.exports.checkMatchID(guild, id)

                    // console.log(id)
                }
                else{
                    resolve("Not found")
                }
            })
        })
    },
    async hasDuplicates(enteredUsers){
        let unique = enteredUsers.filter((item, i, ar) => ar.indexOf(item) === i);
        return unique.length !== 4;
    },
    async sendLeaderboardUpdate(isWinner, player, receivedMessage){
        let currentSeasonObj = await bootstrap.SeasonHelper.getCurrentSeason(receivedMessage.guild.id);
        const getThresholds = await bootstrap.ConfigHelper.getThresholds(receivedMessage.guild.id);
        if (isWinner){
            bootstrap.Leaderboard.updateOne(
                {_player: player, _server: receivedMessage.guild.id, _season: currentSeasonObj._season_name},
                {$inc: {_games: 1, _wins: 1, _losses: 0, _points: getThresholds._points_gained } },
                {upsert: true},
                function(result, err){
                })

        }else{
            bootstrap.Leaderboard.updateOne(
                {_player: player, _server: receivedMessage.guild.id, _season: currentSeasonObj._season_name},
                {$inc: {_games: 1, _wins: 0, _losses: 1, _points: -(getThresholds._points_lost) } },
                {upsert: true},
                function(result, err){
                })
        }

    },
};