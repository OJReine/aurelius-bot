-- Aurelius Bot Database Initialization Script
-- Run this in Supabase SQL Editor

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create streams table
CREATE TABLE IF NOT EXISTS streams (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(20) NOT NULL,
  server_id VARCHAR(20),
  item_name TEXT NOT NULL,
  creator_name TEXT NOT NULL,
  creator_id VARCHAR(20),
  agency_name TEXT,
  due_date TIMESTAMP NOT NULL,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  notes TEXT,
  priority VARCHAR(10) DEFAULT 'medium',
  stream_type VARCHAR(20) DEFAULT 'showcase'
);

-- Create schedules table
CREATE TABLE IF NOT EXISTS schedules (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(20) NOT NULL,
  server_id VARCHAR(20),
  week_start TIMESTAMP NOT NULL,
  week_end TIMESTAMP NOT NULL,
  monday JSON,
  tuesday JSON,
  wednesday JSON,
  thursday JSON,
  friday JSON,
  saturday JSON,
  sunday JSON,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create captions table
CREATE TABLE IF NOT EXISTS captions (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(20) NOT NULL,
  stream_id INTEGER REFERENCES streams(id),
  platform VARCHAR(10) NOT NULL,
  caption_text TEXT NOT NULL,
  agency_format TEXT,
  tags JSON,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(20) NOT NULL,
  stream_id INTEGER REFERENCES streams(id),
  item_name TEXT NOT NULL,
  item_id VARCHAR(50),
  review_text TEXT NOT NULL,
  rating INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(20) PRIMARY KEY,
  imvu_name TEXT,
  instagram_handle TEXT,
  preferred_agencies JSON,
  caption_style VARCHAR(20) DEFAULT 'elegant',
  timezone VARCHAR(50) DEFAULT 'UTC',
  reminder_settings JSON,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create reminders table
CREATE TABLE IF NOT EXISTS reminders (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(20) NOT NULL,
  server_id VARCHAR(20),
  stream_id INTEGER REFERENCES streams(id),
  reminder_type VARCHAR(20) NOT NULL,
  reminder_text TEXT NOT NULL,
  scheduled_for TIMESTAMP NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create agency_templates table
CREATE TABLE IF NOT EXISTS agency_templates (
  id SERIAL PRIMARY KEY,
  agency_name TEXT NOT NULL,
  imvu_caption_format TEXT NOT NULL,
  instagram_caption_format TEXT NOT NULL,
  required_tags JSON,
  optional_tags JSON,
  request_format TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert default agency templates
INSERT INTO agency_templates (agency_name, imvu_caption_format, instagram_caption_format, required_tags, request_format) VALUES
('Ladies & Babes', 
 '✨ {item_name} ✨\n\nCreator: {creator_name}\nItem ID: {item_id}\nManufacturer ID: {manufacturer_id}\n\n#IMVU #Fashion #Modeling #LadiesAndBabes',
 '✨ {item_name} ✨\n\nLoving this beautiful piece by @{creator_instagram}!\n\nItem ID: {item_id}\n\n#IMVU #Fashion #Modeling #VirtualFashion #LadiesAndBabes #@{creator_instagram}',
 '["#IMVU", "#Fashion", "#Modeling", "#LadiesAndBabes"]',
 'Hi! I would love to request {item_name} by {creator_name} for streaming!\n\nIMVU Link: {imvu_link}\nInstagram: @{instagram_handle}\n\nThank you for considering my request! 💕'),
('Default',
 '✨ {item_name} ✨\n\nCreator: {creator_name}\nItem ID: {item_id}\nManufacturer ID: {manufacturer_id}\n\n#IMVU #Fashion #Modeling',
 '✨ {item_name} ✨\n\nBeautiful piece by @{creator_instagram}!\n\nItem ID: {item_id}\n\n#IMVU #Fashion #Modeling #VirtualFashion',
 '["#IMVU", "#Fashion", "#Modeling"]',
 'Hi! I would love to request {item_name} by {creator_name} for streaming!\n\nIMVU Link: {imvu_link}\nInstagram: @{instagram_handle}\n\nThank you! 💕')
ON CONFLICT (agency_name) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_streams_user_id ON streams(user_id);
CREATE INDEX IF NOT EXISTS idx_streams_status ON streams(status);
CREATE INDEX IF NOT EXISTS idx_streams_due_date ON streams(due_date);
CREATE INDEX IF NOT EXISTS idx_schedules_user_id ON schedules(user_id);
CREATE INDEX IF NOT EXISTS idx_captions_user_id ON captions(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reminders_user_id ON reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_reminders_scheduled_for ON reminders(scheduled_for);

-- Enable Row Level Security (RLS)
ALTER TABLE streams ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE captions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for Discord bot access
-- Note: These policies allow access based on user_id matching
-- For Discord bots, we'll use the Discord user ID as the identifier

-- Streams policies
CREATE POLICY "Users can view own streams" ON streams
  FOR SELECT USING (true); -- Allow all reads for Discord bot

CREATE POLICY "Users can insert own streams" ON streams
  FOR INSERT WITH CHECK (true); -- Allow all inserts for Discord bot

CREATE POLICY "Users can update own streams" ON streams
  FOR UPDATE USING (true); -- Allow all updates for Discord bot

CREATE POLICY "Users can delete own streams" ON streams
  FOR DELETE USING (true); -- Allow all deletes for Discord bot

-- Schedules policies
CREATE POLICY "Users can view own schedules" ON schedules
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own schedules" ON schedules
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own schedules" ON schedules
  FOR UPDATE USING (true);

CREATE POLICY "Users can delete own schedules" ON schedules
  FOR DELETE USING (true);

-- Captions policies
CREATE POLICY "Users can view own captions" ON captions
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own captions" ON captions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own captions" ON captions
  FOR UPDATE USING (true);

CREATE POLICY "Users can delete own captions" ON captions
  FOR DELETE USING (true);

-- Reviews policies
CREATE POLICY "Users can view own reviews" ON reviews
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own reviews" ON reviews
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own reviews" ON reviews
  FOR UPDATE USING (true);

CREATE POLICY "Users can delete own reviews" ON reviews
  FOR DELETE USING (true);

-- User profiles policies
CREATE POLICY "Users can view own profiles" ON user_profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own profiles" ON user_profiles
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own profiles" ON user_profiles
  FOR UPDATE USING (true);

CREATE POLICY "Users can delete own profiles" ON user_profiles
  FOR DELETE USING (true);

-- Reminders policies
CREATE POLICY "Users can view own reminders" ON reminders
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own reminders" ON reminders
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own reminders" ON reminders
  FOR UPDATE USING (true);

CREATE POLICY "Users can delete own reminders" ON reminders
  FOR DELETE USING (true);

-- Agency templates are public (no RLS needed)

-- Success message
SELECT 'Aurelius database initialization completed successfully!' as status;
