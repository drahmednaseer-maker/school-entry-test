'use client';

import { generateStudentCode } from '@/lib/actions';
import { useRef, useState } from 'react';
import WebcamCapture from './WebcamCapture';
import { UserPlus, Copy, Check, Printer, Eye, X } from 'lucide-react';

interface PrintData {
    name: string;
    fatherName: string;
    fatherMobile: string;
    classLevel: string;
    gender: string;
    code: string;
}

export default function StudentForm() {
    const formRef = useRef<HTMLFormElement>(null);
    const [lastCode, setLastCode] = useState<string | null>(null);
    const [photo, setPhoto] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [loading, setLoading] = useState(false);
    const [printData, setPrintData] = useState<PrintData | null>(null);
    const [showPreview, setShowPreview] = useState(false);

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
            setPrintData({
                name,
                fatherName,
                fatherMobile,
                classLevel,
                gender: gender || 'Not Specified',
                code: res.code
            });
            setPhoto(null);
            // formRef.current?.reset(); // Removed automatic reset to keep data visible
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

    function handlePrint() {
        // Small delay to ensure DOM is ready and updated
        setTimeout(() => {
            window.print();
        }, 100);
    }

    return (
        <div className="relative">

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
                    <form 
                        ref={formRef} 
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleSubmit(new FormData(e.currentTarget));
                        }} 
                        className="space-y-6"
                    >
                        {/* Inputs */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
                                    Class seeking admission in
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
                        </div>

                        {/* Gender */}
                        <div>
                            <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Gender</label>
                            <div className="flex gap-3">
                                {['Male', 'Female'].map(g => (
                                    <label key={g} className="flex items-center gap-2 cursor-pointer px-4 py-2 rounded-lg border text-sm font-medium transition-all hover:bg-black/5 dark:hover:bg-white/5" style={{ borderColor: 'var(--border)', background: 'var(--bg-surface-2)', color: 'var(--text-secondary)' }}>
                                        <input type="radio" name="gender" value={g} className="accent-blue-600" />
                                        {g === 'Male' ? '♂ Male' : '♀ Female'}
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Photo capture */}
                        <div
                            className="pt-5 border-t"
                            style={{ borderColor: 'var(--border)' }}
                        >
                            <div className="max-w-[400px] mx-auto w-full">
                                <WebcamCapture
                                    capturedPhoto={photo}
                                    onCapture={(b64) => setPhoto(b64)}
                                    onClear={() => setPhoto(null)}
                                />
                            </div>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="st-btn-primary w-full text-base py-3 font-black shadow-md"
                            >
                                {loading ? 'Generating...' : lastCode ? 'Update Access Code' : 'Generate Access Code'}
                            </button>
                        </div>
                    </form>

                    {/* Success display */}
                    {lastCode && (
                        <div
                            className="mt-4 p-4 rounded-xl text-center space-y-4"
                            style={{
                                background: 'var(--success-bg)',
                                border: '1.5px solid var(--success-border)',
                            }}
                        >
                            <div className="space-y-1">
                                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--success)' }}>
                                    Code Generated!
                                </p>
                                <p
                                    className="text-3xl font-mono font-black tracking-[0.25em]"
                                    style={{ color: 'var(--text-primary)' }}
                                >
                                    {lastCode}
                                </p>
                            </div>
                            
                            <div className="flex flex-wrap items-center justify-center gap-2">
                                <button
                                    onClick={copyCode}
                                    className="inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-lg transition-all"
                                    style={{
                                        background: copied ? 'var(--success)' : 'var(--bg-surface)',
                                        color: copied ? 'white' : 'var(--text-secondary)',
                                        border: '1px solid var(--border)',
                                    }}
                                >
                                    {copied ? <><Check size={14} /> Copied!</> : <><Copy size={14} /> Copy Code</>}
                                </button>

                                <button
                                    onClick={() => setShowPreview(true)}
                                    className="inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-sm"
                                >
                                    <Eye size={14} /> Preview Receipt
                                </button>

                                <button
                                    onClick={handlePrint}
                                    className="inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-lg bg-slate-800 text-white hover:bg-black transition-all shadow-sm"
                                >
                                    <Printer size={14} /> Print Receipt
                                </button>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setLastCode(null);
                                        setPrintData(null);
                                        setPhoto(null);
                                        formRef.current?.reset();
                                    }}
                                    className="inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all shadow-sm border border-gray-200"
                                >
                                    <X size={14} /> Clear Form
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Print Preview Modal */}
            {showPreview && printData && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div 
                        className="bg-white rounded-2xl shadow-2xl w-full max-w-[400px] overflow-hidden animate-in zoom-in-95 duration-200"
                        style={{ background: 'var(--bg-surface)' }}
                    >
                        <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
                            <h4 className="font-bold text-sm">Receipt Preview</h4>
                            <button onClick={() => setShowPreview(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        
                        <div className="p-8 flex justify-center bg-gray-50 dark:bg-black/20">
                            {/* The actual receipt visualization */}
                            <div className="bg-white text-black p-6 shadow-md w-[280px] font-sans border border-gray-100">
                                <div className="text-center border-b-2 border-dashed border-gray-300 pb-3 mb-4">
                                    <h5 className="font-black text-xs uppercase tracking-tighter">Mardan Youth Academy</h5>
                                    <p className="text-[10px] text-gray-500">Student Entry Test Ticket</p>
                                </div>
                                
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-[9px] uppercase font-bold text-gray-400">Student Name</p>
                                        <p className="text-xs font-black uppercase">{printData.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] uppercase font-bold text-gray-400">Father's Name</p>
                                        <p className="text-xs font-black uppercase">{printData.fatherName}</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <p className="text-[9px] uppercase font-bold text-gray-400">Class</p>
                                            <p className="text-xs font-black uppercase">{printData.classLevel}</p>
                                        </div>
                                        <div>
                                            <p className="text-[9px] uppercase font-bold text-gray-400">Gender</p>
                                            <p className="text-xs font-black uppercase">{printData.gender}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-[9px] uppercase font-bold text-gray-400">Mobile</p>
                                        <p className="text-xs font-black">{printData.fatherMobile}</p>
                                    </div>
                                </div>
                                
                                <div className="mt-6 pt-4 border-t-2 border-dashed border-gray-300 text-center">
                                    <p className="text-[10px] font-bold uppercase tracking-widest mb-1">Access Code</p>
                                    <p className="text-4xl font-black tracking-widest">{printData.code}</p>
                                </div>
                                
                                <div className="mt-6 text-[8px] text-center text-gray-400">
                                    Please keep this ticket safe.<br/>
                                    System Generated: {new Date().toLocaleString()}
                                </div>
                            </div>
                        </div>
                        
                        <div className="p-4 border-t flex gap-3" style={{ borderColor: 'var(--border)' }}>
                            <button 
                                onClick={() => setShowPreview(false)}
                                className="flex-1 py-2.5 rounded-xl text-xs font-bold border hover:bg-gray-50 transition-all"
                                style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
                            >
                                Close Preview
                            </button>
                            <button 
                                onClick={() => {
                                    setShowPreview(false);
                                    handlePrint();
                                }}
                                className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-slate-800 text-white hover:bg-black transition-all shadow-lg"
                            >
                                <Printer size={14} className="inline mr-2" /> Print Now
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Hidden component for actual printing */}
            <div id="thermal-receipt-print-form" className="print-only-container">
                {printData && (
                    <div style={{ fontFamily: 'sans-serif', textAlign: 'left', color: 'black' }}>
                        <div style={{ textAlign: 'center', borderBottom: '1px dashed black', paddingBottom: '10px', marginBottom: '15px' }}>
                            <h2 style={{ fontSize: '18px', margin: '0', fontWeight: 'bold', textTransform: 'uppercase' }}>Mardan Youth Academy</h2>
                            <p style={{ fontSize: '12px', margin: '5px 0' }}>Student Entry Test Ticket</p>
                        </div>
                        
                        <div style={{ fontSize: '12px', lineHeight: '1.6' }}>
                            <div style={{ marginBottom: '8px' }}>
                                <span style={{ textTransform: 'uppercase', fontWeight: 'bold' }}>Student:</span><br/>
                                <span style={{ fontSize: '14px', fontWeight: '900', textTransform: 'uppercase' }}>{printData.name}</span>
                            </div>
                            <div style={{ marginBottom: '8px' }}>
                                <span style={{ textTransform: 'uppercase', fontWeight: 'bold' }}>Father:</span><br/>
                                <span style={{ fontSize: '14px', fontWeight: '900', textTransform: 'uppercase' }}>{printData.fatherName}</span>
                            </div>
                            <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                                <div>
                                    <span style={{ textTransform: 'uppercase', fontWeight: 'bold' }}>Class:</span><br/>
                                    <span style={{ fontWeight: 'bold' }}>{printData.classLevel}</span>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <span style={{ textTransform: 'uppercase', fontWeight: 'bold' }}>Gender:</span><br/>
                                    <span style={{ fontWeight: 'bold' }}>{printData.gender}</span>
                                </div>
                            </div>
                            <div style={{ marginBottom: '15px' }}>
                                <span style={{ textTransform: 'uppercase', fontWeight: 'bold' }}>Mobile:</span><br/>
                                <span style={{ fontWeight: 'bold' }}>{printData.fatherMobile}</span>
                            </div>
                        </div>
                        
                        <div style={{ textAlign: 'center', borderTop: '1px dashed black', paddingTop: '15px', marginBottom: '15px' }}>
                            <p style={{ fontSize: '10px', fontWeight: 'bold', margin: '0 0 5px 0', textTransform: 'uppercase' }}>Access Code</p>
                            <h1 style={{ fontSize: '42px', margin: '0', fontWeight: '900', letterSpacing: '2px' }}>{printData.code}</h1>
                        </div>
                        
                        <div style={{ textAlign: 'center', fontSize: '10px', color: '#666' }}>
                            Please keep this ticket safe.<br/>
                            {new Date().toLocaleString()}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
