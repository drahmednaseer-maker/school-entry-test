'use client';

import { addQuestion, updateQuestion } from '@/lib/actions';
import { useRef, useEffect, useState } from 'react';
import Image from 'next/image';
import { X, Plus, Save } from 'lucide-react';

interface QuestionFormProps {
    initialData?: any;
    onCancel?: () => void;
}

export default function QuestionForm({ initialData, onCancel }: QuestionFormProps) {
    const formRef = useRef<HTMLFormElement>(null);
    const [removeImage, setRemoveImage] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    useEffect(() => {
        if (initialData && formRef.current) {
            formRef.current.scrollIntoView({ behavior: 'smooth' });
        }
        setMessage(null);
    }, [initialData]);

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        setMessage(null);
        if (initialData) {
            formData.append('id', initialData.id.toString());
            if (removeImage) formData.append('remove_image', 'true');
            const res = await updateQuestion(formData);
            if (res.success) {
                setMessage({ type: 'success', text: 'Question updated successfully!' });
                if (onCancel) onCancel();
            } else {
                setMessage({ type: 'error', text: 'Error updating question' });
            }
        } else {
            const res = await addQuestion(formData);
            if (res.success) {
                setMessage({ type: 'success', text: 'Question added!' });
                formRef.current?.reset();
            } else {
                setMessage({ type: 'error', text: 'Error adding question' });
            }
        }
        setLoading(false);
    }

    const options = initialData ? JSON.parse(initialData.options) : ['', '', '', ''];

    return (
        <form
            ref={formRef}
            action={handleSubmit}
            className="rounded-xl overflow-hidden shadow-sm"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
        >
            {/* Header */}
            <div
                className="px-5 py-4 border-b flex justify-between items-center"
                style={{ borderColor: 'var(--border)', background: 'var(--bg-surface-2)' }}
            >
                <div className="flex items-center gap-2.5">
                    {initialData
                        ? <Save size={17} style={{ color: 'var(--primary)' }} />
                        : <Plus size={17} style={{ color: 'var(--success)' }} />
                    }
                    <h3 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                        {initialData ? `Edit Q-${initialData.id}` : 'Add New Question'}
                    </h3>
                </div>
                {initialData && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="p-1.5 rounded-lg transition-colors"
                        style={{ color: 'var(--text-muted)' }}
                    >
                        <X size={16} />
                    </button>
                )}
            </div>

            <div className="p-5 space-y-4">
                {/* Subject + Difficulty */}
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>Subject</label>
                        <select name="subject" defaultValue={initialData?.subject || 'English'} className="st-input text-sm">
                            <option value="English">English</option>
                            <option value="Urdu">Urdu</option>
                            <option value="Math">Math</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>Difficulty</label>
                        <select name="difficulty" defaultValue={initialData?.difficulty || 'Easy'} className="st-input text-sm">
                            <option value="Easy">Easy</option>
                            <option value="Medium">Medium</option>
                            <option value="Hard">Hard</option>
                        </select>
                    </div>
                </div>

                {/* Class + Image */}
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>Class Level</label>
                        <select name="class_level" defaultValue={initialData?.class_level || 'Grade 1'} required className="st-input text-sm">
                            <option value="PlayGroup">PlayGroup</option>
                            <option value="KG 1">KG 1</option>
                            <option value="KG 2">KG 2</option>
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => (
                                <option key={i} value={`Grade ${i}`}>Grade {i}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>Image (Optional)</label>
                        <input
                            type="file"
                            name="image"
                            accept="image/*"
                            className="st-input text-xs py-1.5 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-semibold"
                            style={{ '--file-text': 'var(--primary)' } as any}
                        />
                    </div>
                </div>

                {/* Existing image */}
                {initialData?.image_path && !removeImage && (
                    <div
                        className="flex items-center gap-3 p-2 rounded-lg"
                        style={{ background: 'var(--bg-surface-2)', border: '1px solid var(--border)' }}
                    >
                        <div className="relative w-12 h-12 rounded overflow-hidden border shrink-0" style={{ borderColor: 'var(--border)' }}>
                            <Image src={initialData.image_path} alt="Current" fill className="object-cover" />
                        </div>
                        <button
                            type="button"
                            onClick={() => setRemoveImage(true)}
                            className="text-xs font-semibold"
                            style={{ color: 'var(--danger)' }}
                        >
                            Remove image
                        </button>
                    </div>
                )}
                {removeImage && (
                    <p className="text-xs" style={{ color: 'var(--warning)' }}>
                        Image will be removed on update.{' '}
                        <button type="button" onClick={() => setRemoveImage(false)} className="underline font-semibold">Undo</button>
                    </p>
                )}

                {/* Question text */}
                <div>
                    <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>Question Text</label>
                    <textarea
                        name="question_text"
                        defaultValue={initialData?.question_text || ''}
                        required
                        rows={3}
                        className="st-input text-sm resize-y"
                        placeholder="Enter question..."
                    />
                </div>

                {/* Options */}
                <div>
                    <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Answer Options</label>
                    <div className="grid grid-cols-2 gap-2">
                        {[0, 1, 2, 3].map((i) => (
                            <div key={i} className="relative">
                                <span
                                    className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                                    style={{ background: 'var(--primary-muted)', color: 'var(--primary)' }}
                                >
                                    {String.fromCharCode(65 + i)}
                                </span>
                                <input
                                    type="text"
                                    name={`option_${i}`}
                                    defaultValue={options[i] || ''}
                                    required
                                    className="st-input text-sm pl-9"
                                    placeholder={`Option ${i + 1}`}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Correct option */}
                <div>
                    <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>Correct Answer</label>
                    <select name="correct_option" defaultValue={initialData?.correct_option ?? '0'} className="st-input text-sm">
                        <option value="0">A — Option 1</option>
                        <option value="1">B — Option 2</option>
                        <option value="2">C — Option 3</option>
                        <option value="3">D — Option 4</option>
                    </select>
                </div>

                {/* Message */}
                {message && (
                    <p
                        className="text-xs px-3 py-2 rounded-lg font-medium"
                        style={{
                            background: message.type === 'success' ? 'var(--success-bg)' : 'var(--danger-bg)',
                            color: message.type === 'success' ? 'var(--success)' : 'var(--danger)',
                            border: `1px solid ${message.type === 'success' ? 'var(--success-border)' : 'var(--danger-border)'}`,
                        }}
                    >
                        {message.text}
                    </p>
                )}

                {/* Submit */}
                <div className="flex gap-2">
                    <button
                        type="submit"
                        disabled={loading}
                        className="st-btn-primary text-sm py-2.5 flex-1"
                    >
                        {loading ? 'Saving...' : initialData ? 'Update Question' : 'Add Question'}
                    </button>
                    {initialData && (
                        <button
                            type="button"
                            onClick={onCancel}
                            className="st-btn-ghost text-sm px-5 py-2.5"
                        >
                            Cancel
                        </button>
                    )}
                </div>
            </div>
        </form>
    );
}
