// Deploy Commands Script
// Run this after successful Render deployment

import { REST, Routes } from 'discord.js';
import { readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const commands = [];

// Load all commands
const commandFolders = readdirSync(join(__dirname, 'src/commands'));

for (const folder of commandFolders) {
  const commandFiles = readdirSync(join(__dirname, 'src/commands', folder)).filter(file => file.endsWith('.js'));
  
  for (const file of commandFiles) {
    const command = await import(`./src/commands/${folder}/${file}`);
    if (command.default.data) {
      commands.push(command.default.data.toJSON());
      console.log(`◆ Loaded command: ${command.default.data.name}`);
    }
  }
}

// Deploy commands
const deployCommands = async () => {
  try {
    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
    
    console.log(`◆ Started refreshing ${commands.length} application (/) commands.`);
    
    // Deploy globally for DM functionality and multi-server support
    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands }
    );
    console.log(`◆ Successfully reloaded ${commands.length} global commands.`);
    
    // Also deploy to test guild if specified
    if (process.env.GUILD_ID) {
      await rest.put(
        Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
        { body: commands }
      );
      console.log(`◆ Successfully reloaded ${commands.length} guild commands for testing.`);
    }
  } catch (error) {
    console.error('Error deploying commands:', error);
  }
};

deployCommands();
