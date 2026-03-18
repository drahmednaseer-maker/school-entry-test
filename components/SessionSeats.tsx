'use client';

import { useState, useEffect, useTransition } from 'react';
import { getSessionSeatsStats, updateSessionSeat } from '@/lib/actions';
import { Loader2 } from 'lucide-react';

interface Session {
    id: number;
    name: string;
    is_active: number;
}

interface SeatStat {
    class_level: string;
    total_seats: number;
    registered: number;
    balance: number;
}

export default function SessionSeats({ sessions }: { sessions: Session[] }) {
    const activeSession = sessions.find(s => s.is_active) || sessions[0];
    const [selectedSessionId, setSelectedSessionId] = useState<number>(activeSession?.id || 0);
    const [stats, setStats] = useState<SeatStat[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        if (!selectedSessionId) return;
        setIsLoading(true);
        getSessionSeatsStats(selectedSessionId).then(data => {
            setStats(data);
            setIsLoading(false);
        });
    }, [selectedSessionId]);

    const handleSeatsChange = (index: number, value: string) => {
        const num = parseInt(value) || 0;
        const newStats = [...stats];
        newStats[index].total_seats = num;
        newStats[index].balance = num - newStats[index].registered;
        setStats(newStats);
    };

    const handleSave = (classLevel: string, totalSeats: number) => {
        startTransition(async () => {
            await updateSessionSeat(selectedSessionId, classLevel, totalSeats);
        });
    };

    if (!selectedSessionId) return null;

    return (
        <div className="rounded-xl overflow-hidden shadow-sm flex flex-col mt-8" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
            <div className="px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b" style={{ borderColor: 'var(--border)', background: 'var(--bg-surface-2)' }}>
                <div>
                    <h3 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>Session Seats Allocation</h3>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Manage available seats and track registrations.</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>View Session:</span>
                    <select 
                        value={selectedSessionId} 
                        onChange={e => setSelectedSessionId(parseInt(e.target.value))}
                        className="st-input py-1.5 px-3 text-sm font-semibold rounded-lg"
                        disabled={isPending || isLoading}
                    >
                        {sessions.map(s => (
                            <option key={s.id} value={s.id}>{s.name} {s.is_active ? '(Active)' : ''}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="p-0 overflow-x-auto relative">
                {isLoading && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center" style={{ background: 'var(--bg-surface)', opacity: 0.7 }}>
                        <Loader2 className="animate-spin" style={{ color: 'var(--primary)' }} size={32} />
                    </div>
                )}
                <table className="w-full text-sm st-table">
                    <thead>
                        <tr style={{ background: 'var(--bg-surface-2)' }}>
                            <th className="px-5 py-3 text-left font-semibold uppercase text-xs" style={{ color: 'var(--text-secondary)' }}>Class Name</th>
                            <th className="px-5 py-3 text-left font-semibold uppercase text-xs w-48" style={{ color: 'var(--text-secondary)' }}>Available Seats</th>
                            <th className="px-5 py-3 text-center font-semibold uppercase text-xs w-32" style={{ color: 'var(--text-secondary)' }}>Registered</th>
                            <th className="px-5 py-3 text-center font-semibold uppercase text-xs w-32" style={{ color: 'var(--text-secondary)' }}>Balance</th>
                        </tr>
                    </thead>
                    <tbody>
                        {stats.map((stat, i) => (
                            <tr key={stat.class_level}>
                                <td className="px-5 py-3 font-semibold" style={{ color: 'var(--text-primary)' }}>{stat.class_level}</td>
                                <td className="px-5 py-3">
                                    <div className="flex items-center gap-2">
                                        <input 
                                            type="number" 
                                            min="0"
                                            className="st-input py-1.5 px-3 w-20 text-center font-bold"
                                            value={stat.total_seats || ''}
                                            onChange={e => handleSeatsChange(i, e.target.value)}
                                            onBlur={() => handleSave(stat.class_level, stat.total_seats)}
                                            disabled={isPending || isLoading}
                                        />
                                        {isPending && <span className="text-xs text-green-500 font-bold">Saving...</span>}
                                    </div>
                                </td>
                                <td className="px-5 py-3 text-center">
                                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-xs" 
                                          style={{ background: stat.registered > 0 ? 'var(--primary-muted)' : 'var(--bg-surface-2)', color: stat.registered > 0 ? 'var(--primary)' : 'var(--text-muted)' }}>
                                        {stat.registered}
                                    </span>
                                </td>
                                <td className="px-5 py-3 text-center">
                                    <span className="font-black text-sm" style={{ color: stat.balance < 0 ? 'var(--danger)' : stat.balance === 0 ? 'var(--text-muted)' : 'var(--success)' }}>
                                        {stat.balance > 0 ? `+${stat.balance}` : stat.balance}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
