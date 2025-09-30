import { SlashCommandBuilder } from 'discord.js';
import { dbHelpers } from '../../database/schema.js';
import aiService from '../../services/aiService.js';

export default {
  data: new SlashCommandBuilder()
    .setName('review')
    .setDescription('Generate detailed reviews for IMVU items')
    .setDMPermission(true)
    .addSubcommand(subcommand =>
      subcommand
        .setName('generate')
        .setDescription('Generate a detailed review for an item')
        .addStringOption(option =>
          option.setName('item_name')
            .setDescription('Name of the IMVU item')
            .setRequired(true))
        .addStringOption(option =>
          option.setName('item_id')
            .setDescription('Item ID from product page')
            .setRequired(true))
        .addStringOption(option =>
          option.setName('creator_name')
            .setDescription('Creator\'s name')
            .setRequired(true))
        .addStringOption(option =>
          option.setName('item_type')
            .setDescription('Type of item')
            .setRequired(true)
            .setChoices(
              { name: 'Outfit', value: 'outfit' },
              { name: 'Top', value: 'top' },
              { name: 'Bottom', value: 'bottom' },
              { name: 'Dress', value: 'dress' },
              { name: 'Shoes', value: 'shoes' },
              { name: 'Accessories', value: 'accessories' },
              { name: 'Hair', value: 'hair' },
              { name: 'Makeup', value: 'makeup' },
              { name: 'Bundle', value: 'bundle' }
            ))
        .addStringOption(option =>
          option.setName('color_scheme')
            .setDescription('Main colors of the item')
            .setRequired(true))
        .addIntegerOption(option =>
          option.setName('rating')
            .setDescription('Rating from 1-5 stars')
            .setMinValue(1)
            .setMaxValue(5)
            .setRequired(true))
        .addStringOption(option =>
          option.setName('style')
            .setDescription('Style of the item')
            .setChoices(
              { name: 'Casual', value: 'casual' },
              { name: 'Formal', value: 'formal' },
              { name: 'Party', value: 'party' },
              { name: 'Gothic', value: 'gothic' },
              { name: 'Cute', value: 'cute' },
              { name: 'Elegant', value: 'elegant' },
              { name: 'Streetwear', value: 'streetwear' },
              { name: 'Vintage', value: 'vintage' }
            ))
        .addStringOption(option =>
          option.setName('special_features')
            .setDescription('Special features or details (optional)')))
    .addSubcommand(subcommand =>
      subcommand
        .setName('template')
        .setDescription('View review templates for different item types')
        .addStringOption(option =>
          option.setName('item_type')
            .setDescription('Type of item to view template for')
            .setRequired(true)
            .setChoices(
              { name: 'Outfit', value: 'outfit' },
              { name: 'Top', value: 'top' },
              { name: 'Bottom', value: 'bottom' },
              { name: 'Dress', value: 'dress' },
              { name: 'Shoes', value: 'shoes' },
              { name: 'Accessories', value: 'accessories' },
              { name: 'Hair', value: 'hair' },
              { name: 'Makeup', value: 'makeup' },
              { name: 'Bundle', value: 'bundle' }
            )))
    .addSubcommand(subcommand =>
      subcommand
        .setName('history')
        .setDescription('View your review history')
        .addIntegerOption(option =>
          option.setName('limit')
            .setDescription('Number of reviews to show (max 10)')
            .setMinValue(1)
            .setMaxValue(10))),

  async execute(interaction, { createEmbed, BOT_CONFIG }) {
    const subcommand = interaction.options.getSubcommand();
    
    switch (subcommand) {
      case 'generate':
        await handleReviewGenerate(interaction, createEmbed, BOT_CONFIG);
        break;
      case 'template':
        await handleReviewTemplate(interaction, createEmbed, BOT_CONFIG);
        break;
      case 'history':
        await handleReviewHistory(interaction, createEmbed, BOT_CONFIG);
        break;
    }
  }
};

async function handleReviewGenerate(interaction, createEmbed, BOT_CONFIG) {
  const itemName = interaction.options.getString('item_name');
  const itemId = interaction.options.getString('item_id');
  const creatorName = interaction.options.getString('creator_name');
  const itemType = interaction.options.getString('item_type');
  const style = interaction.options.getString('style') || 'casual';
  const colorScheme = interaction.options.getString('color_scheme');
  const specialFeatures = interaction.options.getString('special_features');
  const rating = interaction.options.getInteger('rating');
  
  try {
    // Generate detailed review
    const review = generateDetailedReview(
      itemName,
      itemType,
      style,
      colorScheme,
      specialFeatures,
      rating,
      creatorName
    );
    
    const reviewEmbed = createEmbed(
      'Review Generated Successfully',
      `Here's your detailed review for **${itemName}**:\n\n\`\`\`${review}\`\`\``,
      BOT_CONFIG.colors.success
    );
    
    reviewEmbed.addFields(
      { name: 'Item', value: itemName, inline: true },
      { name: 'Creator', value: creatorName, inline: true },
      { name: 'Rating', value: '⭐'.repeat(rating), inline: true },
      { name: 'Type', value: itemType.charAt(0).toUpperCase() + itemType.slice(1), inline: true },
      { name: 'Style', value: style.charAt(0).toUpperCase() + style.slice(1), inline: true },
      { name: 'Colors', value: colorScheme, inline: true }
    );
    
    await interaction.reply({ embeds: [reviewEmbed] });
    
    // Save review to database
    await dbHelpers.saveReview({
      userId: interaction.user.id,
      itemName,
      itemId,
      reviewText: review,
      rating
    });
    
  } catch (error) {
    console.error('Error generating review:', error);
    
    const errorEmbed = createEmbed(
      'Review Generation Failed',
      'I encountered an error while generating your review. Please try again later.',
      BOT_CONFIG.colors.error
    );
    
    await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
  }
}

async function handleReviewTemplate(interaction, createEmbed, BOT_CONFIG) {
  const itemType = interaction.options.getString('item_type');
  
  const templates = {
    outfit: {
      title: 'Outfit Review Template',
      template: `This [item_type] by [creator_name] is absolutely stunning! The [color_scheme] color scheme creates a perfect [style] look that's both elegant and versatile.

The quality and attention to detail are exceptional. The [special_features] add such a beautiful touch to the overall design. The fit is perfect and the textures are incredibly realistic.

I love how this piece can be styled in so many different ways - it's perfect for [occasion1], [occasion2], and [occasion3]. The [item_type] truly showcases [creator_name]'s incredible talent and creativity.

Overall, this is a must-have piece that I would definitely recommend to anyone looking for high-quality [style] fashion. Thank you for creating such a beautiful item! ⭐⭐⭐⭐⭐`
    },
    dress: {
      title: 'Dress Review Template',
      template: `This gorgeous [item_type] by [creator_name] is absolutely breathtaking! The [color_scheme] design is perfect for any [style] occasion.

The silhouette is incredibly flattering and the attention to detail is remarkable. I especially love the [special_features] which add such elegance to the overall look.

The quality is outstanding - the textures are realistic and the fit is perfect. This dress would be perfect for [occasion1], [occasion2], or even [occasion3].

[creator_name] has truly outdone themselves with this creation. It's a timeless piece that I know I'll be wearing for years to come. Highly recommended! ⭐⭐⭐⭐⭐`
    },
    accessories: {
      title: 'Accessories Review Template',
      template: `These beautiful [item_type] by [creator_name] are absolutely perfect! The [color_scheme] design adds such elegance to any outfit.

The quality is exceptional - every detail has been carefully crafted. I love how the [special_features] make these accessories truly unique and special.

These pieces are incredibly versatile and can be styled with so many different looks. They're perfect for [occasion1], [occasion2], and [occasion3].

[creator_name] has created something truly special here. These accessories are a must-have for anyone who loves [style] fashion. Thank you for such beautiful work! ⭐⭐⭐⭐⭐`
    },
    hair: {
      title: 'Hair Review Template',
      template: `This stunning [item_type] by [creator_name] is absolutely gorgeous! The [color_scheme] color and style are perfect for creating beautiful looks.

The quality is outstanding - the textures are realistic and the styling options are incredible. I especially love the [special_features] which add such character to the hair.

This hair works perfectly with so many different styles and outfits. It's ideal for [occasion1], [occasion2], and [occasion3].

[creator_name] has created a truly beautiful piece that I know I'll be using constantly. The attention to detail and quality make this hair a definite favorite. Highly recommended! ⭐⭐⭐⭐⭐`
    }
  };
  
  const template = templates[itemType] || templates.outfit;
  
  const templateEmbed = createEmbed(
    template.title,
    `Here's a review template for ${itemType} items:\n\n\`\`\`${template.template}\`\`\``,
    BOT_CONFIG.colors.info
  );
  
  templateEmbed.addFields({
    name: 'Template Variables',
    value: '• [item_type] - Type of item\n• [creator_name] - Creator\'s name\n• [color_scheme] - Color description\n• [style] - Style type\n• [special_features] - Special details\n• [occasion1/2/3] - Use occasions',
    inline: false
  });
  
  await interaction.reply({ embeds: [templateEmbed] });
}

async function handleReviewHistory(interaction, createEmbed, BOT_CONFIG) {
  const limit = interaction.options.getInteger('limit') || 5;
  
  try {
    // This would need a specific helper function to get user reviews
    // For now, we'll create a placeholder response
    const historyEmbed = createEmbed(
      'Review History',
      `Here are your last ${limit} reviews:`,
      BOT_CONFIG.colors.info
    );
    
    historyEmbed.setDescription('Review history feature is coming soon! Use `/review generate` to create new reviews.');
    
    await interaction.reply({ embeds: [historyEmbed] });
    
  } catch (error) {
    console.error('Error retrieving review history:', error);
    
    const errorEmbed = createEmbed(
      'History Retrieval Failed',
      'I encountered an error while retrieving your review history. Please try again later.',
      BOT_CONFIG.colors.error
    );
    
    await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
  }
}

// Review generation function
function generateDetailedReview(itemName, itemType, style, colorScheme, specialFeatures, rating, creatorName) {
  const ratingStars = '⭐'.repeat(rating);
  const occasions = getOccasionsForStyle(style);
  
  let review = `This absolutely stunning ${itemType} by ${creatorName} is a true masterpiece! The ${colorScheme} color scheme creates the perfect ${style} aesthetic that's both elegant and versatile.\n\n`;
  
  review += `The quality and attention to detail are exceptional. `;
  
  if (specialFeatures) {
    review += `I especially love the ${specialFeatures} which add such a beautiful and unique touch to the overall design. `;
  }
  
  review += `The textures are incredibly realistic and the fit is absolutely perfect.\n\n`;
  
  review += `This piece is incredibly versatile and can be styled for so many different occasions - it's perfect for ${occasions[0]}, ${occasions[1]}, and even ${occasions[2]}. `;
  
  review += `The ${itemType} truly showcases ${creatorName}'s incredible talent and creativity in virtual fashion design.\n\n`;
  
  review += `Overall, this is a must-have piece that I would definitely recommend to anyone looking for high-quality ${style} fashion. `;
  review += `Thank you for creating such a beautiful and well-crafted item! ${ratingStars}`;
  
  return review;
}

function getOccasionsForStyle(style) {
  const occasionMap = {
    casual: ['everyday wear', 'coffee dates', 'shopping trips'],
    formal: ['business meetings', 'formal events', 'special occasions'],
    party: ['night out', 'celebrations', 'club events'],
    gothic: ['dark themed events', 'alternative gatherings', 'mystical occasions'],
    cute: ['dates', 'cute meetups', 'playful events'],
    elegant: ['formal dinners', 'special occasions', 'sophisticated events'],
    streetwear: ['urban adventures', 'casual hangouts', 'street fashion events'],
    vintage: ['retro themed events', 'vintage parties', 'classic occasions']
  };
  
  return occasionMap[style] || ['various occasions', 'different events', 'multiple settings'];
}
