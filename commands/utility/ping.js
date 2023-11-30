const { SlashCommandBuilder } = require('discord.js');
const fetch = require('node-fetch');


function getQuote() {
  return fetch("https://zenquotes.io/api/random")
    .then(res => {
      return res.json()
    })
    .then(data => {
      return data[0]["q"] + " -" + data[0]["a"]
    });
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Replies with Motivational Quotes!'),
  async execute(interaction) {
    await getQuote().then(quote => interaction.reply(quote));
  },
};