import { getDb } from '@/lib/db';
import TestClient from '@/components/TestClient';
import { redirect } from 'next/navigation';
import { getSettings } from '@/lib/actions';

export const dynamic = 'force-dynamic';

export default async function TestPage(props: { params: Promise<{ sessionId: string }> }) {
    const { sessionId } = await props.params;
    const db = getDb();

    const session = db.prepare(`
        SELECT ts.*, s.name as student_name, s.father_name, s.photo as student_photo,
               s.class_level, s.gender
        FROM test_sessions ts
        JOIN students s ON ts.student_id = s.id
        WHERE ts.id = ?
    `).get(sessionId) as any;

    if (!session) redirect('/');
    if (session.end_time) redirect(`/test/${sessionId}/result`);

    const questionIds = JSON.parse(session.question_ids);
    const questions = db.prepare(`SELECT * FROM questions WHERE id IN (${questionIds.join(',')})`).all() as any[];
    const settings = await getSettings();

    const optionsParsedQuestions = questions.map(q => ({
        ...q,
        options: JSON.parse(q.options)
    }));

    const orderedQuestions = questionIds
        .map((id: number) => optionsParsedQuestions.find((q: any) => q.id === id))
        .filter(Boolean);

    const startTimeStr = session.start_time;
    const startTimeMillis = new Date(startTimeStr + (startTimeStr.includes('Z') ? '' : 'Z')).getTime();

    return (
        <div className="min-h-screen" style={{ background: 'var(--bg-page)' }}>
            <TestClient
                sessionId={Number(sessionId)}
                questions={orderedQuestions}
                startTime={startTimeMillis}
                schoolName={settings.school_name}
                studentName={session.student_name}
                fatherName={session.father_name}
                studentPhoto={session.student_photo || undefined}
                classLevel={session.class_level || ''}
                gender={session.gender || ''}
            />
        </div>
    );
}
