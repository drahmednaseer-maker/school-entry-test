import { getDb } from '@/lib/db';
import { BarChart2, Users, CheckCircle, XCircle, Clock, TrendingUp, FileText } from 'lucide-react';
import ReportCharts from '@/components/ReportCharts';
import SessionManager from '@/components/SessionManager';
import SessionSeats from '@/components/SessionSeats';
import { getSessions, getSlcStats } from '@/lib/actions';

export const dynamic = 'force-dynamic';

export default async function ReportsPage() {
    const db = getDb();

    // Active session
    const activeSession = db.prepare('SELECT * FROM sessions WHERE is_active = 1 LIMIT 1').get() as any;
    const sid = activeSession?.id;
    const sessionFilter = sid ? 'AND session_id = ?' : '';
    const sessionArgs = sid ? [sid] : [];
    
    // All sessions for manager
    const sessions = db.prepare(`
        SELECT s.*, (SELECT COUNT(*) FROM students WHERE session_id = s.id) as student_count
        FROM sessions s ORDER BY s.created_at DESC
    `).all() as any[];

    // Summary stats
    const totalCompleted = (db.prepare(`SELECT COUNT(*) as c FROM students WHERE status='completed' ${sessionFilter}`).get(...sessionArgs) as any).c;
    const totalGranted = (db.prepare(`SELECT COUNT(*) as c FROM students WHERE admission_status='granted' ${sessionFilter}`).get(...sessionArgs) as any).c;
    const totalNotGranted = (db.prepare(`SELECT COUNT(*) as c FROM students WHERE admission_status='not_granted' ${sessionFilter}`).get(...sessionArgs) as any).c;
    const pendingDecision = (db.prepare(`SELECT COUNT(*) as c FROM students WHERE status='completed' AND (admission_status IS NULL OR admission_status='') ${sessionFilter}`).get(...sessionArgs) as any).c;

    const seatsQuery = db.prepare(`
        SELECT SUM(
            CASE WHEN class_level LIKE 'Grade%' THEN male_seats + female_seats
            ELSE total_seats END
        ) as total
        FROM session_seats
        WHERE session_id = ?
    `).get(sid) as any;
    const totalAvailableSeats = seatsQuery?.total || 0;

    const settingsRow = (db.prepare('SELECT english_questions, urdu_questions, math_questions FROM settings WHERE id=1').get() as any);
    const totalQuestions = settingsRow ? (settingsRow.english_questions + settingsRow.urdu_questions + settingsRow.math_questions) : 30;

    // Class-wise data
    const classRows = db.prepare(`
        SELECT class_level,
               COUNT(*) as count,
               SUM(CASE WHEN admission_status='granted' THEN 1 ELSE 0 END) as granted,
               SUM(CASE WHEN admission_status='not_granted' THEN 1 ELSE 0 END) as not_granted,
               AVG(CASE WHEN score IS NOT NULL THEN CAST(score AS REAL) / ? * 100 ELSE NULL END) as avg_pct
        FROM students WHERE status='completed' AND class_level IS NOT NULL ${sessionFilter}
        GROUP BY class_level ORDER BY class_level
    `).all(totalQuestions, ...sessionArgs) as any[];

    // Pie data
    const pieData = [
        { name: 'Granted', value: totalGranted, color: '#16a34a' },
        { name: 'Not Granted', value: totalNotGranted, color: '#dc2626' },
        { name: 'Pending', value: pendingDecision, color: '#d97706' },
    ].filter(d => d.value > 0);

    // Gender data
    const maleCount = (db.prepare(`SELECT COUNT(*) as c FROM students WHERE gender='Male' AND status='completed' ${sessionFilter}`).get(...sessionArgs) as any).c;
    const femaleCount = (db.prepare(`SELECT COUNT(*) as c FROM students WHERE gender='Female' AND status='completed' ${sessionFilter}`).get(...sessionArgs) as any).c;
    const genderData = [{ name: 'Applicants', Male: maleCount, Female: femaleCount }];

    // Time data (entire session)
    const timeRows = db.prepare(`
        SELECT DATE(created_at) as date, COUNT(*) as count
        FROM students WHERE status='completed'
        ${sessionFilter}
        GROUP BY DATE(created_at) ORDER BY date
    `).all(...sessionArgs) as any[];
    const timeData = timeRows.map(r => ({ date: r.date?.slice(5), count: r.count }));

    const slcStats = await getSlcStats(sid || 0);

    const statCards = [
        { label: 'Total Tests Taken', value: totalCompleted, icon: Users, color: 'var(--primary)', bg: 'var(--primary-muted)' },
        { label: 'Admission Granted', value: totalGranted, icon: CheckCircle, color: 'var(--success)', bg: 'var(--success-bg)' },
        { label: 'Not Granted', value: totalNotGranted, icon: XCircle, color: 'var(--danger)', bg: 'var(--danger-bg)' },
        { label: 'Total SLCs Issued', value: slcStats.total, icon: FileText, color: '#ec4899', bg: '#fdf2f8' },
        { label: 'Available Admission Seats', value: totalAvailableSeats, icon: TrendingUp, color: '#7c3aed', bg: '#f5f3ff' },
    ];

    return (
        <div className="flex-1 overflow-y-auto space-y-8">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--primary-muted)' }}>
                    <BarChart2 size={20} style={{ color: 'var(--primary)' }} />
                </div>
                <div>
                    <h1 className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>Analytics & Reports</h1>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                        {activeSession ? `Session ${activeSession.name}` : 'All sessions'} — performance overview
                    </p>
                </div>
            </div>

            {/* Summary stat cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                {statCards.map(({ label, value, icon: Icon, color, bg }) => (
                    <div key={label} className="rounded-xl p-4 flex flex-col gap-3" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: bg }}>
                            <Icon size={18} style={{ color }} />
                        </div>
                        <div>
                            <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{label}</p>
                            <p className="text-2xl font-black mt-0.5" style={{ color: 'var(--text-primary)' }}>{value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Session Management */}
            <SessionManager sessions={sessions} />
            <SessionSeats sessions={sessions} />

            {/* Charts */}
            <ReportCharts
                classData={classRows.map(r => ({ class_level: r.class_level, count: r.count, granted: r.granted, not_granted: r.not_granted }))}
                pieData={pieData}
                genderData={genderData}
                timeData={timeData}
            />

            {/* Class-wise textual breakdown */}
            <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                <div className="px-6 py-4 border-b" style={{ borderColor: 'var(--border)', background: 'var(--bg-surface-2)' }}>
                    <h2 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Class-wise Breakdown</h2>
                </div>
                {classRows.length === 0 ? (
                    <div className="px-6 py-12 text-center text-sm" style={{ color: 'var(--text-muted)' }}>No completed tests yet.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm st-table">
                            <thead>
                                <tr>
                                    {['Class', 'Tests Taken', 'Granted', 'Not Granted', 'Pending', 'Avg Score'].map(h => (
                                        <th key={h} className="px-5 py-3 text-left" style={{ color: 'var(--text-secondary)' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {classRows.map(row => (
                                    <tr key={row.class_level}>
                                        <td className="px-5 py-3 font-semibold" style={{ color: 'var(--text-primary)' }}>{row.class_level}</td>
                                        <td className="px-5 py-3 font-bold" style={{ color: 'var(--primary)' }}>{row.count}</td>
                                        <td className="px-5 py-3">
                                            <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: 'var(--success-bg)', color: 'var(--success)', border: '1px solid var(--success-border)' }}>{row.granted}</span>
                                        </td>
                                        <td className="px-5 py-3">
                                            <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: 'var(--danger-bg)', color: 'var(--danger)', border: '1px solid var(--danger-border)' }}>{row.not_granted}</span>
                                        </td>
                                        <td className="px-5 py-3 text-xs" style={{ color: 'var(--text-muted)' }}>{row.count - row.granted - row.not_granted}</td>
                                        <td className="px-5 py-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-20 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                                                    <div className="h-full rounded-full" style={{ width: `${Math.round(row.avg_pct || 0)}%`, background: (row.avg_pct || 0) >= 70 ? 'var(--success)' : (row.avg_pct || 0) >= 40 ? '#f59e0b' : 'var(--danger)' }} />
                                                </div>
                                                <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>{Math.round(row.avg_pct || 0)}%</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* SLC Breakdown */}
            <div className="rounded-2xl overflow-hidden mt-8" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)', background: 'var(--bg-surface-2)' }}>
                    <div className="flex items-center gap-2">
                        <FileText size={16} style={{ color: '#ec4899' }} />
                        <h2 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>SLC Distribution (Class-wise)</h2>
                    </div>
                </div>
                {slcStats.classDistribution.length === 0 ? (
                    <div className="px-6 py-12 text-center text-sm" style={{ color: 'var(--text-muted)' }}>No SLCs recorded for this session.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm st-table">
                            <thead>
                                <tr style={{ background: 'var(--bg-surface-2)' }}>
                                    <th className="px-6 py-3 text-left font-bold uppercase text-xs" style={{ color: 'var(--text-secondary)' }}>Class Level</th>
                                    <th className="px-6 py-3 text-center font-bold uppercase text-xs" style={{ color: 'var(--text-secondary)' }}>Total SLCs Issued</th>
                                    <th className="px-6 py-3 text-right font-bold uppercase text-xs" style={{ color: 'var(--text-secondary)' }}>Contribution</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y" style={{ borderColor: 'var(--border)' }}>
                                {slcStats.classDistribution.map((row) => (
                                    <tr key={row.class_level} className="hover:bg-slate-50 transition-colors [&:nth-child(even)]:bg-[#fcf8ff]">
                                        <td className="px-6 py-4 font-semibold" style={{ color: 'var(--text-primary)' }}>{row.class_level}</td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="px-3 py-1 rounded-full font-black text-sm" style={{ background: '#fdf2f8', color: '#ec4899' }}>{row.count}</span>
                                        </td>
                                        <td className="px-6 py-4 text-right font-medium" style={{ color: 'var(--text-muted)' }}>
                                            {slcStats.total > 0 ? ((row.count / slcStats.total) * 100).toFixed(1) : 0}%
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
