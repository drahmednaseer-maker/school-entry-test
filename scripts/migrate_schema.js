const Database = require('better-sqlite3');
const db = new Database('school.db', { verbose: console.log });

try {
    db.prepare("ALTER TABLE questions ADD COLUMN class_level TEXT").run();
    console.log("Added class_level column.");
} catch (e) {
    console.log("class_level column might already exist.");
}

try {
    db.prepare("ALTER TABLE questions ADD COLUMN image_path TEXT").run();
    console.log("Added image_path column.");
} catch (e) {
    console.log("image_path column might already exist.");
}

console.log("Schema update completed.");
