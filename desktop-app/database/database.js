const Database = require('better-sqlite3');
const path = require('path');
const { app } = require('electron');

class DatabaseManager {
  constructor() {
    // Get user data directory
    const userDataPath = app.getPath('userData');
    const dbPath = path.join(userDataPath, 'aurelius.db');
    
    // Initialize database
    this.db = new Database(dbPath);
    this.init();
  }

  init() {
    // Create tables
    this.createTables();
  }

  createTables() {
    // Streams table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS streams (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        item_name TEXT NOT NULL,
        creator_name TEXT NOT NULL,
        creator_id TEXT,
        agency_name TEXT,
        due_date TEXT NOT NULL,
        status TEXT DEFAULT 'active',
        priority TEXT DEFAULT 'medium',
        stream_type TEXT DEFAULT 'showcase',
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        completed_at DATETIME,
        user_id TEXT DEFAULT 'local'
      )
    `);

    // Schedules table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS schedules (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        week_start TEXT NOT NULL,
        week_end TEXT NOT NULL,
        monday TEXT,
        tuesday TEXT,
        wednesday TEXT,
        thursday TEXT,
        friday TEXT,
        saturday TEXT,
        sunday TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        user_id TEXT DEFAULT 'local'
      )
    `);

    // Captions table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS captions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        stream_id INTEGER,
        platform TEXT NOT NULL,
        caption_text TEXT NOT NULL,
        agency_format TEXT,
        tags TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        user_id TEXT DEFAULT 'local',
        FOREIGN KEY (stream_id) REFERENCES streams (id)
      )
    `);

    // Reviews table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS reviews (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        stream_id INTEGER,
        item_name TEXT NOT NULL,
        item_id TEXT,
        review_text TEXT NOT NULL,
        rating INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        user_id TEXT DEFAULT 'local',
        FOREIGN KEY (stream_id) REFERENCES streams (id)
      )
    `);

    // User profiles table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS user_profiles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        imvu_name TEXT,
        instagram_handle TEXT,
        preferred_agencies TEXT,
        caption_style TEXT DEFAULT 'elegant',
        timezone TEXT DEFAULT 'UTC',
        reminder_settings TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        user_id TEXT DEFAULT 'local'
      )
    `);

    // Agency templates table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS agency_templates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        agency_name TEXT NOT NULL,
        imvu_caption_format TEXT NOT NULL,
        instagram_caption_format TEXT NOT NULL,
        required_tags TEXT,
        optional_tags TEXT,
        request_format TEXT,
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Insert default templates
    this.insertDefaultTemplates();
  }

  insertDefaultTemplates() {
    const checkTemplate = this.db.prepare('SELECT COUNT(*) as count FROM agency_templates');
    const result = checkTemplate.get();
    
    if (result.count > 0) {
      return; // Templates already exist
    }

    const insertTemplate = this.db.prepare(`
      INSERT INTO agency_templates (
        agency_name, imvu_caption_format, instagram_caption_format, 
        required_tags, request_format
      ) VALUES (?, ?, ?, ?, ?)
    `);

    const defaultTemplates = [
      [
        'Ladies & Babes',
        '✨ {item_name} ✨\n\nCreator: {creator_name}\nItem ID: {item_id}\nManufacturer ID: {manufacturer_id}\n\n#IMVU #Fashion #Modeling #LadiesAndBabes',
        '✨ {item_name} ✨\n\nLoving this beautiful piece by @{creator_instagram}!\n\nItem ID: {item_id}\n\n#IMVU #Fashion #Modeling #VirtualFashion #LadiesAndBabes #@{creator_instagram}',
        JSON.stringify(['#IMVU', '#Fashion', '#Modeling', '#LadiesAndBabes']),
        'Hi! I would love to request {item_name} by {creator_name} for streaming!\n\nIMVU Link: {imvu_link}\nInstagram: @{instagram_handle}\n\nThank you for considering my request! 💕'
      ],
      [
        'Default',
        '✨ {item_name} ✨\n\nCreator: {creator_name}\nItem ID: {item_id}\nManufacturer ID: {manufacturer_id}\n\n#IMVU #Fashion #Modeling',
        '✨ {item_name} ✨\n\nBeautiful piece by @{creator_instagram}!\n\nItem ID: {item_id}\n\n#IMVU #Fashion #Modeling #VirtualFashion',
        JSON.stringify(['#IMVU', '#Fashion', '#Modeling']),
        'Hi! I would love to request {item_name} by {creator_name} for streaming!\n\nIMVU Link: {imvu_link}\nInstagram: @{instagram_handle}\n\nThank you! 💕'
      ]
    ];

    const insertMany = this.db.transaction((templates) => {
      for (const template of templates) {
        insertTemplate.run(...template);
      }
    });

    insertMany(defaultTemplates);
  }

  // Stream operations
  getStreams() {
    const stmt = this.db.prepare('SELECT * FROM streams ORDER BY created_at DESC');
    return stmt.all();
  }

  getStream(id) {
    const stmt = this.db.prepare('SELECT * FROM streams WHERE id = ?');
    return stmt.get(id);
  }

  createStream(streamData) {
    const stmt = this.db.prepare(`
      INSERT INTO streams (
        item_name, creator_name, creator_id, agency_name, due_date,
        status, priority, stream_type, notes, user_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      streamData.item_name,
      streamData.creator_name,
      streamData.creator_id || null,
      streamData.agency_name || null,
      streamData.due_date,
      streamData.status || 'active',
      streamData.priority || 'medium',
      streamData.stream_type || 'showcase',
      streamData.notes || null,
      streamData.user_id || 'local'
    );
    
    return { id: result.lastInsertRowid, ...streamData };
  }

  updateStream(id, updates) {
    const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updates);
    values.push(id);
    
    const stmt = this.db.prepare(`UPDATE streams SET ${fields} WHERE id = ?`);
    const result = stmt.run(...values);
    
    return result.changes > 0;
  }

  deleteStream(id) {
    const stmt = this.db.prepare('DELETE FROM streams WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  completeStream(id) {
    const stmt = this.db.prepare(`
      UPDATE streams 
      SET status = 'completed', completed_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `);
    const result = stmt.run(id);
    return result.changes > 0;
  }

  // Schedule operations
  getSchedules() {
    const stmt = this.db.prepare('SELECT * FROM schedules ORDER BY week_start DESC');
    return stmt.all();
  }

  createSchedule(scheduleData) {
    const stmt = this.db.prepare(`
      INSERT INTO schedules (
        week_start, week_end, monday, tuesday, wednesday, thursday,
        friday, saturday, sunday, user_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      scheduleData.week_start,
      scheduleData.week_end,
      scheduleData.monday ? JSON.stringify(scheduleData.monday) : null,
      scheduleData.tuesday ? JSON.stringify(scheduleData.tuesday) : null,
      scheduleData.wednesday ? JSON.stringify(scheduleData.wednesday) : null,
      scheduleData.thursday ? JSON.stringify(scheduleData.thursday) : null,
      scheduleData.friday ? JSON.stringify(scheduleData.friday) : null,
      scheduleData.saturday ? JSON.stringify(scheduleData.saturday) : null,
      scheduleData.sunday ? JSON.stringify(scheduleData.sunday) : null,
      scheduleData.user_id || 'local'
    );
    
    return { id: result.lastInsertRowid, ...scheduleData };
  }

  // Caption operations
  getCaptions(streamId = null) {
    let stmt;
    if (streamId) {
      stmt = this.db.prepare('SELECT * FROM captions WHERE stream_id = ? ORDER BY created_at DESC');
      return stmt.all(streamId);
    } else {
      stmt = this.db.prepare('SELECT * FROM captions ORDER BY created_at DESC');
      return stmt.all();
    }
  }

  createCaption(captionData) {
    const stmt = this.db.prepare(`
      INSERT INTO captions (
        stream_id, platform, caption_text, agency_format, tags, user_id
      ) VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      captionData.stream_id || null,
      captionData.platform,
      captionData.caption_text,
      captionData.agency_format || null,
      captionData.tags ? JSON.stringify(captionData.tags) : null,
      captionData.user_id || 'local'
    );
    
    return { id: result.lastInsertRowid, ...captionData };
  }

  // Review operations
  getReviews(streamId = null) {
    let stmt;
    if (streamId) {
      stmt = this.db.prepare('SELECT * FROM reviews WHERE stream_id = ? ORDER BY created_at DESC');
      return stmt.all(streamId);
    } else {
      stmt = this.db.prepare('SELECT * FROM reviews ORDER BY created_at DESC');
      return stmt.all();
    }
  }

  createReview(reviewData) {
    const stmt = this.db.prepare(`
      INSERT INTO reviews (
        stream_id, item_name, item_id, review_text, rating, user_id
      ) VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      reviewData.stream_id || null,
      reviewData.item_name,
      reviewData.item_id || null,
      reviewData.review_text,
      reviewData.rating || null,
      reviewData.user_id || 'local'
    );
    
    return { id: result.lastInsertRowid, ...reviewData };
  }

  // Agency template operations
  getAgencyTemplates() {
    const stmt = this.db.prepare('SELECT * FROM agency_templates WHERE is_active = 1 ORDER BY agency_name');
    return stmt.all();
  }

  getAgencyTemplate(agencyName) {
    const stmt = this.db.prepare('SELECT * FROM agency_templates WHERE agency_name = ? AND is_active = 1');
    return stmt.get(agencyName);
  }

  // Data import/export
  importStreams(streams) {
    const insertStmt = this.db.prepare(`
      INSERT INTO streams (
        item_name, creator_name, creator_id, agency_name, due_date,
        status, priority, stream_type, notes, created_at, completed_at, user_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertMany = this.db.transaction((streams) => {
      for (const stream of streams) {
        insertStmt.run(
          stream.item_name,
          stream.creator_name,
          stream.creator_id || null,
          stream.agency_name || null,
          stream.due_date,
          stream.status || 'active',
          stream.priority || 'medium',
          stream.stream_type || 'showcase',
          stream.notes || null,
          stream.created_at || new Date().toISOString(),
          stream.completed_at || null,
          stream.user_id || 'local'
        );
      }
    });

    insertMany(streams);
  }

  // Statistics
  getStats() {
    const activeStmt = this.db.prepare('SELECT COUNT(*) as count FROM streams WHERE status = "active"');
    const completedStmt = this.db.prepare('SELECT COUNT(*) as count FROM streams WHERE status = "completed"');
    const overdueStmt = this.db.prepare('SELECT COUNT(*) as count FROM streams WHERE status = "overdue"');
    
    const now = new Date();
    const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
    const thisWeekStmt = this.db.prepare('SELECT COUNT(*) as count FROM streams WHERE created_at >= ?');
    
    return {
      activeStreams: activeStmt.get().count,
      completedStreams: completedStmt.get().count,
      overdueStreams: overdueStmt.get().count,
      thisWeekStreams: thisWeekStmt.get(weekStart.toISOString()).count
    };
  }

  // Close database
  close() {
    this.db.close();
  }
}

module.exports = DatabaseManager;
