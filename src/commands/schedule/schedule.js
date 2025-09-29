import { SlashCommandBuilder } from 'discord.js';
import { dbHelpers } from '../../database/schema.js';

export default {
  data: new SlashCommandBuilder()
    .setName('schedule')
    .setDescription('Manage your weekly modeling schedule')
    .addSubcommand(subcommand =>
      subcommand
        .setName('weekly')
        .setDescription('Plan your weekly schedule')
        .addStringOption(option =>
          option.setName('monday')
            .setDescription('Monday activities (comma-separated)'))
        .addStringOption(option =>
          option.setName('tuesday')
            .setDescription('Tuesday activities (comma-separated)'))
        .addStringOption(option =>
          option.setName('wednesday')
            .setDescription('Wednesday activities (comma-separated)'))
        .addStringOption(option =>
          option.setName('thursday')
            .setDescription('Thursday activities (comma-separated)'))
        .addStringOption(option =>
          option.setName('friday')
            .setDescription('Friday activities (comma-separated)'))
        .addStringOption(option =>
          option.setName('saturday')
            .setDescription('Saturday activities (comma-separated)'))
        .addStringOption(option =>
          option.setName('sunday')
            .setDescription('Sunday activities (comma-separated)')))
    .addSubcommand(subcommand =>
      subcommand
        .setName('view')
        .setDescription('View your current weekly schedule')
        .addIntegerOption(option =>
          option.setName('week_offset')
            .setDescription('Week to view (0 = current, 1 = next, -1 = previous)')
            .setMinValue(-4)
            .setMaxValue(4)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('reminder')
        .setDescription('Set up schedule reminders')
        .addStringOption(option =>
          option.setName('day')
            .setDescription('Day of the week')
            .setRequired(true)
            .setChoices(
              { name: 'Monday', value: 'monday' },
              { name: 'Tuesday', value: 'tuesday' },
              { name: 'Wednesday', value: 'wednesday' },
              { name: 'Thursday', value: 'thursday' },
              { name: 'Friday', value: 'friday' },
              { name: 'Saturday', value: 'saturday' },
              { name: 'Sunday', value: 'sunday' }
            ))
        .addStringOption(option =>
          option.setName('time')
            .setDescription('Time for reminder (HH:MM format)')
            .setRequired(true))
        .addStringOption(option =>
          option.setName('message')
            .setDescription('Custom reminder message')
            .setRequired(true))),

  async execute(interaction, { createEmbed, BOT_CONFIG }) {
    const subcommand = interaction.options.getSubcommand();
    
    switch (subcommand) {
      case 'weekly':
        await handleWeeklySchedule(interaction, createEmbed, BOT_CONFIG);
        break;
      case 'view':
        await handleViewSchedule(interaction, createEmbed, BOT_CONFIG);
        break;
      case 'reminder':
        await handleScheduleReminder(interaction, createEmbed, BOT_CONFIG);
        break;
    }
  }
};

async function handleWeeklySchedule(interaction, createEmbed, BOT_CONFIG) {
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const scheduleData = {};
  
  // Get current week start (Monday)
  const now = new Date();
  const currentDay = now.getDay();
  const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay; // Handle Sunday as 0
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() + mondayOffset);
  weekStart.setHours(0, 0, 0, 0);
  
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);
  
  // Collect activities for each day
  for (const day of days) {
    const activities = interaction.options.getString(day);
    if (activities) {
      scheduleData[day] = activities.split(',').map(activity => activity.trim()).filter(activity => activity);
    }
  }
  
  try {
    // Check if schedule already exists for this week
    const existingSchedule = await dbHelpers.getCurrentWeekSchedule(interaction.user.id, weekStart);
    
    if (existingSchedule.length > 0) {
      // Update existing schedule
      const updatedSchedule = await dbHelpers.createSchedule({
        userId: interaction.user.id,
        serverId: interaction.guild?.id || null,
        weekStart,
        weekEnd,
        ...scheduleData,
        updatedAt: new Date()
      });
    } else {
      // Create new schedule
      const newSchedule = await dbHelpers.createSchedule({
        userId: interaction.user.id,
        serverId: interaction.guild?.id || null,
        weekStart,
        weekEnd,
        ...scheduleData
      });
    }
    
    const successEmbed = createEmbed(
      'Weekly Schedule Updated',
      `Your schedule for the week of ${weekStart.toLocaleDateString()} has been updated successfully!`,
      BOT_CONFIG.colors.success
    );
    
    // Add schedule preview
    const schedulePreview = [];
    for (const day of days) {
      if (scheduleData[day] && scheduleData[day].length > 0) {
        const dayName = day.charAt(0).toUpperCase() + day.slice(1);
        schedulePreview.push(`**${dayName}:** ${scheduleData[day].join(', ')}`);
      }
    }
    
    if (schedulePreview.length > 0) {
      successEmbed.addFields({
        name: 'Your Schedule',
        value: schedulePreview.join('\n'),
        inline: false
      });
    }
    
    await interaction.reply({ embeds: [successEmbed] });
    
  } catch (error) {
    console.error('Error updating weekly schedule:', error);
    
    const errorEmbed = createEmbed(
      'Schedule Update Failed',
      'I encountered an error while updating your schedule. Please try again later.',
      BOT_CONFIG.colors.error
    );
    
    await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
  }
}

async function handleViewSchedule(interaction, createEmbed, BOT_CONFIG) {
  const weekOffset = interaction.options.getInteger('week_offset') || 0;
  
  // Calculate target week
  const now = new Date();
  const currentDay = now.getDay();
  const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;
  const targetWeekStart = new Date(now);
  targetWeekStart.setDate(now.getDate() + mondayOffset + (weekOffset * 7));
  targetWeekStart.setHours(0, 0, 0, 0);
  
  try {
    const schedule = await dbHelpers.getCurrentWeekSchedule(interaction.user.id, targetWeekStart);
    
    if (!schedule || schedule.length === 0) {
      const noScheduleEmbed = createEmbed(
        'No Schedule Found',
        `You don't have a schedule for the week of ${targetWeekStart.toLocaleDateString()}.\n\nUse \`/schedule weekly\` to create one!`,
        BOT_CONFIG.colors.info
      );
      
      await interaction.reply({ embeds: [noScheduleEmbed] });
      return;
    }
    
    const userSchedule = schedule[0];
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    
    const scheduleEmbed = createEmbed(
      `Weekly Schedule - ${targetWeekStart.toLocaleDateString()}`,
      `Here's your schedule for this week:`,
      BOT_CONFIG.colors.primary
    );
    
    let hasActivities = false;
    for (const day of days) {
      if (userSchedule[day] && userSchedule[day].length > 0) {
        const dayName = day.charAt(0).toUpperCase() + day.slice(1);
        const activities = Array.isArray(userSchedule[day]) ? userSchedule[day] : [];
        
        if (activities.length > 0) {
          scheduleEmbed.addFields({
            name: dayName,
            value: activities.map(activity => `• ${activity}`).join('\n'),
            inline: true
          });
          hasActivities = true;
        }
      }
    }
    
    if (!hasActivities) {
      scheduleEmbed.setDescription('No activities scheduled for this week.');
    }
    
    scheduleEmbed.addFields({
      name: 'Last Updated',
      value: new Date(userSchedule.updatedAt).toLocaleDateString(),
      inline: false
    });
    
    await interaction.reply({ embeds: [scheduleEmbed] });
    
  } catch (error) {
    console.error('Error viewing schedule:', error);
    
    const errorEmbed = createEmbed(
      'Schedule Retrieval Failed',
      'I encountered an error while retrieving your schedule. Please try again later.',
      BOT_CONFIG.colors.error
    );
    
    await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
  }
}

async function handleScheduleReminder(interaction, createEmbed, BOT_CONFIG) {
  const day = interaction.options.getString('day');
  const time = interaction.options.getString('time');
  const message = interaction.options.getString('message');
  
  // Parse time
  const [hours, minutes] = time.split(':').map(Number);
  if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    const invalidTimeEmbed = createEmbed(
      'Invalid Time Format',
      'Please use HH:MM format (e.g., 09:30, 14:00)',
      BOT_CONFIG.colors.error
    );
    
    await interaction.reply({ embeds: [invalidTimeEmbed], ephemeral: true });
    return;
  }
  
  try {
    // Calculate next occurrence of the specified day and time
    const now = new Date();
    const targetDay = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'].indexOf(day);
    
    const reminderDate = new Date(now);
    const currentDay = now.getDay();
    const daysUntilTarget = (targetDay - currentDay + 7) % 7;
    
    reminderDate.setDate(now.getDate() + daysUntilTarget);
    reminderDate.setHours(hours, minutes, 0, 0);
    
    // If the time has already passed today, schedule for next week
    if (reminderDate <= now) {
      reminderDate.setDate(reminderDate.getDate() + 7);
    }
    
    // Create reminder
    const reminder = await dbHelpers.createReminder({
      userId: interaction.user.id,
      serverId: interaction.guild?.id || null,
      reminderType: 'weekly',
      reminderText: message,
      scheduledFor: reminderDate,
      isActive: true
    });
    
    const successEmbed = createEmbed(
      'Weekly Reminder Set',
      `Your reminder has been set for every **${day.charAt(0).toUpperCase() + day.slice(1)} at ${time}**.\n\n` +
      `**Message:** ${message}\n` +
      `**Next reminder:** ${reminderDate.toLocaleString()}`,
      BOT_CONFIG.colors.success
    );
    
    await interaction.reply({ embeds: [successEmbed] });
    
  } catch (error) {
    console.error('Error setting reminder:', error);
    
    const errorEmbed = createEmbed(
      'Reminder Setup Failed',
      'I encountered an error while setting up your reminder. Please try again later.',
      BOT_CONFIG.colors.error
    );
    
    await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
  }
}
