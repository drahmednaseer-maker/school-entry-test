'use client';

import { useState, useTransition } from 'react';
import { addSlc } from '@/lib/actions';
import { Loader2, PlusCircle, User, Calendar, BookOpen, Layers } from 'lucide-react';

const CLASSES = ['PlayGroup', 'KG 1', 'KG 2', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10'];
const GENDERS = ['Male', 'Female'];
const SECTIONS = ['M', 'Y', 'A', 'S', 'N', 'R', 'F'];

export default function SlcForm() {
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError('');
        setSuccess(false);

        const formData = new FormData(e.currentTarget);
        
        startTransition(async () => {
            const res = await addSlc(formData);
            if (res.success) {
                setSuccess(true);
                (e.target as HTMLFormElement).reset();
                setTimeout(() => setSuccess(false), 3000);
            } else {
                setError(res.error || 'Failed to record SLC');
            }
        });
    }

    const inputStyle = { paddingLeft: '2.5rem' };

    return (
        <div 
            className="rounded-2xl overflow-hidden shadow-sm mb-6"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
        >
            <div 
                className="px-6 py-4 border-b flex items-center justify-between"
                style={{ borderColor: 'var(--border)', background: 'var(--bg-surface-2)' }}
            >
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--primary-muted)' }}>
                        <PlusCircle size={16} style={{ color: 'var(--primary)' }} />
                    </div>
                    <div>
                        <h3 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Issue New SLC</h3>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Recording an SLC automatically increases available admission seats</p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Name */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider block" style={{ color: 'var(--text-muted)' }}>
                            Student Name
                        </label>
                        <div className="relative">
                            <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 z-10" style={{ color: 'var(--text-muted)' }} />
                            <input
                                name="name"
                                required
                                placeholder="Full Name"
                                className="st-input w-full relative z-0"
                                style={inputStyle}
                            />
                        </div>
                    </div>

                    {/* Father Name */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider block" style={{ color: 'var(--text-muted)' }}>
                            Father Name
                        </label>
                        <div className="relative">
                            <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 z-10" style={{ color: 'var(--text-muted)' }} />
                            <input
                                name="father_name"
                                placeholder="Father's Name"
                                className="st-input w-full relative z-0"
                                style={inputStyle}
                            />
                        </div>
                    </div>

                    {/* Date */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider block" style={{ color: 'var(--text-muted)' }}>
                            Date of SLC
                        </label>
                        <div className="relative">
                            <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 z-10" style={{ color: 'var(--text-muted)' }} />
                            <input
                                type="date"
                                name="date_issued"
                                required
                                defaultValue={new Date().toISOString().split('T')[0]}
                                className="st-input w-full relative z-0"
                                style={inputStyle}
                            />
                        </div>
                    </div>

                    {/* Class */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider block" style={{ color: 'var(--text-muted)' }}>
                            Class
                        </label>
                        <div className="relative">
                            <BookOpen size={16} className="absolute left-3 top-1/2 -translate-y-1/2 z-10" style={{ color: 'var(--text-muted)' }} />
                            <select name="class_level" required className="st-input w-full relative z-0" style={inputStyle}>
                                {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Section */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider block" style={{ color: 'var(--text-muted)' }}>
                            Section
                        </label>
                        <div className="relative">
                            <Layers size={16} className="absolute left-3 top-1/2 -translate-y-1/2 z-10" style={{ color: 'var(--text-muted)' }} />
                            <select name="section" required className="st-input w-full relative z-0" style={inputStyle}>
                                {SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Gender */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider block" style={{ color: 'var(--text-muted)' }}>
                            Gender
                        </label>
                        <div className="relative">
                            <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 z-10" style={{ color: 'var(--text-muted)' }} />
                            <select name="gender" required className="st-input w-full relative z-0" style={inputStyle}>
                                {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="mt-4 p-3 rounded-lg text-sm text-center" style={{ background: 'var(--danger-bg)', color: 'var(--danger)', border: '1px solid var(--danger-border)' }}>
                        {error}
                    </div>
                )}

                {success && (
                    <div className="mt-4 p-3 rounded-lg text-sm text-center" style={{ background: 'var(--success-bg)', color: 'var(--success)', border: '1px solid var(--success-border)' }}>
                        SLC recorded successfully!
                    </div>
                )}

                <div className="mt-8 flex justify-end">
                    <button
                        type="submit"
                        disabled={isPending}
                        className="st-btn-primary px-8 py-2.5 flex items-center gap-2"
                    >
                        {isPending ? <Loader2 size={18} className="animate-spin" /> : <PlusCircle size={18} />}
                        Record SLC
                    </button>
                </div>
            </form>
        </div>
    );
}
