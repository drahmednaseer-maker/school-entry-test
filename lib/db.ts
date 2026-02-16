import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

let db: any = null;
// Force Restart: 2026-02-16T18:59:00Z
let initialized = false;

// Build-safe mock
const mockDb = {
  prepare: () => ({
    get: () => ({}),
    all: () => [],
    run: () => ({ lastInsertRowid: 0, changes: 0 }),
    pragma: () => [],
  }),
  exec: () => { },
  pragma: () => [],
  transaction: (fn: any) => fn,
};

/**
 * Initializes tables only when needed.
 * This is separate from connection to prevent startup hangs.
 */
function ensureInitialized(database: any) {
  if (initialized) return;

  try {
    database.exec(`
      CREATE TABLE IF NOT EXISTS questions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        subject TEXT NOT NULL,
        difficulty TEXT NOT NULL,
        class_level TEXT,
        question_text TEXT NOT NULL,
        options TEXT NOT NULL,
        correct_option INTEGER NOT NULL,
        image_path TEXT
      );
      CREATE TABLE IF NOT EXISTS students (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        access_code TEXT UNIQUE NOT NULL,
        name TEXT,
        father_name TEXT,
        class_level TEXT,
        status TEXT DEFAULT 'pending',
        score INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS test_sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL,
        question_ids TEXT NOT NULL,
        answers TEXT,
        start_time DATETIME,
        end_time DATETIME,
        FOREIGN KEY (student_id) REFERENCES students(id)
      );
      CREATE TABLE IF NOT EXISTS admin_users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS settings (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        school_name TEXT NOT NULL DEFAULT 'Mardan Youth''s Academy',
        easy_percent INTEGER NOT NULL DEFAULT 40,
        medium_percent INTEGER NOT NULL DEFAULT 40,
        hard_percent INTEGER NOT NULL DEFAULT 20,
        english_questions INTEGER NOT NULL DEFAULT 10,
        urdu_questions INTEGER NOT NULL DEFAULT 10,
        math_questions INTEGER NOT NULL DEFAULT 10
      );
    `);

    const settingsCount = database.prepare("SELECT COUNT(*) as count FROM settings").get();
    if (settingsCount.count === 0) {
      database.prepare("INSERT INTO settings (id, school_name) VALUES (1, 'Mardan Youth''s Academy')").run();
    }
    initialized = true;
    console.log('[DB] Optimization: Tables verified.');
  } catch (err: any) {
    console.error('[DB] Initialization error:', err.message);
  }
}

export function getDb(): Database.Database {
  // 1. Build Phase Guard
  if (process.env.NEXT_PHASE === 'phase-production-build' || process.env.IS_BUILD === 'true') {
    return mockDb as any;
  }

  if (!db) {
    // 2. Determine path
    let dbPath = process.env.DATABASE_URL || 'school.db';

    try {
      console.log(`[DB] Connecting to: ${dbPath}`);

      const dbDir = path.dirname(dbPath);
      if (dbDir !== '.' && !fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }

      db = new Database(dbPath, { timeout: 10000 });
      db.pragma('journal_mode = WAL');
      db.pragma('busy_timeout = 10000');

      // We don't initialize tables here anymore to keep the connection instant.
      // Table creation happens on first use in ensureInitialized().
      console.log(`[DB] Connected successfully.`);
    } catch (error: any) {
      console.error(`[DB] Connection failed:`, error.message);
      db = new Database(':memory:');
      console.warn(`[DB] Fallback: Using in-memory store.`);
    }
  }

  // Ensure tables exist before returning (Lazy Initialization)
  if (db && db.name !== ':memory:') {
    ensureInitialized(db);
  }

  return db;
}
