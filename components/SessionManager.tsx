'use client';

import { useState } from 'react';
import { createSession, setActiveSession, deleteSession } from '@/lib/actions';
import { PlusCircle, CheckCircle, Trash2, BookOpen, Loader2 } from 'lucide-react';

interface Session {
    id: number;
    name: string;
    is_active: number;
    student_count: number;
    created_at: string;
}

export default function SessionManager({ sessions }: { sessions: Session[] }) {
    const [creating, setCreating] = useState(false);
    const [newName, setNewName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState<string | null>(null);

    async function handleCreate(e: React.FormEvent) {
        e.preventDefault();
        setError('');
        setLoading('create');
        const fd = new FormData();
        fd.set('name', newName.trim());
        const res = await createSession(fd);
        setLoading(null);
        if (res.success) {
            setNewName('');
            setCreating(false);
        } else {
            setError(res.error || 'Error creating session');
        }
    }

    async function handleSetActive(id: number) {
        setLoading(`active-${id}`);
        const fd = new FormData();
        fd.set('session_id', String(id));
        await setActiveSession(fd);
        setLoading(null);
    }

    async function handleDelete(id: number) {
        setLoading(`delete-${id}`);
        const fd = new FormData();
        fd.set('session_id', String(id));
        const res = await deleteSession(fd);
        setLoading(null);
        if (!res.success) setError(res.error || 'Error deleting session');
    }

    return (
        <div
            className="rounded-2xl overflow-hidden shadow-sm"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
        >
            {/* Header */}
            <div
                className="px-6 py-4 border-b flex items-center justify-between"
                style={{ borderColor: 'var(--border)', background: 'var(--bg-surface-2)' }}
            >
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--primary-muted)' }}>
                        <BookOpen size={16} style={{ color: 'var(--primary)' }} />
                    </div>
                    <div>
                        <h3 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Academic Sessions</h3>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>All stats and reports reflect the active session</p>
                    </div>
                </div>
                <button
                    onClick={() => { setCreating(v => !v); setError(''); }}
                    className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-all"
                    style={{ background: 'var(--primary-muted)', color: 'var(--primary)' }}
                >
                    <PlusCircle size={14} />
                    New Session
                </button>
            </div>

            {/* New session form */}
            {creating && (
                <form
                    onSubmit={handleCreate}
                    className="px-6 py-4 border-b flex items-center gap-3"
                    style={{ borderColor: 'var(--border)', background: 'var(--primary-muted)' }}
                >
                    <input
                        value={newName}
                        onChange={e => setNewName(e.target.value)}
                        placeholder="e.g. 2027-2028"
                        className="st-input flex-1 text-sm"
                        required
                        autoFocus
                    />
                    <button
                        type="submit"
                        disabled={loading === 'create'}
                        className="st-btn-primary text-sm px-4 py-2 shrink-0"
                    >
                        {loading === 'create' ? <Loader2 size={14} className="animate-spin" /> : 'Create'}
                    </button>
                    <button
                        type="button"
                        onClick={() => { setCreating(false); setError(''); }}
                        className="text-sm px-3 py-2 rounded-lg shrink-0"
                        style={{ color: 'var(--text-muted)' }}
                    >
                        Cancel
                    </button>
                </form>
            )}

            {/* Error */}
            {error && (
                <div className="mx-6 mt-3 p-3 rounded-lg text-sm" style={{ background: 'var(--danger-bg)', color: 'var(--danger)', border: '1px solid var(--danger-border)' }}>
                    {error}
                </div>
            )}

            {/* Session list */}
            <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
                {sessions.length === 0 ? (
                    <p className="px-6 py-8 text-center text-sm" style={{ color: 'var(--text-muted)' }}>No sessions yet.</p>
                ) : (
                    sessions.map(session => (
                        <div key={session.id} className="px-6 py-4 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3 min-w-0">
                                {/* Active dot */}
                                <div
                                    className="w-2.5 h-2.5 rounded-full shrink-0"
                                    style={{ background: session.is_active ? 'var(--success)' : 'var(--border)' }}
                                />
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{session.name}</span>
                                        {session.is_active === 1 && (
                                            <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: 'var(--success-bg)', color: 'var(--success)', border: '1px solid var(--success-border)' }}>
                                                ● Active
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                                        {session.student_count} test{session.student_count !== 1 ? 's' : ''} recorded
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                                {session.is_active !== 1 && (
                                    <button
                                        onClick={() => handleSetActive(session.id)}
                                        disabled={loading === `active-${session.id}`}
                                        className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-all"
                                        style={{ background: 'var(--primary-muted)', color: 'var(--primary)' }}
                                    >
                                        {loading === `active-${session.id}` ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle size={12} />}
                                        Set Active
                                    </button>
                                )}
                                {session.is_active !== 1 && session.student_count === 0 && (
                                    <button
                                        onClick={() => handleDelete(session.id)}
                                        disabled={loading === `delete-${session.id}`}
                                        className="p-1.5 rounded-lg transition-all"
                                        style={{ color: 'var(--danger)', background: 'var(--danger-bg)' }}
                                        title="Delete session"
                                    >
                                        {loading === `delete-${session.id}` ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
