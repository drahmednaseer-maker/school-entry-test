import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';

export async function GET(
    request: NextRequest,
    { params }: { params: { filename: string } }
) {
    const filename = params.filename;

    // Use persistent volume path if DATABASE_URL is set (Railway)
    const dbPath = process.env.DATABASE_URL || 'data/school.db';
    const baseDir = path.dirname(path.resolve(process.cwd(), dbPath));
    const uploadDir = path.join(baseDir, 'uploads');
    const filePath = path.join(uploadDir, filename);

    try {
        const fileBuffer = await fs.readFile(filePath);

        // Determine content type based on extension
        const ext = path.extname(filename).toLowerCase();
        let contentType = 'application/octet-stream';

        if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
        else if (ext === '.png') contentType = 'image/png';
        else if (ext === '.gif') contentType = 'image/gif';
        else if (ext === '.webp') contentType = 'image/webp';
        else if (ext === '.svg') contentType = 'image/svg+xml';

        return new NextResponse(fileBuffer, {
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=31536000, immutable',
            },
        });
    } catch (error) {
        console.error('Error serving image:', error);
        return new NextResponse('File not found', { status: 404 });
    }
}
