'use client';

import { generateStudentCode } from '@/lib/actions';
import { useRef, useState } from 'react';
import WebcamCapture from './WebcamCapture';
import { UserPlus, Copy, Check } from 'lucide-react';

export default function StudentForm() {
    const formRef = useRef<HTMLFormElement>(null);
    const [lastCode, setLastCode] = useState<string | null>(null);
    const [photo, setPhoto] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(formData: FormData) {
        const fatherMobile = formData.get('father_mobile') as string;
        if (fatherMobile.length !== 11 || !/^\d+$/.test(fatherMobile)) {
            alert('Mobile number must be exactly 11 digits');
            return;
        }

        setLoading(true);
        const name = formData.get('name') as string;
        const fatherName = formData.get('father_name') as string;
        const classLevel = formData.get('class_level') as string;
        const gender = formData.get('gender') as string;

        const res = await generateStudentCode(name, fatherName, fatherMobile, classLevel, photo || undefined, gender || undefined);

        if (res.success && res.code) {
            setLastCode(res.code);
            setPhoto(null);
            formRef.current?.reset();
        } else {
            alert('Error generating code');
        }
        setLoading(false);
    }

    function copyCode() {
        if (lastCode) {
            navigator.clipboard.writeText(lastCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    }

    return (
        <div
            className="rounded-xl overflow-hidden shadow-sm"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
        >
            {/* Header */}
            <div
                className="px-5 py-4 border-b flex items-center gap-2"
                style={{ borderColor: 'var(--border)', background: 'var(--bg-surface-2)' }}
            >
                <UserPlus size={18} style={{ color: 'var(--primary)' }} />
                <h3 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                    Register Student
                </h3>
            </div>

            <div className="p-5">
                <form ref={formRef} action={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
                            Student Name
                        </label>
                        <input
                            type="text"
                            name="name"
                            required
                            className="st-input text-sm"
                            placeholder="Full name"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
                            Father's Name
                        </label>
                        <input
                            type="text"
                            name="father_name"
                            required
                            className="st-input text-sm"
                            placeholder="Father's full name"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
                            Father's Mobile (11 digits)
                        </label>
                        <input
                            type="tel"
                            name="father_mobile"
                            required
                            pattern="\d{11}"
                            title="Must be 11 digits"
                            className="st-input text-sm"
                            placeholder="03XXXXXXXXX"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
                            Class / Grade
                        </label>
                        <select name="class_level" className="st-input text-sm select-arrow">
                            <option value="PlayGroup">PlayGroup</option>
                            <option value="KG 1">KG 1</option>
                            <option value="KG 2">KG 2</option>
                            <option value="Grade 1">Grade 1</option>
                            <option value="Grade 2">Grade 2</option>
                            <option value="Grade 3">Grade 3</option>
                            <option value="Grade 4">Grade 4</option>
                            <option value="Grade 5">Grade 5</option>
                            <option value="Grade 6">Grade 6</option>
                            <option value="Grade 7">Grade 7</option>
                            <option value="Grade 8">Grade 8</option>
                            <option value="Grade 9">Grade 9</option>
                            <option value="Grade 10">Grade 10</option>
                        </select>
                    </div>

                    {/* Gender */}
                    <div>
                        <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Gender</label>
                        <div className="flex gap-3">
                            {['Male', 'Female'].map(g => (
                                <label key={g} className="flex items-center gap-2 cursor-pointer px-4 py-2 rounded-lg border text-sm font-medium transition-all" style={{ borderColor: 'var(--border)', background: 'var(--bg-surface-2)', color: 'var(--text-secondary)' }}>
                                    <input type="radio" name="gender" value={g} className="accent-blue-600" />
                                    {g === 'Male' ? '♂ Male' : '♀ Female'}
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Photo capture */}
                    <div
                        className="pt-3 border-t"
                        style={{ borderColor: 'var(--border)' }}
                    >
                        <WebcamCapture
                            capturedPhoto={photo}
                            onCapture={(b64) => setPhoto(b64)}
                            onClear={() => setPhoto(null)}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="st-btn-primary w-full text-sm py-2.5 mt-1"
                    >
                        {loading ? 'Generating...' : 'Generate Access Code'}
                    </button>
                </form>

                {/* Success display */}
                {lastCode && (
                    <div
                        className="mt-4 p-4 rounded-xl text-center space-y-2"
                        style={{
                            background: 'var(--success-bg)',
                            border: '1.5px solid var(--success-border)',
                        }}
                    >
                        <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--success)' }}>
                            Code Generated!
                        </p>
                        <p
                            className="text-3xl font-mono font-black tracking-[0.25em]"
                            style={{ color: 'var(--text-primary)' }}
                        >
                            {lastCode}
                        </p>
                        <button
                            onClick={copyCode}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
                            style={{
                                background: copied ? 'var(--success)' : 'var(--bg-surface)',
                                color: copied ? 'white' : 'var(--text-secondary)',
                                border: '1px solid var(--border)',
                            }}
                        >
                            {copied ? <><Check size={12} /> Copied!</> : <><Copy size={12} /> Copy Code</>}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
