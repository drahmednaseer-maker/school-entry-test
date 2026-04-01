import { getDb } from '@/lib/db';
import { Users, CheckCircle, XCircle, TrendingUp, FileText, School } from 'lucide-react';
import ReportCharts from '@/components/ReportCharts';
import SessionManager from '@/components/SessionManager';
import SessionSeats from '@/components/SessionSeats';
import { getSlcStats, getSchoolStats } from '@/lib/actions';
import ThemeToggle from '@/components/ThemeToggle';

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
    const totalCapacity = seatsQuery?.total || 0;
    const totalRegistered = (db.prepare(`SELECT COUNT(*) as c FROM students WHERE is_registered=1 ${sessionFilter}`).get(...sessionArgs) as any).c;
    const totalAvailableReg = totalCapacity - totalRegistered;
    const totalAvailableGranted = totalCapacity - totalGranted;

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
    const schoolStats = await getSchoolStats(sid || 0, totalQuestions);

    const statCards = [
        { label: 'Total Tests Taken', value: totalCompleted, icon: Users, color: 'var(--primary)', bg: 'var(--primary-muted)' },
        { label: 'Admission Granted', value: totalGranted, icon: CheckCircle, color: 'var(--success)', bg: 'var(--success-bg)' },
        { label: 'Not Granted', value: totalNotGranted, icon: XCircle, color: 'var(--danger)', bg: 'var(--danger-bg)' },
        { label: 'Total SLCs Issued', value: slcStats.total, icon: FileText, color: '#ec4899', bg: '#fdf2f8' },
        { 
            label: 'Available Admission Seats', 
            value: totalAvailableReg, 
            subValue: totalAvailableGranted,
            icon: TrendingUp, 
            color: '#7c3aed', 
            bg: '#f5f3ff',
            isDual: true
        },
    ];

    return (
        <div className="flex-1 overflow-y-auto space-y-8">
            {/* Premium Header Card */}
            <div className="rounded-2xl overflow-hidden shadow-sm border border-gray-100 shrink-0">
                <div className="p-7 text-white" style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)' }}>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="flex items-center gap-5">
                            <div>
                                <p className="text-blue-200 text-xs font-bold uppercase tracking-wider mb-1">Mardan Youth's Academy</p>
                                <h1 className="text-3xl font-black mb-1">Analytics & Reports</h1>
                                <p className="text-blue-100/80 font-medium text-sm">
                                    {activeSession ? `Session ${activeSession.name}` : 'All sessions'} — performance overview
                                </p>
                            </div>
                        </div>
                        <div className="hidden md:block shrink-0"><ThemeToggle isPremium /></div>
                    </div>
                </div>
            </div>

            {/* Summary stat cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                {statCards.map((card) => (
                    <div
                        key={card.label}
                        className="rounded-2xl p-5 flex flex-col gap-3 shadow-sm relative overflow-hidden group"
                        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
                    >
                        <div className="flex items-center justify-between z-10">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: card.bg }}>
                                <card.icon size={20} style={{ color: card.color }} />
                            </div>
                            <div className="text-right">
                                <span className="text-2xl font-black block" style={{ color: 'var(--text-primary)' }}>
                                    {card.value}
                                </span>
                                {card.isDual && (
                                    <span className="text-[10px] font-bold block opacity-70" style={{ color: card.color }}>
                                        G: {card.subValue}
                                    </span>
                                )}
                            </div>
                        </div>
                        <p className="text-xs font-bold uppercase tracking-wide z-10" style={{ color: 'var(--text-muted)' }}>{card.label}</p>
                        <div className="absolute -bottom-4 -right-4 opacity-5 group-hover:scale-110 transition-transform duration-500">
                             <card.icon size={80} style={{ color: card.color }} />
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

            {/* ── Detailed Backup & Archiving Control ──────────────── */}
            <div className="rounded-2xl overflow-hidden shadow-md" style={{ background: 'var(--bg-surface)', border: '2px solid var(--primary-muted)' }}>
                <div className="px-6 py-5 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)', background: 'linear-gradient(to right, var(--bg-surface-2), var(--bg-surface))' }}>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-900/20">
                            <FileText size={20} />
                        </div>
                        <div>
                            <h2 className="font-black text-sm uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>Detailed Backup & Archiving</h2>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Generate comprehensive student test records for official filing</p>
                        </div>
                    </div>
                </div>
                <div className="p-6">
                    <form action="/admin-print/reports" method="GET" target="_blank" className="flex flex-col md:flex-row items-end gap-4">
                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Archive From</label>
                                <input 
                                    type="date" 
                                    name="from" 
                                    required 
                                    defaultValue={new Date().toISOString().split('T')[0]}
                                    className="st-input w-full font-bold text-sm" 
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Archive Through</label>
                                <input 
                                    type="date" 
                                    name="to" 
                                    required 
                                    defaultValue={new Date().toISOString().split('T')[0]}
                                    className="st-input w-full font-bold text-sm" 
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Filter by Class</label>
                                <select name="class" className="st-input w-full font-bold text-sm">
                                    {['All', 'PlayGroup', 'KG 1', 'KG 2', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10'].map(c => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <button 
                            type="submit" 
                            className="bg-slate-900 text-white px-8 py-3 rounded-xl font-black text-xs uppercase tracking-[0.15em] flex items-center gap-3 hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20 active:scale-95 shrink-0"
                        >
                            <FileText size={16} /> Generate Record Backup
                        </button>
                    </form>
                    <div className="mt-4 flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/10 rounded-lg">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
                        <p className="text-[10px] font-bold text-blue-600/80 uppercase">Page breaks are automatically added after each student record for clean hard-copy output.</p>
                    </div>
                </div>
            </div>

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
                                {(() => {
                                    const classOrder = ['PlayGroup', 'KG 1', 'KG 2', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10'];
                                    const sortedRows = [...classRows].sort((a, b) => {
                                        const idxA = classOrder.indexOf(a.class_level);
                                        const idxB = classOrder.indexOf(b.class_level);
                                        if (idxA === -1 && idxB === -1) return a.class_level.localeCompare(b.class_level);
                                        if (idxA === -1) return 1;
                                        if (idxB === -1) return -1;
                                        return idxA - idxB;
                                    });

                                    const totals = {
                                        count: 0,
                                        granted: 0,
                                        not_granted: 0,
                                        pending: 0,
                                        sum_avg: 0,
                                        rows_with_avg: 0
                                    };

                                    return (
                                        <>
                                            {sortedRows.map(row => {
                                                const pending = row.count - row.granted - row.not_granted;
                                                totals.count += row.count;
                                                totals.granted += row.granted;
                                                totals.not_granted += row.not_granted;
                                                totals.pending += pending;
                                                if (row.avg_pct !== null) {
                                                    totals.sum_avg += row.avg_pct;
                                                    totals.rows_with_avg++;
                                                }

                                                return (
                                                    <tr key={row.class_level}>
                                                        <td className="px-5 py-3 font-semibold" style={{ color: 'var(--text-primary)' }}>{row.class_level}</td>
                                                        <td className="px-5 py-3 font-bold" style={{ color: 'var(--primary)' }}>{row.count}</td>
                                                        <td className="px-5 py-3">
                                                            <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: 'var(--success-bg)', color: 'var(--success)', border: '1px solid var(--success-border)' }}>{row.granted}</span>
                                                        </td>
                                                        <td className="px-5 py-3">
                                                            <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: 'var(--danger-bg)', color: 'var(--danger)', border: '1px solid var(--danger-border)' }}>{row.not_granted}</span>
                                                        </td>
                                                        <td className="px-5 py-3 text-xs" style={{ color: 'var(--text-muted)' }}>{pending}</td>
                                                        <td className="px-5 py-3">
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-20 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                                                                    <div className="h-full rounded-full" style={{ width: `${Math.round(row.avg_pct || 0)}%`, background: (row.avg_pct || 0) >= 70 ? 'var(--success)' : (row.avg_pct || 0) >= 40 ? '#f59e0b' : 'var(--danger)' }} />
                                                                </div>
                                                                <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>{Math.round(row.avg_pct || 0)}%</span>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                            {/* Total Row */}
                                            <tr className="border-t-2" style={{ borderColor: 'var(--border)', background: 'var(--bg-surface-2)' }}>
                                                <td className="px-5 py-4 font-black uppercase text-xs" style={{ color: 'var(--text-primary)' }}>Total Summary</td>
                                                <td className="px-5 py-4 font-black text-sm" style={{ color: 'var(--primary)' }}>{totals.count}</td>
                                                <td className="px-5 py-4">
                                                    <span className="px-3 py-1 bg-green-600 text-white rounded-lg text-xs font-black shadow-lg shadow-green-900/10 transition-transform active:scale-95 cursor-default">
                                                        {totals.granted}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-4">
                                                    <span className="px-3 py-1 bg-red-600 text-white rounded-lg text-xs font-black shadow-lg shadow-red-900/10 transition-transform active:scale-95 cursor-default">
                                                        {totals.not_granted}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-4 font-black rotate-0 transition-transform cursor-default" style={{ color: 'var(--text-muted)' }}>
                                                    {totals.pending}
                                                </td>
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-2">
                                                        {(() => {
                                                            const overallAvg = totals.rows_with_avg > 0 ? totals.sum_avg / totals.rows_with_avg : 0;
                                                            return (
                                                                <>
                                                                    <div className="w-20 h-2 rounded-full overflow-hidden shadow-inner" style={{ background: 'var(--border)' }}>
                                                                        <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${Math.round(overallAvg)}%`, background: overallAvg >= 70 ? 'var(--success)' : overallAvg >= 40 ? '#f59e0b' : 'var(--danger)' }} />
                                                                    </div>
                                                                    <span className="text-sm font-black" style={{ color: 'var(--text-primary)' }}>{Math.round(overallAvg)}%</span>
                                                                </>
                                                            );
                                                        })()}
                                                    </div>
                                                </td>
                                            </tr>
                                        </>
                                    );
                                })()}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
                {/* SLC Breakdown */}
                <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                    <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)', background: 'var(--bg-surface-2)' }}>
                        <div className="flex items-center gap-2">
                            <FileText size={16} style={{ color: '#ec4899' }} />
                            <h2 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>SLC Distribution (Class-wise)</h2>
                        </div>
                    </div>
                    {slcStats.classDistribution.length === 0 ? (
                        <div className="px-6 py-12 text-center text-sm" style={{ color: 'var(--text-muted)' }}>No SLCs recorded.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm st-table">
                                <thead>
                                    <tr style={{ background: 'var(--bg-surface-2)' }}>
                                        <th className="px-6 py-3 text-left font-bold uppercase text-[10px] tracking-wider" style={{ color: 'var(--text-secondary)' }}>Class Level</th>
                                        <th className="px-6 py-3 text-center font-bold uppercase text-[10px] tracking-wider" style={{ color: 'var(--text-secondary)' }}>Total SLCs</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y" style={{ borderColor: 'var(--border)' }}>
                                    {slcStats.classDistribution.map((row) => (
                                        <tr key={row.class_level} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4 font-semibold" style={{ color: 'var(--text-primary)' }}>{row.class_level}</td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="px-3 py-1 rounded-full font-black text-xs" style={{ background: '#fdf2f8', color: '#ec4899' }}>{row.count}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Previous School Analytics */}
                <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                    <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)', background: 'var(--bg-surface-2)' }}>
                        <div className="flex items-center gap-2">
                            <School size={16} style={{ color: 'var(--primary)' }} />
                            <h2 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Previous School Distribution</h2>
                        </div>
                    </div>
                    {schoolStats.length === 0 ? (
                        <div className="px-6 py-12 text-center text-sm" style={{ color: 'var(--text-muted)' }}>No academic history data found.</div>
                    ) : (
                        <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
                            <table className="w-full text-sm st-table">
                                <thead className="sticky top-0 z-10">
                                    <tr style={{ background: 'var(--bg-surface-2)' }}>
                                        <th className="px-6 py-3 text-left font-bold uppercase text-[10px] tracking-wider" style={{ color: 'var(--text-secondary)' }}>School Name</th>
                                        <th className="px-6 py-3 text-center font-bold uppercase text-[10px] tracking-wider" style={{ color: 'var(--text-secondary)' }}>Total</th>
                                        <th className="px-6 py-3 text-center font-bold uppercase text-[10px] tracking-wider" style={{ color: 'var(--text-secondary)' }}>Granted</th>
                                        <th className="px-6 py-3 text-center font-bold uppercase text-[10px] tracking-wider" style={{ color: 'var(--text-secondary)' }}>Avg Score</th>
                                        <th className="px-6 py-3 text-right font-bold uppercase text-[10px] tracking-wider" style={{ color: 'var(--text-secondary)' }}>Conv.%</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y" style={{ borderColor: 'var(--border)' }}>
                                    {schoolStats.map((row) => {
                                        const pct = ((row.granted_count / row.total_count) * 100).toFixed(0);
                                        const avgPct = Math.round(row.avg_score_pct || 0);
                                        return (
                                            <tr key={row.previous_school} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-4 font-semibold text-xs leading-relaxed" style={{ color: 'var(--text-primary)' }}>{row.previous_school}</td>
                                                <td className="px-6 py-4 text-center font-black" style={{ color: 'var(--text-secondary)' }}>{row.total_count}</td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className="font-bold text-xs" style={{ color: 'var(--success)' }}>{row.granted_count}</span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <div className="flex items-center justify-center gap-1.5">
                                                        <div className="w-12 h-1 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                                                            <div className="h-full" style={{ width: `${avgPct}%`, background: avgPct >= 70 ? 'var(--success)' : avgPct >= 40 ? '#f59e0b' : 'var(--danger)' }} />
                                                        </div>
                                                        <span className="text-[10px] font-bold" style={{ color: avgPct >= 70 ? 'var(--success)' : avgPct >= 40 ? '#d97706' : 'var(--danger)' }}>{avgPct}%</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <span className="text-[10px] font-black px-2 py-0.5 rounded-md" style={{ 
                                                        background: parseInt(pct) >= 70 ? 'var(--success-bg)' : parseInt(pct) >= 40 ? '#fef3c7' : 'var(--danger-bg)', 
                                                        color: parseInt(pct) >= 70 ? 'var(--success)' : parseInt(pct) >= 40 ? '#d97706' : 'var(--danger)'
                                                    }}>
                                                        {pct}%
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
