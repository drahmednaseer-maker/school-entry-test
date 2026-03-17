import { getDb } from '@/lib/db';
import { Users, FileText, CheckCircle, Clock } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default function AdminDashboard() {
    const db = getDb();

    const studentCount = db.prepare('SELECT COUNT(*) as count FROM students').get() as { count: number };
    const questionCount = db.prepare('SELECT COUNT(*) as count FROM questions').get() as { count: number };
    const completedTests = db.prepare("SELECT COUNT(*) as count FROM students WHERE status = 'completed'").get() as { count: number };
    const activeTests = db.prepare("SELECT COUNT(*) as count FROM students WHERE status = 'started'").get() as { count: number };

    const recentResults = db.prepare(`
        SELECT s.id, s.name, s.father_name, s.class_level, s.score, s.created_at, s.photo, s.admission_status
        FROM students s
        WHERE status = 'completed'
        ORDER BY created_at DESC
        LIMIT 50
    `).all() as any[];

    const statCards = [
        { label: 'Total Students', value: studentCount.count, icon: Users, color: 'var(--primary)', bg: 'var(--primary-muted)' },
        { label: 'Total Questions', value: questionCount.count, icon: FileText, color: '#7c3aed', bg: '#f5f3ff' },
        { label: 'Completed Tests', value: completedTests.count, icon: CheckCircle, color: 'var(--success)', bg: 'var(--success-bg)' },
        { label: 'Active Tests', value: activeTests.count, icon: Clock, color: '#d97706', bg: '#fffbeb' },
    ];

    return (
        <div className="flex flex-col flex-1 min-h-0" style={{ gap: '1.5rem' }}>
            <h2 className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>Dashboard</h2>

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
            <div
                className="rounded-xl overflow-hidden shadow-sm flex flex-col min-h-0 flex-1"
                style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
            >
                <div
                    className="px-5 py-4 border-b flex justify-between items-center"
                    style={{ borderColor: 'var(--border)', background: 'var(--bg-surface-2)' }}
                >
                    <h3 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Recent Results</h3>
                    <Link
                        href="/admin/results"
                        className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                        style={{ background: 'var(--primary-muted)', color: 'var(--primary)' }}
                    >
                        View All →
                    </Link>
                </div>

                <div className="overflow-x-auto flex-1 overflow-y-auto min-h-0">
                    <table className="w-full text-sm st-table">
                        <thead className="sticky top-0 z-10" style={{ background: 'var(--bg-surface-2)' }}>
                            <tr>
                                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>Student</th>
                                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide hidden md:table-cell" style={{ color: 'var(--text-secondary)' }}>Father's Name</th>
                                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide hidden sm:table-cell" style={{ color: 'var(--text-secondary)' }}>Class</th>
                                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>Score</th>
                                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide hidden sm:table-cell" style={{ color: 'var(--text-secondary)' }}>Admission</th>
                                <th className="px-5 py-3" />
                            </tr>
                        </thead>
                        <tbody>
                            {recentResults.length > 0 ? (
                                recentResults.map((student) => (
                                    <tr key={student.id}>
                                        <td className="px-5 py-3">
                                            <div className="flex items-center gap-2.5">
                                                {student.photo ? (
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img src={student.photo} alt={student.name} className="w-8 h-8 rounded-full object-cover border shrink-0" style={{ borderColor: 'var(--border)' }} />
                                                ) : (
                                                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
                                                        {student.name?.charAt(0)?.toUpperCase()}
                                                    </div>
                                                )}
                                                <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{student.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3 text-sm hidden md:table-cell" style={{ color: 'var(--text-secondary)' }}>{student.father_name}</td>
                                        <td className="px-5 py-3 text-xs hidden sm:table-cell" style={{ color: 'var(--text-secondary)' }}>{student.class_level}</td>
                                        <td className="px-5 py-3 font-bold text-sm" style={{ color: 'var(--success)' }}>{student.score} / 30</td>
                                        <td className="px-5 py-3 hidden sm:table-cell">
                                            {student.admission_status === 'granted' ? (
                                                <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: 'var(--success-bg)', color: 'var(--success)', border: '1px solid var(--success-border)' }}>Granted</span>
                                            ) : student.admission_status === 'not_granted' ? (
                                                <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: 'var(--danger-bg)', color: 'var(--danger)', border: '1px solid var(--danger-border)' }}>Not Granted</span>
                                            ) : (
                                                <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: 'var(--bg-surface-2)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>Pending</span>
                                            )}
                                        </td>
                                        <td className="px-5 py-3 text-right">
                                            <Link href={`/admin/results/${student.id}`} className="text-xs font-semibold px-2.5 py-1 rounded-lg" style={{ background: 'var(--primary-muted)', color: 'var(--primary)' }}>View</Link>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-sm" style={{ color: 'var(--text-muted)' }}>No tests completed yet.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
