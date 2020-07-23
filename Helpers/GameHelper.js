const User = require('../Schema/Users')

module.exports = {
    async checkRegister(mentionValue, receivedMessage){
        
        return new Promise((resolve, reject)=>{
            var found = 0
            var notFound = 1
            let findQuery = {_mentionValue: mentionValue, _server: receivedMessage.guild.id}
            User.findOne(findQuery, function(err, res){
                if (res) {
                    resolve(found)
                    }
                else{
                    resolve(notFound)
                }
            })
        })
    }
}