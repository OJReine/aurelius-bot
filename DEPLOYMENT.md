# Aurelius Bot - Render Deployment Guide

## Prerequisites

1. **Discord Bot Setup**
   - Create a Discord application at https://discord.com/developers/applications
   - Get your bot token and client ID
   - Invite the bot to your server with necessary permissions

2. **Database Setup**
   - Sign up for a free PostgreSQL database at https://neon.tech/ or https://supabase.com/
   - Get your database connection string

3. **OpenAI API (Optional)**
   - Sign up for OpenAI API at https://platform.openai.com/
   - Get your API key for enhanced review generation

## Render Deployment Steps

### 1. Connect Repository
- Fork or clone this repository
- Connect your GitHub repository to Render

### 2. Create Web Service
- Go to Render Dashboard
- Click "New +" → "Web Service"
- Connect your GitHub repository
- Choose the repository containing Aurelius Bot

### 3. Configure Service Settings
- **Name**: `aurelius-bot`
- **Environment**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Plan**: Choose "Free" plan

### 4. Set Environment Variables
In the Render dashboard, add these environment variables:

```
DISCORD_TOKEN=your_discord_bot_token_here
CLIENT_ID=your_discord_client_id_here
DATABASE_URL=your_postgresql_connection_string_here
OPENAI_API_KEY=your_openai_api_key_here
NODE_ENV=production
PORT=3000
```

### 5. Deploy
- Click "Create Web Service"
- Render will automatically build and deploy your bot
- Monitor the logs for any errors

### 6. Deploy Commands
After successful deployment, run the command deployment:
- Go to your service logs
- Run: `npm run deploy`
- This will register all slash commands with Discord

## Database Setup

### Using Neon (Recommended)
1. Sign up at https://neon.tech/
2. Create a new project
3. Copy the connection string
4. The database tables will be created automatically when the bot starts

### Using Supabase
1. Sign up at https://supabase.com/
2. Create a new project
3. Go to Settings → Database
4. Copy the connection string
5. The database tables will be created automatically when the bot starts

## Bot Permissions

When inviting your bot to Discord, ensure it has these permissions:
- Send Messages
- Use Slash Commands
- Embed Links
- Read Message History
- Send Messages in Threads
- Use External Emojis

## Monitoring

### Health Checks
The bot includes health check endpoints:
- `GET /health` - Basic health check
- `GET /status` - Detailed status information

### Logs
Monitor your bot's logs in the Render dashboard:
- Check for startup errors
- Monitor command execution
- Watch for database connection issues

## Troubleshooting

### Common Issues

1. **Bot Not Responding**
   - Check if the bot is online in Discord
   - Verify the DISCORD_TOKEN is correct
   - Check Render logs for errors

2. **Commands Not Working**
   - Run `npm run deploy` to register commands
   - Ensure bot has proper permissions
   - Check CLIENT_ID is correct

3. **Database Errors**
   - Verify DATABASE_URL is correct
   - Check if database is accessible
   - Ensure tables are created properly

4. **Memory Issues**
   - Free tier has memory limits
   - Consider upgrading if needed
   - Optimize code for memory usage

### Support
- Check Render documentation: https://render.com/docs
- Discord.js documentation: https://discord.js.org/
- Database documentation (Neon/Supabase)

## Scaling

### Free Tier Limits
- 750 hours per month
- 512MB RAM
- Sleeps after 15 minutes of inactivity

### Upgrading
- Consider paid plans for production use
- Higher memory limits
- Always-on service
- Better performance

## Security

### Environment Variables
- Never commit tokens to code
- Use Render's environment variable system
- Rotate tokens regularly

### Database Security
- Use connection pooling
- Implement proper error handling
- Regular backups

## Maintenance

### Updates
- Monitor for Discord.js updates
- Update dependencies regularly
- Test updates in development first

### Monitoring
- Set up alerts for downtime
- Monitor memory usage
- Track command usage

---

◇ "In careful planning and deployment, reliability finds its foundation." ◇
