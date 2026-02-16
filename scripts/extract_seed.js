const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../lib/db.ts');
const outputPath = path.join(__dirname, '../lib/seedData.ts');

if (!fs.existsSync(dbPath)) {
    console.error('db.ts not found');
    process.exit(1);
}

const content = fs.readFileSync(dbPath, 'utf8');

// Regex to find all question arrays
// Pattern: const [name] = [ [content] ];
const arrayRegex = /const (\w+Questions) = (\[[\s\S]*?\]);/g;
let match;
let extractedData = "export const allSeedData: Record<string, any[]> = {\n";
let arraysFound = [];

while ((match = arrayRegex.exec(content)) !== null) {
    const name = match[1];
    const data = match[2];
    extractedData += `  ${name}: ${data},\n`;
    arraysFound.push(name);
}

extractedData += "};";

if (arraysFound.length === 0) {
    console.error('No question arrays found in db.ts');
    process.exit(1);
}

fs.writeFileSync(outputPath, extractedData);
console.log(`Successfully extracted ${arraysFound.length} arrays to ${outputPath}`);
