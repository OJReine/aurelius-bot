import { REST, Routes } from 'discord.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readdirSync } from 'fs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const commands = [];

// Load all commands
const loadCommands = async () => {
  const commandFolders = readdirSync(join(__dirname, 'commands'));
  
  for (const folder of commandFolders) {
    const commandFiles = readdirSync(join(__dirname, 'commands', folder)).filter(file => file.endsWith('.js'));
    
    for (const file of commandFiles) {
      const { default: command } = await import(`./commands/${folder}/${file}`);
      if (command.data) {
        commands.push(command.data.toJSON());
        console.log(`◈ Loaded command: ${command.data.name}`);
      }
    }
  }
};

// Deploy commands
const deployCommands = async () => {
  try {
    await loadCommands();
    
    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
    
    console.log(`◈ Started refreshing ${commands.length} application (/) commands.`);
    
    // Deploy to specific guild for testing
    if (process.env.GUILD_ID) {
      await rest.put(
        Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
        { body: commands }
      );
      console.log(`◈ Successfully reloaded ${commands.length} guild commands.`);
    } else {
      // Deploy globally
      await rest.put(
        Routes.applicationCommands(process.env.CLIENT_ID),
        { body: commands }
      );
      console.log(`◈ Successfully reloaded ${commands.length} global commands.`);
    }
  } catch (error) {
    console.error('Error deploying commands:', error);
  }
};

deployCommands();
