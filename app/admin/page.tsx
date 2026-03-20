import { getDb } from '@/lib/db';
import { Users, FileText, CheckCircle, Clock } from 'lucide-react';
import Link from 'next/link';
import ResultsList from '@/components/ResultsList';
import ThemeToggle from '@/components/ThemeToggle';

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
        <div className="flex flex-col flex-1 min-h-0 space-y-6 h-full">
            {/* Premium Header Card */}
            <div className="rounded-2xl overflow-hidden shadow-sm border border-gray-100 shrink-0">
                <div className="p-7 text-white" style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)' }}>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <p className="text-blue-200 text-xs font-bold uppercase tracking-wider mb-1">Mardan Youth's Academy</p>
                            <h1 className="text-3xl font-black mb-1">Admin Dashboard</h1>
                            <p className="text-blue-100/80 font-medium text-sm">Real-time statistics and system overview</p>
                        </div>
                        {activeSession ? (
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2 bg-white/10 border border-white/20 px-4 py-2 rounded-xl backdrop-blur-sm">
                                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                                    <span className="text-sm font-bold text-white">Active Session: {activeSession.name}</span>
                                </div>
                                <div className="hidden md:block shrink-0"><ThemeToggle isPremium /></div>
                            </div>
                        ) : (
                            <div className="hidden md:block shrink-0"><ThemeToggle isPremium /></div>
                        )}
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 shrink-0">
                {statCards.map(({ label, value, icon: Icon, color, bg }) => (
                    <div
                        key={label}
                        className="rounded-2xl p-6 flex flex-col gap-4 shadow-sm relative overflow-hidden group"
                        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
                    >
                        <div className="flex items-center justify-between">
                            <div
                                className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                                style={{ background: bg }}
                            >
                                <Icon size={24} style={{ color }} />
                            </div>
                            <span className="text-3xl font-black" style={{ color: 'var(--text-primary)' }}>{value}</span>
                        </div>
                        <p className="text-sm font-bold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>{label}</p>
                        <div className="absolute -bottom-6 -right-6 opacity-5 group-hover:scale-110 transition-transform duration-500">
                             <Icon size={120} style={{ color }} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Recent Results */}
            <div
                className="flex-1 min-h-[400px] md:min-h-0 rounded-2xl shadow-sm overflow-hidden flex flex-col"
                style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
            >
                <ResultsList initialResults={recentResults} title="Recent Results" showViewAll />
            </div>
        </div>
    );
}
