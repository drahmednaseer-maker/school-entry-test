'use server';

import { getDb } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import mammoth from 'mammoth';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { redirect } from 'next/navigation';

// --- Authentication ---

const JWT_SECRET = new TextEncoder().encode('super-secret-key-change-this-in-prod');

export async function getCurrentUser() {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_session')?.value;
    if (!token) return null;
    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        return payload as { sub: string; username: string; role: string };
    } catch (e) {
        return null;
    }
}

export async function login(formData: FormData) {
    const db = getDb();
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;

    const user = db.prepare('SELECT * FROM admin_users WHERE username = ?').get(username) as any;

    if (!user || !bcrypt.compareSync(password, user.password_hash)) {
        return { success: false, error: 'Invalid credentials' };
    }

    // Create JWT
    const token = await new SignJWT({
        sub: user.id.toString(),
        username: user.username,
        role: user.role
    })
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime('24h')
        .sign(JWT_SECRET);

    // Set cookie
    // Using simple approach for now. In Next.js 15+ we need await cookies()
    // but in 14 it's direct. Checked package.json: next 16.
    // Next 15/16: cookies() is async.
    const cookieStore = await cookies();
    cookieStore.set('admin_session', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 // 1 day
    });

    // redirect happens in client usually, or here?
    // Let's return success and let client redirect
    return { success: true };
}

export async function logout() {
    const cookieStore = await cookies();
    cookieStore.delete('admin_session');
    redirect('/admin/login');
}

export async function updatePassword(currentState: any, formData: FormData) {
    const db = getDb();
    const currentPassword = formData.get('current_password') as string;
    const newPassword = formData.get('new_password') as string;
    const confirmPassword = formData.get('confirm_password') as string;

    if (newPassword !== confirmPassword) {
        return { error: 'New passwords do not match' };
    }

    // Decode token to get user role/id if needed, but for simplicity we rely on body or single update.
    // However, the requested feature is to allow admin to control passwords from settings.
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_session')?.value;
    if (!token) return { error: 'Not authenticated' };

    let payload;
    try {
        const verified = await jwtVerify(token, JWT_SECRET);
        payload = verified.payload;
    } catch (e) {
        return { error: 'Invalid session' };
    }

    // Role check - only admin can change others' passwords, or anyone can change their own?
    // User request: "The admin should be able to control their login password for their settings menu."
    // This implies admin can change others.
    const targetUsername = formData.get('username') as string || payload.username as string;

    if (payload.role !== 'admin' && targetUsername !== payload.username) {
        return { error: 'Unauthorized to change this password' };
    }

    const user = db.prepare('SELECT * FROM admin_users WHERE username = ?').get(targetUsername) as any;

    if (!user) return { error: 'User not found' };

    // Admin can forcefully change any password, including their own
    if (payload.role !== 'admin') {
        return { error: 'Unauthorized. Only admins can reset passwords.' };
    }

    const newHash = bcrypt.hashSync(newPassword, 10);
    db.prepare('UPDATE admin_users SET password_hash = ? WHERE id = ?').run(newHash, user.id);

    return { success: 'Password updated successfully' };
}

// Helper to get all admin users for settings
export async function getAllUsers() {
    const db = getDb();
    return db.prepare('SELECT id, username, role FROM admin_users').all() as any[];
}

export async function generateStudentCode(name: string, fatherName: string, fatherMobile: string, classLevel: string, photo?: string, gender?: string) {
    const db = getDb();
    const accessCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Get active session
    const activeSession = db.prepare('SELECT id FROM sessions WHERE is_active = 1 LIMIT 1').get() as any;
    const sessionId = activeSession?.id || null;

    try {
        db.prepare('INSERT INTO students (access_code, name, father_name, father_mobile, class_level, photo, gender, session_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').run(accessCode, name, fatherName, fatherMobile, classLevel, photo || null, gender || null, sessionId);
        revalidatePath('/admin/students');
        return { success: true, code: accessCode };
    } catch (error) {
        console.error('Error generating code:', error);
        return { success: false, error: 'Failed to generate code' };
    }
}

export async function deleteStudent(id: number) {
    const db = getDb();
    try {
        // Delete related test sessions first
        db.prepare('DELETE FROM test_sessions WHERE student_id = ?').run(id);
        db.prepare('DELETE FROM students WHERE id = ?').run(id);
        revalidatePath('/admin/students');
        revalidatePath('/admin');
        return { success: true };
    } catch (error) {
        console.error('Error deleting student:', error);
        return { success: false, error: 'Failed to delete student' };
    }
}

// --- Question Management ---

export async function addQuestion(formData: FormData) {
    const db = getDb();
    const subject = formData.get('subject') as string;
    const difficulty = formData.get('difficulty') as string;
    const classLevel = formData.get('class_level') as string;
    const questionText = formData.get('question_text') as string;
    const option1 = formData.get('option_0') as string;
    const option2 = formData.get('option_1') as string;
    const option3 = formData.get('option_2') as string;
    const option4 = formData.get('option_3') as string;
    const correctOption = parseInt(formData.get('correct_option') as string);
    const imageFile = formData.get('image') as File;

    let imagePath = null;
    if (imageFile && imageFile.size > 0) {
        const buffer = Buffer.from(await imageFile.arrayBuffer());
        const filename = `${Date.now()}-${imageFile.name.replace(/\s/g, '_')}`;

        // Use persistent volume path if DATABASE_URL is set (Railway)
        const dbPath = process.env.DATABASE_URL || 'data/school.db';
        const baseDir = path.dirname(path.resolve(process.cwd(), dbPath));
        const uploadDir = path.join(baseDir, 'uploads');

        // Ensure directory exists
        await mkdir(uploadDir, { recursive: true });

        await writeFile(path.join(uploadDir, filename), buffer);
        // Path should point to our API route
        imagePath = `/api/uploads/${filename}`;
    }

    const options = JSON.stringify([option1, option2, option3, option4]);

    try {
        db.prepare(`
      INSERT INTO questions (subject, difficulty, class_level, question_text, options, correct_option, image_path)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(subject, difficulty, classLevel, questionText, options, correctOption, imagePath);

        revalidatePath('/admin/questions');
        return { success: true };
    } catch (error) {
        console.error('Failed to add question:', error);
        return { success: false, error: 'Failed to add question' };
    }
}

export async function updateQuestion(formData: FormData) {
    const db = getDb();
    const id = parseInt(formData.get('id') as string);
    const subject = formData.get('subject') as string;
    const difficulty = formData.get('difficulty') as string;
    const classLevel = formData.get('class_level') as string;
    const questionText = formData.get('question_text') as string;
    const option1 = formData.get('option_0') as string;
    const option2 = formData.get('option_1') as string;
    const option3 = formData.get('option_2') as string;
    const option4 = formData.get('option_3') as string;
    const correctOption = parseInt(formData.get('correct_option') as string);
    const imageFile = formData.get('image') as File;
    const removeImage = formData.get('remove_image') === 'true';

    // Get current question for existing image path
    const currentQuestion = db.prepare('SELECT image_path FROM questions WHERE id = ?').get(id) as any;
    let imagePath = currentQuestion?.image_path;

    const options = JSON.stringify([option1, option2, option3, option4]);
    const dbPath = process.env.DATABASE_URL || 'data/school.db';
    const baseDir = path.dirname(path.resolve(process.cwd(), dbPath));
    const uploadDir = path.join(baseDir, 'uploads');

    if (removeImage) {
        imagePath = null;
    } else if (imageFile && imageFile.size > 0) {
        const buffer = Buffer.from(await imageFile.arrayBuffer());
        const filename = `${Date.now()}-${imageFile.name.replace(/\s/g, '_')}`;

        await mkdir(uploadDir, { recursive: true });
        await writeFile(path.join(uploadDir, filename), buffer);
        imagePath = `/api/uploads/${filename}`;
    }

    try {
        db.prepare(`
            UPDATE questions 
            SET subject = ?, difficulty = ?, class_level = ?, question_text = ?, options = ?, correct_option = ?, image_path = ?
            WHERE id = ?
        `).run(subject, difficulty, classLevel, questionText, options, correctOption, imagePath, id);

        revalidatePath('/admin/questions');
        return { success: true };
    } catch (error) {
        console.error('Failed to update question:', error);
        return { success: false, error: 'Failed to update question' };
    }
}

export async function uploadBulkQuestions(formData: FormData) {
    const db = getDb();
    const classLevel = formData.get('class_level') as string;
    const file = formData.get('file') as File;

    if (!file) return { success: false, error: 'No file uploaded' };

    try {
        const buffer = Buffer.from(await file.arrayBuffer());
        const result = await mammoth.convertToHtml({ buffer });
        let html = result.value;

        // Verify simple parsing strategy:
        // We expect a table. Mammoth converts tables to <table>...
        // This is complex to parse via Regex reliably.

        // Alternative: Use mammoth.extractRawText and expect a specific separator?
        // Or "Plain text table" where rows are lines and columns are separated by tabs/pipes?
        // User asked for "Word file". Tables in word are common.

        // Let's try a simpler approach for the prototype:
        // Expect a specific text format in the Word doc:
        // Subject | Difficulty | Question | Opt1 | Opt2 | Opt3 | Opt4 | CorrectIndex (1-4)

        // For now, let's look for `<tr>` tags if they exist (Mammoth output).

        // Quick regex parser for <table> rows from Mammoth HTML output
        // regex for <tr>...</tr>
        const rowRegex = /<tr>(.*?)<\/tr>/g;
        const cellRegex = /<td>(.*?)<\/td>/g;

        let match;
        let count = 0;

        const insertStmt = db.prepare(`
            INSERT INTO questions (subject, difficulty, class_level, question_text, options, correct_option)
            VALUES (?, ?, ?, ?, ?, ?)
        `);

        const transaction = db.transaction((rows: any[]) => {
            for (const row of rows) {
                insertStmt.run(row.subject, row.difficulty, classLevel, row.question, row.options, row.correct);
                count++;
            }
        });

        const rowsToInsert = [];

        while ((match = rowRegex.exec(html)) !== null) {
            const rowContent = match[1];
            const cells = [];
            let cellMatch;
            while ((cellMatch = cellRegex.exec(rowContent)) !== null) {
                // Remove <p> tags commonly added by Mammoth inside cells
                cells.push(cellMatch[1].replace(/<\/?[^>]+(>|$)/g, "").trim());
            }

            // Expected columns: Subject, Difficulty, Question, Opt1, Opt2, Opt3, Opt4, Correct(1-4)
            if (cells.length >= 8) {
                // Header row check
                if (cells[0].toLowerCase() === 'subject') continue;

                const subject = cells[0]; // Validate?
                const difficulty = cells[1];
                const question = cells[2];
                const opts = [cells[3], cells[4], cells[5], cells[6]];
                const correct = parseInt(cells[7]) - 1; // 1-based to 0-based

                if (subject && difficulty && question && !isNaN(correct)) {
                    rowsToInsert.push({
                        subject, difficulty, question, options: JSON.stringify(opts), correct
                    });
                }
            }
        }

        if (rowsToInsert.length > 0) {
            transaction(rowsToInsert);
            revalidatePath('/admin/questions');
            return { success: true, count };
        } else {
            return { success: false, error: 'No valid questions found in table format.' };
        }

    } catch (error) {
        console.error('Bulk upload error:', error);
        return { success: false, error: 'Failed to process file' };
    }
}

export async function deleteQuestion(id: number) {
    const db = getDb();
    db.prepare('DELETE FROM questions WHERE id = ?').run(id);
    revalidatePath('/admin/questions');
}

export async function getSettings() {
    const db = getDb();
    return db.prepare('SELECT * FROM settings WHERE id = 1').get() as {
        school_name: string;
        easy_percent: number;
        medium_percent: number;
        hard_percent: number;
        english_questions: number;
        urdu_questions: number;
        math_questions: number;
    };
}

export async function updateSettings(currentState: any, formData: FormData) {
    const db = getDb();
    const schoolName = formData.get('school_name') as string;
    const easyPercent = parseInt(formData.get('easy_percent') as string);
    const mediumPercent = parseInt(formData.get('medium_percent') as string);
    const hardPercent = parseInt(formData.get('hard_percent') as string);
    const englishQuestions = parseInt(formData.get('english_questions') as string) || 10;
    const urduQuestions = parseInt(formData.get('urdu_questions') as string) || 10;
    const mathQuestions = parseInt(formData.get('math_questions') as string) || 10;

    if (easyPercent + mediumPercent + hardPercent !== 100) {
        return { error: 'Percentages must total 100%' };
    }

    try {
        db.prepare(`
            UPDATE settings 
            SET school_name = ?, easy_percent = ?, medium_percent = ?, hard_percent = ?,
                english_questions = ?, urdu_questions = ?, math_questions = ?
            WHERE id = 1
        `).run(schoolName, easyPercent, mediumPercent, hardPercent, englishQuestions, urduQuestions, mathQuestions);

        revalidatePath('/admin/settings');
        revalidatePath('/admin');
        revalidatePath('/');
        return { success: 'Settings updated successfully' };
    } catch (error) {
        console.error('Failed to update settings:', error);
        return { error: 'Failed to update settings' };
    }
}

// --- Test Logic ---

export async function startTest(accessCode: string) {
    const db = getDb();
    const student = db.prepare('SELECT * FROM students WHERE access_code = ?').get(accessCode) as any;

    if (!student) return { success: false, error: 'Invalid Access Code' };
    if (student.status === 'completed') return { success: false, error: 'Test already completed' };

    let session = db.prepare('SELECT * FROM test_sessions WHERE student_id = ?').get(student.id) as any;

    if (!session) {
        const settings = await getSettings();
        const classLevel = student.class_level;

        const getQs = (subject: string, totalCount: number) => {
            if (totalCount <= 0) return [];
            const counts = {
                'Easy': Math.round((settings.easy_percent / 100) * totalCount),
                'Medium': Math.round((settings.medium_percent / 100) * totalCount),
                'Hard': totalCount - Math.round((settings.easy_percent / 100) * totalCount) - Math.round((settings.medium_percent / 100) * totalCount)
            };

            let allSubjectQs: any[] = [];

            for (const [diff, count] of Object.entries(counts)) {
                if (count <= 0) continue;
                let qs = db.prepare(`
                    SELECT id FROM questions 
                    WHERE subject = ? AND class_level = ? AND difficulty = ? 
                    ORDER BY RANDOM() LIMIT ?
                `).all(subject, classLevel, diff, count);

                allSubjectQs = [...allSubjectQs, ...qs];
            }

            // Fallback: If not enough questions of specific difficulty, fill with ANY difficulty from same class
            if (allSubjectQs.length < totalCount) {
                const needed = totalCount - allSubjectQs.length;
                const existingIds = allSubjectQs.length > 0 ? allSubjectQs.map(q => q.id).join(',') : '0';
                const extraQs = db.prepare(`
                    SELECT id FROM questions 
                    WHERE subject = ? AND class_level = ? AND id NOT IN (${existingIds}) 
                    ORDER BY RANDOM() LIMIT ?
                `).all(subject, classLevel, needed);
                allSubjectQs = [...allSubjectQs, ...extraQs];
            }

            // If STILL not enough, fallback to any class
            if (allSubjectQs.length < totalCount) {
                const needed = totalCount - allSubjectQs.length;
                const existingIds = allSubjectQs.length > 0 ? allSubjectQs.map(q => q.id).join(',') : '0';
                const extraQs = db.prepare(`
                    SELECT id FROM questions 
                    WHERE subject = ? AND id NOT IN (${existingIds}) 
                    ORDER BY RANDOM() LIMIT ?
                `).all(subject, needed);
                allSubjectQs = [...allSubjectQs, ...extraQs];
            }

            return allSubjectQs;
        }

        const englishQs = getQs('English', settings.english_questions);
        const urduQs = getQs('Urdu', settings.urdu_questions);
        const mathQs = getQs('Math', settings.math_questions);

        const allQs = [...englishQs, ...urduQs, ...mathQs].map((q: any) => q.id);
        const shuffledQs = allQs.sort(() => 0.5 - Math.random());

        const info = db.prepare(`
            INSERT INTO test_sessions (student_id, question_ids, answers, start_time)
            VALUES (?, ?, '{}', datetime('now'))
        `).run(student.id, JSON.stringify(shuffledQs));

        db.prepare("UPDATE students SET status = 'started' WHERE id = ?").run(student.id);
        session = db.prepare('SELECT * FROM test_sessions WHERE id = ?').get(info.lastInsertRowid);
    }

    return { success: true, sessionId: session.id };
}

export async function submitTest(sessionId: number, answers: Record<number, number>) {
    const db = getDb();
    const session = db.prepare('SELECT * FROM test_sessions WHERE id = ?').get(sessionId) as any;
    if (!session) return { success: false, error: "Session not found" };

    const questionIds = JSON.parse(session.question_ids);
    let score = 0;

    const questions = db.prepare(`SELECT id, correct_option FROM questions WHERE id IN (${questionIds.join(',')})`).all() as any[];
    const qMap = new Map(questions.map(q => [q.id, q.correct_option]));

    for (const [qId, selectedOpt] of Object.entries(answers)) {
        if (qMap.get(Number(qId)) === selectedOpt) {
            score++;
        }
    }

    db.prepare(`
        UPDATE test_sessions 
        SET answers = ?, end_time = datetime('now') 
        WHERE id = ?
    `).run(JSON.stringify(answers), sessionId);

    db.prepare(`
        UPDATE students 
        SET status = 'completed', score = ? 
        WHERE id = ?
    `).run(score, session.student_id);

    revalidatePath('/admin');
    return { success: true, score };
}

export async function setAdmissionStatus(formData: FormData) {
    const db = getDb();
    const studentId = parseInt(formData.get('student_id') as string);
    const status = formData.get('status') as string; // 'granted' | 'not_granted'
    const admittedClass = formData.get('admitted_class') as string || null;

    db.prepare(`
        UPDATE students
        SET admission_status = ?, admitted_class = ?
        WHERE id = ?
    `).run(status, admittedClass, studentId);

    revalidatePath(`/admin/results/${studentId}`);
    revalidatePath('/admin/results');
    revalidatePath('/admin/reports');
    revalidatePath('/admin');
    return { success: true };
}

// --- Session Management ---

export async function getSessions() {
    const db = getDb();
    return db.prepare(`
        SELECT s.id, s.name, s.is_active, s.created_at,
               COUNT(st.id) as student_count
        FROM sessions s
        LEFT JOIN students st ON st.session_id = s.id
        GROUP BY s.id
        ORDER BY s.created_at DESC
    `).all() as any[];
}

export async function getActiveSession() {
    const db = getDb();
    return db.prepare('SELECT * FROM sessions WHERE is_active = 1 LIMIT 1').get() as any;
}

export async function createSession(formData: FormData) {
    const db = getDb();
    const name = (formData.get('name') as string)?.trim();
    if (!name) return { success: false, error: 'Session name is required' };
    try {
        db.prepare('INSERT INTO sessions (name, is_active) VALUES (?, 0)').run(name);
        revalidatePath('/admin/settings');
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message?.includes('UNIQUE') ? 'A session with that name already exists' : 'Failed to create session' };
    }
}

export async function setActiveSession(formData: FormData) {
    const db = getDb();
    const id = parseInt(formData.get('session_id') as string);
    if (!id) return { success: false, error: 'Invalid session' };
    db.transaction(() => {
        db.prepare('UPDATE sessions SET is_active = 0').run();
        db.prepare('UPDATE sessions SET is_active = 1 WHERE id = ?').run(id);
    })();
    revalidatePath('/admin/settings');
    revalidatePath('/admin');
    revalidatePath('/admin/reports');
    revalidatePath('/admin/results');
    return { success: true };
}

export async function deleteSession(formData: FormData) {
    const db = getDb();
    const id = parseInt(formData.get('session_id') as string);
    const session = db.prepare('SELECT * FROM sessions WHERE id = ?').get(id) as any;
    if (!session) return { success: false, error: 'Session not found' };
    if (session.is_active) return { success: false, error: 'Cannot delete the active session' };
    const count = (db.prepare('SELECT COUNT(*) as c FROM students WHERE session_id = ?').get(id) as any).c;
    if (count > 0) return { success: false, error: `Cannot delete — ${count} student(s) belong to this session` };
    db.prepare('DELETE FROM sessions WHERE id = ?').run(id);
    revalidatePath('/admin/settings');
    return { success: true };
}

export async function toggleRegistration(formData: FormData) {
    const db = getDb();
    const studentId = parseInt(formData.get('student_id') as string);
    const current = (db.prepare('SELECT is_registered FROM students WHERE id = ?').get(studentId) as any)?.is_registered ?? 0;
    db.prepare('UPDATE students SET is_registered = ? WHERE id = ?').run(current ? 0 : 1, studentId);
    revalidatePath('/admin');
    revalidatePath('/admin/results');
    return { success: true };
}

// ============================================================================
// SESSION SEATS ACTIONS
// ============================================================================

export async function getSessionSeatsStats(sessionId: number) {
    const db = getDb();
    const classLevels = ['PlayGroup', 'KG 1', 'KG 2', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10'];
    
    const configuredRows = db.prepare('SELECT class_level, total_seats FROM session_seats WHERE session_id = ?').all(sessionId) as any[];
    const seatsMap = new Map(configuredRows.map((r: any) => [r.class_level, r.total_seats]));
    
    // Registered means: is_registered = 1 AND admitted_class is populated
    const registeredRows = db.prepare(`
        SELECT admitted_class, COUNT(*) as count 
        FROM students 
        WHERE session_id = ? AND is_registered = 1 AND admitted_class IS NOT NULL
        GROUP BY admitted_class
    `).all(sessionId) as any[];
    const registeredMap = new Map(registeredRows.map((r: any) => [r.admitted_class, r.count]));
    
    return classLevels.map(c => {
        const total = seatsMap.get(c) || 0;
        const registered = registeredMap.get(c) || 0;
        return {
            class_level: c,
            total_seats: total,
            registered: registered,
            balance: total - registered
        };
    });
}

export async function updateSessionSeat(sessionId: number, classLevel: string, totalSeats: number) {
    const db = getDb();
    const exists = db.prepare('SELECT 1 FROM session_seats WHERE session_id = ? AND class_level = ?').get(sessionId, classLevel);
    if (exists) {
        db.prepare('UPDATE session_seats SET total_seats = ? WHERE session_id = ? AND class_level = ?').run(totalSeats, sessionId, classLevel);
    } else {
        db.prepare('INSERT INTO session_seats (session_id, class_level, total_seats) VALUES (?, ?, ?)').run(sessionId, classLevel, totalSeats);
    }
    revalidatePath('/admin/settings');
    return { success: true };
}
