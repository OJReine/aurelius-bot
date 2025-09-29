import { SlashCommandBuilder } from 'discord.js';
import { dbHelpers } from '../../database/schema.js';

export default {
  data: new SlashCommandBuilder()
    .setName('request')
    .setDescription('Generate request formats for different agencies')
    .addSubcommand(subcommand =>
      subcommand
        .setName('format')
        .setDescription('Generate a request format')
        .addStringOption(option =>
          option.setName('agency_name')
            .setDescription('Agency to generate request format for')
            .setRequired(true))
        .addStringOption(option =>
          option.setName('item_name')
            .setDescription('Name of the item you want to request')
            .setRequired(true))
        .addStringOption(option =>
          option.setName('creator_name')
            .setDescription('Creator\'s name')
            .setRequired(true))
        .addStringOption(option =>
          option.setName('imvu_link')
            .setDescription('Your IMVU avatar link')
            .setRequired(true))
        .addStringOption(option =>
          option.setName('instagram_handle')
            .setDescription('Your Instagram handle (without @)')
            .setRequired(true)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('template')
        .setDescription('View request templates for agencies')
        .addStringOption(option =>
          option.setName('agency_name')
            .setDescription('Agency to view template for')
            .setRequired(true))),

  async execute(interaction, { createEmbed, BOT_CONFIG }) {
    const subcommand = interaction.options.getSubcommand();
    
    switch (subcommand) {
      case 'format':
        await handleRequestFormat(interaction, createEmbed, BOT_CONFIG);
        break;
      case 'template':
        await handleRequestTemplate(interaction, createEmbed, BOT_CONFIG);
        break;
    }
  }
};

async function handleRequestFormat(interaction, createEmbed, BOT_CONFIG) {
  const agencyName = interaction.options.getString('agency_name');
  const itemName = interaction.options.getString('item_name');
  const creatorName = interaction.options.getString('creator_name');
  const imvuLink = interaction.options.getString('imvu_link');
  const instagramHandle = interaction.options.getString('instagram_handle');
  
  try {
    // Get agency template
    const agencyTemplate = await dbHelpers.getAgencyTemplate(agencyName);
    
    let requestFormat;
    if (agencyTemplate && agencyTemplate.length > 0) {
      requestFormat = generateRequestFromTemplate(
        itemName,
        creatorName,
        imvuLink,
        instagramHandle,
        agencyTemplate[0].requestFormat
      );
    } else {
      // Use default format
      requestFormat = generateDefaultRequest(
        itemName,
        creatorName,
        imvuLink,
        instagramHandle
      );
    }
    
    const requestEmbed = createEmbed(
      'Request Format Generated',
      `Here's your request format for **${agencyName}**:\n\n\`\`\`${requestFormat}\`\`\``,
      BOT_CONFIG.colors.success
    );
    
    requestEmbed.addFields(
      { name: 'Agency', value: agencyName, inline: true },
      { name: 'Item', value: itemName, inline: true },
      { name: 'Creator', value: creatorName, inline: true }
    );
    
    requestEmbed.addFields({
      name: '💡 Tips',
      value: '• Copy and paste this format into the agency\'s request channel\n• Make sure to follow the agency\'s specific rules\n• Be patient - creators review requests carefully',
      inline: false
    });
    
    await interaction.reply({ embeds: [requestEmbed] });
    
  } catch (error) {
    console.error('Error generating request format:', error);
    
    const errorEmbed = createEmbed(
      'Request Generation Failed',
      'I encountered an error while generating your request format. Please try again later.',
      BOT_CONFIG.colors.error
    );
    
    await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
  }
}

async function handleRequestTemplate(interaction, createEmbed, BOT_CONFIG) {
  const agencyName = interaction.options.getString('agency_name');
  
  try {
    const agencyTemplate = await dbHelpers.getAgencyTemplate(agencyName);
    
    if (!agencyTemplate || agencyTemplate.length === 0) {
      const notFoundEmbed = createEmbed(
        'Template Not Found',
        `No request template found for agency: ${agencyName}\n\nI'll use a default format for now.`,
        BOT_CONFIG.colors.warning
      );
      
      const defaultTemplate = generateDefaultRequest(
        '[Item Name]',
        '[Creator Name]',
        '[Your IMVU Link]',
        '[Your Instagram Handle]'
      );
      
      notFoundEmbed.addFields({
        name: 'Default Request Format',
        value: `\`\`\`${defaultTemplate}\`\`\``,
        inline: false
      });
      
      await interaction.reply({ embeds: [notFoundEmbed] });
      return;
    }
    
    const template = agencyTemplate[0];
    
    const templateEmbed = createEmbed(
      `Request Template - ${agencyName}`,
      `Here's the request template for ${agencyName}:`,
      BOT_CONFIG.colors.info
    );
    
    templateEmbed.addFields({
      name: 'Request Format',
      value: `\`\`\`${template.requestFormat}\`\`\``,
      inline: false
    });
    
    if (template.requiredTags) {
      templateEmbed.addFields({
        name: 'Required Tags',
        value: template.requiredTags.join(', '),
        inline: false
      });
    }
    
    await interaction.reply({ embeds: [templateEmbed] });
    
  } catch (error) {
    console.error('Error retrieving template:', error);
    
    const errorEmbed = createEmbed(
      'Template Retrieval Failed',
      'I encountered an error while retrieving the template. Please try again later.',
      BOT_CONFIG.colors.error
    );
    
    await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
  }
}

// Request generation functions
function generateRequestFromTemplate(itemName, creatorName, imvuLink, instagramHandle, template) {
  return template
    .replace('{item_name}', itemName)
    .replace('{creator_name}', creatorName)
    .replace('{imvu_link}', imvuLink)
    .replace('{instagram_handle}', instagramHandle);
}

function generateDefaultRequest(itemName, creatorName, imvuLink, instagramHandle) {
  return `Hi! I would love to request ${itemName} by ${creatorName} for streaming!

IMVU Link: ${imvuLink}
Instagram: @${instagramHandle}

Thank you for considering my request! 💕`;
}
