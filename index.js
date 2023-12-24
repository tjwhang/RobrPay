require('dotenv/config');
const { Client, IntentsBitField } = require('discord.js');
const { CommandHandler } = require('djs-commander');
const mongoose = require('mongoose')
const mongodb = require('mongodb');
const path = require('path');


const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
    ]
});

new CommandHandler({
    client,
    eventsPath: path.join(__dirname, 'events'),
    commandsPath: path.join(__dirname, 'commands'),
});

(async () => {
    mongoose.connect(process.env.MONGODB_URI).then(() => console.log('Connected to MongoDB')).catch(() => console.log('Connection to MongoDB failed'))

    client.login(process.env.TOKEN);
})();

