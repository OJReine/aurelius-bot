import { SlashCommandBuilder } from 'discord.js';
import { dbHelpers } from '../../database/schema.js';
import aiService from '../../services/aiService.js';

export default {
  data: new SlashCommandBuilder()
    .setName('caption')
    .setDescription('Generate captions for your IMVU and Instagram posts')
    .addSubcommand(subcommand =>
      subcommand
        .setName('imvu')
        .setDescription('Generate IMVU feed caption')
        .addStringOption(option =>
          option.setName('item_name')
            .setDescription('Name of the IMVU item')
            .setRequired(true))
        .addStringOption(option =>
          option.setName('creator_name')
            .setDescription('Creator\'s IMVU avatar name')
            .setRequired(true))
        .addStringOption(option =>
          option.setName('item_id')
            .setDescription('Item ID from product page')
            .setRequired(true))
        .addStringOption(option =>
          option.setName('manufacturer_id')
            .setDescription('Creator\'s manufacturer ID')
            .setRequired(true))
        .addStringOption(option =>
          option.setName('agency_name')
            .setDescription('Agency name for format')
            .setRequired(true))
        .addStringOption(option =>
          option.setName('shop_link')
            .setDescription('Creator\'s shop link (optional)'))
        .addStringOption(option =>
          option.setName('additional_tags')
            .setDescription('Additional tags to include (optional)')))
    .addSubcommand(subcommand =>
      subcommand
        .setName('instagram')
        .setDescription('Generate Instagram caption')
        .addStringOption(option =>
          option.setName('item_name')
            .setDescription('Name of the IMVU item')
            .setRequired(true))
        .addStringOption(option =>
          option.setName('creator_name')
            .setDescription('Creator\'s name')
            .setRequired(true))
        .addStringOption(option =>
          option.setName('creator_instagram')
            .setDescription('Creator\'s Instagram handle')
            .setRequired(true))
        .addStringOption(option =>
          option.setName('agency_instagram')
            .setDescription('Agency\'s Instagram handle')
            .setRequired(true))
        .addStringOption(option =>
          option.setName('agency_name')
            .setDescription('Agency name for format')
            .setRequired(true))
        .addStringOption(option =>
          option.setName('item_id')
            .setDescription('Item ID from product page')
            .setRequired(true))
        .addStringOption(option =>
          option.setName('additional_tags')
            .setDescription('Additional tags to include (optional)')))
    .addSubcommand(subcommand =>
      subcommand
        .setName('template')
        .setDescription('View caption templates for agencies')
        .addStringOption(option =>
          option.setName('agency_name')
            .setDescription('Agency to view template for')
            .setRequired(true))),

  async execute(interaction, { createEmbed, BOT_CONFIG }) {
    const subcommand = interaction.options.getSubcommand();
    
    switch (subcommand) {
      case 'imvu':
        await handleIMVUCaption(interaction, createEmbed, BOT_CONFIG);
        break;
      case 'instagram':
        await handleInstagramCaption(interaction, createEmbed, BOT_CONFIG);
        break;
      case 'template':
        await handleCaptionTemplate(interaction, createEmbed, BOT_CONFIG);
        break;
    }
  }
};

async function handleIMVUCaption(interaction, createEmbed, BOT_CONFIG) {
  const itemName = interaction.options.getString('item_name');
  const creatorName = interaction.options.getString('creator_name');
  const itemId = interaction.options.getString('item_id');
  const manufacturerId = interaction.options.getString('manufacturer_id');
  const agencyName = interaction.options.getString('agency_name');
  const shopLink = interaction.options.getString('shop_link');
  const additionalTags = interaction.options.getString('additional_tags');
  
  try {
    // Check if AI service is available
    if (!aiService.isReady()) {
      // Fallback to template-based generation
      const agencyTemplate = await dbHelpers.getAgencyTemplate(agencyName);
      
      let caption;
      if (agencyTemplate && agencyTemplate.length > 0) {
        caption = generateIMVUCaptionFromTemplate(
          itemName,
          creatorName,
          itemId,
          manufacturerId,
          agencyTemplate[0].imvu_caption_format,
          shopLink,
          additionalTags
        );
      } else {
        caption = generateDefaultIMVUCaption(itemName, creatorName, itemId, manufacturerId);
      }
      
      const embed = createEmbed(
        'IMVU Caption Generated',
        `\`\`\`${caption}\`\`\``,
        BOT_CONFIG.colors.success
      );
      
      await interaction.reply({ embeds: [embed] });
      return;
    }

    // Use AI service for enhanced caption generation
    const itemData = {
      item_name: itemName,
      creator_name: creatorName,
      item_id: itemId,
      manufacturer_id: manufacturerId,
      agency_name: agencyName
    };

    const userPreferences = {
      captionStyle: 'elegant',
      additionalTags: additionalTags
    };

    await interaction.deferReply();
    
    const caption = await aiService.generateIMVUCaption(itemData, userPreferences);
    
    const captionEmbed = createEmbed(
      'IMVU Caption Generated ✨',
      `Here's your AI-generated IMVU feed caption:\n\n\`\`\`${caption}\`\`\``,
      BOT_CONFIG.colors.success
    );
    
    captionEmbed.addFields(
      { name: 'Item', value: itemName, inline: true },
      { name: 'Creator', value: creatorName, inline: true },
      { name: 'Agency Format', value: agencyName, inline: true }
    );
    
    await interaction.editReply({ embeds: [captionEmbed] });
    
    // Save caption to database
    await dbHelpers.saveCaption({
      userId: interaction.user.id,
      platform: 'imvu',
      captionText: caption,
      agencyFormat: agencyName
    });
    
  } catch (error) {
    console.error('Error generating IMVU caption:', error);
    
    const errorEmbed = createEmbed(
      'Caption Generation Failed',
      'I encountered an error while generating your IMVU caption. Please try again later.',
      BOT_CONFIG.colors.error
    );
    
    await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
  }
}

async function handleInstagramCaption(interaction, createEmbed, BOT_CONFIG) {
  const itemName = interaction.options.getString('item_name');
  const creatorName = interaction.options.getString('creator_name');
  const creatorInstagram = interaction.options.getString('creator_instagram');
  const agencyInstagram = interaction.options.getString('agency_instagram');
  const agencyName = interaction.options.getString('agency_name');
  const itemId = interaction.options.getString('item_id');
  const additionalTags = interaction.options.getString('additional_tags');
  
  try {
    // Get agency template
    const agencyTemplate = await dbHelpers.getAgencyTemplate(agencyName);
    
    let caption;
    if (agencyTemplate && agencyTemplate.length > 0) {
      caption = generateInstagramCaptionFromTemplate(
        itemName,
        creatorName,
        creatorInstagram,
        agencyInstagram,
        itemId,
        agencyTemplate[0].instagramCaptionFormat,
        agencyTemplate[0].requiredTags,
        additionalTags
      );
    } else {
      // Use default format
      caption = generateDefaultInstagramCaption(
        itemName,
        creatorName,
        creatorInstagram,
        agencyInstagram,
        itemId,
        additionalTags
      );
    }
    
    const captionEmbed = createEmbed(
      'Instagram Caption Generated',
      `Here's your Instagram caption:\n\n\`\`\`${caption}\`\`\``,
      BOT_CONFIG.colors.success
    );
    
    captionEmbed.addFields(
      { name: 'Item', value: itemName, inline: true },
      { name: 'Creator', value: creatorName, inline: true },
      { name: 'Agency Format', value: agencyName, inline: true }
    );
    
    await interaction.reply({ embeds: [captionEmbed] });
    
    // Save caption to database
    await dbHelpers.saveCaption({
      userId: interaction.user.id,
      platform: 'instagram',
      captionText: caption,
      agencyFormat: agencyName
    });
    
  } catch (error) {
    console.error('Error generating Instagram caption:', error);
    
    const errorEmbed = createEmbed(
      'Caption Generation Failed',
      'I encountered an error while generating your Instagram caption. Please try again later.',
      BOT_CONFIG.colors.error
    );
    
    await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
  }
}

async function handleCaptionTemplate(interaction, createEmbed, BOT_CONFIG) {
  const agencyName = interaction.options.getString('agency_name');
  
  try {
    const agencyTemplate = await dbHelpers.getAgencyTemplate(agencyName);
    
    if (!agencyTemplate || agencyTemplate.length === 0) {
      const notFoundEmbed = createEmbed(
        'Template Not Found',
        `No template found for agency: ${agencyName}\n\nUse \`/caption template\` to see available agencies.`,
        BOT_CONFIG.colors.warning
      );
      
      await interaction.reply({ embeds: [notFoundEmbed], ephemeral: true });
      return;
    }
    
    const template = agencyTemplate[0];
    
    const templateEmbed = createEmbed(
      `Caption Template - ${agencyName}`,
      `Here's the caption template for ${agencyName}:`,
      BOT_CONFIG.colors.info
    );
    
    templateEmbed.addFields(
      { 
        name: 'IMVU Format', 
        value: `\`\`\`${template.imvuCaptionFormat}\`\`\``, 
        inline: false 
      },
      { 
        name: 'Instagram Format', 
        value: `\`\`\`${template.instagramCaptionFormat}\`\`\``, 
        inline: false 
      }
    );
    
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

// Caption generation functions
function generateIMVUCaptionFromTemplate(itemName, creatorName, itemId, manufacturerId, template, shopLink, additionalTags) {
  let caption = template
    .replace('{item_name}', itemName)
    .replace('{creator_name}', creatorName)
    .replace('{item_id}', itemId)
    .replace('{manufacturer_id}', manufacturerId);
  
  if (shopLink && caption.includes('{shop_link}')) {
    caption = caption.replace('{shop_link}', shopLink);
  }
  
  if (additionalTags) {
    caption += `\n\n${additionalTags}`;
  }
  
  return caption;
}

function generateDefaultIMVUCaption(itemName, creatorName, itemId, manufacturerId, shopLink, additionalTags) {
  let caption = `✨ ${itemName} ✨\n\n`;
  caption += `Creator: ${creatorName}\n`;
  caption += `Item ID: ${itemId}\n`;
  caption += `Manufacturer ID: ${manufacturerId}\n`;
  
  if (shopLink) {
    caption += `Shop: ${shopLink}\n`;
  }
  
  caption += `\n#IMVU #Fashion #Modeling #${creatorName.replace(/\s+/g, '')}`;
  
  if (additionalTags) {
    caption += `\n${additionalTags}`;
  }
  
  return caption;
}

function generateInstagramCaptionFromTemplate(itemName, creatorName, creatorInstagram, agencyInstagram, itemId, template, requiredTags, additionalTags) {
  let caption = template
    .replace('{item_name}', itemName)
    .replace('{creator_name}', creatorName)
    .replace('{creator_instagram}', creatorInstagram)
    .replace('{agency_instagram}', agencyInstagram)
    .replace('{item_id}', itemId);
  
  if (requiredTags && requiredTags.length > 0) {
    caption += `\n\n${requiredTags.join(' ')}`;
  }
  
  if (additionalTags) {
    caption += `\n${additionalTags}`;
  }
  
  return caption;
}

function generateDefaultInstagramCaption(itemName, creatorName, creatorInstagram, agencyInstagram, itemId, additionalTags) {
  let caption = `✨ ${itemName} ✨\n\n`;
  caption += `Loving this beautiful piece by @${creatorInstagram}!\n\n`;
  caption += `Item ID: ${itemId}\n\n`;
  caption += `#IMVU #Fashion #Modeling #VirtualFashion #${creatorInstagram} #${agencyInstagram}`;
  
  if (additionalTags) {
    caption += `\n${additionalTags}`;
  }
  
  return caption;
}
