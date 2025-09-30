# 🤖 Google AI Studio Setup Guide

## Overview
Aurelius uses Google AI Studio (Gemini) for AI-powered features like caption generation and item reviews. This guide will help you set up your own API key to avoid shared limits.

## Why Use Your Own API Key?
- **No shared limits** with other users
- **Free tier** with generous usage limits
- **Better performance** and reliability
- **Personal control** over your AI features

## Step 1: Get Your Gemini API Key

1. **Go to Google AI Studio**
   - Visit: https://aistudio.google.com/
   - Sign in with your Google account

2. **Create API Key**
   - Click "Get API key" in the left sidebar
   - Click "Create API key"
   - Choose "Create API key in new project" (recommended)
   - Copy your API key (starts with `AIza...`)

3. **Save Your API Key**
   - Keep it secure and don't share it
   - You can regenerate it if needed

## Step 2: Add API Key to Aurelius

### For Discord Bot Users:
1. **Set Environment Variable**
   - Add `GEMINI_API_KEY=your_api_key_here` to your `.env` file
   - Restart your bot

### For Render Deployment:
1. **Add to Render Environment Variables**
   - Go to your Render dashboard
   - Navigate to your service
   - Go to "Environment" tab
   - Add: `GEMINI_API_KEY` = `your_api_key_here`
   - Redeploy your service

## Step 3: Verify Setup

1. **Test AI Features**
   - Use `/caption imvu` command
   - Use `/review generate` command
   - Check if AI-generated content appears

2. **Check Bot Logs**
   - Look for: `◆ Google AI Studio (Gemini) initialized successfully`
   - If you see: `◆ No Gemini API key found. AI features will use fallback templates.`
   - Then your API key wasn't set correctly

## Free Tier Limits

Google AI Studio offers generous free tier limits:
- **15 requests per minute**
- **1 million tokens per day**
- **No credit card required**

## Troubleshooting

### Common Issues:

1. **"AI service not initialized" error**
   - Check if your API key is set correctly
   - Verify the key starts with `AIza...`
   - Restart your bot after adding the key

2. **"Rate limit exceeded" error**
   - You've hit the free tier limits
   - Wait a few minutes and try again
   - Consider upgrading to paid tier for higher limits

3. **"Invalid API key" error**
   - Double-check your API key
   - Make sure there are no extra spaces
   - Regenerate the key if needed

### Getting Help:
- Check Google AI Studio documentation
- Verify your API key in Google AI Studio
- Check bot logs for specific error messages

## Security Best Practices

1. **Never share your API key**
2. **Don't commit it to version control**
3. **Use environment variables**
4. **Regenerate if compromised**

## Advanced Configuration

### Custom AI Prompts
You can modify the AI prompts in `src/services/aiService.js` to customize:
- Caption style and tone
- Review format and length
- Request format templates

### Multiple API Keys
For high-usage scenarios, you can:
- Use multiple API keys
- Implement key rotation
- Monitor usage in Google AI Studio

---

## Need Help?

If you encounter issues:
1. Check this guide first
2. Verify your API key setup
3. Check bot logs for errors
4. Contact support if needed

**Happy modeling with AI-powered features! ✨**
