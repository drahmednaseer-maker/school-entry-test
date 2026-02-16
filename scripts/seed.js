const Database = require('better-sqlite3');
const path = require('path');

const db = new Database('school.db', { verbose: console.log });

// Create tables if they don't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    subject TEXT CHECK(subject IN ('English', 'Urdu', 'Math')) NOT NULL,
    difficulty TEXT CHECK(difficulty IN ('Easy', 'Medium', 'Hard')) NOT NULL,
    question_text TEXT NOT NULL,
    options TEXT NOT NULL,
    correct_option INTEGER NOT NULL
  )
`);

const questions = [
    // Math - Easy
    { subject: 'Math', difficulty: 'Easy', question_text: 'What is 2 + 2?', options: JSON.stringify(['3', '4', '5', '6']), correct_option: 1 },
    { subject: 'Math', difficulty: 'Easy', question_text: 'What is 5 x 5?', options: JSON.stringify(['10', '20', '25', '30']), correct_option: 2 },
    { subject: 'Math', difficulty: 'Easy', question_text: 'What is 10 - 3?', options: JSON.stringify(['6', '7', '8', '9']), correct_option: 1 },
    { subject: 'Math', difficulty: 'Easy', question_text: 'What is 12 / 4?', options: JSON.stringify(['2', '3', '4', '6']), correct_option: 1 },
    { subject: 'Math', difficulty: 'Easy', question_text: 'Review the sequence: 2, 4, 6, 8, ... What comes next?', options: JSON.stringify(['10', '12', '9', '11']), correct_option: 0 },
    { subject: 'Math', difficulty: 'Easy', question_text: 'Which number is even?', options: JSON.stringify(['1', '3', '7', '8']), correct_option: 3 },
    { subject: 'Math', difficulty: 'Easy', question_text: 'What is the shape of a ball?', options: JSON.stringify(['Square', 'Circle', 'Triangle', 'Rectangle']), correct_option: 1 },
    { subject: 'Math', difficulty: 'Easy', question_text: 'How many sides does a triangle have?', options: JSON.stringify(['2', '3', '4', '5']), correct_option: 1 },
    { subject: 'Math', difficulty: 'Easy', question_text: '10 + 10 = ?', options: JSON.stringify(['10', '20', '30', '0']), correct_option: 1 },
    { subject: 'Math', difficulty: 'Easy', question_text: 'Which is larger: 5 or 9?', options: JSON.stringify(['5', '9', 'Equal', 'None']), correct_option: 1 },

    // Math - Medium
    { subject: 'Math', difficulty: 'Medium', question_text: 'What is 15 * 3?', options: JSON.stringify(['30', '40', '45', '50']), correct_option: 2 },
    { subject: 'Math', difficulty: 'Medium', question_text: 'What is the square root of 64?', options: JSON.stringify(['6', '7', '8', '9']), correct_option: 2 },
    { subject: 'Math', difficulty: 'Medium', question_text: 'Solve for x: 2x + 4 = 10', options: JSON.stringify(['2', '3', '4', '5']), correct_option: 1 },
    { subject: 'Math', difficulty: 'Medium', question_text: 'What is 20% of 50?', options: JSON.stringify(['5', '10', '15', '20']), correct_option: 1 },
    { subject: 'Math', difficulty: 'Medium', question_text: 'What is the area of a rectangle with length 5 and width 3?', options: JSON.stringify(['8', '15', '16', '10']), correct_option: 1 },
    { subject: 'Math', difficulty: 'Medium', question_text: 'Simplify: 3(x + 2)', options: JSON.stringify(['3x + 2', '3x + 6', 'x + 6', '3x + 5']), correct_option: 1 },
    { subject: 'Math', difficulty: 'Medium', question_text: 'If a triangle has angles 60 and 60, what is the third angle?', options: JSON.stringify(['40', '60', '80', '90']), correct_option: 1 },
    { subject: 'Math', difficulty: 'Medium', question_text: 'What is 1/2 + 1/4?', options: JSON.stringify(['3/4', '2/6', '1/3', '1/8']), correct_option: 0 },
    { subject: 'Math', difficulty: 'Medium', question_text: 'Convert 0.75 to a fraction.', options: JSON.stringify(['1/2', '3/4', '2/3', '4/5']), correct_option: 1 },
    { subject: 'Math', difficulty: 'Medium', question_text: 'What is the perimeter of a square with side 4?', options: JSON.stringify(['8', '12', '16', '20']), correct_option: 2 },

    // English - Easy
    { subject: 'English', difficulty: 'Easy', question_text: 'What is the opposite of "Hot"?', options: JSON.stringify(['Warm', 'Cold', 'Spicy', 'Cool']), correct_option: 1 },
    { subject: 'English', difficulty: 'Easy', question_text: 'Select the noun: "Run", "Blue", "Cat", "Slowly"', options: JSON.stringify(['Run', 'Blue', 'Cat', 'Slowly']), correct_option: 2 },
    { subject: 'English', difficulty: 'Easy', question_text: 'Complete the sentence: The sky is ___', options: JSON.stringify(['Green', 'Blue', 'Yellow', 'Red']), correct_option: 1 },
    { subject: 'English', difficulty: 'Easy', question_text: 'Which word rhymes with "Cat"?', options: JSON.stringify(['Dog', 'Bat', 'Cow', 'Pig']), correct_option: 1 },
    { subject: 'English', difficulty: 'Easy', question_text: 'What is the plural of "Book"?', options: JSON.stringify(['Bookes', 'Books', 'Bookies', 'Bookz']), correct_option: 1 },
    { subject: 'English', difficulty: 'Easy', question_text: 'Identify the verb: "The dog runs fast."', options: JSON.stringify(['The', 'Dog', 'Runs', 'Fast']), correct_option: 2 },
    { subject: 'English', difficulty: 'Easy', question_text: 'A, E, I, O, U are called ___', options: JSON.stringify(['Consonants', 'Vowels', 'Numbers', 'Words']), correct_option: 1 },
    { subject: 'English', difficulty: 'Easy', question_text: 'What do you use to write?', options: JSON.stringify(['Spoon', 'Pencil', 'Shoe', 'Plate']), correct_option: 1 },
    { subject: 'English', difficulty: 'Easy', question_text: 'Which is a color?', options: JSON.stringify(['Apple', 'Run', 'Red', 'Big']), correct_option: 2 },
    { subject: 'English', difficulty: 'Easy', question_text: 'Opposite of "Up" is ___', options: JSON.stringify(['Down', 'Left', 'Right', 'Back']), correct_option: 0 },

    // English - Medium
    { subject: 'English', difficulty: 'Medium', question_text: 'Looking AT correct spelling:', options: JSON.stringify(['Recieve', 'Receive', 'Receve', 'Reiceve']), correct_option: 1 },
    { subject: 'English', difficulty: 'Medium', question_text: 'Identify the adjective: "The beautiful flower bloomed."', options: JSON.stringify(['Beautiful', 'Flower', 'Bloomed', 'The']), correct_option: 0 },
    { subject: 'English', difficulty: 'Medium', question_text: 'Past tense of "Run" is:', options: JSON.stringify(['Runned', 'Ran', 'Running', 'Runs']), correct_option: 1 },
    { subject: 'English', difficulty: 'Medium', question_text: 'Synonym for "Happy" is:', options: JSON.stringify(['Sad', 'Joyful', 'Angry', 'Tired']), correct_option: 1 },
    { subject: 'English', difficulty: 'Medium', question_text: 'Complete the proverb: "A stitch in time saves ___"', options: JSON.stringify(['Nine', 'Five', 'Ten', 'Money']), correct_option: 0 },
    { subject: 'English', difficulty: 'Medium', question_text: 'What is a group of lions called?', options: JSON.stringify(['Pack', 'Herd', 'Pride', 'Flock']), correct_option: 2 },
    { subject: 'English', difficulty: 'Medium', question_text: 'Which sentence is grammatically correct?', options: JSON.stringify(['He don\'t know.', 'He doesn\'t know.', 'He not know.', 'He no know.']), correct_option: 1 },
    { subject: 'English', difficulty: 'Medium', question_text: 'Choose the correct preposition: The book is ___ the table.', options: JSON.stringify(['In', 'On', 'At', 'Of']), correct_option: 1 },
    { subject: 'English', difficulty: 'Medium', question_text: 'Antonym of "Ancient" is:', options: JSON.stringify(['Old', 'Modern', 'Antique', 'Rare']), correct_option: 1 },
    { subject: 'English', difficulty: 'Medium', question_text: 'What type of word is "Quickly"?', options: JSON.stringify(['Noun', 'Verb', 'Adjective', 'Adverb']), correct_option: 3 },

    // Urdu - Easy (Transliterated/Basic due to encoding simplicity, but system supports Unicode)
    { subject: 'Urdu', difficulty: 'Easy', question_text: 'Pakistan ka matlab kya hai?', options: JSON.stringify(['Des', 'La ilaha illallah', 'Pura Mulk', 'Azadi']), correct_option: 1 },
    { subject: 'Urdu', difficulty: 'Easy', question_text: 'Urdu ke haroof-e-tehajji kitne hain?', options: JSON.stringify(['26', '36', '39', '50']), correct_option: 1 }, // Approximately 36-39 depending on inclusion
    { subject: 'Urdu', difficulty: 'Easy', question_text: 'Phool ka mutradif kya hai?', options: JSON.stringify(['Gul', 'Kanta', 'Patti', 'Darakht']), correct_option: 0 },
    { subject: 'Urdu', difficulty: 'Easy', question_text: 'Pakistani flag main kon se rang hain?', options: JSON.stringify(['Red and Green', 'Green and White', 'Blue and White', 'Black and White']), correct_option: 1 },
    { subject: 'Urdu', difficulty: 'Easy', question_text: 'Subah ka ulat kya hai?', options: JSON.stringify(['Sham', 'Raat', 'Dophar', 'Sawera']), correct_option: 0 },
    { subject: 'Urdu', difficulty: 'Easy', question_text: 'Suraj kis taraf se nikalta hai?', options: JSON.stringify(['Mashriq', 'Maghrib', 'Shumal', 'Junoob']), correct_option: 0 },
    { subject: 'Urdu', difficulty: 'Easy', question_text: 'Haftay main kitne din hote hain?', options: JSON.stringify(['5', '6', '7', '8']), correct_option: 2 },
    { subject: 'Urdu', difficulty: 'Easy', question_text: 'Sher kahan rehta hai?', options: JSON.stringify(['Ghar', 'Jungle', 'Pani', 'Hawa']), correct_option: 1 },
    { subject: 'Urdu', difficulty: 'Easy', question_text: 'Pani ka rang kaisa hota hai?', options: JSON.stringify(['Lal', 'Neela', 'Rang heen', 'Kala']), correct_option: 2 },
    { subject: 'Urdu', difficulty: 'Easy', question_text: 'Quaid-e-Azam kon thay?', options: JSON.stringify(['Poet', 'Founder of Pakistan', 'Doctor', 'Scientist']), correct_option: 1 },

    // Urdu - Medium
    { subject: 'Urdu', difficulty: 'Medium', question_text: 'Allama Iqbal ki mashoor nazam konsi hai?', options: JSON.stringify(['Lab pe aati hai', 'Twinkle Twinkle', 'Baa Baa Black Sheep', 'Dil Dil Pakistan']), correct_option: 0 },
    { subject: 'Urdu', difficulty: 'Medium', question_text: 'Urdu zuban ka aghaz kahan se hua?', options: JSON.stringify(['Sindh', 'Punjab', 'Lashkar', 'Iran']), correct_option: 2 },
    { subject: 'Urdu', difficulty: 'Medium', question_text: '"Aasman se gira, khajoor main ___"', options: JSON.stringify(['Gira', 'Atka', 'Phasa', 'Laga']), correct_option: 1 },
    { subject: 'Urdu', difficulty: 'Medium', question_text: 'Pakistan ka qaumi khel kya hai?', options: JSON.stringify(['Cricket', 'Hockey', 'Football', 'Tennis']), correct_option: 1 },
    { subject: 'Urdu', difficulty: 'Medium', question_text: 'K2 pahar kahan waqay hai?', options: JSON.stringify(['Punjab', 'Sindh', 'Gilgit-Baltistan', 'Balochistan']), correct_option: 2 },
    { subject: 'Urdu', difficulty: 'Medium', question_text: 'Eid-ul-Fitr kis mahinay ke baad aati hai?', options: JSON.stringify(['Shaban', 'Ramzan', 'Safar', 'Moharram']), correct_option: 1 },
    { subject: 'Urdu', difficulty: 'Medium', question_text: 'Punjab ka matlab kya hai?', options: JSON.stringify(['Panch Darya', 'Saat Darya', 'Do Darya', 'Char Darya']), correct_option: 0 },
    { subject: 'Urdu', difficulty: 'Medium', question_text: 'Qaumi Tarana kis ne likha?', options: JSON.stringify(['Ghalib', 'Iqbal', 'Hafeez Jalandhari', 'Faiz']), correct_option: 2 },
    { subject: 'Urdu', difficulty: 'Medium', question_text: 'Minar-e-Pakistan kahan hai?', options: JSON.stringify(['Karachi', 'Lahore', 'Islamabad', 'Quetta']), correct_option: 1 },
    { subject: 'Urdu', difficulty: 'Medium', question_text: 'Urdu kis rasm-ul-khat main likhi jati hai?', options: JSON.stringify(['Nastaliq', 'Roman', 'Devanagari', 'Latin']), correct_option: 0 },
];

const insertStmt = db.prepare(`
  INSERT INTO questions (subject, difficulty, question_text, options, correct_option)
  VALUES (@subject, @difficulty, @question_text, @options, @correct_option)
`);

const insertMany = db.transaction((questions) => {
    for (const q of questions) insertStmt.run(q);
});

try {
    insertMany(questions);
    console.log('Seeded ' + questions.length + ' questions successfully.');
} catch (error) {
    console.error('Error seeding data:', error);
}
