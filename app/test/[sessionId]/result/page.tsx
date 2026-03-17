import { getDb } from '@/lib/db';
import { CheckCircle, Home, Award } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import ThemeToggle from '@/components/ThemeToggle';

export const dynamic = 'force-dynamic';

export default async function ResultPage(props: { params: Promise<{ sessionId: string }> }) {
    const { sessionId } = await props.params;
    const db = getDb();

    const session = db.prepare('SELECT * FROM test_sessions WHERE id = ?').get(sessionId) as any;
    if (!session || !session.end_time) redirect(`/test/${sessionId}`);

    const student = db.prepare('SELECT * FROM students WHERE id = ?').get(session.student_id) as any;

    const totalQuestions = 30;
    const score = student.score || 0;
    const percentage = Math.round((score / totalQuestions) * 100);

    let grade = 'F';
    if (percentage >= 90) grade = 'A+';
    else if (percentage >= 80) grade = 'A';
    else if (percentage >= 70) grade = 'B';
    else if (percentage >= 60) grade = 'C';
    else if (percentage >= 50) grade = 'D';

    const gradeColor = grade === 'F' ? 'var(--danger)' : 'var(--success)';
    const passed = grade !== 'F';

    return (
        <div
            className="min-h-screen flex flex-col items-center justify-center p-4"
            style={{ background: 'var(--bg-page)' }}
        >
            {/* Theme toggle corner */}
            <div className="absolute top-4 right-4">
                <ThemeToggle />
            </div>

            <div
                className="w-full max-w-md rounded-2xl overflow-hidden shadow-xl"
                style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
            >
                {/* Top banner */}
                <div
                    className="p-8 text-center"
                    style={{
                        background: passed
                            ? 'linear-gradient(135deg, #064e3b, #059669)'
                            : 'linear-gradient(135deg, #7f1d1d, #dc2626)',
                    }}
                >
                    <div className="mx-auto w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mb-4 border-2 border-white/40">
                        {passed
                            ? <CheckCircle size={32} className="text-white" />
                            : <Award size={32} className="text-white" />
                        }
                    </div>
                    <h1 className="text-2xl font-black text-white mb-1">Test Completed!</h1>
                    <p className="text-white/80 text-sm">
                        Well done, {student.name}. Here are your results.
                    </p>
                </div>

                {/* Scores */}
                <div className="p-6 space-y-4">
                    {/* Student photo + name */}
                    {student.photo && (
                        <div className="flex justify-center mb-2">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={student.photo}
                                alt={student.name}
                                className="w-16 h-16 rounded-full object-cover border-2"
                                style={{ borderColor: 'var(--primary)' }}
                            />
                        </div>
                    )}

                    <div
                        className="rounded-xl p-5 grid grid-cols-3 gap-4 text-center"
                        style={{ background: 'var(--bg-surface-2)', border: '1px solid var(--border)' }}
                    >
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: 'var(--text-muted)' }}>Score</p>
                            <p className="text-2xl font-black" style={{ color: 'var(--primary)' }}>
                                {score}<span className="text-sm font-normal" style={{ color: 'var(--text-muted)' }}>/{totalQuestions}</span>
                            </p>
                        </div>
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: 'var(--text-muted)' }}>Percentage</p>
                            <p className="text-2xl font-black" style={{ color: passed ? 'var(--success)' : 'var(--danger)' }}>
                                {percentage}%
                            </p>
                        </div>
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: 'var(--text-muted)' }}>Grade</p>
                            <p className="text-3xl font-black" style={{ color: gradeColor }}>{grade}</p>
                        </div>
                    </div>

                    <p className="text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                        Your results have been recorded. You may now close this window or return home.
                    </p>

                    <Link
                        href="/"
                        className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-semibold text-sm text-white transition-all"
                        style={{ background: 'var(--primary)' }}
                    >
                        <Home size={16} /> Return to Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
