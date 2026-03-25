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
      CREATE TABLE IF NOT EXISTS settings (id INTEGER PRIMARY KEY CHECK (id = 1), school_name TEXT NOT NULL DEFAULT 'Mardan Youth''s Academy', easy_percent INTEGER NOT NULL DEFAULT 40, medium_percent INTEGER NOT NULL DEFAULT 40, hard_percent INTEGER NOT NULL DEFAULT 20, english_questions INTEGER NOT NULL DEFAULT 10, urdu_questions INTEGER NOT NULL DEFAULT 10, math_questions INTEGER NOT NULL DEFAULT 10, master_password TEXT NOT NULL DEFAULT '1234', groq_api_key TEXT, gemini_api_key TEXT, active_ai_provider TEXT DEFAULT 'groq', gemini_model TEXT DEFAULT 'gemini-1.5-flash');
      CREATE TABLE IF NOT EXISTS sessions (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL UNIQUE, is_active INTEGER NOT NULL DEFAULT 0, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);
      CREATE TABLE IF NOT EXISTS slcs (id INTEGER PRIMARY KEY AUTOINCREMENT, session_id INTEGER, name TEXT NOT NULL, father_name TEXT, class_level TEXT, section TEXT, gender TEXT, date_issued DATE, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);
    `);

    // Handle migrations for existing databases
    const settingCols = database.pragma('table_info(settings)');
    if (!settingCols.find((c: any) => c.name === 'master_password')) {
      database.exec("ALTER TABLE settings ADD COLUMN master_password TEXT NOT NULL DEFAULT '1234'");
    }
    if (!settingCols.find((c: any) => c.name === 'groq_api_key')) {
      database.exec("ALTER TABLE settings ADD COLUMN groq_api_key TEXT");
    }
    if (!settingCols.find((c: any) => c.name === 'gemini_api_key')) {
      database.exec("ALTER TABLE settings ADD COLUMN gemini_api_key TEXT");
    }
    if (!settingCols.find((c: any) => c.name === 'active_ai_provider')) {
      database.exec("ALTER TABLE settings ADD COLUMN active_ai_provider TEXT DEFAULT 'groq'");
    }
    if (!settingCols.find((c: any) => c.name === 'gemini_model')) {
      database.exec("ALTER TABLE settings ADD COLUMN gemini_model TEXT DEFAULT 'gemini-1.5-flash'");
    }

    const studentCols = database.pragma('table_info(students)');
    if (!studentCols.find((c: any) => c.name === 'father_mobile')) {
      database.exec('ALTER TABLE students ADD COLUMN father_mobile TEXT');
    }
    if (!studentCols.find((c: any) => c.name === 'photo')) {
      database.exec('ALTER TABLE students ADD COLUMN photo TEXT');
    }
    if (!studentCols.find((c: any) => c.name === 'gender')) {
      database.exec('ALTER TABLE students ADD COLUMN gender TEXT');
    }
    if (!studentCols.find((c: any) => c.name === 'admission_status')) {
      database.exec('ALTER TABLE students ADD COLUMN admission_status TEXT');
    }
    if (!studentCols.find((c: any) => c.name === 'admitted_class')) {
      database.exec('ALTER TABLE students ADD COLUMN admitted_class TEXT');
    }
    if (!studentCols.find((c: any) => c.name === 'session_id')) {
      database.exec('ALTER TABLE students ADD COLUMN session_id INTEGER');
    }
    if (!studentCols.find((c: any) => c.name === 'is_registered')) {
      database.exec('ALTER TABLE students ADD COLUMN is_registered INTEGER NOT NULL DEFAULT 0');
    }
    // Admission form extended fields
    const admissionFields: [string, string][] = [
      ['dob', 'TEXT'],
      ['guardian_name', 'TEXT'],
      ['father_cnic', 'TEXT'],
      ['previous_school', 'TEXT'],
      ['previous_class', 'TEXT'],
      ['slc_no', 'TEXT'],
      ['slc_date', 'TEXT'],
      ['reason_for_leaving', 'TEXT'],
      ['admission_class', 'TEXT'],
      ['occupation', 'TEXT'],
      ['country', "TEXT DEFAULT 'Pakistan'"],
      ['province', 'TEXT'],
      ['district', 'TEXT'],
      ['tehsil', 'TEXT'],
      ['city', 'TEXT'],
      ['street_address', 'TEXT'],
      ['contact1_name', 'TEXT'],
      ['contact1_phone', 'TEXT'],
      ['contact1_whatsapp', 'INTEGER DEFAULT 0'],
      ['contact2_name', 'TEXT'],
      ['contact2_phone', 'TEXT'],
      ['contact3_name', 'TEXT'],
      ['contact3_phone', 'TEXT'],
      ['reg_no', 'TEXT'],
      ['date_of_test', 'TEXT'],
      ['date_of_admission', 'TEXT'],
    ];
    for (const [col, type] of admissionFields) {
      if (!studentCols.find((c: any) => c.name === col)) {
        database.exec(`ALTER TABLE students ADD COLUMN ${col} ${type}`);
      }
    }

    // Ensure sessions and slcs tables exist (for older DBs that didn't get them in CREATE TABLE block)
    database.exec(`CREATE TABLE IF NOT EXISTS sessions (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL UNIQUE, is_active INTEGER NOT NULL DEFAULT 0, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);`);
    database.exec(`CREATE TABLE IF NOT EXISTS slcs (id INTEGER PRIMARY KEY AUTOINCREMENT, session_id INTEGER, name TEXT NOT NULL, father_name TEXT, class_level TEXT, section TEXT, gender TEXT, date_issued DATE, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);`);

    // Ensure session_id exists in slcs (migration for the very first SLC version)
    const slcCols = database.prepare("PRAGMA table_info(slcs)").all();
    if (!slcCols.find((c: any) => c.name === 'session_id')) {
      database.exec('ALTER TABLE slcs ADD COLUMN session_id INTEGER');
    }

    database.exec(`
      CREATE TABLE IF NOT EXISTS session_seats (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          session_id INTEGER NOT NULL,
          class_level TEXT NOT NULL,
          total_seats INTEGER NOT NULL DEFAULT 0,
          male_seats INTEGER NOT NULL DEFAULT 0,
          female_seats INTEGER NOT NULL DEFAULT 0,
          UNIQUE(session_id, class_level)
      );
    `);

    try {
        database.exec('ALTER TABLE session_seats ADD COLUMN male_seats INTEGER NOT NULL DEFAULT 0;');
        database.exec('ALTER TABLE session_seats ADD COLUMN female_seats INTEGER NOT NULL DEFAULT 0;');
    } catch (e) {
        // Columns already exist
    }

    // Seed default active session 2026-2027 if none exist
    const sessionCount = database.prepare('SELECT COUNT(*) as c FROM sessions').get() as any;
    if (sessionCount.c === 0) {
      database.prepare("INSERT INTO sessions (name, is_active) VALUES ('2026-2027', 1)").run();
      console.log('[DB] Default session 2026-2027 created and set active');
    }

    // Migrate existing students with no session_id to the active session
    const activeSession = database.prepare('SELECT id FROM sessions WHERE is_active = 1 LIMIT 1').get() as any;
    if (activeSession) {
      database.prepare('UPDATE students SET session_id = ? WHERE session_id IS NULL').run(activeSession.id);
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

    // Ensure qbank user exists
    const qbankUser = database.prepare("SELECT * FROM admin_users WHERE username = ?").get('qbank');
    if (!qbankUser) {
      const bcrypt = require('bcryptjs');
      const qbankHash = bcrypt.hashSync('admin123', 10);
      database.prepare("INSERT INTO admin_users (username, password_hash, role) VALUES (?, ?, ?)").run('qbank', qbankHash, 'qbank');
      console.log('[DB] Default qbank user created (qbank/admin123)');
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
