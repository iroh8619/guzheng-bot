require('dotenv').config();
global.ReadableStream = require('readable-stream').Readable;
const { Client, GatewayIntentBits } = require('discord.js');
const fs = require('fs');
const { createAudioPlayer, createAudioResource, joinVoiceChannel, VoiceConnectionStatus, AudioPlayerStatus, generateDependencyReport } = require('@discordjs/voice');
const sodium = require('libsodium-wrappers');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates
  ]
});

// keepAlive
const express = require('express');
const app = express();

// A simple route that returns a message
app.get('/', (req, res) => {
  res.send('Bot is alive!');
});

// Start server on port 3000 or the port Glitch sets
const listener = app.listen(process.env.PORT || 3000, () => {
  console.log(`Your app is listening on port ${listener.address().port}`);
});

module.exports = app;

client.once('ready', async () => {
  console.log(`Logged in as ${client.user.tag}!`);

  const guild = client.guilds.cache.get('905876133151637575');
  if (!guild) {
    console.error('Guild not found');
    return;
  }

  const channel = guild.channels.cache.get('905876133558493204');
  if (!channel) {
    console.error('Channel not found');
    return;
  }

  try {
    await sodium.ready;
    const connection = joinVoiceChannel({
      channelId: channel.id,
      guildId: guild.id,
      adapterCreator: guild.voiceAdapterCreator,
    });

    connection.on(VoiceConnectionStatus.Ready, () => {
      console.log('Joined voice channel');
      playStream(connection);
    });

  } catch (error) {
    console.error('Error joining voice channel:', error);
  }
});

client.login('ODY1NTMyNTU1NTU3NDcwMjI5.G3tQVk.LOzOhcTIC8QHRx5uCrNU-2eJTgr6MuvxpnVODk');

async function playStream(connection) {
  try {
    const stream = fs.createReadStream('./guz.mp3');
    const resource = createAudioResource(stream);
    const player = createAudioPlayer();

    connection.subscribe(player);
    player.play(resource);

    player.on(AudioPlayerStatus.Idle, () => {
      console.log('Stream ended, retrying...');
      setTimeout(() => playStream(connection), 10000); // Retry after 10 seconds
    });

    player.on('error', error => {
      console.error('Error playing stream:', error);
      setTimeout(() => playStream(connection), 10000); // Retry after 10 seconds
    });
  } catch (error) {
    console.error('Error creating stream:', error);
    setTimeout(() => playStream(connection), 10000); // Retry after 10 seconds
  }
}

console.log(generateDependencyReport());
