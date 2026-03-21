'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useState } from 'react';
import { Search, X, Hash, ChevronDown, Zap } from 'lucide-react';

export default function QuestionFilters() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [idInput, setIdInput] = useState(searchParams.get('qid') || '');

    const push = useCallback((updates: Record<string, string>) => {
        const p = new URLSearchParams(searchParams.toString());
        for (const [k, v] of Object.entries(updates)) {
            if (v) p.set(k, v); else p.delete(k);
        }
        router.push(`?${p.toString()}`, { scroll: false });
    }, [searchParams, router]);

    const subjects = ['Math', 'English', 'Urdu'];
    const difficulties = ['Easy', 'Medium', 'Hard'];
    const classes = ['PlayGroup', 'KG 1', 'KG 2', ...Array.from({ length: 10 }, (_, i) => `Grade ${i + 1}`)];
    const hasFilters = searchParams.toString().length > 0;

    const activeSubject = searchParams.get('subject') || '';
    const activeDiff = searchParams.get('difficulty') || '';
    const activeLevel = searchParams.get('level') || '';

    const diffColors: Record<string, { bg: string; text: string; activeBg: string }> = {
        Easy: { bg: 'transparent', text: 'var(--text-secondary)', activeBg: '#15803d' },
        Medium: { bg: 'transparent', text: 'var(--text-secondary)', activeBg: '#b45309' },
        Hard: { bg: 'transparent', text: 'var(--text-secondary)', activeBg: '#dc2626' },
    };

    return (
        <div
            className="rounded-2xl overflow-hidden"
            style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
            }}
        >
            {/* ── Row 1: Main search + ID jump ─────────────────── */}
            <div
                className="px-4 py-3 flex flex-wrap items-center gap-3 border-b"
                style={{ borderColor: 'var(--border)', background: 'var(--bg-surface)' }}
            >
                {/* Text search */}
                <div className="flex-1 min-w-[200px] relative group">
                    <Search
                        size={15}
                        className="absolute top-1/2 -translate-y-1/2 pointer-events-none transition-colors"
                        style={{ left: '14px', color: 'var(--text-muted)' }}
                    />
                    <input
                        type="text"
                        placeholder="Search question text..."
                        style={{
                            paddingLeft: '40px',
                            paddingRight: '12px',
                            paddingTop: '9px',
                            paddingBottom: '9px',
                            background: 'var(--bg-surface-2)',
                            border: '1.5px solid var(--border)',
                            borderRadius: '10px',
                            color: 'var(--text-primary)',
                            fontSize: '0.875rem',
                            outline: 'none',
                            width: '100%',
                            transition: 'border-color 0.15s, box-shadow 0.15s',
                        }}
                        value={searchParams.get('q') || ''}
                        onChange={(e) => push({ q: e.target.value })}
                        onFocus={e => {
                            e.currentTarget.style.borderColor = 'var(--primary)';
                            e.currentTarget.style.boxShadow = '0 0 0 3px color-mix(in srgb, var(--primary) 15%, transparent)';
                        }}
                        onBlur={e => {
                            e.currentTarget.style.borderColor = 'var(--border)';
                            e.currentTarget.style.boxShadow = 'none';
                        }}
                    />
                </div>

                {/* Separator */}
                <div className="w-px h-8 hidden sm:block" style={{ background: 'var(--border)' }} />

                {/* ID Jump */}
                <form
                    onSubmit={(e) => { e.preventDefault(); push({ qid: idInput.trim() }); }}
                    className="flex items-center gap-2"
                >
                    <div className="relative" style={{ width: '130px' }}>
                        <Zap
                            size={13}
                            className="absolute top-1/2 -translate-y-1/2 pointer-events-none"
                            style={{ left: '11px', color: 'var(--primary)' }}
                        />
                        <input
                            type="number"
                            placeholder="Jump to Q#"
                            min="1"
                            value={idInput}
                            onChange={(e) => setIdInput(e.target.value)}
                            style={{
                                paddingLeft: '30px',
                                paddingRight: '10px',
                                paddingTop: '9px',
                                paddingBottom: '9px',
                                background: 'var(--primary-muted)',
                                border: '1.5px solid var(--primary-light)',
                                borderRadius: '10px',
                                color: 'var(--primary)',
                                fontSize: '0.875rem',
                                fontWeight: 600,
                                outline: 'none',
                                width: '100%',
                            }}
                            onFocus={e => { e.currentTarget.style.borderColor = 'var(--primary)'; }}
                            onBlur={e => { e.currentTarget.style.borderColor = 'var(--primary-light)'; }}
                        />
                    </div>
                    <button
                        type="submit"
                        style={{
                            background: 'var(--primary)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '10px',
                            padding: '9px 16px',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                            letterSpacing: '0.02em',
                        }}
                    >
                        Find →
                    </button>
                </form>

                {/* Clear all */}
                {hasFilters && (
                    <button
                        onClick={() => { setIdInput(''); router.push('/admin/questions'); }}
                        className="flex items-center gap-1 text-xs font-semibold px-3 py-2 rounded-lg transition-all"
                        style={{ color: 'var(--danger)', background: 'var(--danger-bg)', border: '1px solid var(--danger-border)' }}
                    >
                        <X size={13} /> Clear
                    </button>
                )}
            </div>

            {/* ── Row 2: Filter pills ───────────────────────────── */}
            <div
                className="px-4 py-2.5 flex flex-wrap items-center gap-2"
                style={{ background: 'var(--bg-surface-2)' }}
            >
                <span className="text-xs font-semibold uppercase tracking-widest mr-1" style={{ color: 'var(--text-muted)' }}>Filter</span>

                {/* Subject pills */}
                {subjects.map(s => (
                    <button
                        key={s}
                        onClick={() => push({ subject: activeSubject === s ? '' : s })}
                        className="text-xs font-semibold px-3 py-1.5 rounded-full transition-all"
                        style={{
                            background: activeSubject === s ? 'var(--primary)' : 'var(--bg-surface)',
                            color: activeSubject === s ? 'white' : 'var(--text-secondary)',
                            border: `1.5px solid ${activeSubject === s ? 'var(--primary)' : 'var(--border)'}`,
                        }}
                    >
                        {s}
                    </button>
                ))}

                <div className="w-px h-5 mx-1" style={{ background: 'var(--border)' }} />

                {/* Difficulty pills */}
                {difficulties.map(d => {
                    const active = activeDiff === d;
                    const colors: Record<string, string> = { Easy: '#15803d', Medium: '#b45309', Hard: '#dc2626' };
                    return (
                        <button
                            key={d}
                            onClick={() => push({ difficulty: active ? '' : d })}
                            className="text-xs font-semibold px-3 py-1.5 rounded-full transition-all"
                            style={{
                                background: active ? colors[d] : 'var(--bg-surface)',
                                color: active ? 'white' : 'var(--text-secondary)',
                                border: `1.5px solid ${active ? colors[d] : 'var(--border)'}`,
                            }}
                        >
                            {d}
                        </button>
                    );
                })}

                <div className="w-px h-5 mx-1" style={{ background: 'var(--border)' }} />

                {/* Class dropdown */}
                <div className="relative">
                    <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
                    <select
                        value={activeLevel}
                        onChange={(e) => push({ level: e.target.value })}
                        style={{
                            appearance: 'none',
                            background: activeLevel ? 'var(--primary)' : 'var(--bg-surface)',
                            color: activeLevel ? 'white' : 'var(--text-secondary)',
                            border: `1.5px solid ${activeLevel ? 'var(--primary)' : 'var(--border)'}`,
                            borderRadius: '999px',
                            padding: '6px 28px 6px 12px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            outline: 'none',
                        }}
                    >
                        <option value="">— Class —</option>
                        {classes.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>

                {/* Active Q-ID badge */}
                {searchParams.get('qid') && (
                    <>
                        <div className="w-px h-5 mx-1" style={{ background: 'var(--border)' }} />
                        <span
                            className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full"
                            style={{ background: 'var(--primary)', color: 'white' }}
                        >
                            <Hash size={11} /> Q-{searchParams.get('qid')}
                        </span>
                    </>
                )}
            </div>
        </div>
    );
}
