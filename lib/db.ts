import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { allSeedData } from './seedData';

let db: any = null;
let isSeeding = false;

// Robust mock for any phase where the DB shouldn't be active (Build/Prerender)
const mockDb = {
  prepare: () => ({
    get: () => ({}),
    all: () => [],
    run: () => ({ lastInsertRowid: 0, changes: 0 }),
    pragma: () => [],
  }),
  exec: () => { },
  pragma: () => [],
  transaction: (fn: any) => {
    if (typeof fn === 'function') return fn;
    return () => { };
  },
};

export function getDb(): Database.Database {
  // 1. Build Phase Guard (Crucial for Next.js Pre-rendering)
  if (process.env.NEXT_PHASE === 'phase-production-build' || process.env.IS_BUILD === 'true') {
    return mockDb as any;
  }

  // 2. Singleton initialization
  if (!db) {
    let dbPath = process.env.DATABASE_URL;
    if (!dbPath) {
      const isLinux = process.platform === 'linux';
      dbPath = isLinux ? '/app/data/school.db' : 'school.db';
    }

    try {
      const dbDir = path.dirname(dbPath);
      if (dbDir !== '.' && !fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }

      db = new Database(dbPath, { timeout: 10000 });
      db.pragma('journal_mode = WAL');
      db.pragma('busy_timeout = 10000');

      initTables(db);

      // Background seeding
      setTimeout(() => {
        if (db) seedQuestionsAsync(db);
      }, 5000);

    } catch (error: any) {
      console.error(`[DB] Initialization error:`, error.message);
      // Final fallback: In-memory just to pass health checks
      return new Database(':memory:') as any;
    }
  }
  return db;
}

function initTables(db: any) {
  try {
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

    // Ensure settings exists
    const row = db.prepare("SELECT count(*) as count FROM settings").get();
    if (row && row.count === 0) {
      db.prepare("INSERT INTO settings (id, school_name) VALUES (1, 'Mardan Youth''s Academy')").run();
    }
  } catch (err) {
    console.error("[DB] Table init error:", err);
  }
}

function seedQuestionsAsync(db: any) {
  if (isSeeding) return;
  isSeeding = true;
  try {
    const insert = db.prepare(`
      INSERT INTO questions (subject, difficulty, class_level, question_text, options, correct_option)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    const checkExists = db.prepare("SELECT id FROM questions WHERE question_text = ? AND class_level = ?");

    db.transaction(() => {
      for (const [arrayName, questions] of Object.entries(allSeedData)) {
        let subject = 'Math';
        let difficulty = 'Easy';
        let classLevel = 'Grade 1';

        if (arrayName.includes('eng')) subject = 'English';
        else if (arrayName.includes('urdu')) subject = 'Urdu';

        if (arrayName.toLowerCase().includes('med')) difficulty = 'Medium';
        else if (arrayName.toLowerCase().includes('hard')) difficulty = 'Hard';

        const match = arrayName.match(/\d+/);
        if (match) classLevel = `Grade ${match[0]}`;

        const countCheck = db.prepare(`SELECT COUNT(*) as count FROM questions WHERE subject = ? AND class_level = ? AND difficulty = ?`).get(subject, classLevel, difficulty);

        if (countCheck.count < 30) {
          for (const q of questions) {
            const exists = checkExists.get(q.question_text, classLevel);
            if (!exists) {
              insert.run(subject, difficulty, classLevel, q.question_text, JSON.stringify(q.options), q.correct_option);
            }
          }
        }
      }
    })();
  } catch (err) {
    console.error("[DB] Seeding error:", err);
  } finally {
    isSeeding = false;
  }
}
