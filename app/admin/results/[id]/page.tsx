import { getDb } from '@/lib/db';
import { notFound } from 'next/navigation';
import { XCircle, User, Calendar, BookOpen, AlertCircle, Hash, ChevronLeft, Clock, Timer, ThumbsUp, ThumbsDown, CheckCircle2 } from 'lucide-react';
import clsx from 'clsx';
import Link from 'next/link';
import AIAssessment from '@/components/AIAssessment';
import ThemeToggle from '@/components/ThemeToggle';
import AdminDecisionManager from '@/components/AdminDecisionManager';
import ResultFullscreenWrapper from '@/components/ResultFullscreenWrapper';

export const dynamic = 'force-dynamic';

const CLASSES = ['PlayGroup', 'KG 1', 'KG 2', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10'];

export default async function ResultDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const studentId = parseInt(id);
    const db = getDb();

    const student = db.prepare('SELECT * FROM students WHERE id = ?').get(studentId) as any;
    if (!student) notFound();

    const session = db.prepare('SELECT * FROM test_sessions WHERE student_id = ?').get(studentId) as any;
    if (!session) {
        return (
            <div className="flex flex-col items-center justify-center p-12 rounded-2xl" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                <AlertCircle size={48} style={{ color: 'var(--text-muted)' }} className="mb-4" />
                <h2 className="text-xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>No Session Found</h2>
                <p style={{ color: 'var(--text-muted)' }}>The student has not started any test session yet.</p>
                <Link href="/admin" className="mt-6 text-sm font-semibold" style={{ color: 'var(--primary)' }}>← Back to Dashboard</Link>
            </div>
        );
    }

    const questionIds: number[] = JSON.parse(session.question_ids || '[]');
    const answers = JSON.parse(session.answers || '{}');
    const questions = questionIds.length > 0
        ? db.prepare(`SELECT * FROM questions WHERE id IN (${questionIds.join(',')})`).all() as any[]
        : [];
    const orderedQuestions = questionIds
        .map((qid: number) => questions.find((q: any) => q.id === qid))
        .filter(Boolean) as any[];

    const subjects = ['English', 'Urdu', 'Math'];
    const summary = subjects.map(sub => {
        const subQs = orderedQuestions.filter((q: any) => q?.subject === sub);
        const total = subQs.length;
        const correct = subQs.filter((q: any) => answers[q.id] === q.correct_option).length;
        return { subject: sub, total, correct };
    });

    const settings = db.prepare('SELECT school_name, active_ai_provider FROM settings WHERE id = 1').get() as { school_name: string, active_ai_provider: string };

    const subjectColor: Record<string, string> = { English: '#2563eb', Urdu: '#7c3aed', Math: '#059669' };
    const subjectBg: Record<string, string> = { English: '#eff6ff', Urdu: '#f5f3ff', Math: '#ecfdf5' };

    const admissionStatus = student.admission_status as string | null;

    return (
        <ResultFullscreenWrapper>
            <div className="flex-1 overflow-y-auto pt-6">
                <div className="max-w-4xl mx-auto space-y-6">
                    {/* Back link */}
                    <Link href="/admin/results" className="inline-flex items-center gap-1.5 text-sm font-medium transition-colors mb-2" style={{ color: 'var(--text-secondary)' }}>
                        <ChevronLeft size={16} /> All Results
                    </Link>

                    {/* AI Assessment Trigger */}
                    <AIAssessment 
                        studentId={studentId} 
                        studentName={student.name} 
                        classLevel={student.class_level} 
                        activeProvider={settings.active_ai_provider || 'groq'}
                    />

                    {/* ── Header Card ─────────────────────────────────── */}
                    <div className="rounded-2xl overflow-hidden shadow-sm" style={{ border: '1px solid var(--border)' }}>
                        <div className="p-7 text-white" style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)' }}>
                            <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                                <div className="flex items-center gap-4">
                                    {student.photo ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={student.photo} alt={student.name} className="w-20 h-20 rounded-2xl object-cover border-2 border-white/40 shrink-0" />
                                    ) : (
                                        <div className="w-20 h-20 rounded-2xl bg-white/20 border-2 border-white/30 flex items-center justify-center text-white font-black text-2xl shrink-0">
                                            {student.name?.charAt(0)?.toUpperCase()}
                                        </div>
                                    )}
                                    <div>
                                        <p className="text-blue-200 text-xs font-bold uppercase tracking-wider mb-1">{settings.school_name}</p>
                                        <h1 className="text-3xl font-black mb-1">{student.name}</h1>
                                        <p className="text-blue-100/80 font-medium">
                                            {student.gender === 'Female' ? 'D/O' : 'S/O'}: {student.father_name}
                                        </p>
                                        <div className="flex flex-col gap-2 mt-3 text-sm text-blue-100/90 font-medium">
                                            <div className="flex flex-wrap items-center gap-4">
                                                <span className="flex items-center gap-1"><User size={14} /> {student.class_level}</span>
                                                <span className="flex items-center gap-1"><Calendar size={14} /> {new Date(student.created_at).toLocaleDateString('en-PK', { timeZone: 'Asia/Karachi' })}</span>
                                                {student.gender && <span className="flex items-center gap-1"><User size={14} /> {student.gender}</span>}
                                            </div>
                                            
                                            {session.start_time && session.end_time && (
                                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-blue-100/80 mt-1 pb-1">
                                                    <span className="flex items-center gap-1" title="Start Time (PKT)">
                                                        <Clock size={12} className="text-blue-300" />
                                                        Started: {new Date(session.start_time).toLocaleTimeString('en-US', { timeZone: 'Asia/Karachi', hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                    <span className="flex items-center gap-1" title="End Time (PKT)">
                                                        <Clock size={12} className="text-blue-300" />
                                                        Finished: {new Date(session.end_time).toLocaleTimeString('en-US', { timeZone: 'Asia/Karachi', hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                    <span className="flex items-center gap-1 font-bold text-blue-50" title="Total Time Spent">
                                                        <Timer size={13} className="text-blue-200" />
                                                        Spent: {Math.floor((new Date(session.end_time).getTime() - new Date(session.start_time).getTime()) / 60000)}m {Math.floor(((new Date(session.end_time).getTime() - new Date(session.start_time).getTime()) % 60000) / 1000)}s
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-blue-200 text-xs uppercase font-semibold tracking-wider">Overall Score</p>
                                    <p className="text-5xl font-black mt-1">
                                        {student.score}
                                        <span className="text-2xl text-blue-300"> / {questionIds.length}</span>
                                    </p>
                                    {/* Admission badge */}
                                    {admissionStatus === 'granted' && (
                                        <span className="inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 rounded-full text-sm font-bold" style={{ background: 'rgba(22,163,74,0.2)', color: '#86efac', border: '1px solid rgba(134,239,172,0.3)' }}>
                                            <ThumbsUp size={14} /> Admitted — {student.admitted_class}
                                        </span>
                                    )}
                                    {admissionStatus === 'not_granted' && (
                                        <span className="inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 rounded-full text-sm font-bold" style={{ background: 'rgba(220,38,38,0.2)', color: '#fca5a5', border: '1px solid rgba(252,165,165,0.3)' }}>
                                            <ThumbsDown size={14} /> Not Admitted
                                        </span>
                                    )}
                                    <div className="mt-4 flex justify-end hidden md:flex">
                                        <ThemeToggle isPremium />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── Admin Decision & Notes Manager ────────────────── */}
                    <AdminDecisionManager 
                        studentId={studentId}
                        initialNotes={student.admin_notes || ''}
                        initialStatus={student.admission_status || null}
                        initialAdmittedClass={student.admitted_class || null}
                        classes={CLASSES}
                    />

                    {/* ── Subject Performance ─────────────────────────── */}
                    <div className="rounded-2xl overflow-hidden shadow-sm" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                        <div className="px-6 py-4 border-b flex items-center gap-2" style={{ borderColor: 'var(--border)', background: 'var(--bg-surface-2)' }}>
                            <CheckCircle2 size={18} style={{ color: 'var(--success)' }} />
                            <h2 className="font-bold" style={{ color: 'var(--text-primary)' }}>Subject-wise Performance</h2>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                            {summary.map(s => (
                                <div key={s.subject} className="p-4 rounded-xl text-center" style={{ background: 'var(--bg-surface-2)', border: '1px solid var(--border)' }}>
                                    <span className="inline-block text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full mb-3" style={{ background: subjectBg[s.subject], color: subjectColor[s.subject] }}>
                                        {s.subject}
                                    </span>
                                    <p className="text-3xl font-black" style={{ color: 'var(--text-primary)' }}>
                                        {s.correct} <span className="text-lg font-normal" style={{ color: 'var(--text-muted)' }}>/ {s.total}</span>
                                    </p>
                                    <div className="w-full h-2 rounded-full mt-3 overflow-hidden" style={{ background: 'var(--border)' }}>
                                        <div className="h-full rounded-full" style={{ width: `${s.total > 0 ? (s.correct / s.total) * 100 : 0}%`, background: s.correct / s.total > 0.7 ? 'var(--success)' : s.correct / s.total > 0.4 ? '#f59e0b' : 'var(--danger)' }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ── Test Paper Review ───────────────────────────── */}
                    <div>
                        <h2 className="text-xl font-bold flex items-center gap-2 mb-4" style={{ color: 'var(--text-primary)' }}>
                            <BookOpen size={20} style={{ color: 'var(--primary)' }} /> Test Paper Review
                        </h2>
                        <div className="space-y-4">
                            {orderedQuestions.map((q: any, index: number) => {
                                const studentAnswerIdx = answers[q.id];
                                const isCorrect = studentAnswerIdx === q.correct_option;
                                const options = JSON.parse(q.options);
                                const isUrdu = q.subject === 'Urdu';

                                return (
                                    <div key={q.id} className="rounded-xl overflow-hidden shadow-sm" style={{ background: 'var(--bg-surface)', border: `1px solid ${isCorrect ? 'var(--success-border)' : studentAnswerIdx !== undefined ? 'var(--danger-border)' : 'var(--border)'}` }}>
                                        <div className="px-5 py-3 border-b flex items-center justify-between gap-3" style={{ borderColor: 'var(--border)', background: isCorrect ? 'var(--success-bg)' : studentAnswerIdx !== undefined ? 'var(--danger-bg)' : 'var(--bg-surface-2)' }}>
                                            <div className="flex items-center gap-2">
                                                <span className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0" style={{ background: 'var(--bg-surface)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>{index + 1}</span>
                                                <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ background: subjectBg[q.subject], color: subjectColor[q.subject] }}>{q.subject}</span>
                                                <span className="q-id-chip"><Hash size={9} />Q-{q.id}</span>
                                            </div>
                                            {isCorrect ? (
                                                <span className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: 'var(--success-bg)', color: 'var(--success)', border: '1px solid var(--success-border)' }}><CheckCircle2 size={13} /> Correct</span>
                                            ) : (
                                                <span className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: 'var(--danger-bg)', color: 'var(--danger)', border: '1px solid var(--danger-border)' }}><XCircle size={13} /> {studentAnswerIdx !== undefined ? 'Incorrect' : 'Skipped'}</span>
                                            )}
                                        </div>
                                        <div className="p-5 space-y-3">
                                            {q.image_path && (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img src={q.image_path} alt="Question" className="max-h-40 rounded-lg border" style={{ borderColor: 'var(--border)' }} />
                                            )}
                                            <p className={clsx('text-base font-medium leading-relaxed', isUrdu ? 'font-urdu text-right' : 'text-left')} dir={isUrdu ? 'rtl' : 'ltr'} style={{ color: 'var(--text-primary)' }}>{q.question_text}</p>
                                            <div className={clsx('grid grid-cols-1 md:grid-cols-2 gap-2', isUrdu && 'rtl')}>
                                                {options.map((opt: string, i: number) => {
                                                    const isSelected = studentAnswerIdx === i;
                                                    const isCorrectOpt = q.correct_option === i;
                                                    return (
                                                        <div key={i} className="p-3 rounded-lg text-sm flex items-center gap-2" style={{ background: isCorrectOpt ? 'var(--success-bg)' : isSelected ? 'var(--danger-bg)' : 'var(--bg-surface-2)', border: `1px solid ${isCorrectOpt ? 'var(--success-border)' : isSelected ? 'var(--danger-border)' : 'var(--border)'}`, color: isCorrectOpt ? 'var(--success)' : isSelected ? 'var(--danger)' : 'var(--text-secondary)', fontWeight: isCorrectOpt ? 600 : 400 }}>
                                                            <span className="w-6 h-6 rounded-full border flex items-center justify-center text-xs font-bold shrink-0" style={{ borderColor: 'currentColor' }}>{String.fromCharCode(65 + i)}</span>
                                                            <span className={clsx('flex-1', isUrdu && 'font-urdu')}>{opt}</span>
                                                            {isCorrectOpt && <CheckCircle2 size={14} />}
                                                            {isSelected && !isCorrectOpt && <XCircle size={14} />}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                            {!isCorrect && studentAnswerIdx !== undefined && (
                                                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Selected: <strong>{String.fromCharCode(65 + studentAnswerIdx)}</strong> — Correct: <strong>{String.fromCharCode(65 + q.correct_option)}</strong></p>
                                            )}
                                            {studentAnswerIdx === undefined && (
                                                <p className="text-xs italic" style={{ color: 'var(--warning)' }}>Question was skipped.</p>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="flex justify-center pb-10">
                        <Link href="/admin/results" className="st-btn-ghost px-8 py-3">← Back to Results</Link>
                    </div>
                </div>
            </div>
        </ResultFullscreenWrapper>
    );
}
