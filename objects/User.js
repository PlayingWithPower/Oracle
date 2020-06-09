/**
 * User Object
 *
 * All user based functionality.
 */

module.exports = {

    /**
     * Get user league profile
     */
    profile(receivedMessage, args) {
        MongoClient.connect(url, { useUnifiedTopology: true }, function (err, db){
            var dbo = db.db("UserData")
            let query = {_name: receivedMessage.author.username}
            dbo.collection("users").findOne(query, function(err, res){
                console.log(res)
            })
        });
    },

    /**
     * Shows recent matches
     */
    recent() {

    },

    /**
     * Shows currently registered Deck and Alias
     */
    currentDeck() {

    }

}