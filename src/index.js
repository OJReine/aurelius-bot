import { Client, GatewayIntentBits, Collection, EmbedBuilder, ActivityType } from 'discord.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readdirSync } from 'fs';
import dotenv from 'dotenv';
import cron from 'node-cron';
import http from 'http';
import { dbHelpers } from './database/schema.js';
import { initializeDatabase } from './database/init.js';
import aiService from './services/aiService.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create Discord client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// Command collection
client.commands = new Collection();

// Aurelius Bot Configuration
const BOT_CONFIG = {
  name: 'Aurelius',
  symbols: {
    title: '◆',        // Diamond for titles and structure
    accent: '◇',       // White diamond for accents
    footer: '❧',       // Floral heart for poetic endings
    achievement: '✦',  // White four-pointed star for achievements
    bullet: '•',
    heart: '♡'
  },
  colors: {
    primary: 0x6B73FF,
    secondary: 0x9B59B6,
    success: 0x2ECC71,
    warning: 0xF39C12,
    error: 0xE74C3C,
    info: 0x3498DB
  },
  personality: {
    greeting: "Hello there, beautiful!",
    encouragement: "You're doing amazing work!",
    support: "I'm here to help make your modeling journey smoother.",
    farewell: "Take care and keep shining!"
  }
};

// Load commands
const loadCommands = async () => {
  const commandFolders = readdirSync(join(__dirname, 'commands'));
  
  for (const folder of commandFolders) {
    const commandFiles = readdirSync(join(__dirname, 'commands', folder)).filter(file => file.endsWith('.js'));
    
    for (const file of commandFiles) {
      const { default: command } = await import(`./commands/${folder}/${file}`);
      if (command.data && command.execute) {
        client.commands.set(command.data.name, command);
        console.log(`◈ Loaded command: ${command.data.name}`);
      }
    }
  }
};

// Create elegant embed helper
const createEmbed = (title, description, color = BOT_CONFIG.colors.primary, fields = []) => {
  const embed = new EmbedBuilder()
    .setTitle(`${BOT_CONFIG.symbols.title} ${title}`)
    .setDescription(description)
    .setColor(color)
    .setTimestamp()
    .setFooter({ 
      text: `${BOT_CONFIG.symbols.footer} ${getRandomFooterMotto()}`,
      iconURL: client.user?.displayAvatarURL()
    });
  
  if (fields.length > 0) {
    embed.addFields(fields);
  }
  
  return embed;
};

// Random footer mottos for Aurelius
const getRandomFooterMotto = () => {
  const mottos = [
    "In gentle guidance, creativity finds its truest expression.",
    "Every stream is a step toward greater artistry.",
    "Structure and beauty dance together in perfect harmony.",
    "Your dedication transforms dreams into reality.",
    "In the rhythm of creation, magic happens.",
    "Each moment of organization is a gift to your future self.",
    "The path to excellence is paved with careful planning.",
    "Your passion illuminates every project you touch."
  ];
  return mottos[Math.floor(Math.random() * mottos.length)];
};

// Bot ready event
client.once('ready', async () => {
  console.log(`◈ ${BOT_CONFIG.name} is ready and online!`);
  console.log(`◈ Logged in as: ${client.user.tag}`);
  console.log(`◈ Serving ${client.guilds.cache.size} servers`);
  
  // Initialize database
  try {
    await initializeDatabase();
  } catch (error) {
    console.error('Failed to initialize database:', error);
  }
  
  // Initialize AI service
  try {
    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (geminiApiKey) {
      aiService.initialize(geminiApiKey);
    } else {
      console.log('◆ No Gemini API key found. AI features will use fallback templates.');
    }
  } catch (error) {
    console.error('Failed to initialize AI service:', error);
  }
  
  // Set bot activity
  client.user.setActivity('your modeling journey', { type: ActivityType.Watching });
  
  // Load commands
  await loadCommands();
  
  // Start scheduled tasks
  startScheduledTasks();
});

// Interaction handling
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  
  const command = client.commands.get(interaction.commandName);
  
  if (!command) {
    console.error(`No command matching ${interaction.commandName} was found.`);
    return;
  }
  
  try {
    await command.execute(interaction, { createEmbed, BOT_CONFIG });
  } catch (error) {
    console.error(`Error executing command ${interaction.commandName}:`, error);
    
    const errorEmbed = createEmbed(
      'Something went wrong',
      'I apologize, but I encountered an issue while processing your request. Please try again later.',
      BOT_CONFIG.colors.error
    );
    
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ embeds: [errorEmbed], ephemeral: true });
    } else {
      await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }
  }
});

// DM handling for personal assistance
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  if (!message.guild && message.channel.type === 1) { // Direct message
    // Handle DM interactions for personal modeling assistance
    await handleDirectMessage(message);
  }
});

// Direct message handler
const handleDirectMessage = async (message) => {
  const content = message.content.toLowerCase();
  
  // Simple DM responses for common questions
  if (content.includes('hello') || content.includes('hi')) {
    const greetingEmbed = createEmbed(
      'Welcome to Your Personal Assistant',
      `${BOT_CONFIG.personality.greeting} I'm ${BOT_CONFIG.name}, your dedicated IMVU modeling assistant. I'm here to help you manage your streams, create captions, organize your schedule, and so much more!\n\n${BOT_CONFIG.symbols.bullet} Use \`/stream create\` to register new streams\n${BOT_CONFIG.symbols.bullet} Use \`/caption imvu\` or \`/caption instagram\` for caption generation\n${BOT_CONFIG.symbols.bullet} Use \`/schedule weekly\` to plan your week\n${BOT_CONFIG.symbols.bullet} Use \`/help\` to see all available commands\n\n${BOT_CONFIG.personality.support}`,
      BOT_CONFIG.colors.info
    );
    
    await message.reply({ embeds: [greetingEmbed] });
  }
};

// Scheduled tasks
const startScheduledTasks = () => {
  // Check for overdue streams every hour
  cron.schedule('0 * * * *', async () => {
    try {
      // Check if database is initialized
      if (!client.isReady()) {
        console.log('◆ Bot not ready, skipping overdue streams check');
        return;
      }
      
      const overdueStreams = await dbHelpers.getOverdueStreams();
      
      for (const stream of overdueStreams) {
        // Update stream status to overdue
        await dbHelpers.completeStream(stream.id);
        
        // Send reminder to user if possible
        try {
          const user = await client.users.fetch(stream.user_id);
          const reminderEmbed = createEmbed(
            'Stream Reminder',
            `Your stream for **${stream.item_name}** by **${stream.creator_name}** is now overdue. Please complete it as soon as possible!`,
            BOT_CONFIG.colors.warning
          );
          
          await user.send({ embeds: [reminderEmbed] });
        } catch (error) {
          console.error(`Could not send reminder to user ${stream.user_id}:`, error);
        }
      }
    } catch (error) {
      console.error('Error in overdue streams check:', error);
    }
  });
  
  // Daily reminder check
  cron.schedule('0 9 * * *', async () => {
    try {
      // Check if database is initialized
      if (!client.isReady()) {
        console.log('◆ Bot not ready, skipping daily reminders check');
        return;
      }
      
      const activeReminders = await dbHelpers.getActiveReminders();
      
      for (const reminder of activeReminders) {
        try {
          const user = await client.users.fetch(reminder.user_id);
          const reminderEmbed = createEmbed(
            'Daily Reminder',
            reminder.reminder_text,
            BOT_CONFIG.colors.info
          );
          
          await user.send({ embeds: [reminderEmbed] });
          
          // Mark reminder as inactive
          await dbHelpers.createReminder({
            ...reminder,
            isActive: false
          });
        } catch (error) {
          console.error(`Could not send reminder to user ${reminder.userId}:`, error);
        }
      }
    } catch (error) {
      console.error('Error in daily reminder check:', error);
    }
  });
  
  console.log('◈ Scheduled tasks started');
};

// Error handling
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n◆ Shutting down gracefully...');
  server.close(() => {
    console.log('◆ HTTP server closed');
    client.destroy();
    process.exit(0);
  });
});

// Create HTTP server for Render port binding
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    status: 'online',
    bot: 'Aurelius',
    message: 'Aurelius Discord Bot is running!',
    timestamp: new Date().toISOString()
  }));
});

// Start HTTP server on the port specified by Render
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`◆ HTTP server listening on port ${PORT}`);
});

// Export for use in other files
export { client, createEmbed, BOT_CONFIG };

// Start the bot
client.login(process.env.DISCORD_TOKEN);
