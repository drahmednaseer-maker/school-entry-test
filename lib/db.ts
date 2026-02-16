import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { allSeedData } from './seedData';

let db: Database.Database | undefined;
let isSeeding = false;

export function getDb() {
  // During build phase, NEVER attempt to initialize a real DB if it might block/fail
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return {} as any;
  }

  if (!db) {
    let dbPath = process.env.DATABASE_URL;
    if (!dbPath) {
      const isLinux = process.platform === 'linux';
      dbPath = isLinux ? '/app/data/school.db' : 'school.db';
    }
    console.log(`[DB] Start initialization: ${dbPath}`);

    try {
      const dbDir = path.dirname(dbPath);
      if (dbDir !== '.' && !fs.existsSync(dbDir)) {
        console.log(`[DB] Creating directory: ${dbDir}`);
        fs.mkdirSync(dbDir, { recursive: true });
      }

      console.log(`[DB] Opening better-sqlite3 connection...`);
      db = new Database(dbPath, { timeout: 10000 }); // Explicit connection timeout
      db.pragma('journal_mode = WAL');
      db.pragma('busy_timeout = 10000');

      console.log(`[DB] Initializing tables...`);
      initTables(db);

      console.log(`[DB] Fast startup phase complete.`);

      // Defer seeding significantly
      setTimeout(() => {
        if (db) {
          console.log("[DB] Starting deferred background seeding...");
          seedQuestionsAsync(db);
        }
      }, 10000);

    } catch (error: any) {
      console.error(`[DB] CONNECTION ERROR:`, error.message);
      // Fallback to in-memory if disk is blocked, just to keep the process alive for health checks
      if (!process.env.DATABASE_URL) {
        console.warn("[DB] Disk access failed. Falling back to in-memory for recovery.");
        db = new Database(':memory:');
        initTables(db);
      } else {
        throw error;
      }
    }
  }
  return db;
}

function initTables(db: Database.Database) {
  try {
    db.transaction(() => {
      // Basic table creation is very fast
      db.exec(`
        CREATE TABLE IF NOT EXISTS questions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          subject TEXT CHECK(subject IN ('English', 'Urdu', 'Math')) NOT NULL,
          difficulty TEXT CHECK(difficulty IN ('Easy', 'Medium', 'Hard')) NOT NULL,
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
          status TEXT CHECK(status IN ('pending', 'started', 'completed')) DEFAULT 'pending',
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

      const settingsCount = db.prepare("SELECT COUNT(*) as count FROM settings").get() as { count: number };
      if (settingsCount.count === 0) {
        db.prepare("INSERT INTO settings (id, school_name) VALUES (1, 'Mardan Youth''s Academy')").run();
      }

      db.exec(`
        CREATE INDEX IF NOT EXISTS idx_questions_lookup ON questions (subject, class_level, difficulty);
        CREATE INDEX IF NOT EXISTS idx_students_access ON students (access_code);
        CREATE INDEX IF NOT EXISTS idx_test_sessions_student ON test_sessions (student_id);
      `);
    })();
  } catch (err) {
    console.error("[DB] initTables error:", err);
  }
}

function seedQuestionsAsync(db: Database.Database) {
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

        if (arrayName === 'easyQuestions') { }
        else if (arrayName === 'mediumQuestions') { difficulty = 'Medium'; }
        else if (arrayName === 'hardQuestions') { difficulty = 'Hard'; }
        else if (arrayName === 'engEasyQuestions') { subject = 'English'; }
        else if (arrayName === 'engMedQuestions') { subject = 'English'; difficulty = 'Medium'; }
        else if (arrayName === 'engHardQuestions') { subject = 'English'; difficulty = 'Hard'; }
        else if (arrayName === 'urduEasyQuestions') { subject = 'Urdu'; }
        else if (arrayName === 'urduMedQuestions') { subject = 'Urdu'; difficulty = 'Medium'; }
        else if (arrayName === 'urduHardQuestions') { subject = 'Urdu'; difficulty = 'Hard'; }
        else {
          const match = arrayName.match(/^(eng|math|urdu)(\d+)(Easy|Med|Hard)Questions$/);
          if (match) {
            const [, subj, level, diff] = match;
            subject = subj === 'eng' ? 'English' : subj === 'urdu' ? 'Urdu' : 'Math';
            classLevel = `Grade ${level}`;
            difficulty = diff === 'Med' ? 'Medium' : diff;
          }
        }

        const countCheck = db.prepare(`
          SELECT COUNT(*) as count FROM questions 
          WHERE subject = ? AND class_level = ? AND difficulty = ?
        `).get(subject, classLevel, difficulty) as { count: number };

        if (countCheck.count < 30) {
          console.log(`[DB] Seeding ${subject} ${classLevel} ${difficulty}...`);
          for (const q of questions) {
            const exists = checkExists.get(q.question_text, classLevel);
            if (!exists) {
              insert.run(subject, difficulty, classLevel, q.question_text, JSON.stringify(q.options), q.correct_option);
            }
          }
        }
      }
    })();
    console.log("[DB] Background seeding complete.");
  } catch (err) {
    console.error("[DB] Seeding error:", err);
  } finally {
    isSeeding = false;
  }
}
