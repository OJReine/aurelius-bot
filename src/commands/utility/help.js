import { SlashCommandBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Get help with Aurelius commands')
    .setDMPermission(true)
    .addStringOption(option =>
      option.setName('category')
        .setDescription('Category to get help for')
        .setChoices(
          { name: 'Stream Management', value: 'stream' },
          { name: 'Caption Generation', value: 'caption' },
          { name: 'Schedule Planning', value: 'schedule' },
          { name: 'Review Writing', value: 'review' },
          { name: 'All Commands', value: 'all' }
        )),

  async execute(interaction, { createEmbed, BOT_CONFIG }) {
    const category = interaction.options.getString('category') || 'all';
    
    const helpEmbed = createEmbed(
      'Aurelius Help Center',
      `Hello there! I'm ${BOT_CONFIG.name}, your personal IMVU modeling assistant. I'm here to help you manage your streams, create captions, organize your schedule, and write detailed reviews.\n\n${BOT_CONFIG.personality.support}`,
      BOT_CONFIG.colors.info
    );
    
    switch (category) {
      case 'stream':
        helpEmbed.setTitle('◈ Stream Management Help');
        helpEmbed.setDescription('Commands to help you track and manage your IMVU modeling streams:');
        helpEmbed.addFields(
          {
            name: '/stream create',
            value: 'Register a new stream with item details, creator info, and due date',
            inline: false
          },
          {
            name: '/stream complete',
            value: 'Mark a stream as completed when you finish it',
            inline: false
          },
          {
            name: '/stream list',
            value: 'View all your active streams with status and due dates',
            inline: false
          },
          {
            name: '/stream info',
            value: 'Get detailed information about a specific stream',
            inline: false
          }
        );
        break;
        
      case 'caption':
        helpEmbed.setTitle('◈ Caption Generation Help');
        helpEmbed.setDescription('Commands to generate professional captions for your posts:');
        helpEmbed.addFields(
          {
            name: '/caption imvu',
            value: 'Generate IMVU feed captions with proper formatting and tags',
            inline: false
          },
          {
            name: '/caption instagram',
            value: 'Generate Instagram captions with agency-specific formats',
            inline: false
          },
          {
            name: '/caption template',
            value: 'View caption templates for different agencies',
            inline: false
          }
        );
        break;
        
      case 'schedule':
        helpEmbed.setTitle('◈ Schedule Planning Help');
        helpEmbed.setDescription('Commands to organize your weekly modeling schedule:');
        helpEmbed.addFields(
          {
            name: '/schedule weekly',
            value: 'Plan your weekly activities and modeling schedule',
            inline: false
          },
          {
            name: '/schedule view',
            value: 'View your current or past weekly schedules',
            inline: false
          },
          {
            name: '/schedule reminder',
            value: 'Set up weekly reminders for your activities',
            inline: false
          }
        );
        break;
        
      case 'review':
        helpEmbed.setTitle('◈ Review Writing Help');
        helpEmbed.setDescription('Commands to create detailed reviews for IMVU items:');
        helpEmbed.addFields(
          {
            name: '/review generate',
            value: 'Generate detailed, heartfelt reviews for items you\'ve streamed',
            inline: false
          },
          {
            name: '/review template',
            value: 'View review templates for different item types',
            inline: false
          },
          {
            name: '/review history',
            value: 'View your past reviews and ratings',
            inline: false
          }
        );
        break;
        
      case 'all':
      default:
        helpEmbed.addFields(
          {
            name: '🌊 Stream Management',
            value: '`/stream create` - Register new streams\n`/stream complete` - Mark streams complete\n`/stream list` - View active streams\n`/stream info` - Get stream details',
            inline: true
          },
          {
            name: '📝 Caption Generation',
            value: '`/caption imvu` - Generate IMVU captions\n`/caption instagram` - Generate IG captions\n`/caption template` - View agency templates',
            inline: true
          },
          {
            name: '📅 Schedule Planning',
            value: '`/schedule weekly` - Plan your week\n`/schedule view` - View schedules\n`/schedule reminder` - Set reminders',
            inline: true
          },
          {
            name: '⭐ Review Writing',
            value: '`/review generate` - Create detailed reviews\n`/review template` - View templates\n`/review history` - View past reviews',
            inline: true
          },
          {
            name: '💡 Tips',
            value: '• Use DM me for personal assistance\n• I work in any server you invite me to\n• All your data is private and secure\n• I\'ll remind you about due dates automatically',
            inline: false
          }
        );
        break;
    }
    
    helpEmbed.addFields({
      name: 'Need More Help?',
      value: 'Feel free to DM me anytime for personal assistance! I\'m here to make your modeling journey smoother and more organized.',
      inline: false
    });
    
    await interaction.reply({ embeds: [helpEmbed] });
  }
};
