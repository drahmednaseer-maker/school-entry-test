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

export async function updatePassword(_currentState: any, formData: FormData) {
    const db = getDb();
    
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

export async function updateStudent(id: number, data: { name: string, fatherName: string, fatherMobile: string, classLevel: string, gender: string }) {
    const db = getDb();
    try {
        db.prepare(`
            UPDATE students 
            SET name = ?, father_name = ?, father_mobile = ?, class_level = ?, gender = ?
            WHERE id = ?
        `).run(data.name, data.fatherName, data.fatherMobile, data.classLevel, data.gender, id);
        
        revalidatePath('/admin/students');
        revalidatePath('/admin');
        return { success: true };
    } catch (error) {
        console.error('Error updating student:', error);
        return { success: false, error: 'Failed to update student' };
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
        master_password?: string;
        groq_api_key?: string;
        gemini_api_key?: string;
        active_ai_provider?: string;
        gemini_model?: string;
    };
}

export async function updateSettings(_currentState: any, formData: FormData) {
    const db = getDb();
    const schoolName = formData.get('school_name') as string;
    const easyPercent = parseInt(formData.get('easy_percent') as string);
    const mediumPercent = parseInt(formData.get('medium_percent') as string);
    const hardPercent = parseInt(formData.get('hard_percent') as string);
    const englishQuestions = parseInt(formData.get('english_questions') as string) || 10;
    const urduQuestions = parseInt(formData.get('urdu_questions') as string) || 10;
    const mathQuestions = parseInt(formData.get('math_questions') as string) || 10;

    const masterPassword = formData.get('master_password') as string || '1234';
    const groqApiKey = formData.get('groq_api_key') as string;
    const geminiApiKey = formData.get('gemini_api_key') as string;
    const activeAiProvider = formData.get('active_ai_provider') as string || 'groq';
    const geminiModel = formData.get('gemini_model') as string || 'gemini-1.5-flash';

    if (easyPercent + mediumPercent + hardPercent !== 100) {
        return { error: 'Percentages must total 100%' };
    }

    try {
        db.prepare(`
            UPDATE settings 
            SET school_name = ?, easy_percent = ?, medium_percent = ?, hard_percent = ?,
                english_questions = ?, urdu_questions = ?, math_questions = ?, 
                master_password = ?, groq_api_key = ?, gemini_api_key = ?, 
                active_ai_provider = ?, gemini_model = ?
            WHERE id = 1
        `).run(schoolName, easyPercent, mediumPercent, hardPercent, englishQuestions, urduQuestions, mathQuestions, masterPassword, groqApiKey, geminiApiKey, activeAiProvider, geminiModel);

        revalidatePath('/admin/settings');
        revalidatePath('/admin');
        revalidatePath('/');
        return { success: 'Settings updated successfully' };
    } catch (e: any) {
        console.error('Update settings error:', e);
        return { error: 'Failed: ' + e.message };
    }
}

export async function updateActiveAIProvider(provider: string) {
    const db = getDb();
    try {
        db.prepare('UPDATE settings SET active_ai_provider = ? WHERE id = 1').run(provider);
        revalidatePath('/admin/settings');
        return { success: 'AI Provider updated' };
    } catch (e: any) {
        return { error: 'Failed: ' + e.message };
    }
}

export async function updateGROQConfig(apiKey: string) {
    const db = getDb();
    try {
        db.prepare('UPDATE settings SET groq_api_key = ? WHERE id = 1').run(apiKey);
        revalidatePath('/admin/settings');
        return { success: 'GROQ key saved' };
    } catch (e: any) {
        return { error: 'Failed: ' + e.message };
    }
}

export async function updateGeminiConfig(apiKey: string, model: string) {
    const db = getDb();
    try {
        db.prepare('UPDATE settings SET gemini_api_key = ?, gemini_model = ? WHERE id = 1').run(apiKey, model);
        revalidatePath('/admin/settings');
        return { success: 'Gemini configuration saved' };
    } catch (e: any) {
        return { error: 'Failed: ' + e.message };
    }
}

export async function verifyMasterPassword(password: string) {
    const db = getDb();
    const settings = db.prepare('SELECT master_password FROM settings WHERE id = 1').get() as any;
    return password === settings?.master_password;
}

export async function getAIResultAssessment(studentId: number, mode: 'standard' | 'detailed' = 'standard') {
    const db = getDb();
    const student = db.prepare('SELECT * FROM students WHERE id = ?').get(studentId) as any;
    if (!student) return { error: 'Student not found' };

    const session = db.prepare('SELECT * FROM test_sessions WHERE student_id = ?').get(studentId) as any;
    if (!session || !session.answers) return { error: 'No test session results found' };

    const settings = await getSettings();
    const provider = settings.active_ai_provider || 'groq';
    const apiKey = provider === 'groq' ? settings.groq_api_key : settings.gemini_api_key;

    if (!apiKey) return { error: `${provider.toUpperCase()} API Key is not configured in Settings.` };

    const questionIds = JSON.parse(session.question_ids);
    const answers = JSON.parse(session.answers);
    const questions = db.prepare(`SELECT * FROM questions WHERE id IN (${questionIds.join(',')})`).all() as any[];
    
    // Performance Summary
    const subjects = ['English', 'Urdu', 'Math'];
    const summary = subjects.map(sub => {
        const subQs = questions.filter(q => q.subject === sub);
        const total = subQs.length;
        const correct = subQs.filter(q => answers[q.id] === q.correct_option).length;
        return { subject: sub, total, correct };
    });

    const totalQuestions = questionIds.length;
    const totalCorrect = student.score;
    const percentage = (totalCorrect / totalQuestions) * 100;

    let prompt = '';

    if (mode === 'detailed') {
        const startTime = new Date(session.start_time).getTime();
        const endTime = new Date(session.end_time).getTime();
        const timeTakenMinutes = Math.round((endTime - startTime) / 60000);
        
        const timeClause = timeTakenMinutes < 20 
            ? `The student completed the 30-minute test in only ${timeTakenMinutes} minutes, which indicates they may have rushed. Please discuss this rushing behavior in the analysis.` 
            : `The student took ${timeTakenMinutes} minutes, which is an adequate use of the 30-minute time limit. You do not need to mention time management.`;

        const detailedQA = questions.map((q, index) => {
            const stAns = answers[q.id];
            const isCorrect = stAns === q.correct_option;
            // Shortened text to save tokens, but enough for skill analysis
            const qStr = q.question_text.substring(0, 100).replace(/\n/g, ' '); 
            return `Q${index+1} (${q.subject} - ${q.difficulty}): Status: ${isCorrect ? 'Correct' : 'Incorrect'}. Content: ${qStr}...`;
        }).join('\n          ');

        prompt = `
        Act as a Master Education Assessment Analyst for ${settings.school_name}. 
        Perform a Deep, Comprehensive, and Highly Detailed AI Assessment for the following student:
        
        Student Name: ${student.name}
        Gender: ${student.gender}
        Class Seeking Admission In: ${student.class_level}
        
        TEST PERFORMANCE DATA:
        - Total Score: ${totalCorrect} / ${totalQuestions} (${percentage.toFixed(1)}%)
        - Performance Breakdown:
          ${summary.map(s => `${s.subject}: ${s.correct}/${s.total}`).join('\n          ')}
          
        TIME MANAGEMENT:
        ${timeClause}
        
        DETAILED QUESTION RESPONSES:
        ${detailedQA}
        
        CRITICAL INSTRUCTIONS FOR THIS REPORT (YOU MUST FOLLOW THESE STRICTLY):
        1. LENGTH & DEPTH: This is a DETAILED assessment. Your response MUST be comprehensive, highly detailed, and span at least 400-600 words. Do NOT provide brief summaries. Each section must have deep, insightful paragraphs.
        2. HEADINGS: You MUST use the exact markdown headings requested below. Do NOT use standard bullet points for headings. Do NOT use ** for headings. YOU MUST prefix sections with '#### '.
        3. TONE: Professional, highly analytical, and empathetic, like a seasoned educator evaluating specific skills to parents and administrators.
        4. ANALYSIS: Do not quote the questions verbatim. Instead, synthesize the data to explain the student's mastery of specific logical, linguistic, or mathematical concepts. If they rushed, analyze how that impacted their correctness.
        5. Use the student's name naturally throughout the deep analysis.
        
        REQUIRED REPORT STRUCTURE:
        
        #### DETAILED PERFORMANCE ANALYSIS:
        (Write a multi-paragraph deep dive into their overall skills across subjects. Discuss their time management if applicable, and how their pace correlated with their errors or successes.)
        
        #### STRENGTH AREAS:
        (Write a detailed paragraph identifying 2-3 specific academic concepts they have mastered, referencing their successful subjects.)
        
        #### WEAKNESS AREAS:
        (Write a detailed paragraph identifying 2-3 specific concepts they struggled with, analyzing patterns in what they got wrong.)
        
        #### SPECIFIC RECOMMENDATIONS:
        (Provide actionable, detailed advice on exact topics or study habits the student needs to focus on to improve.)
        
        #### ADMISSION DECISION SUGGESTION:
        (Conclude with a firm 1-2 sentence recommendation: Grant admission, Offer lower class, or Deny admission.)
        
        FORMAT YOUR RESPONSE EXACTLY LIKE THIS:
        Do NOT wrap the response in markdown code blocks like \`\`\`markdown.
        Return ONLY the raw report text. 
        Ensure you use EXACTLY the '#### ' markdown headers so the system can parse the sections.
        `;
    } else {
        prompt = `
        Act as an expert Academic Evaluator for ${settings.school_name}. 
        Perform a professional, personalized assessment for the following student:
        
        Sudent Name: ${student.name}
        Gender: ${student.gender}
        Class Seeking Admission In: ${student.class_level}
        
        TEST PERFORMANCE DATA:
        - Total Score: ${totalCorrect} / ${totalQuestions} (${percentage.toFixed(1)}%)
        - Performance Breakdown:
          ${summary.map(s => `${s.subject}: ${s.correct}/${s.total}`).join('\n          ')}
        
        GUIDELINES FOR REPORT:
        1. Use the student's name (${student.name}) naturally throughout the report.
        2. NO EMOJIS ALLOWED at all.
        3. Professional, academic, and encouraging tone.
        4. Admission Threshold: 50%.
        5. DO NOT use ALL CAPS for the body text. Use standard sentence casing and proper Title Case for names.
        6. EACH SECTION MUST START WITH THE HEADING IN THE EXACT FORMAT '#### HEADING_NAME:' (bold markdown).
        
        STRUCTURE:
        - #### GENERAL DISCUSSION: One professional paragraph about their overall performance.
        - #### STRENGTHS: Key areas where they excelled.
        - #### WEAKNESSES: Areas requiring improvement.
        - #### RECOMMENDATION: A firm recommendation on suitability. 
          Suggest one of these: 
          - Grant admission in requested class (${student.class_level}).
          - Offer admission in one step lower class (if performance is weak but promising).
          - Do not grant admission (if performance is far below potential).
        
        FORMAT:
        Return ONLY the report text with clear headings prefixed with '#### ' and ending with ':'.
        `;
    }

    try {
        let assessment = '';
        if (provider === 'groq') {
            const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: 'llama-3.3-70b-versatile',
                    messages: [{ role: 'user', content: prompt }],
                    temperature: 0.7
                })
            });

            const data = await response.json();
            if (data.error) throw new Error(data.error.message);
            assessment = data.choices[0].message.content;
        } else {
            // Gemini API
            const model = settings.gemini_model || 'gemini-2.5-flash';
            const apiVersion = model.includes('exp') || (model.includes('2.0') && !model.includes('lite')) ? 'v1beta' : 'v1';
            const response = await fetch(`https://generativelanguage.googleapis.com/${apiVersion}/models/${model}:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: {
                        temperature: 0.7,
                        maxOutputTokens: 8192
                    }
                })
            });

            const data = await response.json();
            if (data.error) {
                // Try fallback to v1beta if v1 failed (or vice versa)
                if (data.error.status === 'NOT_FOUND' || data.error.code === 404) {
                    const fallbackVersion = apiVersion === 'v1' ? 'v1beta' : 'v1';
                    const fallbackResponse = await fetch(`https://generativelanguage.googleapis.com/${fallbackVersion}/models/${model}:generateContent?key=${apiKey}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            contents: [{ parts: [{ text: prompt }] }],
                            generationConfig: { temperature: 0.7, maxOutputTokens: 8192 }
                        })
                    });
                    const fallbackData = await fallbackResponse.json();
                    if (fallbackData.error) throw new Error(fallbackData.error.message);
                    assessment = fallbackData.candidates[0].content.parts[0].text;
                } else {
                    throw new Error(data.error.message);
                }
            } else {
                assessment = data.candidates[0].content.parts[0].text;
            }
        }
        
        return { assessment };
    } catch (e: any) {
        console.error('AI Assessment Error:', e);
        return { error: 'Failed to generate AI assessment: ' + e.message };
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

// Save in-progress answers to server (crash recovery backup)
export async function saveProgress(sessionId: number, answers: Record<number, number>) {
    const db = getDb();
    const session = db.prepare('SELECT id, end_time FROM test_sessions WHERE id = ?').get(sessionId) as any;
    if (!session || session.end_time) return { success: false };
    db.prepare('UPDATE test_sessions SET answers = ? WHERE id = ?').run(JSON.stringify(answers), sessionId);
    return { success: true };
}

// Read saved draft answers (used when localStorage is unavailable, e.g. different device)
export async function getProgress(sessionId: number) {
    const db = getDb();
    const session = db.prepare('SELECT answers FROM test_sessions WHERE id = ? AND end_time IS NULL').get(sessionId) as any;
    if (!session?.answers) return { answers: {} };
    try {
        return { answers: JSON.parse(session.answers) as Record<number, number> };
    } catch {
        return { answers: {} };
    }
}

// --- Admission Form ---

export async function getStudentById(id: number) {
    const db = getDb();
    const student = db.prepare(`
        SELECT s.*, (
            SELECT end_time 
            FROM test_sessions 
            WHERE student_id = s.id AND end_time IS NOT NULL 
            ORDER BY end_time DESC 
            LIMIT 1
        ) as system_test_date
        FROM students s
        WHERE s.id = ?
    `).get(id) as any;
    return student;
}

export async function saveAdmissionForm(studentId: number, data: Record<string, any>) {
    const db = getDb();
    // SQLite cannot bind booleans or undefined — convert them
    const sanitize = (v: any) => {
        if (v === undefined || v === '') return null;
        if (typeof v === 'boolean') return v ? 1 : 0;
        return v;
    };
    const allowed = [
        'name', 'father_name', 'father_mobile', 'class_level', 'gender',
        'dob', 'guardian_name', 'father_cnic', 'previous_school', 'previous_class',
        'slc_no', 'slc_date', 'reason_for_leaving', 'admission_class', 'occupation',
        'country', 'province', 'district', 'tehsil', 'city', 'street_address',
        'contact1_name', 'contact1_phone', 'contact1_whatsapp',
        'contact2_name', 'contact2_phone', 'contact2_whatsapp',
        'contact3_name', 'contact3_phone', 'contact3_whatsapp',
        'reg_no', 'date_of_test', 'date_of_admission', 'photo',
        'is_intl_wa', 'intl_wa_name', 'intl_wa_phone', 'intl_wa_country', 'intl_wa_verified',
        'admin_notes',
    ];
    const sets: string[] = [];
    const vals: any[] = [];
    for (const key of allowed) {
        if (key in data) {
            sets.push(`${key} = ?`);
            vals.push(sanitize(data[key]));
        }
    }
    if (sets.length === 0) return { success: false, error: 'No data' };
    vals.push(studentId);
    try {
        db.prepare(`UPDATE students SET ${sets.join(', ')} WHERE id = ?`).run(...vals);
        revalidatePath('/admin/students');
        revalidatePath(`/admin/students/${studentId}/admission`);
        return { success: true };
    } catch (error: any) {
        console.error('[saveAdmissionForm] Error:', error);
        return { success: false, error: error.message || 'Database update failed' };
    }
}

export async function createFullStudent(data: Record<string, any>) {
    const db = getDb();
    const accessCode = Math.floor(100000 + Math.random() * 900000).toString();
    // SQLite cannot bind booleans or undefined — convert them
    const sanitize = (v: any) => {
        if (v === undefined || v === '') return null;
        if (typeof v === 'boolean') return v ? 1 : 0;
        return v;
    };
    // Get active session
    const activeSession = db.prepare('SELECT id FROM sessions WHERE is_active = 1 LIMIT 1').get() as any;
    const sessionId = activeSession?.id || null;

    const allowed = [
        'name', 'father_name', 'father_mobile', 'class_level', 'gender',
        'dob', 'guardian_name', 'father_cnic', 'previous_school', 'previous_class',
        'slc_no', 'slc_date', 'reason_for_leaving', 'admission_class', 'occupation',
        'country', 'province', 'district', 'tehsil', 'city', 'street_address',
        'contact1_name', 'contact1_phone', 'contact1_whatsapp',
        'contact2_name', 'contact2_phone', 'contact2_whatsapp',
        'contact3_name', 'contact3_phone', 'contact3_whatsapp',
        'reg_no', 'date_of_test', 'date_of_admission', 'photo',
        'is_intl_wa', 'intl_wa_name', 'intl_wa_phone', 'intl_wa_country', 'intl_wa_verified',
        'admin_notes',
    ];

    const keys = ['access_code', 'session_id'];
    const placeholders = ['?', '?'];
    const vals: any[] = [accessCode, sessionId];

    for (const key of allowed) {
        if (key in data) {
            keys.push(key);
            placeholders.push('?');
            vals.push(sanitize(data[key]));
        }
    }

    try {
        db.prepare(`
            INSERT INTO students (${keys.join(', ')}) 
            VALUES (${placeholders.join(', ')})
        `).run(...vals);
        revalidatePath('/admin/students');
        return { success: true, code: accessCode };
    } catch (error: any) {
        console.error('Error creating student:', error);
        return { success: false, error: error.message || 'Failed to create student' };
    }
}


export async function setAdmissionStatus(formData: FormData) {
    const db = getDb();
    const studentId = parseInt(formData.get('student_id') as string);
    const status = formData.get('status') as string; // 'granted' | 'not_granted'
    const admittedClass = formData.get('admitted_class') as string || null;
    const adminNotes = formData.get('admin_notes') as string || null;

    db.prepare(`
        UPDATE students
        SET admission_status = ?, admitted_class = ?, admin_notes = ?
        WHERE id = ?
    `).run(status, admittedClass, adminNotes, studentId);

    revalidatePath(`/admin/results/${studentId}`);
    revalidatePath('/admin/results');
    revalidatePath('/admin/reports');
    revalidatePath('/admin');
    return { success: true };
}

export async function updateAdminNotes(formData: FormData) {
    const db = getDb();
    const studentId = parseInt(formData.get('student_id') as string);
    const adminNotes = formData.get('admin_notes') as string || null;

    db.prepare(`
        UPDATE students
        SET admin_notes = ?
        WHERE id = ?
    `).run(adminNotes, studentId);

    revalidatePath(`/admin/results/${studentId}`);
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
        revalidatePath('/admin/reports');
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
    revalidatePath('/admin/reports');
    return { success: true };
}

export async function renameSession(formData: FormData) {
    const db = getDb();
    const id = parseInt(formData.get('session_id') as string);
    const name = (formData.get('name') as string)?.trim();
    if (!id || !name) return { success: false, error: 'Invalid data' };
    
    const session = db.prepare('SELECT * FROM sessions WHERE id = ?').get(id) as any;
    if (!session) return { success: false, error: 'Session not found' };
    if (session.is_active) return { success: false, error: 'Cannot edit the active session' };
    
    const count = (db.prepare('SELECT COUNT(*) as c FROM students WHERE session_id = ?').get(id) as any).c;
    if (count > 0) return { success: false, error: `Cannot edit — ${count} student(s) belong to this session` };
    
    try {
        db.prepare('UPDATE sessions SET name = ? WHERE id = ?').run(name, id);
        revalidatePath('/admin/settings');
        revalidatePath('/admin/reports');
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message?.includes('UNIQUE') ? 'A session with that name already exists' : 'Failed to rename session' };
    }
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
    
    const configuredRows = db.prepare('SELECT class_level, total_seats, male_seats, female_seats FROM session_seats WHERE session_id = ?').all(sessionId) as any[];
    const seatsMap = new Map(configuredRows.map((r: any) => [r.class_level, r]));
    
    // Registered means: is_registered = 1 AND admitted_class is populated
    const registeredRows = db.prepare(`
        SELECT admitted_class, 
               SUM(CASE WHEN gender = 'Male' THEN 1 ELSE 0 END) as male_count,
               SUM(CASE WHEN gender = 'Female' THEN 1 ELSE 0 END) as female_count,
               COUNT(*) as total_count 
        FROM students 
        WHERE session_id = ? AND is_registered = 1 AND admitted_class IS NOT NULL
        GROUP BY admitted_class
    `).all(sessionId) as any[];
    const registeredMap = new Map(registeredRows.map((r: any) => [r.admitted_class, r]));
    
    return classLevels.map(c => {
        const conf = seatsMap.get(c) || { total_seats: 0, male_seats: 0, female_seats: 0 };
        const reg = registeredMap.get(c) || { male_count: 0, female_count: 0, total_count: 0 };
        return {
            class_level: c,
            total_seats: conf.total_seats,
            male_seats: conf.male_seats,
            female_seats: conf.female_seats,
            registered_total: reg.total_count,
            registered_male: reg.male_count,
            registered_female: reg.female_count,
            balance_total: conf.total_seats - reg.total_count,
            balance_male: conf.male_seats - reg.male_count,
            balance_female: conf.female_seats - reg.female_count
        };
    });
}

export async function updateSessionSeat(sessionId: number, classLevel: string, field: 'total_seats' | 'male_seats' | 'female_seats', value: number) {
    const db = getDb();
    const exists = db.prepare('SELECT 1 FROM session_seats WHERE session_id = ? AND class_level = ?').get(sessionId, classLevel);
    
    const safeField = ['total_seats', 'male_seats', 'female_seats'].includes(field) ? field : 'total_seats';

    if (exists) {
        db.prepare(`UPDATE session_seats SET ${safeField} = ? WHERE session_id = ? AND class_level = ?`).run(value, sessionId, classLevel);
    } else {
        db.prepare(`INSERT INTO session_seats (session_id, class_level, ${safeField}) VALUES (?, ?, ?)`).run(sessionId, classLevel, value);
    }
    revalidatePath('/admin/settings');
    revalidatePath('/admin/reports');
    return { success: true };
}

// ============================================================================
// SLC ACTIONS
// ============================================================================

export async function addSlc(formData: FormData) {
    const db = getDb();
    const name = formData.get('name') as string;
    const fatherName = formData.get('father_name') as string;
    const classLevel = formData.get('class_level') as string;
    const section = formData.get('section') as string;
    const gender = formData.get('gender') as string;
    const dateIssued = formData.get('date_issued') as string;

    if (!name || !classLevel || !gender || !dateIssued) {
        return { success: false, error: 'Required fields missing' };
    }

    const activeSession = db.prepare('SELECT id FROM sessions WHERE is_active = 1 LIMIT 1').get() as any;
    const sessionId = activeSession?.id || null;

    db.transaction(() => {
        // 1. Insert SLC record
        db.prepare(`
            INSERT INTO slcs (session_id, name, father_name, class_level, section, gender, date_issued)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(sessionId, name, fatherName, classLevel, section, gender, dateIssued);

        // 2. Update session seats for active session
        if (sessionId) {
            const sid = sessionId;
            const existing = db.prepare('SELECT * FROM session_seats WHERE session_id = ? AND class_level = ?').get(sid, classLevel) as any;
            
            if (existing) {
                const total = (existing.total_seats || 0) + 1;
                const male = (existing.male_seats || 0) + (gender === 'Male' ? 1 : 0);
                const female = (existing.female_seats || 0) + (gender === 'Female' ? 1 : 0);
                
                db.prepare(`
                    UPDATE session_seats 
                    SET total_seats = ?, male_seats = ?, female_seats = ?
                    WHERE session_id = ? AND class_level = ?
                `).run(total, male, female, sid, classLevel);
            } else {
                // If no capacity row exists yet, create one with 1 seat
                db.prepare(`
                    INSERT INTO session_seats (session_id, class_level, total_seats, male_seats, female_seats)
                    VALUES (?, ?, ?, ?, ?)
                `).run(sid, classLevel, 1, gender === 'Male' ? 1 : 0, gender === 'Female' ? 1 : 0);
            }
        }
    })();

    revalidatePath('/admin/slc');
    revalidatePath('/admin/reports');
    return { success: true };
}

export async function getSlcs() {
    const db = getDb();
    return db.prepare('SELECT * FROM slcs ORDER BY date_issued DESC, created_at DESC').all() as any[];
}

export async function getSlcStats(sessionId: number) {
    const db = getDb();
    const total = (db.prepare('SELECT COUNT(*) as count FROM slcs WHERE session_id = ?').get(sessionId) as any).count || 0;
    const classDistribution = db.prepare(`
        SELECT class_level, COUNT(*) as count 
        FROM slcs 
        WHERE session_id = ? 
        GROUP BY class_level 
        ORDER BY count DESC
    `).all(sessionId) as any[];

    return { total, classDistribution };
}

export async function deleteSlc(id: number) {
    const db = getDb();
    const slc = db.prepare('SELECT * FROM slcs WHERE id = ?').get(id) as any;
    if (!slc) return { success: false, error: 'SLC record not found' };

    try {
        db.transaction(() => {
            // 1. Delete the record
            db.prepare('DELETE FROM slcs WHERE id = ?').run(id);

            // 2. Reverse the seat increment if session exists
            if (slc.session_id) {
                const seats = db.prepare('SELECT * FROM session_seats WHERE session_id = ? AND class_level = ?').get(slc.session_id, slc.class_level) as any;
                if (seats) {
                    db.prepare(`
                        UPDATE session_seats 
                        SET total_seats = ?, male_seats = ?, female_seats = ?
                        WHERE id = ?
                    `).run(
                        Math.max(0, (seats.total_seats || 0) - 1),
                        Math.max(0, (seats.male_seats || 0) - (slc.gender === 'Male' ? 1 : 0)),
                        Math.max(0, (seats.female_seats || 0) - (slc.gender === 'Female' ? 1 : 0)),
                        seats.id
                    );
                }
            }
        })();

        revalidatePath('/admin/slc');
        revalidatePath('/admin/reports');
        return { success: true };
    } catch (error) {
        console.error('Error deleting SLC:', error);
        return { success: false, error: 'Failed to delete SLC record' };
    }
}

export async function updateSlc(id: number, formData: FormData) {
    const db = getDb();
    const oldSlc = db.prepare('SELECT * FROM slcs WHERE id = ?').get(id) as any;
    if (!oldSlc) return { success: false, error: 'SLC record not found' };

    const name = formData.get('name') as string;
    const fatherName = formData.get('father_name') as string;
    const classLevel = formData.get('class_level') as string;
    const section = formData.get('section') as string;
    const gender = formData.get('gender') as string;
    const dateIssued = formData.get('date_issued') as string;

    try {
        db.transaction(() => {
            // 1. Update the record
            db.prepare(`
                UPDATE slcs 
                SET name = ?, father_name = ?, class_level = ?, section = ?, gender = ?, date_issued = ?
                WHERE id = ?
            `).run(name, fatherName, classLevel, section, gender, dateIssued, id);

            // 2. Handle seat adjustments if class or gender changed
            if (oldSlc.session_id && (oldSlc.class_level !== classLevel || oldSlc.gender !== gender)) {
                // Decrement old seats
                const oldSeats = db.prepare('SELECT * FROM session_seats WHERE session_id = ? AND class_level = ?').get(oldSlc.session_id, oldSlc.class_level) as any;
                if (oldSeats) {
                    db.prepare(`
                        UPDATE session_seats 
                        SET total_seats = ?, male_seats = ?, female_seats = ?
                        WHERE id = ?
                    `).run(
                        Math.max(0, (oldSeats.total_seats || 0) - 1),
                        Math.max(0, (oldSeats.male_seats || 0) - (oldSlc.gender === 'Male' ? 1 : 0)),
                        Math.max(0, (oldSeats.female_seats || 0) - (oldSlc.gender === 'Female' ? 1 : 0)),
                        oldSeats.id
                    );
                }

                // Increment new seats
                const newSeats = db.prepare('SELECT * FROM session_seats WHERE session_id = ? AND class_level = ?').get(oldSlc.session_id, classLevel) as any;
                if (newSeats) {
                    db.prepare(`
                        UPDATE session_seats 
                        SET total_seats = ?, male_seats = ?, female_seats = ?
                        WHERE id = ?
                    `).run(
                        (newSeats.total_seats || 0) + 1,
                        (newSeats.male_seats || 0) + (gender === 'Male' ? 1 : 0),
                        (newSeats.female_seats || 0) + (gender === 'Female' ? 1 : 0),
                        newSeats.id
                    );
                } else {
                    db.prepare(`
                        INSERT INTO session_seats (session_id, class_level, total_seats, male_seats, female_seats)
                        VALUES (?, ?, ?, ?, ?)
                    `).run(oldSlc.session_id, classLevel, 1, gender === 'Male' ? 1 : 0, gender === 'Female' ? 1 : 0);
                }
            }
        })();

        revalidatePath('/admin/slc');
        revalidatePath('/admin/reports');
        return { success: true };
    } catch (error) {
        console.error('Error updating SLC:', error);
        return { success: false, error: 'Failed to update SLC record' };
    }
}
