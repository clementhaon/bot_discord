require('dotenv').config()

const sendMessageAfterConnection = (client) => {
    try {
        const channelConnection = process.env.CHANNEL_MSG_CONNECTION;
        client.channels.cache.get(channelConnection).send('Je suis connecté')
    } catch (e) {
        console.log(e)
    }
};

module.exports = {sendMessageAfterConnection};