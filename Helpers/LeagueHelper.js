const bootstrap = require('../bootstrap.js')

module.exports = {
    getUserAvatarUrl(user) {
        return "https://cdn.discordapp.com/avatars/" + user.id + "/" + user.avatar + ".png"
    },
    getUserFromMention(mention) {
        if (!mention) return;
        return bootstrap.Client.users.fetch(mention)
        // if (mention.startsWith('<@') && mention.endsWith('>')) {
        // 	mention = mention.slice(2, -1);

        // 	if (mention.startsWith('!')) {
        // 		mention = mention.slice(1);
        //     }
        // }
    },
}