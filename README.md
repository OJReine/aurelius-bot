# Aurelius Bot - Personal IMVU Modeling Assistant

## Overview

Aurelius is a Discord bot designed to be the perfect personal assistant for IMVU models and streamers. He serves as a supportive companion to Astraee, sharing her elegant aesthetic while bringing a warmer, more friendly personality to help models manage their streaming workflow.

## Features

### 🌟 Core Capabilities
- **Stream Management**: Track ongoing streams, deadlines, and completions
- **Caption Generation**: Create IMVU and Instagram captions with proper formatting
- **Schedule Organization**: Weekly planning and reminder system
- **Review Writing**: AI-powered detailed reviews for IMVU items
- **Request Formatting**: Generate proper request formats for different agencies
- **Progress Tracking**: Monitor model performance and achievements

### 🎨 Aesthetic & Personality
- **Symbols**: ◆ for titles, ◇ for accents, ❧ for poetic endings, ✦ for achievements
- **Personality**: Warm, supportive, and encouraging
- **Color Scheme**: Soft blues and purples with elegant gradients
- **Communication**: Friendly yet professional tone

### 🔧 Technical Features
- **Multi-Server Support**: Works in DMs and across multiple servers
- **Database Integration**: PostgreSQL with Supabase
- **Cloud Hosting**: Render + Uptime Robot for 24/7 uptime
- **Free Tier Compatible**: Completely free hosting solution

## Installation

1. Clone the repository
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env` and configure
4. Deploy commands: `npm run deploy`
5. Start the bot: `npm start`

## Commands

### Stream Management
- `/stream create` - Register a new stream
- `/stream complete` - Mark stream as complete
- `/stream list` - View active streams
- `/stream schedule` - Set up weekly schedule

### Content Creation
- `/caption imvu` - Generate IMVU feed caption
- `/caption instagram` - Generate Instagram caption
- `/review generate` - Create detailed item review
- `/request format` - Generate agency request format

### Organization
- `/schedule weekly` - Plan weekly activities
- `/reminder set` - Set custom reminders
- `/progress track` - View performance metrics

## Database Schema

The bot uses PostgreSQL with the following main tables:
- `streams` - Stream tracking and management
- `schedules` - Weekly planning and organization
- `captions` - Generated caption templates
- `reviews` - Item review history
- `user_profiles` - Model preferences and settings

## Deployment

The bot is optimized for deployment on Render with:
- Automatic restarts
- Environment variable configuration
- Free PostgreSQL database integration
- Health check endpoints

## Support

For support and feature requests, please contact the development team.

---

❧ "In the gentle guidance of structure, creativity finds its truest expression." ❧
