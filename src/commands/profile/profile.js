import { SlashCommandBuilder } from 'discord.js';
import { dbHelpers } from '../../database/schema.js';

export default {
  data: new SlashCommandBuilder()
    .setName('profile')
    .setDescription('Manage your modeling profile and preferences')
    .setDMPermission(true)
    .addSubcommand(subcommand =>
      subcommand
        .setName('setup')
        .setDescription('Set up your modeling profile')
        .addStringOption(option =>
          option.setName('imvu_name')
            .setDescription('Your IMVU avatar name')
            .setRequired(true))
        .addStringOption(option =>
          option.setName('instagram_handle')
            .setDescription('Your Instagram handle (without @)')
            .setRequired(true))
        .addStringOption(option =>
          option.setName('timezone')
            .setDescription('Your timezone (e.g., UTC, EST, PST)')
            .setRequired(true))
        .addStringOption(option =>
          option.setName('preferred_agencies')
            .setDescription('Your preferred agencies (comma-separated)'))
        .addStringOption(option =>
          option.setName('caption_style')
            .setDescription('Your preferred caption style')
            .setChoices(
              { name: 'Elegant', value: 'elegant' },
              { name: 'Casual', value: 'casual' },
              { name: 'Professional', value: 'professional' },
              { name: 'Creative', value: 'creative' }
            )))
    .addSubcommand(subcommand =>
      subcommand
        .setName('view')
        .setDescription('View your current profile'))
    .addSubcommand(subcommand =>
      subcommand
        .setName('update')
        .setDescription('Update specific profile information')
        .addStringOption(option =>
          option.setName('field')
            .setDescription('Field to update')
            .setRequired(true)
            .setChoices(
              { name: 'IMVU Name', value: 'imvu_name' },
              { name: 'Instagram Handle', value: 'instagram_handle' },
              { name: 'Timezone', value: 'timezone' },
              { name: 'Preferred Agencies', value: 'preferred_agencies' },
              { name: 'Caption Style', value: 'caption_style' }
            ))
        .addStringOption(option =>
          option.setName('value')
            .setDescription('New value for the field')
            .setRequired(true))),

  async execute(interaction, { createEmbed, BOT_CONFIG }) {
    const subcommand = interaction.options.getSubcommand();
    
    switch (subcommand) {
      case 'setup':
        await handleProfileSetup(interaction, createEmbed, BOT_CONFIG);
        break;
      case 'view':
        await handleProfileView(interaction, createEmbed, BOT_CONFIG);
        break;
      case 'update':
        await handleProfileUpdate(interaction, createEmbed, BOT_CONFIG);
        break;
    }
  }
};

async function handleProfileSetup(interaction, createEmbed, BOT_CONFIG) {
  const imvuName = interaction.options.getString('imvu_name');
  const instagramHandle = interaction.options.getString('instagram_handle');
  const timezone = interaction.options.getString('timezone');
  const preferredAgencies = interaction.options.getString('preferred_agencies');
  const captionStyle = interaction.options.getString('caption_style') || 'elegant';
  
  try {
    const profileData = {
      userId: interaction.user.id,
      imvuName,
      instagramHandle: instagramHandle.startsWith('@') ? instagramHandle : `@${instagramHandle}`,
      timezone,
      captionStyle,
      preferredAgencies: preferredAgencies ? preferredAgencies.split(',').map(agency => agency.trim()) : [],
      reminderSettings: {
        streamReminders: true,
        weeklyReminders: true,
        dailyCheckIns: false
      }
    };
    
    const profile = await dbHelpers.createOrUpdateProfile(profileData);
    
    const successEmbed = createEmbed(
      'Profile Setup Complete',
      `Welcome to ${BOT_CONFIG.name}! Your modeling profile has been set up successfully. I'll use this information to personalize your experience and help you manage your modeling journey more effectively.`,
      BOT_CONFIG.colors.success
    );
    
    successEmbed.addFields(
      { name: 'IMVU Name', value: imvuName, inline: true },
      { name: 'Instagram', value: instagramHandle.startsWith('@') ? instagramHandle : `@${instagramHandle}`, inline: true },
      { name: 'Timezone', value: timezone, inline: true },
      { name: 'Caption Style', value: captionStyle.charAt(0).toUpperCase() + captionStyle.slice(1), inline: true }
    );
    
    if (preferredAgencies) {
      successEmbed.addFields({
        name: 'Preferred Agencies',
        value: preferredAgencies.split(',').map(agency => `• ${agency.trim()}`).join('\n'),
        inline: false
      });
    }
    
    successEmbed.addFields({
      name: 'What\'s Next?',
      value: '• Use `/stream create` to register your first stream\n• Use `/schedule weekly` to plan your week\n• Use `/help` to see all available commands\n• DM me anytime for personal assistance!',
      inline: false
    });
    
    await interaction.reply({ embeds: [successEmbed] });
    
  } catch (error) {
    console.error('Error setting up profile:', error);
    
    const errorEmbed = createEmbed(
      'Profile Setup Failed',
      'I encountered an error while setting up your profile. Please try again later.',
      BOT_CONFIG.colors.error
    );
    
    await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
  }
}

async function handleProfileView(interaction, createEmbed, BOT_CONFIG) {
  try {
    const profile = await dbHelpers.getUserProfile(interaction.user.id);
    
    if (!profile || profile.length === 0) {
      const noProfileEmbed = createEmbed(
        'No Profile Found',
        `You haven't set up your profile yet! Use \`/profile setup\` to get started with ${BOT_CONFIG.name}.`,
        BOT_CONFIG.colors.info
      );
      
      await interaction.reply({ embeds: [noProfileEmbed] });
      return;
    }
    
    const userProfile = profile[0];
    
    const profileEmbed = createEmbed(
      'Your Modeling Profile',
      `Here's your current profile information:`,
      BOT_CONFIG.colors.primary
    );
    
    profileEmbed.addFields(
      { name: 'IMVU Name', value: userProfile.imvuName || 'Not set', inline: true },
      { name: 'Instagram Handle', value: userProfile.instagramHandle || 'Not set', inline: true },
      { name: 'Timezone', value: userProfile.timezone || 'UTC', inline: true },
      { name: 'Caption Style', value: userProfile.captionStyle || 'Elegant', inline: true },
      { name: 'Profile Created', value: new Date(userProfile.createdAt).toLocaleDateString(), inline: true },
      { name: 'Last Updated', value: new Date(userProfile.updatedAt).toLocaleDateString(), inline: true }
    );
    
    if (userProfile.preferredAgencies && userProfile.preferredAgencies.length > 0) {
      profileEmbed.addFields({
        name: 'Preferred Agencies',
        value: userProfile.preferredAgencies.map(agency => `• ${agency}`).join('\n'),
        inline: false
      });
    }
    
    if (userProfile.reminderSettings) {
      const reminders = userProfile.reminderSettings;
      const reminderStatus = [];
      if (reminders.streamReminders) reminderStatus.push('Stream reminders');
      if (reminders.weeklyReminders) reminderStatus.push('Weekly reminders');
      if (reminders.dailyCheckIns) reminderStatus.push('Daily check-ins');
      
      if (reminderStatus.length > 0) {
        profileEmbed.addFields({
          name: 'Active Reminders',
          value: reminderStatus.map(status => `• ${status}`).join('\n'),
          inline: false
        });
      }
    }
    
    await interaction.reply({ embeds: [profileEmbed] });
    
  } catch (error) {
    console.error('Error viewing profile:', error);
    
    const errorEmbed = createEmbed(
      'Profile Retrieval Failed',
      'I encountered an error while retrieving your profile. Please try again later.',
      BOT_CONFIG.colors.error
    );
    
    await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
  }
}

async function handleProfileUpdate(interaction, createEmbed, BOT_CONFIG) {
  const field = interaction.options.getString('field');
  const value = interaction.options.getString('value');
  
  try {
    const profile = await dbHelpers.getUserProfile(interaction.user.id);
    
    if (!profile || profile.length === 0) {
      const noProfileEmbed = createEmbed(
        'No Profile Found',
        `You need to set up your profile first! Use \`/profile setup\` to get started.`,
        BOT_CONFIG.colors.warning
      );
      
      await interaction.reply({ embeds: [noProfileEmbed] });
      return;
    }
    
    const userProfile = profile[0];
    const updateData = { ...userProfile };
    
    switch (field) {
      case 'imvu_name':
        updateData.imvuName = value;
        break;
      case 'instagram_handle':
        updateData.instagramHandle = value.startsWith('@') ? value : `@${value}`;
        break;
      case 'timezone':
        updateData.timezone = value;
        break;
      case 'preferred_agencies':
        updateData.preferredAgencies = value.split(',').map(agency => agency.trim());
        break;
      case 'caption_style':
        updateData.captionStyle = value;
        break;
    }
    
    const updatedProfile = await dbHelpers.createOrUpdateProfile(updateData);
    
    const successEmbed = createEmbed(
      'Profile Updated Successfully',
      `Your ${field.replace('_', ' ')} has been updated successfully!`,
      BOT_CONFIG.colors.success
    );
    
    successEmbed.addFields({
      name: 'Updated Field',
      value: `${field.replace('_', ' ').charAt(0).toUpperCase() + field.replace('_', ' ').slice(1)}: ${value}`,
      inline: false
    });
    
    await interaction.reply({ embeds: [successEmbed] });
    
  } catch (error) {
    console.error('Error updating profile:', error);
    
    const errorEmbed = createEmbed(
      'Profile Update Failed',
      'I encountered an error while updating your profile. Please try again later.',
      BOT_CONFIG.colors.error
    );
    
    await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
  }
}
