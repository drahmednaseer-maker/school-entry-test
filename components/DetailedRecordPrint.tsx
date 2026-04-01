'use client';

import React from 'react';
import clsx from 'clsx';

interface PrintRecordProps {
    students: any[];
    sessions: Record<number, any>;
    questions: Record<number, any>;
    schoolName: string;
}

export default function DetailedRecordPrint({ students, sessions, questions, schoolName }: PrintRecordProps) {
    const subjectColor: Record<string, string> = { English: '#2563eb', Urdu: '#7c3aed', Math: '#059669' };
    const subjectBg: Record<string, string> = { English: '#eff6ff', Urdu: '#f5f3ff', Math: '#ecfdf5' };

    return (
        <div className="print-container bg-white text-slate-950 print-only-container" style={{ fontFamily: 'Inter, sans-serif', width: '100%', position: 'relative', zIndex: 9999 }}>
            <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                    @page {
                        size: A4 portrait !important;
                        margin: 15mm !important;
                    }
                    
                    html, body {
                        background: white !important;
                        color: #000000 !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                        width: 100% !important;
                        height: auto !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        overflow: visible !important;
                    }
                    
                    /* Clean up the style and script tags so they don't print */
                    style, script {
                        display: none !important;
                    }

                    .page-break {
                        page-break-after: always !important;
                        break-after: page !important;
                        display: block !important;
                    }
                    .no-print {
                        display: none !important;
                    }
                    .print-card {
                        break-inside: avoid !important;
                    }
                }
                .print-gradient {
                    background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%) !important;
                    background-color: #2563eb !important;
                    color: white !important;
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                }
            `}} />

            {/* Non-printing helper */}
            <div className="no-print p-4 bg-slate-900 text-white flex justify-between items-center sticky top-0 z-50 shadow-2xl">
                <div>
                     <p className="text-xs font-black uppercase tracking-widest text-blue-400">Archive Print Engine v2.0</p>
                     <p className="text-lg font-black">{students.length} Records Detected</p>
                </div>
                <div className="flex gap-4">
                    <button onClick={() => window.print()} className="px-6 py-2 bg-blue-600 rounded-xl text-xs font-black shadow-lg shadow-blue-500/20 active:scale-95 transition-all">START PRINTING</button>
                    <button onClick={() => window.close()} className="px-6 py-2 bg-white/10 rounded-xl text-xs font-black hover:bg-white/20 transition-all">STOP ARCHIVE</button>
                </div>
            </div>

            {/* High-Visibility Diagnostic (Only for debugging blank page) */}
            <div className="hidden no-print bg-amber-50 mx-auto max-w-[850px] p-4 text-center border-b border-amber-200">
                <p className="text-amber-800 font-black text-sm uppercase tracking-widest">
                    Diagnostic: {students.length} Records In Buffer • Data Sync Active
                </p>
            </div>

            <div className="max-w-[850px] mx-auto p-4 md:p-10 relative">
            {/* FORCE VISIBILITY TEST FOR BLANK PAGE */}
            <div className="no-print opacity-0 pointer-events-none absolute -top-20">
                This is a hidden anchor to force layout computation.
            </div>

            {students.length === 0 && (
                <div className="text-center py-40 border-4 border-dashed border-slate-100 rounded-3xl">
                    <p className="text-2xl font-black text-slate-300 uppercase tracking-widest">No Student Records Found</p>
                    <p className="text-slate-400 mt-2 font-bold">Please check your date range filters in the dashboard.</p>
                </div>
            )}

            {students.map((student, index) => {
                let questionIds: number[] = [];
                let answers: Record<number, number> = {};
                // Improved type-safe lookup
                const rawSession = (sessions as any)[student.id] || (sessions as any)[String(student.id)];

                try {
                    if (rawSession) {
                        questionIds = JSON.parse(typeof rawSession.question_ids === 'string' ? rawSession.question_ids : '[]');
                        answers = JSON.parse(typeof rawSession.answers === 'string' ? rawSession.answers : '{}');
                    }
                } catch (e) {
                    console.error("Data Parse Error:", student.id, e);
                }

                const orderedQuestions = questionIds
                    .map(qid => questions[qid])
                    .filter(Boolean);

                const subjects = ['English', 'Urdu', 'Math'];
                const summary = subjects.map(sub => {
                    const subQs = orderedQuestions.filter(q => q.subject === sub);
                    const total = subQs.length;
                    const correct = subQs.filter(q => {
                         try {
                            return answers[q.id] === q.correct_option;
                         } catch(e) { return false; }
                    }).length;
                    return { subject: sub, total, correct };
                });

                return (
                    <div key={student.id} className={clsx("student-record space-y-6 py-10", index < students.length - 1 && "page-break")}>
                        {/* ── Official Branding Header ────────────────── */}
                        <div className="rounded-2xl overflow-hidden print-gradient text-white p-8 shadow-lg">
                            <div className="flex justify-between items-start gap-8">
                                <div className="flex items-center gap-6">
                                    {student.photo ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={student.photo} alt={student.name} className="w-24 h-24 rounded-2xl object-cover border-4 border-white/30 shadow-xl" />
                                    ) : (
                                        <div className="w-24 h-24 rounded-2xl bg-white/20 border-4 border-white/20 flex items-center justify-center text-3xl font-black">
                                            {student.name?.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    <div>
                                        <p className="text-blue-100/80 text-[10px] font-black uppercase tracking-[0.3em] mb-1">{schoolName}</p>
                                        <h1 className="text-3xl font-black tracking-tight mb-1">{student.name}</h1>
                                        <p className="text-blue-50 font-bold opacity-80 uppercase text-xs tracking-wider">
                                            {student.gender === 'Female' ? 'Daughter of' : 'Son of'} {student.father_name}
                                        </p>
                                        <div className="flex gap-4 mt-3">
                                             <span className="px-2 py-1 bg-white/10 rounded text-[10px] font-bold uppercase">{student.class_level}</span>
                                             <span className="px-2 py-1 bg-white/10 rounded text-[10px] font-bold uppercase">{new Date(student.created_at).toLocaleDateString('en-GB')}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-blue-100/60 text-[9px] font-black uppercase tracking-widest">Comprehensive Score</p>
                                    <div className="text-5xl font-black my-1">{student.score}</div>
                                    <p className="text-xs font-bold text-blue-100/80 uppercase">Out of {questionIds.length}</p>
                                    {student.admission_status && (
                                        <div className={clsx(
                                            "mt-4 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest inline-block border",
                                            student.admission_status === 'granted' ? "bg-emerald-500/20 border-emerald-400 text-emerald-100" : "bg-rose-500/20 border-rose-400 text-rose-100"
                                        )}>
                                            {student.admission_status === 'granted' ? `✓ Admitted: ${student.admitted_class}` : "× Admission Denied"}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* ── Performance Matrix ────────────────────────── */}
                        <div className="grid grid-cols-3 gap-4 print-card">
                            {summary.map(s => (
                                <div key={s.subject} className="p-4 rounded-2xl border border-slate-100 text-center shadow-sm" style={{ background: subjectBg[s.subject] || '#f8fafc' }}>
                                    <p className="text-[9px] font-black uppercase tracking-widest mb-1" style={{ color: subjectColor[s.subject] }}>{s.subject}</p>
                                    <p className="text-2xl font-black" style={{ color: '#0f172a' }}>{s.correct}<span className="text-xs opacity-30 font-normal"> / {s.total}</span></p>
                                    <div className="w-full h-1 bg-white/50 rounded-full mt-2 overflow-hidden border border-black/5">
                                        <div className="h-full rounded-full" style={{ width: `${s.total > 0 ? (s.correct / s.total) * 100 : 0}%`, background: subjectColor[s.subject] }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* ── Official Verdict & Admin Notes ────────────── */}
                        <div className="rounded-2xl border border-slate-100 overflow-hidden shadow-sm print-card">
                            <div className="px-5 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                                <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Section 05: Administrative Verdict & Decisions</h2>
                                <span className="text-[9px] font-bold text-slate-400 italic">Official Archive Copy</span>
                            </div>
                            <div className="p-6">
                                {student.admin_notes ? (
                                    <p className="text-sm leading-relaxed text-slate-700 italic border-l-4 border-slate-200 pl-4">{student.admin_notes}</p>
                                ) : (
                                    <p className="text-sm text-slate-400 italic">No additional administrative notes were recorded for this candidate.</p>
                                )}
                            </div>
                        </div>

                        {/* ── Question-by-Question Review ───────────────── */}
                        <div className="space-y-4 pt-4">
                            <div className="flex items-center gap-4 mb-4">
                                <h2 className="text-xs font-black uppercase tracking-[0.3em] text-slate-900 whitespace-nowrap">Paper Audit Trail</h2>
                                <div className="h-px bg-slate-200 w-full"></div>
                            </div>
                            
                            <div className="grid grid-cols-1 gap-3">
                                {orderedQuestions.map((q, qIndex) => {
                                    const studentAnswerIdx = answers[q.id];
                                    const isCorrect = studentAnswerIdx === q.correct_option;
                                    const options = JSON.parse(q.options || '[]');
                                    const isUrdu = q.subject === 'Urdu';

                                    return (
                                        <div key={q.id} className="p-4 rounded-xl border border-slate-100 shadow-sm print-card" style={{ breakInside: 'avoid' }}>
                                            <div className="flex justify-between items-start gap-4 mb-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="w-6 h-6 rounded-lg bg-slate-900 text-white flex items-center justify-center text-xs font-black shadow-inner">{qIndex + 1}</span>
                                                    <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full" style={{ background: subjectBg[q.subject], color: subjectColor[q.subject] }}>{q.subject}</span>
                                                </div>
                                                <div className={clsx(
                                                    "text-[10px] font-black uppercase px-2 py-1 rounded-lg",
                                                    isCorrect ? "bg-emerald-50 text-emerald-600" : studentAnswerIdx !== undefined ? "bg-rose-50 text-rose-600" : "bg-slate-100 text-slate-400"
                                                )}>
                                                    {isCorrect ? "✓ Correct" : studentAnswerIdx !== undefined ? "× Incorrect" : "○ Skipped"}
                                                </div>
                                            </div>
                                            <p className={clsx("text-sm font-bold mb-3 leading-relaxed", isUrdu ? 'font-urdu text-right text-lg' : 'text-left')} dir={isUrdu ? 'rtl' : 'ltr'}>
                                                {q.question_text}
                                            </p>
                                            <div className={clsx("grid grid-cols-2 gap-2", isUrdu && 'rtl')}>
                                                {options.map((opt: string, i: number) => {
                                                    const isSelected = studentAnswerIdx === i;
                                                    const isCorrectOpt = q.correct_option === i;
                                                    return (
                                                        <div key={i} className={clsx(
                                                            "p-2 rounded-lg text-[10px] border flex items-center gap-2",
                                                            isCorrectOpt ? "bg-emerald-50 border-emerald-200 text-emerald-700 font-bold" : isSelected ? "bg-rose-50 border-rose-200 text-rose-700" : "bg-slate-50 border-slate-100 text-slate-600"
                                                        )}>
                                                            <span className="w-4 h-4 rounded-full border border-current flex items-center justify-center text-[8px] font-black shrink-0">{String.fromCharCode(65 + i)}</span>
                                                            <span className={clsx("flex-1", isUrdu && 'font-urdu text-sm')}>{opt}</span>
                                                            {isCorrectOpt && <span className="ml-auto text-xs">✓</span>}
                                                            {isSelected && !isCorrectOpt && <span className="ml-auto text-xs">×</span>}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                );
            })}
            </div>
        </div>
    );
}
