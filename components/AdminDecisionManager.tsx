'use client';

import { useState } from 'react';
import { ThumbsUp, ThumbsDown, GraduationCap, AlertCircle, Save } from 'lucide-react';
import { setAdmissionStatus, updateAdminNotes } from '@/lib/actions';

interface AdminDecisionManagerProps {
    studentId: number;
    initialNotes: string;
    initialStatus: string | null;
    initialAdmittedClass: string | null;
    classes: string[];
}

export default function AdminDecisionManager({
    studentId,
    initialNotes,
    initialStatus,
    initialAdmittedClass,
    classes
}: AdminDecisionManagerProps) {
    const [notes, setNotes] = useState(initialNotes || '');
    const [status, setStatus] = useState(initialStatus);
    const [admittedClass, setAdmittedClass] = useState(initialAdmittedClass || '');
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

    const handleSaveNotes = async (formData: FormData) => {
        setSaveStatus('saving');
        try {
            const result = await updateAdminNotes(formData);
            if (result.success) {
                setSaveStatus('saved');
                setTimeout(() => setSaveStatus('idle'), 3000);
            } else {
                setSaveStatus('error');
            }
        } catch (err) {
            setSaveStatus('error');
        }
    };

    return (
        <div className="space-y-6">
            {/* ── Admission Decision Card ──────────────────────── */}
            <div className="rounded-2xl overflow-hidden shadow-sm" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                <div className="px-6 py-4 border-b flex items-center gap-2" style={{ borderColor: 'var(--border)', background: 'var(--bg-surface-2)' }}>
                    <GraduationCap size={18} style={{ color: 'var(--primary)' }} />
                    <div>
                        <h2 className="font-bold" style={{ color: 'var(--text-primary)' }}>
                            {status ? 'Change Admission Decision' : 'Admission Decision'}
                        </h2>
                        {status && (
                            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Current status can be updated at any time</p>
                        )}
                    </div>
                    {status === 'granted' && (
                        <span className="ml-auto text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: 'var(--success-bg)', color: 'var(--success)', border: '1px solid var(--success-border)' }}>
                            ✓ Granted — {admittedClass}
                        </span>
                    )}
                    {status === 'not_granted' && (
                        <span className="ml-auto text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: 'var(--danger-bg)', color: 'var(--danger)', border: '1px solid var(--danger-border)' }}>
                            ✗ Not Granted
                        </span>
                    )}
                </div>
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Grant Admission */}
                        <div className="rounded-xl p-4 space-y-3" style={{ background: 'var(--success-bg)', border: '1px solid var(--success-border)' }}>
                            <div className="flex items-center gap-2">
                                <ThumbsUp size={18} style={{ color: 'var(--success)' }} />
                                <p className="font-bold text-sm" style={{ color: 'var(--success)' }}>Grant Admission</p>
                            </div>
                            <form action={async (formData) => {
                                formData.append('admin_notes', notes);
                                await setAdmissionStatus(formData);
                                setStatus('granted');
                                const newClass = formData.get('admitted_class') as string;
                                setAdmittedClass(newClass);
                            }} className="space-y-2">
                                <input type="hidden" name="student_id" value={studentId} />
                                <input type="hidden" name="status" value="granted" />
                                <select
                                    name="admitted_class"
                                    value={admittedClass}
                                    onChange={(e) => setAdmittedClass(e.target.value)}
                                    className="st-input text-sm"
                                    required
                                >
                                    <option value="" disabled>Select class to admit into…</option>
                                    {classes.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                                <button type="submit" className="w-full py-2 rounded-lg text-sm font-bold transition-all" style={{ background: 'var(--success)', color: 'white' }}>
                                    ✓ Confirm — Grant Admission
                                </button>
                            </form>
                        </div>

                        {/* Not Granted */}
                        <div className="rounded-xl p-4 space-y-3" style={{ background: 'var(--danger-bg)', border: '1px solid var(--danger-border)' }}>
                            <div className="flex items-center gap-2">
                                <ThumbsDown size={18} style={{ color: 'var(--danger)' }} />
                                <p className="font-bold text-sm" style={{ color: 'var(--danger)' }}>Decline Admission</p>
                            </div>
                            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                Marks the student as not granted. This can be changed at any time.
                            </p>
                            <form action={async (formData) => {
                                formData.append('admin_notes', notes);
                                await setAdmissionStatus(formData);
                                setStatus('not_granted');
                            }}>
                                <input type="hidden" name="student_id" value={studentId} />
                                <input type="hidden" name="status" value="not_granted" />
                                <button type="submit" className="w-full py-2 rounded-lg text-sm font-bold transition-all" style={{ background: 'var(--danger)', color: 'white' }}>
                                    ✗ Admission Not Granted
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Admin Staff Notes ────────────────────────────── */}
            <div className="rounded-2xl overflow-hidden shadow-sm" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                <div className="px-6 py-4 border-b flex items-center gap-2" style={{ borderColor: 'var(--border)', background: 'var(--bg-surface-2)' }}>
                    <AlertCircle size={18} style={{ color: '#2563eb' }} />
                    <h2 className="font-bold" style={{ color: 'var(--text-primary)' }}>Notes to the Admin Staff</h2>
                </div>
                <div className="p-6">
                    <form action={handleSaveNotes} className="space-y-4">
                        <input type="hidden" name="student_id" value={studentId} />
                        
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Internal Instructions & Feedback</label>
                            <textarea 
                                name="admin_notes"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Enter specific instructions that will appear on the student's admission form..."
                                className="w-full min-h-[100px] st-input text-sm p-4 resize-none"
                            ></textarea>
                            <p className="text-[10px] italic text-gray-400">These notes will strictly appear in the "Section 05. NOTES TO ADMIN" on the printed admission form.</p>
                        </div>
                        
                        <div className="flex items-center gap-4">
                            <button 
                                type="submit" 
                                disabled={saveStatus === 'saving'}
                                className={`px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
                                    saveStatus === 'saved' ? 'bg-green-600 text-white' : 
                                    saveStatus === 'error' ? 'bg-red-600 text-white' :
                                    'bg-blue-600 text-white hover:bg-blue-700'
                                }`}
                            >
                                <Save size={16} /> 
                                {saveStatus === 'saving' ? 'Saving...' : 
                                 saveStatus === 'saved' ? 'Saved!' : 
                                 'Save Administrative Notes'}
                            </button>
                            
                            {saveStatus === 'saved' && (
                                <span className="text-green-600 font-bold text-xs animate-in fade-in slide-in-from-left-2">
                                    ✓ Notes Saved Successfully
                                </span>
                            )}
                            {saveStatus === 'error' && (
                                <span className="text-red-600 font-bold text-xs">
                                    ✗ Failed to save notes
                                </span>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
