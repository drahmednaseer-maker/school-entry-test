import { getDb } from '@/lib/db';
import TestClient from '@/components/TestClient';
import { redirect } from 'next/navigation';
import { getSettings } from '@/lib/actions';

export const dynamic = 'force-dynamic';

export default async function TestPage(props: { params: Promise<{ sessionId: string }> }) {
    const { sessionId } = await props.params;
    const db = getDb();

    // Fetch Session
    const session = db.prepare('SELECT * FROM test_sessions WHERE id = ?').get(sessionId) as any;

    if (!session) {
        redirect('/');
    }

    if (session.end_time) {
        redirect(`/test/${sessionId}/result`);
    }

    // Fetch Questions
    const questionIds = JSON.parse(session.question_ids);
    const questions = db.prepare(`SELECT * FROM questions WHERE id IN (${questionIds.join(',')})`).all() as any[];

    // Fetch Settings for branding
    const settings = await getSettings();

    // Convert options string to array and sort questions to match the order in question_ids (shuffled)
    const optionsParsedQuestions = questions.map(q => ({
        ...q,
        options: JSON.parse(q.options)
    }));

    // Sort based on question_ids order
    const orderedQuestions = questionIds.map((id: number) => optionsParsedQuestions.find((q: any) => q.id === id)).filter(Boolean);

    const startTimeStr = session.start_time;
    const startTimeMillis = new Date(startTimeStr + (startTimeStr.includes('Z') ? '' : 'Z')).getTime();

    return (
        <div className="min-h-screen bg-gray-50">
            <TestClient
                sessionId={Number(sessionId)}
                questions={orderedQuestions}
                startTime={startTimeMillis}
                schoolName={settings.school_name}
            />
        </div>
    );
}
