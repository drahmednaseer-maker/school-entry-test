const { spawn } = require('child_process');

/**
 * Professional Cross-Platform Startup Script
 * This script ensures the app binds to 0.0.0.0 on Railway (Linux) 
 * and localhost on Windows, handling the PORT variable safely for both.
 */

const isWindows = process.platform === 'win32';
const port = process.env.PORT || 3000;
const host = isWindows ? 'localhost' : '0.0.0.0';

console.log(`[Startup] Operating System: ${process.platform}`);
console.log(`[Startup] Target Host: ${host}`);
console.log(`[Startup] Target Port: ${port}`);
console.log(`[Startup] Initializing Next.js production server...`);

const nextStart = spawn('npx', ['next', 'start', '-H', host, '-p', port.toString()], {
    stdio: 'inherit',
    shell: true,
    env: {
        ...process.env,
        // Ensure Next.js doesn't try to use experimental features that might hang
        NEXT_TELEMETRY_DISABLED: '1'
    }
});

nextStart.on('error', (err) => {
    console.error('[Startup] Failed to start Next.js:', err);
    process.exit(1);
});

nextStart.on('close', (code) => {
    if (code !== 0) {
        console.warn(`[Startup] Next.js exited with code ${code}`);
    }
    process.exit(code);
});
