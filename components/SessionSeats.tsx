'use client';

import { useState, useEffect, useTransition, useRef } from 'react';
import { getSessionSeatsStats, updateSessionSeat } from '@/lib/actions';
import { Loader2, ChevronUp, ChevronDown } from 'lucide-react';

function NumberControl({ value, onChange, onSave, disabled }: { value: number, onChange: (val: number) => void, onSave: (val: number) => void, disabled: boolean }) {
    const [localVal, setLocalVal] = useState(value);
    const saveTimeout = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        setLocalVal(value);
    }, [value]);

    const handleChange = (newVal: number) => {
        if (newVal < 0) newVal = 0;
        setLocalVal(newVal);
        onChange(newVal);

        if (saveTimeout.current) clearTimeout(saveTimeout.current);
        saveTimeout.current = setTimeout(() => {
            onSave(newVal);
        }, 500);
    };

    return (
        <div className="flex items-center justify-center border rounded-md overflow-hidden bg-white" style={{ borderColor: 'var(--input-border)', height: '34px', width: '82px', margin: '0 auto' }}>
            <input 
                type="number" 
                min="0"
                className="w-full h-full text-center font-bold text-sm outline-none bg-transparent"
                style={{ MozAppearance: 'textfield' }}
                value={localVal || 0}
                onChange={e => handleChange(parseInt(e.target.value) || 0)}
                onBlur={() => onSave(localVal)}
                onWheel={e => e.currentTarget.blur()}
                onKeyDown={e => {
                    if (e.key === 'ArrowUp') { e.preventDefault(); handleChange(localVal + 1); }
                    if (e.key === 'ArrowDown') { e.preventDefault(); handleChange(localVal - 1); }
                }}
                disabled={disabled}
            />
            <div className="flex flex-col border-l h-full shrink-0" style={{ borderColor: 'var(--input-border)', width: '22px', background: 'var(--bg-surface-2)' }}>
                <button 
                    type="button" 
                    className="flex-1 flex items-center justify-center hover:bg-gray-200 border-b outline-none" style={{ borderColor: 'var(--input-border)' }}
                    onClick={() => handleChange(localVal + 1)}
                    disabled={disabled}
                >
                    <ChevronUp size={12} />
                </button>
                <button 
                    type="button" 
                    className="flex-1 flex items-center justify-center hover:bg-gray-200 outline-none"
                    onClick={() => handleChange(localVal - 1)}
                    disabled={disabled}
                >
                    <ChevronDown size={12} />
                </button>
            </div>
        </div>
    );
}

interface Session {
    id: number;
    name: string;
    is_active: number;
}

interface SeatStat {
    class_level: string;
    total_seats: number;
    male_seats: number;
    female_seats: number;
    registered_total: number;
    registered_male: number;
    registered_female: number;
    balance_total: number;
    balance_male: number;
    balance_female: number;
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

    const handleSeatsChange = (index: number, field: 'total_seats' | 'male_seats' | 'female_seats', value: string) => {
        const num = parseInt(value) || 0;
        const newStats = [...stats];
        newStats[index][field] = num;
        
        // Recalculate balance
        if (field === 'total_seats') {
            newStats[index].balance_total = num - newStats[index].registered_total;
        } else if (field === 'male_seats') {
            newStats[index].balance_male = num - newStats[index].registered_male;
        } else if (field === 'female_seats') {
            newStats[index].balance_female = num - newStats[index].registered_female;
        }
        
        setStats(newStats);
    };

    const handleSave = (classLevel: string, field: 'total_seats' | 'male_seats' | 'female_seats', value: number) => {
        startTransition(async () => {
            await updateSessionSeat(selectedSessionId, classLevel, field, value);
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
                            <th className="px-5 py-3 text-left font-semibold uppercase text-xs" rowSpan={2} style={{ color: 'var(--text-secondary)' }}>Class Name</th>
                            <th className="px-5 py-2 text-center font-semibold uppercase text-xs border-b border-l" colSpan={2} style={{ color: 'var(--text-secondary)', borderColor: 'var(--border)' }}>Available Seats</th>
                            <th className="px-5 py-2 text-center font-semibold uppercase text-xs border-b border-l" colSpan={2} style={{ color: 'var(--text-secondary)', borderColor: 'var(--border)' }}>Registered</th>
                            <th className="px-5 py-2 text-center font-semibold uppercase text-xs border-b border-l" colSpan={2} style={{ color: 'var(--text-secondary)', borderColor: 'var(--border)' }}>Balance</th>
                        </tr>
                        <tr style={{ background: 'var(--bg-surface-2)' }}>
                            <th className="px-3 py-2 text-center font-semibold text-xs border-l" style={{ color: 'var(--text-secondary)', borderColor: 'var(--border)' }}>Male</th>
                            <th className="px-3 py-2 text-center font-semibold text-xs" style={{ color: '#db2777' }}>Female</th>
                            <th className="px-3 py-2 text-center font-semibold text-xs border-l" style={{ color: 'var(--text-secondary)', borderColor: 'var(--border)' }}>Male</th>
                            <th className="px-3 py-2 text-center font-semibold text-xs" style={{ color: '#db2777' }}>Female</th>
                            <th className="px-3 py-2 text-center font-semibold text-xs border-l" style={{ color: 'var(--text-secondary)', borderColor: 'var(--border)' }}>Male</th>
                            <th className="px-3 py-2 text-center font-semibold text-xs" style={{ color: '#db2777' }}>Female</th>
                        </tr>
                    </thead>
                    <tbody>
                        {stats.map((stat, i) => {
                            const isSplit = stat.class_level.startsWith('Grade');
                            return (
                                <tr key={stat.class_level} className="border-b last:border-0 hover:bg-slate-50 transition-colors [&:nth-child(even)]:bg-[#f4f9ff] dark:[&:nth-child(even)]:bg-blue-900/10 dark:hover:bg-slate-800/50">
                                    <td className="px-5 py-3 font-semibold" style={{ color: 'var(--text-primary)' }}>{stat.class_level}</td>
                                    
                                    {isSplit ? (
                                        <>
                                            <td className="px-3 py-3 text-center border-l" style={{ borderColor: 'var(--border)' }}>
                                                <NumberControl 
                                                    value={stat.male_seats} 
                                                    onChange={(val) => handleSeatsChange(i, 'male_seats', String(val))}
                                                    onSave={(val) => handleSave(stat.class_level, 'male_seats', val)}
                                                    disabled={isPending || isLoading}
                                                />
                                            </td>
                                            <td className="px-3 py-3 text-center">
                                                <NumberControl 
                                                    value={stat.female_seats} 
                                                    onChange={(val) => handleSeatsChange(i, 'female_seats', String(val))}
                                                    onSave={(val) => handleSave(stat.class_level, 'female_seats', val)}
                                                    disabled={isPending || isLoading}
                                                />
                                            </td>

                                            <td className="px-3 py-3 text-center border-l" style={{ borderColor: 'var(--border)' }}>
                                                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full font-bold text-xs" style={{ background: stat.registered_male > 0 ? 'var(--primary-muted)' : 'var(--bg-surface-2)', color: stat.registered_male > 0 ? 'var(--primary)' : 'var(--text-muted)' }}>{stat.registered_male}</span>
                                            </td>
                                            <td className="px-3 py-3 text-center">
                                                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full font-bold text-xs" style={{ background: stat.registered_female > 0 ? '#fdf2f8' : 'var(--bg-surface-2)', color: stat.registered_female > 0 ? '#db2777' : 'var(--text-muted)' }}>{stat.registered_female}</span>
                                            </td>

                                            <td className="px-3 py-3 text-center border-l" style={{ borderColor: 'var(--border)' }}>
                                                <span className="font-black text-sm" style={{ color: stat.balance_male < 0 ? 'var(--danger)' : stat.balance_male === 0 ? 'var(--text-muted)' : 'var(--success)' }}>{stat.balance_male > 0 ? `+${stat.balance_male}` : stat.balance_male}</span>
                                            </td>
                                            <td className="px-3 py-3 text-center">
                                                <span className="font-black text-sm" style={{ color: stat.balance_female < 0 ? 'var(--danger)' : stat.balance_female === 0 ? 'var(--text-muted)' : 'var(--success)' }}>{stat.balance_female > 0 ? `+${stat.balance_female}` : stat.balance_female}</span>
                                            </td>
                                        </>
                                    ) : (
                                        <>
                                            <td colSpan={2} className="px-5 py-3 text-center border-l" style={{ borderColor: 'var(--border)' }}>
                                                <NumberControl 
                                                    value={stat.total_seats} 
                                                    onChange={(val) => handleSeatsChange(i, 'total_seats', String(val))}
                                                    onSave={(val) => handleSave(stat.class_level, 'total_seats', val)}
                                                    disabled={isPending || isLoading}
                                                />
                                            </td>
                                            <td colSpan={2} className="px-5 py-3 text-center border-l" style={{ borderColor: 'var(--border)' }}>
                                                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-xs" style={{ background: stat.registered_total > 0 ? 'var(--primary-muted)' : 'var(--bg-surface-2)', color: stat.registered_total > 0 ? 'var(--primary)' : 'var(--text-muted)' }}>{stat.registered_total}</span>
                                            </td>
                                            <td colSpan={2} className="px-5 py-3 text-center border-l" style={{ borderColor: 'var(--border)' }}>
                                                <span className="font-black text-sm" style={{ color: stat.balance_total < 0 ? 'var(--danger)' : stat.balance_total === 0 ? 'var(--text-muted)' : 'var(--success)' }}>{stat.balance_total > 0 ? `+${stat.balance_total}` : stat.balance_total}</span>
                                            </td>
                                        </>
                                    )}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
