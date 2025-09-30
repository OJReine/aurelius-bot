# 🚀 Aurelius Bot - Render Deployment Guide

## Prerequisites
- ✅ GitHub repository created
- ✅ Supabase database configured
- ✅ Discord bot token ready
- ✅ Environment variables prepared

## Step-by-Step Deployment

### 1. GitHub Repository Setup
```bash
# If you haven't already:
git init
git add .
git commit -m "Initial commit: Aurelius Discord Bot"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/aurelius-bot.git
git push -u origin main
```

### 2. Render Account Setup
1. Go to https://render.com/
2. Sign up with GitHub (recommended)
3. Authorize Render to access your repositories

### 3. Create Web Service
1. Click "New +" → "Web Service"
2. Connect GitHub account if not already connected
3. Select your `aurelius-bot` repository
4. Configure the service:

**Basic Settings:**
- **Name**: `aurelius-bot`
- **Environment**: `Node`
- **Region**: Choose closest to your users
- **Branch**: `main`
- **Root Directory**: Leave empty
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Plan**: `Free`

### 4. Environment Variables
In the Render dashboard, go to "Environment" tab and add:

```env
DISCORD_TOKEN=your_discord_bot_token_here
CLIENT_ID=your_discord_client_id_here
GUILD_ID=your_test_guild_id_here
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
SUPABASE_URL=https://[PROJECT-REF].supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
BOT_NAME=Aurelius
BOT_PREFIX=!
NODE_ENV=production
OPENAI_API_KEY=your_openai_api_key_here
PORT=3000
```

**Important**: Replace all placeholder values with your actual credentials.

### 5. Deploy
1. Click "Create Web Service"
2. Wait for deployment (2-3 minutes)
3. Note the deployment URL (e.g., `https://aurelius-bot.onrender.com`)

### 6. Verify Deployment
1. Check the logs for successful startup
2. Look for "Aurelius is online!" message
3. Test slash commands in Discord

### 7. Set Up Uptime Robot (Next Step)
Once deployed, we'll set up Uptime Robot to keep the bot awake 24/7.

## Troubleshooting

### Common Issues:
1. **Build Fails**: Check Node.js version compatibility
2. **Bot Doesn't Start**: Verify all environment variables are set
3. **Database Connection Error**: Check Supabase credentials
4. **Commands Not Working**: Verify Discord token and permissions

### Logs Location:
- Render Dashboard → Your Service → "Logs" tab

## Next Steps
1. ✅ Deploy to Render
2. 🔄 Set up Uptime Robot monitoring
3. 🔄 Test bot functionality
4. 🔄 Deploy slash commands globally (optional)

---

**Need Help?** Check the logs in Render dashboard or refer to the troubleshooting section.