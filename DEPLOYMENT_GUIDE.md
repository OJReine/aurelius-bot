# 🚀 Aurelius Deployment Guide - All Platforms

## 📋 **Quick Start Checklist**

### **Discord Bot Deployment**
- [ ] Create Discord application and bot
- [ ] Set up free PostgreSQL database (Neon/Supabase)
- [ ] Deploy to Railway/Render
- [ ] Configure environment variables
- [ ] Deploy slash commands
- [ ] Test bot functionality

### **Web Dashboard Deployment**
- [ ] Set up Supabase project
- [ ] Deploy frontend to Vercel
- [ ] Configure authentication
- [ ] Set up database tables
- [ ] Test web interface

### **Desktop App Distribution**
- [ ] Build Electron app
- [ ] Create installers for Windows/macOS/Linux
- [ ] Upload to GitHub Releases
- [ ] Test installation process
- [ ] Create user documentation

---

## 🤖 **Discord Bot Deployment**

### **Step 1: Discord Application Setup**

1. **Create Discord Application**
   - Go to https://discord.com/developers/applications
   - Click "New Application"
   - Name it "Aurelius"
   - Copy Application ID (Client ID)

2. **Create Bot**
   - Go to "Bot" section
   - Click "Add Bot"
   - Copy Bot Token
   - Enable "Message Content Intent"

3. **Set Permissions**
   - Go to "OAuth2" > "URL Generator"
   - Select "bot" and "applications.commands"
   - Select permissions:
     - Send Messages
     - Use Slash Commands
     - Embed Links
     - Read Message History
     - Send Messages in Threads
     - Use External Emojis

4. **Invite Bot**
   - Copy generated URL
   - Open in browser
   - Select server and authorize

### **Step 2: Database Setup**

#### **Option A: Supabase (Recommended)**
```bash
# 1. Sign up at https://supabase.com/
# 2. Create new project
# 3. Go to Settings > Database
# 4. Copy connection string
# 5. Database will be created automatically
```

#### **Option B: Neon**
```bash
# 1. Sign up at https://neon.tech/
# 2. Create new project
# 3. Copy connection string
# 4. Database will be created automatically
```

### **Step 3: Hosting Setup**

#### **Option A: Render (Recommended)**
```bash
# 1. Sign up at https://render.com/
# 2. Connect GitHub repository
# 3. Create Web Service
# 4. Add environment variables:
DISCORD_TOKEN=your_bot_token
CLIENT_ID=your_client_id
DATABASE_URL=your_supabase_url
OPENAI_API_KEY=your_openai_key
NODE_ENV=production
PORT=3000

# 5. Deploy automatically
# 6. Set up Uptime Robot for 24/7 uptime
```

#### **Option B: Replit**
```bash
# 1. Sign up at https://replit.com/
# 2. Import from GitHub
# 3. Set environment variables
# 4. Run in browser
# 5. Keep alive with uptime monitoring
```

#### **Option C: Fly.io**
```bash
# 1. Sign up at https://fly.io/
# 2. Install flyctl CLI
# 3. Create fly.toml configuration
# 4. Deploy with fly deploy
# 5. Set up monitoring
```

### **Step 4: Command Deployment**
```bash
# After successful deployment, run:
npm run deploy

# This registers all slash commands with Discord
```

### **Step 5: Uptime Robot Setup (24/7 Uptime)**
```bash
# 1. Sign up at https://uptimerobot.com/
# 2. Add new monitor:
#    - Monitor Type: HTTP(s)
#    - Friendly Name: Aurelius Bot
#    - URL: https://your-render-app.onrender.com
#    - Monitoring Interval: 5 minutes
#    - Monitor Timeout: 30 seconds

# 3. Configure alerts:
#    - Email notifications
#    - Discord webhook (optional)
#    - Mobile app notifications

# 4. This keeps your bot awake 24/7
#    Render sleeps after 15 minutes of inactivity
#    Uptime Robot pings every 5 minutes to keep it awake
```

### **Step 6: Testing**
```bash
# Test basic functionality:
/help
/stream create
/profile setup

# Verify database connection
# Check logs for errors
# Confirm Uptime Robot is pinging
```

---

## 🌐 **Web Dashboard Deployment**

### **Step 1: Supabase Setup**

1. **Create Supabase Project**
   - Go to https://supabase.com/
   - Create new project
   - Wait for setup to complete

2. **Configure Authentication**
   - Go to Authentication > Settings
   - Enable Discord provider
   - Add Discord OAuth credentials
   - Set redirect URLs

3. **Set Up Database**
   - Go to SQL Editor
   - Run initialization script
   - Enable Row Level Security

### **Step 2: Frontend Deployment**

#### **Vercel Deployment**
```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Login to Vercel
vercel login

# 3. Deploy from project directory
vercel --prod

# 4. Set environment variables in Vercel dashboard:
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

#### **Netlify Deployment**
```bash
# 1. Connect GitHub repository
# 2. Set build command: npm run build
# 3. Set publish directory: out
# 4. Set environment variables
# 5. Deploy automatically
```

### **Step 3: Domain Configuration**
```bash
# Optional: Custom domain
# 1. Add domain in hosting platform
# 2. Update Supabase redirect URLs
# 3. Configure DNS records
```

---

## 💻 **Desktop App Distribution**

### **Step 1: Build Process**

#### **Development Build**
```bash
# 1. Install dependencies
npm install

# 2. Run in development
npm run electron-dev

# 3. Test functionality
```

#### **Production Build**
```bash
# 1. Build React app
npm run build

# 2. Build Electron app
npm run dist

# 3. Check dist/ folder for installers
```

### **Step 2: Platform-Specific Builds**

#### **Windows Build**
```bash
# Build Windows installer
npm run dist-win

# Creates: dist/Aurelius Setup 1.0.0.exe
```

#### **macOS Build**
```bash
# Build macOS app
npm run dist-mac

# Creates: dist/Aurelius-1.0.0.dmg
```

#### **Linux Build**
```bash
# Build Linux AppImage
npm run dist-linux

# Creates: dist/Aurelius-1.0.0.AppImage
```

### **Step 3: Distribution**

#### **GitHub Releases**
```bash
# 1. Create release on GitHub
# 2. Upload installers
# 3. Add release notes
# 4. Tag version
```

#### **Auto-Updates**
```bash
# 1. Configure electron-updater
# 2. Set up update server
# 3. Test update process
```

---

## 🔧 **Configuration Guide**

### **Environment Variables**

#### **Discord Bot**
```env
# Required
DISCORD_TOKEN=your_discord_bot_token
CLIENT_ID=your_discord_client_id
DATABASE_URL=your_postgresql_connection_string

# Optional
GUILD_ID=your_test_guild_id
OPENAI_API_KEY=your_openai_api_key
NODE_ENV=production
PORT=3000
```

#### **Web Dashboard**
```env
# Required
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_APP_URL=your_app_url
```

#### **Desktop App**
```env
# No environment variables needed
# Uses local SQLite database
# Settings stored in Electron Store
```

### **Database Configuration**

#### **PostgreSQL (Cloud)**
```sql
-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable Row Level Security
ALTER TABLE streams ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE captions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own data" ON streams
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own data" ON streams
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own data" ON streams
  FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete own data" ON streams
  FOR DELETE USING (auth.uid()::text = user_id);
```

#### **SQLite (Local)**
```sql
-- Tables created automatically
-- No additional configuration needed
-- Data stored in user data directory
```

---

## 🚀 **Deployment Strategies**

### **Free Tier Strategy**

#### **Complete Free Stack**
- **Discord Bot**: Render (free tier) + Uptime Robot (free tier)
- **Web Dashboard**: Vercel (free tier)
- **Database**: Supabase (free tier)
- **AI Services**: Hugging Face (free tier)
- **Total Cost**: $0/month

#### **Enhanced Free Stack**
- **Discord Bot**: Render (free tier) + Uptime Robot (free tier)
- **Web Dashboard**: Vercel (free tier)
- **Database**: Neon (free tier)
- **AI Services**: Groq (free tier)
- **Total Cost**: $0/month

### **Production Strategy**

#### **Recommended Production Stack**
- **Discord Bot**: Railway (Pro plan)
- **Web Dashboard**: Vercel (Pro plan)
- **Database**: Supabase (Pro plan)
- **AI Services**: OpenAI API
- **Monitoring**: Sentry + Uptime Robot
- **CDN**: Cloudflare
- **Total Cost**: ~$50-100/month

---

## 🔐 **Security Configuration**

### **Discord Bot Security**
```javascript
// Rate limiting
const rateLimit = new Map();

// Input validation
const validateInput = (input) => {
  // Sanitize and validate
};

// Error handling
const handleError = (error) => {
  // Log error securely
  // Don't expose sensitive information
};
```

### **Web Dashboard Security**
```javascript
// Supabase RLS policies
const policies = {
  streams: "Users can only access their own streams",
  schedules: "Users can only access their own schedules",
  captions: "Users can only access their own captions",
  reviews: "Users can only access their own reviews"
};

// API security
const apiSecurity = {
  rateLimit: "100 requests per minute",
  cors: "Configured for specific domains",
  headers: "Security headers enabled"
};
```

### **Desktop App Security**
```javascript
// Local data encryption
const encryptData = (data) => {
  // Encrypt sensitive data
};

// Secure storage
const secureStore = {
  path: "User data directory",
  permissions: "User-only access",
  backup: "User-controlled export"
};
```

---

## 📊 **Monitoring Setup**

### **Free Monitoring Tools**

#### **Uptime Monitoring**
```bash
# Uptime Robot
# 1. Sign up at https://uptimerobot.com/
# 2. Add monitors for:
#    - Discord bot endpoint
#    - Web dashboard URL
# 3. Set up alerts
```

#### **Error Tracking**
```bash
# Sentry
# 1. Sign up at https://sentry.io/
# 2. Create project
# 3. Add SDK to applications
# 4. Configure error reporting
```

#### **Analytics**
```bash
# Google Analytics
# 1. Create GA4 property
# 2. Add tracking code to web dashboard
# 3. Monitor user behavior
```

### **Performance Monitoring**
```javascript
// Response time monitoring
const monitorPerformance = () => {
  // Track API response times
  // Monitor database query performance
  // Alert on slow responses
};

// Resource monitoring
const monitorResources = () => {
  // Track memory usage
  // Monitor CPU usage
  // Alert on resource limits
};
```

---

## 🛠️ **Troubleshooting**

### **Common Issues**

#### **Discord Bot Issues**
```bash
# Bot not responding
# 1. Check bot token
# 2. Verify permissions
# 3. Check server logs
# 4. Test with /help command

# Commands not working
# 1. Run npm run deploy
# 2. Check command registration
# 3. Verify slash command permissions
# 4. Test in different server

# Database connection errors
# 1. Check DATABASE_URL
# 2. Verify database is running
# 3. Check connection limits
# 4. Review error logs
```

#### **Web Dashboard Issues**
```bash
# Authentication not working
# 1. Check Supabase configuration
# 2. Verify OAuth settings
# 3. Check redirect URLs
# 4. Test with different browser

# Data not loading
# 1. Check RLS policies
# 2. Verify user permissions
# 3. Check network requests
# 4. Review console errors
```

#### **Desktop App Issues**
```bash
# App not starting
# 1. Check system requirements
# 2. Verify installation
# 3. Check antivirus software
# 4. Run as administrator

# Data not saving
# 1. Check file permissions
# 2. Verify disk space
# 3. Check database file
# 4. Review error logs
```

### **Debug Mode**
```bash
# Discord Bot
NODE_ENV=development npm run dev

# Web Dashboard
npm run dev

# Desktop App
npm run electron-dev
```

---

## 📈 **Scaling Guide**

### **Horizontal Scaling**

#### **Discord Bot Scaling**
```bash
# Multiple instances
# 1. Deploy multiple bot instances
# 2. Use load balancer
# 3. Implement session sharing
# 4. Monitor resource usage
```

#### **Web Dashboard Scaling**
```bash
# CDN setup
# 1. Configure Cloudflare
# 2. Enable caching
# 3. Optimize assets
# 4. Monitor performance
```

### **Vertical Scaling**

#### **Database Scaling**
```sql
-- Connection pooling
-- 1. Configure connection limits
-- 2. Implement query optimization
-- 3. Add database indexes
-- 4. Monitor query performance
```

#### **Application Scaling**
```javascript
// Caching
const cache = {
  redis: "For session storage",
  memory: "For frequently accessed data",
  cdn: "For static assets"
};

// Optimization
const optimization = {
  compression: "Enable gzip compression",
  minification: "Minify JavaScript/CSS",
  bundling: "Optimize bundle size"
};
```

---

## 🎯 **Success Metrics**

### **Deployment Success**
- [ ] All platforms deployed successfully
- [ ] No critical errors in logs
- [ ] All features working correctly
- [ ] Performance within acceptable limits
- [ ] Security measures implemented
- [ ] Monitoring configured
- [ ] Documentation complete

### **User Adoption**
- [ ] 100+ Discord server installations
- [ ] 50+ web dashboard users
- [ ] 25+ desktop app downloads
- [ ] Positive user feedback
- [ ] Active community engagement

---

This deployment guide ensures successful deployment of Aurelius across all platforms while maintaining security, performance, and scalability! 🚀

---

◇ "In careful planning and execution, reliability finds its foundation." ◇
