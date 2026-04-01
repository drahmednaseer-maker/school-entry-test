import { getDb } from '@/lib/db';
import DetailedRecordPrint from '@/components/DetailedRecordPrint';

export const dynamic = 'force-dynamic';

export default async function PrintReportsPage({
    searchParams,
}: {
    searchParams: Promise<{ from?: string; to?: string; class?: string }>;
}) {
    const { from, to, class: classFilter } = await searchParams;
    const db = getDb();

    if (!from || !to) {
        return (
            <div className="p-10 text-center font-bold text-red-600">
                Invalid Parameters: Please provide 'from' and 'to' date ranges.
            </div>
        );
    }

    // Prepare filter query
    let query = `
        SELECT * FROM students 
        WHERE status = 'completed' 
        AND date(created_at) >= date(?) 
        AND date(created_at) <= date(?)
    `;
    const params: any[] = [from, to];

    if (classFilter && classFilter !== 'All') {
        query += " AND class_level = ?";
        params.push(classFilter);
    }

    query += " ORDER BY class_level, name ASC";

    const students = db.prepare(query).all(...params) as any[];

    if (students.length === 0) {
        return (
            <div className="p-20 text-center flex flex-col items-center gap-4">
                <h1 className="text-2xl font-black">No Records Found</h1>
                <p className="text-slate-500 font-medium">No completed tests were found for the selected date range ({from} to {to}).</p>
                <p className="px-6 py-2 bg-slate-100 text-slate-400 rounded-xl font-bold no-print">
                    Navigation Disabled in Print View
                </p>
            </div>
        );
    }

    // Fetch all sessions for these students
    const studentIds = students.map(s => s.id);
    const sessionsList = db.prepare(`
        SELECT * FROM test_sessions 
        WHERE student_id IN (${studentIds.join(',')})
    `).all() as any[];

    const sessionsMap: Record<number, any> = {};
    const allQuestionIds = new Set<number>();

    sessionsList.forEach(session => {
        sessionsMap[session.student_id] = session;
        const qids = JSON.parse(session.question_ids || '[]');
        qids.forEach((id: number) => allQuestionIds.add(id));
    });

    // Fetch all unique questions in one go
    const questionsList = allQuestionIds.size > 0 
        ? db.prepare(`SELECT * FROM questions WHERE id IN (${Array.from(allQuestionIds).join(',')})`).all() as any[]
        : [];

    const questionsMap: Record<number, any> = {};
    questionsList.forEach(q => {
        questionsMap[q.id] = q;
    });

    const settings = db.prepare('SELECT school_name FROM settings WHERE id = 1').get() as { school_name: string };

    return (
        <div className="min-h-screen bg-white">
            {/* Auto Print Trigger (Capped to avoid freezing on too many records during dev) */}
            <script dangerouslySetInnerHTML={{ __html: `
                window.onload = function() {
                    setTimeout(() => {
                        window.print();
                    }, 1000);
                }
            `}} />
            
            <DetailedRecordPrint 
                students={students} 
                sessions={sessionsMap} 
                questions={questionsMap}
                schoolName={settings.school_name}
            />
        </div>
    );
}
