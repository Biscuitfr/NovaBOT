require('dotenv').config();
const Discord = require('discord.js');
const { Intents, MessageEmbed, MessageActionRow, MessageSelectMenu, MessageAttachment } = require("discord.js");
const client = new Discord.Client({
  ws : {
    properties: {
      $browser: "Discord Windows",
    },
  },
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES]
});
const mongodb = require("mongodb")
const mongoose = require("mongoose");
const Fs = require('fs');
const ms = require('ms');
const { readdirSync } = require("fs");
const wait = require('node:timers/promises').setTimeout;
const { mutedRoleId, welcomeChannelId, prefix } = require("./config.json");
const fetch = require("node-fetch");

// •=======================================| Uptime Hosting |=======================================• \\

const express = require('express');
const port = 3000;

const app = express();

app.get('/', (request, response) => {
  return response.sendFile('./website/index.html', { root: '.'});
});

app.listen(port, () => console.log(`[Express] App listening at http://localhost:${port}`));

// •=======================================| Mongo DB Connection |=======================================• \\

const mongoURL = process.env.MONGO;

if (!mongoURL) {
  console.log("[Error] No Mongo URL added to in Secrets! There is one way to fix this Error: \n\n[>] Use the key \"MONGO\" and paste your mongo url in the value case.")
  process.exit();
}

mongoose.connect(mongoURL).then(() => console.log('[Mongo] Successfully Connected to mongodb!')).catch((err) => console.log("[Error] The Mongo is probably invalid in Secrets! Please recheck your Mongo URL."))
// •=======================================| Testing Codes |=======================================• \\

// No testing codes available now.

// •=======================================| Welcome System |=======================================• \\

client.on('guildMemberAdd', async user => {

  const channel = user.guild.channels.cache.find(ch => ch.id === welcomeChannelId);

  if (!channel) return console.log("[Warn] No welcome channel id set in config.json file!")

  const embedWelcome = new MessageEmbed()
    .setAuthor({ name: client.user.username, iconURL: client.user.displayAvatarURL() })
    .setTitle(`Welcome, ${user.user.username}!`)
    .setDescription(`Welcome to **${user.guild.name}**, We're glad that you are here!`)
    .setThumbnail(user.user.displayAvatarURL())
    .setImage("https://media.discordapp.net/attachments/951847867943907338/953641012281102397/CMG-Create-Free-Backgrounds-You-Can-Use-in-Proclaim.gif?width=640&height=361")
    .setColor("RANDOM")
    .setTimestamp()
    .setFooter(`© 2022, ${client.user.username}.`)

  channel.send({ embeds: [embedWelcome]})
  
})

// •=======================================| Auto Moderation |=======================================• \\

const { emoji } = require("./config/automod/emoji.json");

client.on("guildMemberAdd", async (member) => {
  let UserJSON = JSON.parse(Fs.readFileSync("./database/users.json"));
  UserJSON[member.id] = {
    warns: 0
  }
  Fs.writeFileSync("./database/users.json", JSON.stringify(UserJSON));
})

let badWords = require("./config/automod/swears.json")
client.on("message", async message => {
  let UserJSON = JSON.parse(Fs.readFileSync("./database/users.json"));

  if (!UserJSON[message.author.id]) {
    if (message.author.bot) return;
    UserJSON[message.author.id] = {
      warns: 0
    }
    Fs.writeFileSync("./database/users.json", JSON.stringify(UserJSON));
  }
for (i = 0; i < badWords.length; i++) {
if (message.content.toLowerCase().includes(badWords[i])) {
  
message.channel.send(`${message.author}, ${emoji} **Watch your language!** Continuing with 3 total infractions will ends in a mute.`).catch(err => console.log(err));

message.delete().catch(err => console.log(err));

UserJSON[message.author.id].warns += 1;
Fs.writeFileSync("./database/users.json", JSON.stringify(UserJSON));

    try {
if (UserJSON[message.author.id].warns === 3) {
 
(Fs.readFileSync("./database/users.json"));
  
  UserJSON[message.author.id].warns = 0;
  
  Fs.writeFileSync("./database/users.json", JSON.stringify(UserJSON));

  const user = message.member

  // ------- NEW AUTO MUTE BY TIMEOUT FUNCTION -------

  const { timeout } = require("./config/automod/timeout.json")

  const time = timeout;

  const milliseconds = ms(time);

  const iosTime = new Date(Date.now() + milliseconds).toISOString();

  try {

	  await fetch(`https://discord.com/api/guilds/${message.guild.id}/members/${user.id}`, {
		  method: 'PATCH',
		  body: JSON.stringify({ communication_disabled_until: iosTime }),
		  headers: {
			  'Content-Type': 'application/json',
			  'Authorization': `Bot ${client.token}`,
		  },
	  });

  } catch (err) {

    console.log("[AutoMod - Error] ", err)
    
  }

  const embedMuted = new MessageEmbed()
    .setDescription(`${user} has been **Timeout** for **__Continuous Infractions__.**`)
    .setColor("RED");

  message.channel.send({ embeds: [embedMuted] })
  
}
    } catch (err) {
      
      console.log(err)
      
    }
        }
    }
})

// •=======================================| Console Logs |=======================================• \\

console.log("T.F.A#7524 - Official Bot Dev.\n")
console.log(`
████████╗░░░███████╗░░░░█████╗░
╚══██╔══╝░░░██╔════╝░░░██╔══██╗
░░░██║░░░░░░█████╗░░░░░███████║
░░░██║░░░░░░██╔══╝░░░░░██╔══██║
░░░██║░░░██╗██║░░░░░██╗██║░░██║
░░░╚═╝░░░╚═╝╚═╝░░░░░╚═╝╚═╝░░╚═╝\n`)
console.log("For more info, Check the folder called 'docs'.\n")

// •=======================================| Events and Commands Handler |=======================================• \\

client.config = require('./config.json');
client.commands = new Discord.Collection();

const events = readdirSync('./events/').filter(file => file.endsWith('.js'));

console.log(`[Handler - Events] Loading the events...`);
for (const file of events) {
    const event = require(`./events/${file}`);
    console.log(`[Handler - Events] Status: ✅ • Loaded event: ${file.split('.')[0]}`);
    client.on(file.split('.')[0], event.bind(null, client));
    delete require.cache[require.resolve(`./events/${file}`)];
};

console.log(`\n[Handler - Cmds] Loading the commands...`);

readdirSync('./commands/').forEach(dirs => {
    const commands = readdirSync(`./commands/${dirs}`).filter(files => files.endsWith('.js'));
    for (const file of commands) {
        const command = require(`./commands/${dirs}/${file}`);
        console.log(`[Handler - Cmds] Status: ✅ • Loaded command: ${command.name.toLowerCase()}`);
        client.commands.set(command.name.toLowerCase(), command);
        delete require.cache[require.resolve(`./commands/${dirs}/${file}`)];
    };
});

// •=======================================| Snipe and other Commands: |=======================================• \\

client.snipes = new Map()

client.on('messageDelete', function(message, channel) {
  client.snipes.set(message.channel.id, {
    content: message.content,
    author: message.author.id,
    image: message.attachments.first() ? message.attachments.first().proxyURL : null
  })
})

client.on('messageCreate', async (message) => {
  if(message.content === `${prefix}snipe`){
    const { moderatorRoleId } = require("./config.json")
    const modRole = message.guild.roles.cache.find(role => role.id === moderatorRoleId);

    if (!modRole)
    return console.log("[WARN] The Mods role does not exist!");

    if (!message.member.roles.cache.has(modRole.id)) return message.reply({ content: `\`⛔\` **Missing Permissions:**\nYou are not allowed to use this command.`}).then(() => message.delete());
    const msg = client.snipes.get(message.channel.id)
    if(!msg) return message.reply({ content: `**No latest Deleted Message was Found.**` })

    const embed = new MessageEmbed()
      .setTitle("Snipe Command:")
      .setDescription(`**Channel:** <#${message.channel.id}>\n\n**User:** <@${msg.author}>\n\n**Message:** ${msg.content}`)
      .setColor("RED")
      .setFooter("WARNING: Snipe command Doesn't break Discord ToS.")
      .setTimestamp();

    if(msg.image) embed.setImage(msg.image)
    message.reply({ content: `<:snipemoment:949410093655556096> **Last Deleted Message:**`, embeds: [embed] })
  }
})

// •=======================================| Login to Bot and YT API Handler |=======================================• \\

console.log(" ") // Just use this to keep the console logs organized.

client.login(process.env.TOKEN).catch(() => console.log("\n[Error] Bot Token Invalid or Missing Intents! Please recheck your bot token or enable all the Intents."));

const Token = process.env.TOKEN;

if(!Token) {
  console.log("\n[Error] No Bot Token provided in Secrets! Please fix this error on your application page on Discord Developer's Website."), process.exit();
}

const YTAPI = process.env.YT_API;

if(!YTAPI) {
  console.log("\n[Warn] Youtube API Key is not Found! Please create a YT Api Key, or use someone else's key to make some commands runs correctly.");
} else {
  console.log("[YT-API] Youtube API Found in Secrets!")
}