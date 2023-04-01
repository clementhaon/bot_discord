const http = require("http");
const fs = require('node:fs');
const path = require('node:path');
require('dotenv').config()
const express = require("express");
const cors = require("cors");
const PORT = process.env.PORT || 4000;
const { Configuration, OpenAIApi } = require("openai");
const { Client, Events, GatewayIntentBits } = require('discord.js');
const token = process.env.DISCORD_TOKEN;
const {sendMessageAfterConnection} = require('./controller/connection');
//express
const app = express();
//Cors
app.use("*", cors());
// express configuration here
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use((req, res, next) => {
    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');
    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization');
    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    //res.setHeader('Access-Control-Allow-Credentials', true);
    // Pass to next layer of middleware
    next();
});
app.use("/public", express.static(path.join(__dirname, "/public")));

const httpServer = http.createServer(app);
httpServer.listen(PORT, () => {
    console.log(`http server listening on port ${PORT}`)
});

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);


// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once(Events.ClientReady, c => {
    console.log(`Ready! Logged in as ${c.user.tag}`);
    sendMessageAfterConnection(client);
    const commandsPath = path.join(__dirname, 'commands');
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    client.commands = new Map();
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        // Set a new item in the Collection with the key as the command name and the value as the exported module
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
        } else {
            console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }
});

client.on(Events.InteractionCreate, async interaction => {

    if (interaction.customId === 'maRecette') {
        try {
            await interaction.deferReply({ ephemeral: true });
            const component = interaction.components;
            let array = [];
            for (const actionRowModalDatum of component) {
                let object = {
                    data: actionRowModalDatum.components[0].value
                }
                array.push(object);
            }
            console.log(array[0].data)
            const completion = await openai.createChatCompletion({
                model: "gpt-3.5-turbo",
                messages: [{role: "user", content:`Pourrais tu me trouver une recette pour ${array[0].data}, avec ${array[1].data} mais sans ${array[2].data}`}],
            });
            console.log(completion.data.choices[0].message.content);
            await interaction.editReply({ content: completion.data.choices[0].message.content });
        }catch (e) {
            await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }

    }

    if (!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        return;
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
        } else {
            await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
    }
});
// Log in to Discord with your client's token
client.login(token);