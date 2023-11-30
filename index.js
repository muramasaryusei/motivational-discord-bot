const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
const rebootServer = require("./server");

// Discord.js Client Constructor (client to connect to our discord server)
const client = new Client({ intents: [
  GatewayIntentBits.Guilds,
  GatewayIntentBits.GuildMembers,
  GatewayIntentBits.GuildMessages,
  GatewayIntentBits.MessageContent,
], });


//access your commands from other files (connecting .commands property in your client instance.)
client.commands = new Collection();

//command handler 

// Grab all the command folders from the commands directory you created earlier
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

// Grab all the command files that ends with .js from the commands directory you created earlier
for (const folder of commandFolders) {
  const commandsPath = path.join(foldersPath, folder);
  const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

// Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
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
}


//listening to ready event and once it connects, it calls a callback function which console logs a message.
client.on(Events.ClientReady, readyClient => {
  console.log(`Logged in as ${readyClient.user.tag}!`);
});


// Event listener for handling user interactions such as chat input commands
client.on(Events.InteractionCreate, async interaction => {
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
// Check if the interaction has been replied to or deferred
if (interaction.replied || interaction.deferred) {
  // If interaction has been replied to or deferred, follow up with an error message
  await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
} else {
  // If interaction has not been replied to or deferred, reply with an error message
  await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
}
  }
});

rebootServer();
//to login to the server, we need to call the client.login method
client.login(process.env.TOKEN);