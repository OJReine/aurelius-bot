import { drizzle } from 'drizzle-orm/node-postgres';
import { pgTable, serial, text, timestamp, integer, boolean, json, varchar } from 'drizzle-orm/pg-core';
import pkg from 'pg';
const { Pool } = pkg;

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

const db = drizzle(pool);

// Define tables (same as schema.js but for initialization)
const streams = pgTable('streams', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id', { length: 20 }).notNull(),
  serverId: varchar('server_id', { length: 20 }),
  itemName: text('item_name').notNull(),
  creatorName: text('creator_name').notNull(),
  creatorId: varchar('creator_id', { length: 20 }),
  agencyName: text('agency_name'),
  dueDate: timestamp('due_date').notNull(),
  status: varchar('status', { length: 20 }).default('active'),
  createdAt: timestamp('created_at').defaultNow(),
  completedAt: timestamp('completed_at'),
  notes: text('notes'),
  priority: varchar('priority', { length: 10 }).default('medium'),
  streamType: varchar('stream_type', { length: 20 }).default('showcase'),
});

const schedules = pgTable('schedules', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id', { length: 20 }).notNull(),
  serverId: varchar('server_id', { length: 20 }),
  weekStart: timestamp('week_start').notNull(),
  weekEnd: timestamp('week_end').notNull(),
  monday: json('monday'),
  tuesday: json('tuesday'),
  wednesday: json('wednesday'),
  thursday: json('thursday'),
  friday: json('friday'),
  saturday: json('saturday'),
  sunday: json('sunday'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

const captions = pgTable('captions', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id', { length: 20 }).notNull(),
  streamId: integer('stream_id').references(() => streams.id),
  platform: varchar('platform', { length: 10 }).notNull(),
  captionText: text('caption_text').notNull(),
  agencyFormat: text('agency_format'),
  tags: json('tags'),
  createdAt: timestamp('created_at').defaultNow(),
});

const reviews = pgTable('reviews', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id', { length: 20 }).notNull(),
  streamId: integer('stream_id').references(() => streams.id),
  itemName: text('item_name').notNull(),
  itemId: varchar('item_id', { length: 50 }),
  reviewText: text('review_text').notNull(),
  rating: integer('rating'),
  createdAt: timestamp('created_at').defaultNow(),
});

const userProfiles = pgTable('user_profiles', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id', { length: 20 }).primaryKey(),
  imvuName: text('imvu_name'),
  instagramHandle: text('instagram_handle'),
  preferredAgencies: json('preferred_agencies'),
  captionStyle: varchar('caption_style', { length: 20 }).default('elegant'),
  timezone: varchar('timezone', { length: 50 }).default('UTC'),
  reminderSettings: json('reminder_settings'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

const reminders = pgTable('reminders', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id', { length: 20 }).notNull(),
  serverId: varchar('server_id', { length: 20 }),
  streamId: integer('stream_id').references(() => streams.id),
  reminderType: varchar('reminder_type', { length: 20 }).notNull(),
  reminderText: text('reminder_text').notNull(),
  scheduledFor: timestamp('scheduled_for').notNull(),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

const agencyTemplates = pgTable('agency_templates', {
  id: serial('id').primaryKey(),
  agencyName: text('agency_name').notNull(),
  imvuCaptionFormat: text('imvu_caption_format').notNull(),
  instagramCaptionFormat: text('instagram_caption_format').notNull(),
  requiredTags: json('required_tags'),
  optionalTags: json('optional_tags'),
  requestFormat: text('request_format'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Initialize database
async function initializeDatabase() {
  try {
    console.log('◈ Initializing Aurelius database...');
    
    // Create tables
    await db.execute(`
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
    `);
    
    await db.execute(`
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
    `);
    
    await db.execute(`
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
    `);
    
    await db.execute(`
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
    `);
    
    await db.execute(`
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
    `);
    
    await db.execute(`
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
    `);
    
    await db.execute(`
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
    `);
    
    // Insert default agency templates
    await insertDefaultTemplates();
    
    console.log('◈ Database initialization complete!');
    
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

async function insertDefaultTemplates() {
  try {
    // Check if templates already exist
    const existingTemplates = await db.execute('SELECT COUNT(*) FROM agency_templates');
    
    if (existingTemplates.rows[0].count > 0) {
      console.log('◈ Agency templates already exist, skipping...');
      return;
    }
    
    // Insert default templates
    const defaultTemplates = [
      {
        agencyName: 'Ladies & Babes',
        imvuCaptionFormat: '✨ {item_name} ✨\n\nCreator: {creator_name}\nItem ID: {item_id}\nManufacturer ID: {manufacturer_id}\n\n#IMVU #Fashion #Modeling #LadiesAndBabes',
        instagramCaptionFormat: '✨ {item_name} ✨\n\nLoving this beautiful piece by @{creator_instagram}!\n\nItem ID: {item_id}\n\n#IMVU #Fashion #Modeling #VirtualFashion #LadiesAndBabes #@{creator_instagram}',
        requiredTags: ['#IMVU', '#Fashion', '#Modeling', '#LadiesAndBabes'],
        requestFormat: 'Hi! I would love to request {item_name} by {creator_name} for streaming!\n\nIMVU Link: {imvu_link}\nInstagram: @{instagram_handle}\n\nThank you for considering my request! 💕'
      },
      {
        agencyName: 'Default',
        imvuCaptionFormat: '✨ {item_name} ✨\n\nCreator: {creator_name}\nItem ID: {item_id}\nManufacturer ID: {manufacturer_id}\n\n#IMVU #Fashion #Modeling',
        instagramCaptionFormat: '✨ {item_name} ✨\n\nBeautiful piece by @{creator_instagram}!\n\nItem ID: {item_id}\n\n#IMVU #Fashion #Modeling #VirtualFashion',
        requiredTags: ['#IMVU', '#Fashion', '#Modeling'],
        requestFormat: 'Hi! I would love to request {item_name} by {creator_name} for streaming!\n\nIMVU Link: {imvu_link}\nInstagram: @{instagram_handle}\n\nThank you! 💕'
      }
    ];
    
    for (const template of defaultTemplates) {
      await db.execute(`
        INSERT INTO agency_templates (agency_name, imvu_caption_format, instagram_caption_format, required_tags, request_format)
        VALUES ($1, $2, $3, $4, $5)
      `, [
        template.agencyName,
        template.imvuCaptionFormat,
        template.instagramCaptionFormat,
        JSON.stringify(template.requiredTags),
        template.requestFormat
      ]);
    }
    
    console.log('◈ Default agency templates inserted successfully!');
    
  } catch (error) {
    console.error('Error inserting default templates:', error);
  }
}

// Run initialization if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  initializeDatabase()
    .then(() => {
      console.log('◈ Database setup complete!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('◈ Database setup failed:', error);
      process.exit(1);
    });
}

export { initializeDatabase };
