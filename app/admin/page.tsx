import { getDb } from '@/lib/db';
import { Users, FileText, CheckCircle, Clock } from 'lucide-react';
import Link from 'next/link';
import ResultsList from '@/components/ResultsList';

export const dynamic = 'force-dynamic';

export default function AdminDashboard() {
    const db = getDb();

    // Get active session
    const activeSession = db.prepare('SELECT * FROM sessions WHERE is_active = 1 LIMIT 1').get() as any;
    const sessionId = activeSession?.id;

    const studentCount = sessionId
        ? db.prepare('SELECT COUNT(*) as count FROM students WHERE session_id = ?').get(sessionId) as { count: number }
        : db.prepare('SELECT COUNT(*) as count FROM students').get() as { count: number };
    const questionCount = db.prepare('SELECT COUNT(*) as count FROM questions').get() as { count: number };
    const completedTests = sessionId
        ? db.prepare("SELECT COUNT(*) as count FROM students WHERE status = 'completed' AND session_id = ?").get(sessionId) as { count: number }
        : db.prepare("SELECT COUNT(*) as count FROM students WHERE status = 'completed'").get() as { count: number };
    const activeTests = sessionId
        ? db.prepare("SELECT COUNT(*) as count FROM students WHERE status = 'started' AND session_id = ?").get(sessionId) as { count: number }
        : db.prepare("SELECT COUNT(*) as count FROM students WHERE status = 'started'").get() as { count: number };

    const recentResults = sessionId ? db.prepare(`
        SELECT s.id, s.name, s.father_name, s.class_level, s.score, s.created_at, s.photo, s.admission_status, s.admitted_class, s.is_registered
        FROM students s
        WHERE status = 'completed' AND session_id = ?
        ORDER BY created_at DESC
        LIMIT 50
    `).all(sessionId) as any[] : db.prepare(`
        SELECT s.id, s.name, s.father_name, s.class_level, s.score, s.created_at, s.photo, s.admission_status, s.admitted_class, s.is_registered
        FROM students s
        WHERE status = 'completed'
        ORDER BY created_at DESC
        LIMIT 50
    `).all() as any[];

    const statCards = [
        { label: 'Students (Session)', value: studentCount.count, icon: Users, color: 'var(--primary)', bg: 'var(--primary-muted)' },
        { label: 'Total Questions', value: questionCount.count, icon: FileText, color: '#7c3aed', bg: '#f5f3ff' },
        { label: 'Completed Tests', value: completedTests.count, icon: CheckCircle, color: 'var(--success)', bg: 'var(--success-bg)' },
        { label: 'Active Tests', value: activeTests.count, icon: Clock, color: '#d97706', bg: '#fffbeb' },
    ];

    return (
        <div className="flex flex-col flex-1 min-h-0" style={{ gap: '1.5rem' }}>
            <div className="flex items-baseline gap-3">
                <h2 className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>Dashboard</h2>
                {activeSession && (
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: 'var(--primary-muted)', color: 'var(--primary)' }}>
                        📅 {activeSession.name}
                    </span>
                )}
            </div>
            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map(({ label, value, icon: Icon, color, bg }) => (
                    <div
                        key={label}
                        className="rounded-xl p-5 flex items-center gap-4 shadow-sm"
                        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
                    >
                        <div
                            className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                            style={{ background: bg }}
                        >
                            <Icon size={22} style={{ color }} />
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs font-medium truncate" style={{ color: 'var(--text-muted)' }}>{label}</p>
                            <p className="text-2xl font-black mt-0.5" style={{ color: 'var(--text-primary)' }}>{value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Recent Results — fills remaining page height */}
            <ResultsList initialResults={recentResults} title="Recent Results" showViewAll />
        </div>
    );
}
