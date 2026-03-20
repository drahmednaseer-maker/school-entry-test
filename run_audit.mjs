import { execSync } from 'child_process';
import fs from 'fs';

try {
    execSync('npx tsc --noEmit', { stdio: 'pipe' });
    fs.writeFileSync('audit_results.txt', 'No unused code found!');
} catch (error) {
    fs.writeFileSync('audit_results.txt', error.stdout.toString() + '\n' + error.stderr.toString());
}
console.log('done running audit');
