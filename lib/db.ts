import path from 'path';
import fs from 'fs';

let db: any = null;

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

function initTables(database: any) {
  try {
    database.exec(`
      CREATE TABLE IF NOT EXISTS questions (id INTEGER PRIMARY KEY AUTOINCREMENT, subject TEXT NOT NULL, difficulty TEXT NOT NULL, class_level TEXT, question_text TEXT NOT NULL, options TEXT NOT NULL, correct_option INTEGER NOT NULL, image_path TEXT);
      CREATE TABLE IF NOT EXISTS students (id INTEGER PRIMARY KEY AUTOINCREMENT, access_code TEXT UNIQUE NOT NULL, name TEXT, father_name TEXT, class_level TEXT, status TEXT DEFAULT 'pending', score INTEGER, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);
      CREATE TABLE IF NOT EXISTS test_sessions (id INTEGER PRIMARY KEY AUTOINCREMENT, student_id INTEGER NOT NULL, question_ids TEXT NOT NULL, answers TEXT, start_time DATETIME, end_time DATETIME, FOREIGN KEY (student_id) REFERENCES students(id));
      CREATE TABLE IF NOT EXISTS admin_users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS settings (id INTEGER PRIMARY KEY CHECK (id = 1), school_name TEXT NOT NULL DEFAULT 'Mardan Youth''s Academy', easy_percent INTEGER NOT NULL DEFAULT 40, medium_percent INTEGER NOT NULL DEFAULT 40, hard_percent INTEGER NOT NULL DEFAULT 20, english_questions INTEGER NOT NULL DEFAULT 10, urdu_questions INTEGER NOT NULL DEFAULT 10, math_questions INTEGER NOT NULL DEFAULT 10);
    `);

    // Default Settings
    const count = database.prepare("SELECT COUNT(*) as count FROM settings").get();
    if (count.count === 0) {
      database.prepare("INSERT INTO settings (id, school_name) VALUES (1, 'Mardan Youth''s Academy')").run();
    }

    // Default Admin (admin/admin)
    const adminCount = database.prepare("SELECT COUNT(*) as count FROM admin_users").get();
    if (adminCount.count === 0) {
      const bcrypt = require('bcryptjs');
      const hash = bcrypt.hashSync('admin', 10);
      database.prepare("INSERT INTO admin_users (username, password_hash) VALUES (?, ?)").run('admin', hash);
      console.log('[DB] Default admin user created (admin/admin) ');
    }

    // Seed Questions if empty
    const questionCount = database.prepare("SELECT COUNT(*) as count FROM questions").get();
    if (questionCount.count === 0) {
      console.log('[DB] Seeding questions... this may take a moment');
      const { allSeedData } = require('./seedData');
      const insert = database.prepare('INSERT INTO questions (subject, difficulty, class_level, question_text, options, correct_option) VALUES (?, ?, ?, ?, ?, ?)');

      database.transaction(() => {
        for (const [key, questions] of Object.entries(allSeedData)) {
          // Determine subject and level from key if possible, or use defaults
          // Based on seedData naming: easyQuestions (Math), engEasy... urduEasy...
          let subject = 'Math';
          let difficulty = 'easy';
          let level = 'Grade 1';

          if (key.includes('eng')) subject = 'English';
          if (key.includes('urdu')) subject = 'Urdu';
          if (key.includes('Med')) difficulty = 'medium';
          if (key.includes('Hard')) difficulty = 'hard';
          if (key.includes('2')) level = 'Grade 2';
          if (key.includes('3')) level = 'Grade 3';
          if (key.includes('4')) level = 'Grade 4';
          if (key.includes('5')) level = 'Grade 5';
          if (key.includes('6')) level = 'Grade 6';
          if (key.includes('7')) level = 'Grade 7';
          if (key.includes('8')) level = 'Grade 8';

          for (const q of (questions as any[])) {
            insert.run(subject, difficulty, level, q.question_text, JSON.stringify(q.options), q.correct_option);
          }
        }
      })();
      console.log('[DB] Seeding completed');
    }
  } catch (err: any) {
    console.error('[DB] Passive Init Error:', err.message);
  }
}

export function getDb(): any {
  if (process.env.NEXT_PHASE === 'phase-production-build' || process.env.IS_BUILD === 'true') {
    return mockDb as any;
  }

  if (!db) {
    const dbPath = path.resolve(process.cwd(), process.env.DATABASE_URL || 'data/school.db');
    try {
      const dbDir = path.dirname(dbPath);
      if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });

      const Database = require('better-sqlite3');
      db = new Database(dbPath, { timeout: 10000 });
      db.pragma('journal_mode = WAL');
      db.pragma('busy_timeout = 10000');
      initTables(db);
    } catch (e: any) {
      console.error('[DB] Runtime failure prevented:', e.message);
      db = mockDb;
    }
  }
  return db;
}
