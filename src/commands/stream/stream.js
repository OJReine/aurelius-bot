import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { dbHelpers } from '../../database/schema.js';

export default {
  data: new SlashCommandBuilder()
    .setName('stream')
    .setDescription('Manage your IMVU modeling streams')
    .setDMPermission(true)
    .addSubcommand(subcommand =>
      subcommand
        .setName('create')
        .setDescription('Register a new stream')
        .addStringOption(option =>
          option.setName('item_name')
            .setDescription('Name of the IMVU item to stream')
            .setRequired(true))
        .addStringOption(option =>
          option.setName('creator_name')
            .setDescription('Name of the creator/shop owner')
            .setRequired(true))
        .addIntegerOption(option =>
          option.setName('due_days')
            .setDescription('Days until due (1-7)')
            .setRequired(true)
            .setMinValue(1)
            .setMaxValue(7))
        .addStringOption(option =>
          option.setName('creator_id')
            .setDescription('Creator\'s IMVU ID (optional)'))
        .addStringOption(option =>
          option.setName('agency_name')
            .setDescription('Agency name (optional)'))
        .addStringOption(option =>
          option.setName('priority')
            .setDescription('Priority level')
            .setChoices(
              { name: 'Low', value: 'low' },
              { name: 'Medium', value: 'medium' },
              { name: 'High', value: 'high' }
            ))
        .addStringOption(option =>
          option.setName('stream_type')
            .setDescription('Type of stream')
            .setChoices(
              { name: 'Showcase', value: 'showcase' },
              { name: 'Sponsored', value: 'sponsored' },
              { name: 'Open Shop', value: 'open' }
            ))
        .addStringOption(option =>
          option.setName('notes')
            .setDescription('Additional notes (optional)')))
    .addSubcommand(subcommand =>
      subcommand
        .setName('complete')
        .setDescription('Mark a stream as complete')
        .addIntegerOption(option =>
          option.setName('stream_id')
            .setDescription('ID of the stream to complete')
            .setRequired(true)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('list')
        .setDescription('View your active streams')
        .addStringOption(option =>
          option.setName('status')
            .setDescription('Filter by status')
            .setChoices(
              { name: 'Active', value: 'active' },
              { name: 'Completed', value: 'completed' },
              { name: 'Overdue', value: 'overdue' }
            )))
    .addSubcommand(subcommand =>
      subcommand
        .setName('info')
        .setDescription('Get detailed information about a stream')
        .addIntegerOption(option =>
          option.setName('stream_id')
            .setDescription('ID of the stream to view')
            .setRequired(true))),

  async execute(interaction, { createEmbed, BOT_CONFIG }) {
    const subcommand = interaction.options.getSubcommand();
    
    switch (subcommand) {
      case 'create':
        await handleStreamCreate(interaction, createEmbed, BOT_CONFIG);
        break;
      case 'complete':
        await handleStreamComplete(interaction, createEmbed, BOT_CONFIG);
        break;
      case 'list':
        await handleStreamList(interaction, createEmbed, BOT_CONFIG);
        break;
      case 'info':
        await handleStreamInfo(interaction, createEmbed, BOT_CONFIG);
        break;
    }
  }
};

async function handleStreamCreate(interaction, createEmbed, BOT_CONFIG) {
  const itemName = interaction.options.getString('item_name');
  const creatorName = interaction.options.getString('creator_name');
  const creatorId = interaction.options.getString('creator_id');
  const agencyName = interaction.options.getString('agency_name');
  const dueDays = interaction.options.getInteger('due_days');
  const priority = interaction.options.getString('priority') || 'medium';
  const streamType = interaction.options.getString('stream_type') || 'showcase';
  const notes = interaction.options.getString('notes');
  
  // Calculate due date
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + dueDays);
  
  try {
    const streamData = {
      user_id: interaction.user.id,
      server_id: interaction.guild?.id || null,
      item_name: itemName,
      creator_name: creatorName,
      creator_id: creatorId,
      agency_name: agencyName,
      due_date: dueDate.toISOString(),
      priority,
      stream_type: streamType,
      notes,
      status: 'active'
    };
    
    const newStream = await dbHelpers.createStream(streamData);
    
    const successEmbed = createEmbed(
      'Stream Registered Successfully',
      `Your stream has been registered with ID: **${newStream[0].id}**\n\n` +
      `**Item:** ${itemName}\n` +
      `**Creator:** ${creatorName}\n` +
      `**Agency:** ${agencyName || 'Not specified'}\n` +
      `**Due Date:** ${dueDate.toLocaleDateString()}\n` +
      `**Priority:** ${priority.charAt(0).toUpperCase() + priority.slice(1)}\n` +
      `**Type:** ${streamType.charAt(0).toUpperCase() + streamType.slice(1)}\n\n` +
      `${BOT_CONFIG.personality.encouragement} I'll remind you when it's due!`,
      BOT_CONFIG.colors.success
    );
    
    if (notes) {
      successEmbed.addFields({ name: 'Notes', value: notes, inline: false });
    }
    
    await interaction.reply({ embeds: [successEmbed] });
    
    // Send DM confirmation
    try {
      const dmEmbed = createEmbed(
        'Stream Registration Confirmed',
        `Hello! I've registered your new stream:\n\n` +
        `**${itemName}** by **${creatorName}**\n` +
        `Due: ${dueDate.toLocaleDateString()}\n\n` +
        `I'll send you a reminder 1 day before the due date. Good luck with your stream!`,
        BOT_CONFIG.colors.info
      );
      
      await interaction.user.send({ embeds: [dmEmbed] });
    } catch (error) {
      console.log('Could not send DM to user');
    }
    
  } catch (error) {
    console.error('Error creating stream:', error);
    
    const errorEmbed = createEmbed(
      'Registration Failed',
      'I encountered an error while registering your stream. Please try again later.',
      BOT_CONFIG.colors.error
    );
    
    await interaction.reply({ embeds: [errorEmbed], flags: 64 });
  }
}

async function handleStreamComplete(interaction, createEmbed, BOT_CONFIG) {
  const streamId = interaction.options.getInteger('stream_id');
  
  try {
    const completedStream = await dbHelpers.completeStream(streamId);
    
    if (completedStream.length === 0) {
      const notFoundEmbed = createEmbed(
        'Stream Not Found',
        `No stream found with ID: ${streamId}`,
        BOT_CONFIG.colors.error
      );
      
      await interaction.reply({ embeds: [notFoundEmbed], flags: 64 });
      return;
    }
    
    const stream = completedStream[0];
    
    const successEmbed = createEmbed(
      'Stream Completed Successfully',
      `Congratulations! You've completed your stream for **${stream.item_name}** by **${stream.creator_name}**.\n\n` +
      `**Completed on:** ${new Date().toLocaleDateString()}\n` +
      `**Stream ID:** ${stream.id}\n\n` +
      `${BOT_CONFIG.personality.encouragement} Great work on completing this stream!`,
      BOT_CONFIG.colors.success
    );
    
    await interaction.reply({ embeds: [successEmbed] });
    
  } catch (error) {
    console.error('Error completing stream:', error);
    
    const errorEmbed = createEmbed(
      'Completion Failed',
      'I encountered an error while marking your stream as complete. Please try again later.',
      BOT_CONFIG.colors.error
    );
    
    await interaction.reply({ embeds: [errorEmbed], flags: 64 });
  }
}

async function handleStreamList(interaction, createEmbed, BOT_CONFIG) {
  const status = interaction.options.getString('status') || 'active';
  
  try {
    let streams;
    
    if (status === 'active') {
      streams = await dbHelpers.getActiveStreams(interaction.user.id, interaction.guild?.id);
    } else {
      // For completed/overdue, we'd need additional helper functions
      streams = await dbHelpers.getActiveStreams(interaction.user.id, interaction.guild?.id);
    }
    
    if (streams.length === 0) {
      const noStreamsEmbed = createEmbed(
        'No Streams Found',
        `You don't have any ${status} streams at the moment. Use \`/stream create\` to register a new one!`,
        BOT_CONFIG.colors.info
      );
      
      await interaction.reply({ embeds: [noStreamsEmbed] });
      return;
    }
    
    const listEmbed = createEmbed(
      `Your ${status.charAt(0).toUpperCase() + status.slice(1)} Streams`,
      `Here are your current streams:`,
      BOT_CONFIG.colors.primary
    );
    
    streams.forEach((stream, index) => {
      const daysLeft = Math.ceil((new Date(stream.due_date) - new Date()) / (1000 * 60 * 60 * 24));
      const urgency = daysLeft <= 1 ? '🔴' : daysLeft <= 3 ? '🟡' : '🟢';
      
      listEmbed.addFields({
        name: `${urgency} ID: ${stream.id} - ${stream.item_name}`,
        value: `**Creator:** ${stream.creator_name}\n**Due:** ${new Date(stream.due_date).toLocaleDateString()}\n**Priority:** ${stream.priority}`,
        inline: true
      });
    });
    
    await interaction.reply({ embeds: [listEmbed] });
    
  } catch (error) {
    console.error('Error listing streams:', error);
    
    const errorEmbed = createEmbed(
      'List Failed',
      'I encountered an error while retrieving your streams. Please try again later.',
      BOT_CONFIG.colors.error
    );
    
    await interaction.reply({ embeds: [errorEmbed], flags: 64 });
  }
}

async function handleStreamInfo(interaction, createEmbed, BOT_CONFIG) {
  const streamId = interaction.options.getInteger('stream_id');
  
  try {
    // This would need a specific helper function to get stream by ID
    const streams = await dbHelpers.getActiveStreams(interaction.user.id, interaction.guild?.id);
    const stream = streams.find(s => s.id === streamId);
    
    if (!stream) {
      const notFoundEmbed = createEmbed(
        'Stream Not Found',
        `No stream found with ID: ${streamId}`,
        BOT_CONFIG.colors.error
      );
      
      await interaction.reply({ embeds: [notFoundEmbed], flags: 64 });
      return;
    }
    
    const daysLeft = Math.ceil((new Date(stream.due_date) - new Date()) / (1000 * 60 * 60 * 24));
    const urgency = daysLeft <= 1 ? '🔴' : daysLeft <= 3 ? '🟡' : '🟢';
    
    const infoEmbed = createEmbed(
      `Stream Information - ID: ${stream.id}`,
      `Detailed information about your stream:`,
      BOT_CONFIG.colors.info
    );
    
    infoEmbed.addFields(
      { name: 'Item Name', value: stream.item_name, inline: true },
      { name: 'Creator', value: stream.creator_name, inline: true },
      { name: 'Agency', value: stream.agency_name || 'Not specified', inline: true },
      { name: 'Due Date', value: new Date(stream.due_date).toLocaleDateString(), inline: true },
      { name: 'Days Left', value: `${daysLeft} days ${urgency}`, inline: true },
      { name: 'Priority', value: stream.priority.charAt(0).toUpperCase() + stream.priority.slice(1), inline: true },
      { name: 'Type', value: stream.stream_type.charAt(0).toUpperCase() + stream.stream_type.slice(1), inline: true },
      { name: 'Status', value: stream.status.charAt(0).toUpperCase() + stream.status.slice(1), inline: true },
      { name: 'Created', value: new Date(stream.created_at).toLocaleDateString(), inline: true }
    );
    
    if (stream.notes) {
      infoEmbed.addFields({ name: 'Notes', value: stream.notes, inline: false });
    }
    
    await interaction.reply({ embeds: [infoEmbed] });
    
  } catch (error) {
    console.error('Error getting stream info:', error);
    
    const errorEmbed = createEmbed(
      'Information Retrieval Failed',
      'I encountered an error while retrieving stream information. Please try again later.',
      BOT_CONFIG.colors.error
    );
    
    await interaction.reply({ embeds: [errorEmbed], flags: 64 });
  }
}
