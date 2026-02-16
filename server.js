const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const hostname = '0.0.0.0';
const port = process.env.PORT || 3000;

// Initialize Next.js app
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

console.log(`[Server] Starting Next.js app on ${hostname}:${port}...`);

app.prepare().then(() => {
    createServer(async (req, res) => {
        try {
            const parsedUrl = parse(req.url, true);
            const { pathname } = parsedUrl;

            // Special health check logging
            if (pathname === '/api/health') {
                // console.log('[Server] Health check ping received');
            }

            await handle(req, res, parsedUrl);
        } catch (err) {
            console.error('[Server] Request error:', err);
            res.statusCode = 500;
            res.end('Internal Server Error');
        }
    })
        .once('error', (err) => {
            console.error('[Server] Fatal startup error:', err);
            process.exit(1);
        })
        .listen(port, hostname, () => {
            console.log(`> Ready on http://${hostname}:${port}`);
            console.log(`> Environment: ${process.env.NODE_ENV}`);
        });
}).catch((err) => {
    console.error('[Server] Next.js prepare failed:', err);
    process.exit(1);
});
