import { GoogleGenAI } from '@google/genai';

// AI Service for Google Gemini
class AIService {
  constructor() {
    this.client = null;
    this.isInitialized = false;
  }

  // Initialize the AI client with API key
  initialize(apiKey) {
    try {
      if (!apiKey) {
        throw new Error('Gemini API key is required');
      }

      this.client = new GoogleGenAI({
        apiKey: apiKey
      });
      
      this.isInitialized = true;
      console.log('◆ Google AI Studio (Gemini) initialized successfully');
      return true;
    } catch (error) {
      console.error('Error initializing Google AI Studio:', error);
      this.isInitialized = false;
      return false;
    }
  }

  // Generate IMVU caption
  async generateIMVUCaption(itemData, userPreferences = {}) {
    if (!this.isInitialized) {
      throw new Error('AI service not initialized. Please set your Gemini API key.');
    }

    const prompt = `
Generate an engaging IMVU feed caption for the following item:

Item: ${itemData.item_name}
Creator: ${itemData.creator_name}
Item ID: ${itemData.item_id}
Manufacturer ID: ${itemData.manufacturer_id}
Agency: ${itemData.agency_name || 'General'}

Style: ${userPreferences.captionStyle || 'elegant'}
Additional tags: ${userPreferences.additionalTags || ''}

Requirements:
- Use emojis appropriately (✨, 💕, etc.)
- Include item name, creator, and IDs
- Add relevant hashtags (#IMVU, #Fashion, #Modeling)
- Keep it engaging and professional
- Match the agency format if specified
- Length: 2-4 lines

Generate the caption:`;

    try {
      const response = await this.client.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          thinkingConfig: {
            thinkingBudget: 0 // Disable thinking for faster responses
          }
        }
      });

      return response.text.trim();
    } catch (error) {
      console.error('Error generating IMVU caption:', error);
      throw new Error('Failed to generate IMVU caption. Please try again.');
    }
  }

  // Generate Instagram caption
  async generateInstagramCaption(itemData, userPreferences = {}) {
    if (!this.isInitialized) {
      throw new Error('AI service not initialized. Please set your Gemini API key.');
    }

    const prompt = `
Generate an engaging Instagram caption for the following IMVU item:

Item: ${itemData.item_name}
Creator: ${itemData.creator_name}
Item ID: ${itemData.item_id}
Instagram Handle: @${itemData.creator_instagram || 'creator'}

Style: ${userPreferences.captionStyle || 'elegant'}
Additional tags: ${userPreferences.additionalTags || ''}

Requirements:
- Use emojis appropriately (✨, 💕, 🔥, etc.)
- Include item name and creator mention
- Add relevant hashtags (#IMVU, #VirtualFashion, #Modeling)
- Keep it engaging and social media friendly
- Length: 3-5 lines
- Include call-to-action if appropriate

Generate the Instagram caption:`;

    try {
      const response = await this.client.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          thinkingConfig: {
            thinkingBudget: 0
          }
        }
      });

      return response.text.trim();
    } catch (error) {
      console.error('Error generating Instagram caption:', error);
      throw new Error('Failed to generate Instagram caption. Please try again.');
    }
  }

  // Generate detailed item review
  async generateItemReview(itemData, userPreferences = {}) {
    if (!this.isInitialized) {
      throw new Error('AI service not initialized. Please set your Gemini API key.');
    }

    const prompt = `
Generate a detailed, professional review for the following IMVU item:

Item: ${itemData.item_name}
Creator: ${itemData.creator_name}
Item ID: ${itemData.item_id}
Item Type: ${itemData.item_type}
Color Scheme: ${itemData.color_scheme}
Style: ${itemData.style || 'Not specified'}
Rating: ${itemData.rating}/5 stars
Special Features: ${itemData.special_features || 'None specified'}

Requirements:
- Write a comprehensive review (3-5 paragraphs)
- Include detailed description of the item
- Mention quality, design, and usability
- Include pros and cons
- Be honest and constructive
- Use professional but engaging tone
- Include the rating justification
- End with a recommendation

Generate the detailed review:`;

    try {
      const response = await this.client.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          thinkingConfig: {
            thinkingBudget: 0
          }
        }
      });

      return response.text.trim();
    } catch (error) {
      console.error('Error generating item review:', error);
      throw new Error('Failed to generate item review. Please try again.');
    }
  }

  // Generate request format
  async generateRequestFormat(itemData, agencyName) {
    if (!this.isInitialized) {
      throw new Error('AI service not initialized. Please set your Gemini API key.');
    }

    const prompt = `
Generate a professional request format for the following IMVU item and agency:

Item: ${itemData.item_name}
Creator: ${itemData.creator_name}
Agency: ${agencyName}
IMVU Link: ${itemData.imvu_link || 'Not provided'}
Instagram: @${itemData.instagram_handle || 'Not provided'}

Requirements:
- Write a polite, professional request
- Include all necessary information
- Match the agency's communication style
- Be concise but complete
- Include gratitude and professionalism
- Length: 2-3 sentences

Generate the request format:`;

    try {
      const response = await this.client.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          thinkingConfig: {
            thinkingBudget: 0
          }
        }
      });

      return response.text.trim();
    } catch (error) {
      console.error('Error generating request format:', error);
      throw new Error('Failed to generate request format. Please try again.');
    }
  }

  // Check if service is ready
  isReady() {
    return this.isInitialized && this.client !== null;
  }
}

// Create singleton instance
const aiService = new AIService();

export default aiService;
