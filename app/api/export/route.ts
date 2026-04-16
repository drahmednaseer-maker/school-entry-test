import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { getDb } from '@/lib/db';
import path from 'path';
import fs from 'fs';
import JSZip from 'jszip';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key-change-in-production');

async function verifyAdmin(req: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_session')?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload;
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const user = await verifyAdmin(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const db = getDb();
    const zip = new JSZip();

    // ── 1. Export all DB tables as JSON ─────────────────────────────────────
    const tables: Record<string, string> = {
      questions: 'SELECT * FROM questions',
      students: 'SELECT * FROM students',
      test_sessions: 'SELECT * FROM test_sessions',
      sessions: 'SELECT * FROM sessions',
      session_seats: 'SELECT * FROM session_seats',
      slcs: 'SELECT * FROM slcs',
      settings: 'SELECT id, school_name, easy_percent, medium_percent, hard_percent, english_questions, urdu_questions, math_questions, active_ai_provider, gemini_model FROM settings',
    };

    const dbFolder = zip.folder('database')!;
    for (const [tableName, query] of Object.entries(tables)) {
      try {
        const rows = db.prepare(query).all();
        dbFolder.file(`${tableName}.json`, JSON.stringify(rows, null, 2));
      } catch {
        dbFolder.file(`${tableName}.json`, JSON.stringify([], null, 2));
      }
    }

    // ── 2. Export manifest ───────────────────────────────────────────────────
    const manifest = {
      exportedAt: new Date().toISOString(),
      exportedBy: user.username,
      version: '1.0',
      tables: Object.keys(tables),
    };
    zip.file('manifest.json', JSON.stringify(manifest, null, 2));

    // ── 3. Export uploaded files (photos, question images, etc.) ─────────────
    // Files are stored in the same folder as the DB (e.g. data/uploads/), NOT public/uploads/
    const dbPath = process.env.DATABASE_URL || 'data/school.db';
    const dbBaseDir = path.dirname(path.resolve(process.cwd(), dbPath));
    const uploadsDir = path.join(dbBaseDir, 'uploads');
    if (fs.existsSync(uploadsDir)) {
      const uploadsFolder = zip.folder('uploads')!;
      const walkDir = (dir: string, zipFolder: JSZip) => {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          if (entry.isDirectory()) {
            walkDir(fullPath, zipFolder.folder(entry.name)!);
          } else {
            const fileBuffer = fs.readFileSync(fullPath);
            zipFolder.file(entry.name, fileBuffer);
          }
        }
      };
      walkDir(uploadsDir, uploadsFolder);
    }

    // ── 4. Generate ZIP buffer ────────────────────────────────────────────────
    const zipBuffer = await zip.generateAsync({
      type: 'nodebuffer',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 },
    });

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const filename = `snap-test-export-${timestamp}.zip`;

    return new NextResponse(zipBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': zipBuffer.length.toString(),
      },
    });
  } catch (err: any) {
    console.error('[Export] Error:', err);
    return NextResponse.json({ error: 'Export failed: ' + err.message }, { status: 500 });
  }
}
