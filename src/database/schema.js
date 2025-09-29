import { drizzle } from 'drizzle-orm/node-postgres';
import { pgTable, serial, text, timestamp, integer, boolean, json, varchar } from 'drizzle-orm/pg-core';
import { eq, and, desc, gte, lte } from 'drizzle-orm';
import pkg from 'pg';
const { Pool } = pkg;

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

export const db = drizzle(pool);

// Stream Management Tables
export const streams = pgTable('streams', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id', { length: 20 }).notNull(),
  serverId: varchar('server_id', { length: 20 }),
  itemName: text('item_name').notNull(),
  creatorName: text('creator_name').notNull(),
  creatorId: varchar('creator_id', { length: 20 }),
  agencyName: text('agency_name'),
  dueDate: timestamp('due_date').notNull(),
  status: varchar('status', { length: 20 }).default('active'), // active, completed, overdue
  createdAt: timestamp('created_at').defaultNow(),
  completedAt: timestamp('completed_at'),
  notes: text('notes'),
  priority: varchar('priority', { length: 10 }).default('medium'), // low, medium, high
  streamType: varchar('stream_type', { length: 20 }).default('showcase'), // showcase, sponsored, open
});

// Weekly Schedule Management
export const schedules = pgTable('schedules', {
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

// Caption Templates and Generated Captions
export const captions = pgTable('captions', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id', { length: 20 }).notNull(),
  streamId: integer('stream_id').references(() => streams.id),
  platform: varchar('platform', { length: 10 }).notNull(), // imvu, instagram
  captionText: text('caption_text').notNull(),
  agencyFormat: text('agency_format'),
  tags: json('tags'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Item Reviews
export const reviews = pgTable('reviews', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id', { length: 20 }).notNull(),
  streamId: integer('stream_id').references(() => streams.id),
  itemName: text('item_name').notNull(),
  itemId: varchar('item_id', { length: 50 }),
  reviewText: text('review_text').notNull(),
  rating: integer('rating'), // 1-5 stars
  createdAt: timestamp('created_at').defaultNow(),
});

// User Profiles and Preferences
export const userProfiles = pgTable('user_profiles', {
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

// Reminders and Notifications
export const reminders = pgTable('reminders', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id', { length: 20 }).notNull(),
  serverId: varchar('server_id', { length: 20 }),
  streamId: integer('stream_id').references(() => streams.id),
  reminderType: varchar('reminder_type', { length: 20 }).notNull(), // due_date, custom, weekly
  reminderText: text('reminder_text').notNull(),
  scheduledFor: timestamp('scheduled_for').notNull(),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

// Agency Templates and Formats
export const agencyTemplates = pgTable('agency_templates', {
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

// Database helper functions
export const dbHelpers = {
  // Stream helpers
  async createStream(data) {
    return await db.insert(streams).values(data).returning();
  },
  
  async getActiveStreams(userId, serverId = null) {
    const whereCondition = serverId 
      ? and(eq(streams.userId, userId), eq(streams.serverId, serverId), eq(streams.status, 'active'))
      : and(eq(streams.userId, userId), eq(streams.status, 'active'));
    
    return await db.select().from(streams).where(whereCondition).orderBy(desc(streams.createdAt));
  },
  
  async completeStream(streamId) {
    return await db.update(streams)
      .set({ status: 'completed', completedAt: new Date() })
      .where(eq(streams.id, streamId))
      .returning();
  },
  
  async getOverdueStreams() {
    return await db.select().from(streams)
      .where(and(eq(streams.status, 'active'), lte(streams.dueDate, new Date())));
  },
  
  // Schedule helpers
  async createSchedule(data) {
    return await db.insert(schedules).values(data).returning();
  },
  
  async getCurrentWeekSchedule(userId, weekStart) {
    return await db.select().from(schedules)
      .where(and(eq(schedules.userId, userId), eq(schedules.weekStart, weekStart)))
      .limit(1);
  },
  
  // Caption helpers
  async saveCaption(data) {
    return await db.insert(captions).values(data).returning();
  },
  
  async getCaptionsByStream(streamId) {
    return await db.select().from(captions).where(eq(captions.streamId, streamId));
  },
  
  // Review helpers
  async saveReview(data) {
    return await db.insert(reviews).values(data).returning();
  },
  
  async getReviewsByStream(streamId) {
    return await db.select().from(reviews).where(eq(reviews.streamId, streamId));
  },
  
  // User profile helpers
  async createOrUpdateProfile(data) {
    return await db.insert(userProfiles).values(data)
      .onConflictDoUpdate({
        target: userProfiles.userId,
        set: { ...data, updatedAt: new Date() }
      })
      .returning();
  },
  
  async getUserProfile(userId) {
    return await db.select().from(userProfiles).where(eq(userProfiles.userId, userId)).limit(1);
  },
  
  // Reminder helpers
  async createReminder(data) {
    return await db.insert(reminders).values(data).returning();
  },
  
  async getActiveReminders() {
    return await db.select().from(reminders)
      .where(and(eq(reminders.isActive, true), lte(reminders.scheduledFor, new Date())));
  },
  
  // Agency template helpers
  async getAgencyTemplate(agencyName) {
    return await db.select().from(agencyTemplates)
      .where(and(eq(agencyTemplates.agencyName, agencyName), eq(agencyTemplates.isActive, true)))
      .limit(1);
  },
  
  async getAllAgencyTemplates() {
    return await db.select().from(agencyTemplates).where(eq(agencyTemplates.isActive, true));
  }
};

export default db;
