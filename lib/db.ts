import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

let db: any = null;

/**
 * Build-safe mock to prevent pre-rendering crashes
 */
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

export function getDb(): Database.Database {
  // 1. Build Phase Guard
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return mockDb as any;
  }

  if (!db) {
    // 2. Determine path. Always prefer an environment variable in production.
    // On Railway, 'school.db' in the root is fine for ephemeral testing, 
    // or /app/data/school.db if a volume is mounted.
    const dbPath = process.env.DATABASE_URL || 'school.db';

    try {
      console.log(`[DB] Initializing database: ${path.resolve(dbPath)}`);

      // Ensure directory exists if path is specified
      const dbDir = path.dirname(dbPath);
      if (dbDir !== '.' && !fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }

      db = new Database(dbPath, { timeout: 10000 });
      db.pragma('journal_mode = WAL');
      db.pragma('busy_timeout = 10000');

      initTables(db);
      console.log(`[DB] Database ready.`);
    } catch (error: any) {
      console.error(`[DB] Initialization error:`, error.message);
      // Recovery mode: In-memory store to keep the app booting
      db = new Database(':memory:');
      initTables(db);
      console.warn(`[DB] Fallback: Using in-memory database.`);
    }
  }
  return db;
}

function initTables(db: any) {
  db.exec(`
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

  const settingsCount = db.prepare("SELECT COUNT(*) as count FROM settings").get();
  if (settingsCount.count === 0) {
    db.prepare("INSERT INTO settings (id, school_name) VALUES (1, 'Mardan Youth''s Academy')").run();
  }
}
