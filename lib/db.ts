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
      CREATE TABLE IF NOT EXISTS students (id INTEGER PRIMARY KEY AUTOINCREMENT, access_code TEXT UNIQUE NOT NULL, name TEXT, father_name TEXT, father_mobile TEXT, class_level TEXT, status TEXT DEFAULT 'pending', score INTEGER, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);
      CREATE TABLE IF NOT EXISTS test_sessions (id INTEGER PRIMARY KEY AUTOINCREMENT, student_id INTEGER NOT NULL, question_ids TEXT NOT NULL, answers TEXT, start_time DATETIME, end_time DATETIME, FOREIGN KEY (student_id) REFERENCES students(id));
      CREATE TABLE IF NOT EXISTS admin_users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL, role TEXT NOT NULL DEFAULT 'admin');
      CREATE TABLE IF NOT EXISTS settings (id INTEGER PRIMARY KEY CHECK (id = 1), school_name TEXT NOT NULL DEFAULT 'Mardan Youth''s Academy', easy_percent INTEGER NOT NULL DEFAULT 40, medium_percent INTEGER NOT NULL DEFAULT 40, hard_percent INTEGER NOT NULL DEFAULT 20, english_questions INTEGER NOT NULL DEFAULT 10, urdu_questions INTEGER NOT NULL DEFAULT 10, math_questions INTEGER NOT NULL DEFAULT 10);
    `);

    // Handle migrations for existing databases
    const studentCols = database.pragma('table_info(students)');
    if (!studentCols.find((c: any) => c.name === 'father_mobile')) {
      database.exec('ALTER TABLE students ADD COLUMN father_mobile TEXT');
    }

    const adminCols = database.pragma('table_info(admin_users)');
    if (!adminCols.find((c: any) => c.name === 'role')) {
      database.exec("ALTER TABLE admin_users ADD COLUMN role TEXT NOT NULL DEFAULT 'admin'");
    }

    // Default Settings
    const count = database.prepare("SELECT COUNT(*) as count FROM settings").get();
    if (count.count === 0) {
      database.prepare("INSERT INTO settings (id, school_name) VALUES (1, 'Mardan Youth''s Academy')").run();
    }

    // Default users (admin, exam, staff)
    const adminCount = database.prepare("SELECT COUNT(*) as count FROM admin_users").get();
    if (adminCount.count === 0 || adminCount.count === 1) { // If only old admin exists or none
      const bcrypt = require('bcryptjs');
      const hash = bcrypt.hashSync('admin', 10);

      if (adminCount.count === 0) {
        database.prepare("INSERT INTO admin_users (username, password_hash, role) VALUES (?, ?, ?)").run('admin', hash, 'admin');
        console.log('[DB] Default admin user created (admin/admin)');
      }

      // Create other roles if they don't exist
      const examUser = database.prepare("SELECT * FROM admin_users WHERE username = ?").get('exam');
      if (!examUser) {
        database.prepare("INSERT INTO admin_users (username, password_hash, role) VALUES (?, ?, ?)").run('exam', hash, 'exam_coordinator');
        console.log('[DB] Default exam user created (exam/admin)');
      }

      const staffUser = database.prepare("SELECT * FROM admin_users WHERE username = ?").get('staff');
      if (!staffUser) {
        database.prepare("INSERT INTO admin_users (username, password_hash, role) VALUES (?, ?, ?)").run('staff', hash, 'staff');
        console.log('[DB] Default staff user created (staff/admin)');
      }
    }

    // V1 Migration: Shift classes and capitalize difficulty
    const currentVersion = database.pragma('user_version', { simple: true });
    if (currentVersion === 0) {
      console.log('[DB] Running V1 Migration: Shifting Class Levels and Capitalizing Difficulty...');
      try {
        database.transaction(() => {
          database.exec(`
            UPDATE questions SET difficulty = 'Easy' WHERE difficulty IN ('easy', 'EASY');
            UPDATE questions SET difficulty = 'Medium' WHERE difficulty IN ('medium', 'MEDIUM');
            UPDATE questions SET difficulty = 'Hard' WHERE difficulty IN ('hard', 'HARD');

            DELETE FROM questions WHERE class_level = 'Grade 10';
            UPDATE questions SET class_level = 'Grade 10' WHERE class_level = 'Grade 9';
            UPDATE questions SET class_level = 'Grade 9' WHERE class_level = 'Grade 8';
            UPDATE questions SET class_level = 'Grade 8' WHERE class_level = 'Grade 7';
            UPDATE questions SET class_level = 'Grade 7' WHERE class_level = 'Grade 6';
            UPDATE questions SET class_level = 'Grade 6' WHERE class_level = 'Grade 5';
            UPDATE questions SET class_level = 'Grade 5' WHERE class_level = 'Grade 4';
            UPDATE questions SET class_level = 'Grade 4' WHERE class_level = 'Grade 3';
            UPDATE questions SET class_level = 'Grade 3' WHERE class_level = 'Grade 2';
            UPDATE questions SET class_level = 'Grade 2' WHERE class_level = 'Grade 1';
            UPDATE questions SET class_level = 'Grade 1' WHERE class_level = 'KG 2';
            UPDATE questions SET class_level = 'KG 2' WHERE class_level = 'KG 1';
          `);
        })();
        database.pragma('user_version = 1');
        console.log('[DB] V1 Migration complete');
      } catch (err: any) {
        console.error('[DB] V1 Migration failed:', err.message);
      }
    }

    // Seed Questions incrementally
    const { allSeedData } = require('./seedData');
    const insert = database.prepare('INSERT INTO questions (subject, difficulty, class_level, question_text, options, correct_option) VALUES (?, ?, ?, ?, ?, ?)');
    const checkExists = database.prepare('SELECT COUNT(*) as count FROM questions WHERE subject = ? AND difficulty = ? AND class_level = ?');

    database.transaction(() => {
      for (const [key, questions] of Object.entries(allSeedData)) {
        if (key.startsWith('del_')) continue; // Skip dropped sets

        let subject = 'Math';
        let difficulty = 'Easy';
        let level = 'Grade 1';

        if (key.includes('eng')) subject = 'English';
        if (key.includes('urdu')) subject = 'Urdu';
        if (key.includes('Med')) difficulty = 'Medium';
        if (key.includes('Hard')) difficulty = 'Hard';

        if (key.includes('KG1')) level = 'KG 1';
        else if (key.includes('KG2')) level = 'KG 2';
        else if (key.includes('10')) level = 'Grade 10';
        else if (key.includes('9')) level = 'Grade 9';
        else if (key.includes('8')) level = 'Grade 8';
        else if (key.includes('7')) level = 'Grade 7';
        else if (key.includes('6')) level = 'Grade 6';
        else if (key.includes('5')) level = 'Grade 5';
        else if (key.includes('4')) level = 'Grade 4';
        else if (key.includes('3')) level = 'Grade 3';
        else if (key.includes('2')) level = 'Grade 2';

        const existing = checkExists.get(subject, difficulty, level);
        if (existing.count === 0) {
          console.log(`[DB] Seeding new category: ${subject} ${level} ${difficulty}`);
          for (const q of (questions as any[])) {
            insert.run(subject, difficulty, level, q.question_text, JSON.stringify(q.options), q.correct_option);
          }
        }
      }
    })();
    console.log('[DB] Seeding check completed');
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
