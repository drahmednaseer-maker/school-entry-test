const fs = require('fs');

let file = fs.readFileSync('lib/seedData.ts', 'utf8');

const map = {
    /* 10 -> delete */
    'eng10EasyQuestions:': 'del_eng10EasyQuestions:',
    'eng10MedQuestions:': 'del_eng10MedQuestions:',
    'eng10HardQuestions:': 'del_eng10HardQuestions:',
    'math10EasyQuestions:': 'del_math10EasyQuestions:',
    'math10MedQuestions:': 'del_math10MedQuestions:',
    'math10HardQuestions:': 'del_math10HardQuestions:',
    'urdu10EasyQuestions:': 'del_urdu10EasyQuestions:',
    'urdu10MedQuestions:': 'del_urdu10MedQuestions:',
    'urdu10HardQuestions:': 'del_urdu10HardQuestions:',

    /* 9 -> 10 */
    'eng9EasyQuestions:': 'eng10EasyQuestions:',
    'eng9MedQuestions:': 'eng10MedQuestions:',
    'eng9HardQuestions:': 'eng10HardQuestions:',
    'math9EasyQuestions:': 'math10EasyQuestions:',
    'math9MedQuestions:': 'math10MedQuestions:',
    'math9HardQuestions:': 'math10HardQuestions:',
    'urdu9EasyQuestions:': 'urdu10EasyQuestions:',
    'urdu9MedQuestions:': 'urdu10MedQuestions:',
    'urdu9HardQuestions:': 'urdu10HardQuestions:',

    /* 8 -> 9 */
    'eng8EasyQuestions:': 'eng9EasyQuestions:',
    'eng8MedQuestions:': 'eng9MedQuestions:',
    'eng8HardQuestions:': 'eng9HardQuestions:',
    'math8EasyQuestions:': 'math9EasyQuestions:',
    'math8MedQuestions:': 'math9MedQuestions:',
    'math8HardQuestions:': 'math9HardQuestions:',
    'urdu8EasyQuestions:': 'urdu9EasyQuestions:',
    'urdu8MedQuestions:': 'urdu9MedQuestions:',
    'urdu8HardQuestions:': 'urdu9HardQuestions:',

    /* 7 -> 8 */
    'eng7EasyQuestions:': 'eng8EasyQuestions:',
    'eng7MedQuestions:': 'eng8MedQuestions:',
    'eng7HardQuestions:': 'eng8HardQuestions:',
    'math7EasyQuestions:': 'math8EasyQuestions:',
    'math7MedQuestions:': 'math8MedQuestions:',
    'math7HardQuestions:': 'math8HardQuestions:',
    'urdu7EasyQuestions:': 'urdu8EasyQuestions:',
    'urdu7MedQuestions:': 'urdu8MedQuestions:',
    'urdu7HardQuestions:': 'urdu8HardQuestions:',

    /* 6 -> 7 */
    'eng6EasyQuestions:': 'eng7EasyQuestions:',
    'eng6MedQuestions:': 'eng7MedQuestions:',
    'eng6HardQuestions:': 'eng7HardQuestions:',
    'math6EasyQuestions:': 'math7EasyQuestions:',
    'math6MedQuestions:': 'math7MedQuestions:',
    'math6HardQuestions:': 'math7HardQuestions:',
    'urdu6EasyQuestions:': 'urdu7EasyQuestions:',
    'urdu6MedQuestions:': 'urdu7MedQuestions:',
    'urdu6HardQuestions:': 'urdu7HardQuestions:',

    /* 5 -> 6 */
    'eng5EasyQuestions:': 'eng6EasyQuestions:',
    'eng5MedQuestions:': 'eng6MedQuestions:',
    'eng5HardQuestions:': 'eng6HardQuestions:',
    'math5EasyQuestions:': 'math6EasyQuestions:',
    'math5MedQuestions:': 'math6MedQuestions:',
    'math5HardQuestions:': 'math6HardQuestions:',
    'urdu5EasyQuestions:': 'urdu6EasyQuestions:',
    'urdu5MedQuestions:': 'urdu6MedQuestions:',
    'urdu5HardQuestions:': 'urdu6HardQuestions:',

    /* 4 -> 5 */
    'eng4EasyQuestions:': 'eng5EasyQuestions:',
    'eng4MedQuestions:': 'eng5MedQuestions:',
    'eng4HardQuestions:': 'eng5HardQuestions:',
    'math4EasyQuestions:': 'math5EasyQuestions:',
    'math4MedQuestions:': 'math5MedQuestions:',
    'math4HardQuestions:': 'math5HardQuestions:',
    'urdu4EasyQuestions:': 'urdu5EasyQuestions:',
    'urdu4MedQuestions:': 'urdu5MedQuestions:',
    'urdu4HardQuestions:': 'urdu5HardQuestions:',

    /* 3 -> 4 */
    'eng3EasyQuestions:': 'eng4EasyQuestions:',
    'eng3MedQuestions:': 'eng4MedQuestions:',
    'eng3HardQuestions:': 'eng4HardQuestions:',
    'math3EasyQuestions:': 'math4EasyQuestions:',
    'math3MedQuestions:': 'math4MedQuestions:',
    'math3HardQuestions:': 'math4HardQuestions:',
    'urdu3EasyQuestions:': 'urdu4EasyQuestions:',
    'urdu3MedQuestions:': 'urdu4MedQuestions:',
    'urdu3HardQuestions:': 'urdu4HardQuestions:',

    /* 2 -> 3 */
    'eng2EasyQuestions:': 'eng3EasyQuestions:',
    'eng2MedQuestions:': 'eng3MedQuestions:',
    'eng2HardQuestions:': 'eng3HardQuestions:',
    'math2EasyQuestions:': 'math3EasyQuestions:',
    'math2MedQuestions:': 'math3MedQuestions:',
    'math2HardQuestions:': 'math3HardQuestions:',
    'urdu2EasyQuestions:': 'urdu3EasyQuestions:',
    'urdu2MedQuestions:': 'urdu3MedQuestions:',
    'urdu2HardQuestions:': 'urdu3HardQuestions:',

    /* 1 -> 2 */
    'engEasyQuestions:': 'eng2EasyQuestions:',
    'engMedQuestions:': 'eng2MedQuestions:',
    'engHardQuestions:': 'eng2HardQuestions:',
    'easyQuestions:': 'math2EasyQuestions:',
    'mediumQuestions:': 'math2MedQuestions:',
    'hardQuestions:': 'math2HardQuestions:',
    'urduEasyQuestions:': 'urdu2EasyQuestions:',
    'urduMedQuestions:': 'urdu2MedQuestions:',
    'urduHardQuestions:': 'urdu2HardQuestions:',

    /* KG2 -> Grade 1 (key: 1) */
    'engKG2EasyQuestions:': 'eng1EasyQuestions:',
    'engKG2MedQuestions:': 'eng1MedQuestions:',
    'engKG2HardQuestions:': 'eng1HardQuestions:',
    'mathKG2EasyQuestions:': 'math1EasyQuestions:',
    'mathKG2MedQuestions:': 'math1MedQuestions:',
    'mathKG2HardQuestions:': 'math1HardQuestions:',
    'urduKG2EasyQuestions:': 'urdu1EasyQuestions:',
    'urduKG2MedQuestions:': 'urdu1MedQuestions:',
    'urduKG2HardQuestions:': 'urdu1HardQuestions:',

    /* KG1 -> KG2 (key: KG2) */
    'engKG1EasyQuestions:': 'engKG2EasyQuestions:',
    'engKG1MedQuestions:': 'engKG2MedQuestions:',
    'engKG1HardQuestions:': 'engKG2HardQuestions:',
    'mathKG1EasyQuestions:': 'mathKG2EasyQuestions:',
    'mathKG1MedQuestions:': 'mathKG2MedQuestions:',
    'mathKG1HardQuestions:': 'mathKG2HardQuestions:',
    'urduKG1EasyQuestions:': 'urduKG2EasyQuestions:',
    'urduKG1MedQuestions:': 'urduKG2MedQuestions:',
    'urduKG1HardQuestions:': 'urduKG2HardQuestions:',
};

for (const [oldKey, newKey] of Object.entries(map)) {
    const oldKeyName = oldKey.replace(':', '');
    const newKeyName = newKey.replace(':', '');
    const regex = new RegExp('^(\\s*)' + oldKeyName + '\\s*:', 'm');
    file = file.replace(regex, '$1' + newKeyName + ':');
}

fs.writeFileSync('lib/seedData.ts', file, 'utf8');
console.log('Seed keys successfully renamed.');
