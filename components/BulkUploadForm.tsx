'use client';

import { uploadBulkQuestions } from '@/lib/actions';
import { useRef, useState } from 'react';
import { Upload, Download, CheckCircle, AlertCircle, FileText } from 'lucide-react';

export default function BulkUploadForm() {
    const formRef = useRef<HTMLFormElement>(null);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [fileName, setFileName] = useState('');

    async function handleSubmit(formData: FormData) {
        setIsUploading(true);
        setMessage(null);
        const res = await uploadBulkQuestions(formData);
        setIsUploading(false);
        if (res.success) {
            setMessage({ type: 'success', text: `Uploaded ${res.count} questions successfully!` });
            formRef.current?.reset();
            setFileName('');
        } else {
            setMessage({ type: 'error', text: res.error as string || 'Failed to upload' });
        }
    }

    function handleDownloadTemplate() {
        const html = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Question Template</title></head><body><table border="1"><thead><tr><th>Subject</th><th>Difficulty</th><th>Question</th><th>Option 1</th><th>Option 2</th><th>Option 3</th><th>Option 4</th><th>Correct (1-4)</th></tr></thead><tbody><tr><td>English</td><td>Easy</td><td>Example Question?</td><td>Opt A</td><td>Opt B</td><td>Opt C</td><td>Opt D</td><td>1</td></tr></tbody></table></body></html>`;
        const blob = new Blob([html], { type: 'application/msword' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Question_Template.doc';
        a.click();
    }

    return (
        <div
            className="rounded-xl overflow-hidden shadow-sm"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
        >
            {/* Header */}
            <div
                className="px-5 py-4 border-b flex justify-between items-center"
                style={{ borderColor: 'var(--border)', background: 'var(--bg-surface-2)' }}
            >
                <div className="flex items-center gap-2.5">
                    <Upload size={16} style={{ color: 'var(--primary)' }} />
                    <h3 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Bulk Upload</h3>
                </div>
                <button
                    type="button"
                    onClick={handleDownloadTemplate}
                    className="text-xs font-semibold flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-colors"
                    style={{ color: 'var(--primary)', background: 'var(--primary-muted)' }}
                >
                    <Download size={13} /> Template
                </button>
            </div>

            <form ref={formRef} action={handleSubmit} className="p-5 space-y-4">
                {/* Class selector */}
                <div>
                    <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>Target Class</label>
                    <select name="class_level" required className="st-input text-sm">
                        <option value="PlayGroup">PlayGroup</option>
                        <option value="KG 1">KG 1</option>
                        <option value="KG 2">KG 2</option>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => (
                            <option key={i} value={`Grade ${i}`}>Grade {i}</option>
                        ))}
                    </select>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>All questions in the file are assigned to this class.</p>
                </div>

                {/* File drop zone */}
                <label
                    className="flex flex-col items-center justify-center gap-2 p-5 rounded-xl border-2 border-dashed cursor-pointer transition-colors text-center"
                    style={{ borderColor: 'var(--border)', background: 'var(--bg-surface-2)' }}
                >
                    {fileName ? (
                        <>
                            <FileText size={28} style={{ color: 'var(--primary)' }} />
                            <span className="text-sm font-medium" style={{ color: 'var(--primary)' }}>{fileName}</span>
                            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Click to change file</span>
                        </>
                    ) : (
                        <>
                            <Upload size={28} style={{ color: 'var(--text-muted)' }} />
                            <span className="text-sm font-semibold" style={{ color: 'var(--primary)' }}>Select Word File</span>
                            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>.docx or .doc</span>
                        </>
                    )}
                    <input
                        name="file"
                        type="file"
                        className="hidden"
                        accept=".docx,.doc"
                        required
                        onChange={(e) => setFileName(e.target.files?.[0]?.name || '')}
                    />
                </label>

                {/* Message */}
                {message && (
                    <div
                        className="p-3 rounded-lg flex items-center gap-2 text-sm"
                        style={{
                            background: message.type === 'success' ? 'var(--success-bg)' : 'var(--danger-bg)',
                            color: message.type === 'success' ? 'var(--success)' : 'var(--danger)',
                            border: `1px solid ${message.type === 'success' ? 'var(--success-border)' : 'var(--danger-border)'}`,
                        }}
                    >
                        {message.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                        {message.text}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={isUploading}
                    className="st-btn-primary w-full text-sm py-2.5"
                >
                    {isUploading ? 'Uploading...' : 'Upload Questions'}
                </button>

                {/* Format guide */}
                <div className="text-xs px-3 py-2 rounded-lg" style={{ background: 'var(--bg-surface-2)', color: 'var(--text-muted)' }}>
                    <p className="font-semibold mb-0.5" style={{ color: 'var(--text-secondary)' }}>Table Format (8 columns):</p>
                    <p>Subject · Difficulty · Question · Opt A · Opt B · Opt C · Opt D · Correct (1–4)</p>
                </div>
            </form>
        </div>
    );
}
