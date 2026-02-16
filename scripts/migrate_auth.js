const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');

const db = new Database('school.db', { verbose: console.log });

// Create admin_users table
db.exec(`
  CREATE TABLE IF NOT EXISTS admin_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL
  )
`);

// Check if admin exists
const admin = db.prepare("SELECT * FROM admin_users WHERE username = 'admin'").get();

if (!admin) {
    const hash = bcrypt.hashSync('admin', 10);
    db.prepare("INSERT INTO admin_users (username, password_hash) VALUES (?, ?)").run('admin', hash);
    console.log("Default admin user created (admin/admin).");
} else {
    console.log("Admin user already exists.");
}
