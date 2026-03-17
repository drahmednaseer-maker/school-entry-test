'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { submitTest } from '@/lib/actions';
import { Clock, CheckCircle, ChevronLeft, ChevronRight, Hash } from 'lucide-react';
import clsx from 'clsx';
import ThemeToggle from '@/components/ThemeToggle';

type Question = {
    id: number;
    subject: string;
    difficulty: string;
    question_text: string;
    image_path?: string;
    options: string[];
    correct_option: number;
};

interface TestClientProps {
    sessionId: number;
    questions: Question[];
    startTime: number;
    schoolName: string;
    studentName: string;
    fatherName: string;
    studentPhoto?: string;
    classLevel?: string;
    gender?: string;
}

export default function TestClient({
    sessionId,
    questions,
    startTime,
    schoolName,
    studentName,
    fatherName,
    studentPhoto,
    classLevel,
    gender,
}: TestClientProps) {
    const router = useRouter();
    const [currentIdx, setCurrentIdx] = useState(0);
    const [answers, setAnswers] = useState<Record<number, number>>({});
    const [timeLeft, setTimeLeft] = useState(30 * 60);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const now = Date.now();
        const elapsedSeconds = Math.floor((now - startTime) / 1000);
        const remaining = Math.max(0, (30 * 60) - elapsedSeconds);
        setTimeLeft(remaining);

        const interval = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    handleAutoSubmit();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    function handleAnswer(optionIdx: number) {
        setAnswers((prev) => ({
            ...prev,
            [questions[currentIdx].id]: optionIdx
        }));
    }

    async function handleAutoSubmit() {
        if (isSubmitting) return;
        await submit();
    }

    async function submit() {
        setIsSubmitting(true);
        const res = await submitTest(sessionId, answers);
        if (res.success) {
            router.push(`/test/${sessionId}/result`);
        } else {
            alert('Error submitting test: ' + res.error);
            setIsSubmitting(false);
        }
    }

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    const currentQ = questions[currentIdx];
    const answeredCount = Object.keys(answers).length;
    const isUrdu = currentQ.subject === 'Urdu';

    const subjectColor: Record<string, string> = {
        English: '#2563eb',
        Urdu: '#7c3aed',
        Math: '#059669',
    };
    const subjectBg: Record<string, string> = {
        English: '#eff6ff',
        Urdu: '#f5f3ff',
        Math: '#ecfdf5',
    };

    if (timeLeft === 0 && !isSubmitting) {
        return <div className="text-center p-10 text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Time's up! Submitting...</div>;
    }

    return (
        <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-page)' }}>
            {/* ── Sticky Top Bar ─────────────────────────────────── */}
            <div
                className="sticky top-0 z-20 border-b shadow-sm"
                style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}
            >
                <div className="max-w-3xl mx-auto px-4 py-2.5 flex items-center justify-between gap-3">
                    {/* Left: Logo + school */}
                    <div className="flex items-center gap-2.5 min-w-0">
                        <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-sm shrink-0"
                            style={{ background: 'linear-gradient(135deg,#1e3a8a,#2563eb)' }}
                        >
                            ST
                        </div>
                        <div className="min-w-0 hidden sm:block">
                            <p className="font-bold text-sm truncate" style={{ color: 'var(--text-primary)' }}>{schoolName}</p>
                            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Entry Examination</p>
                        </div>
                    </div>

                    {/* Center: Timer */}
                    <div
                        className={clsx(
                            "flex items-center gap-2 px-4 py-2 rounded-xl font-mono font-bold text-lg shrink-0",
                            timeLeft < 60 ? "animate-pulse" : ""
                        )}
                        style={{
                            background: timeLeft < 60 ? 'var(--danger-bg)' : 'var(--primary-muted)',
                            color: timeLeft < 60 ? 'var(--danger)' : 'var(--primary)',
                            border: `1.5px solid ${timeLeft < 60 ? 'var(--danger-border)' : 'var(--primary-light)'}`,
                        }}
                    >
                        <Clock size={16} strokeWidth={2.5} />
                        {formatTime(timeLeft)}
                    </div>

                    {/* Right: Student info + photo */}
                    <div className="flex items-center gap-2 min-w-0">
                        <div className="text-right hidden sm:block min-w-0">
                            <p className="font-bold text-sm truncate" style={{ color: 'var(--text-primary)' }}>{studentName}</p>
                            <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                                s/o {fatherName}{classLevel ? ` · ${classLevel}` : ''}
                            </p>
                        </div>
                        {studentPhoto ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={studentPhoto}
                                alt={studentName}
                                className="w-9 h-9 rounded-full object-cover border-2 shrink-0"
                                style={{ borderColor: 'var(--primary)' }}
                            />
                        ) : (
                            <div
                                className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0"
                                style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}
                            >
                                {studentName.charAt(0).toUpperCase()}
                            </div>
                        )}
                        <ThemeToggle />
                    </div>
                </div>

                {/* Progress bar */}
                <div className="h-1" style={{ background: 'var(--border)' }}>
                    <div
                        className="h-full transition-all duration-300"
                        style={{ width: `${((currentIdx + 1) / questions.length) * 100}%`, background: 'var(--primary)' }}
                    />
                </div>
            </div>

            {/* ── Main Content ──────────────────────────────────── */}
            <div className="flex-1 max-w-3xl mx-auto w-full px-4 py-5">

                {/* Navigation progress line */}
                <div className="flex items-center justify-between mb-4">
                    <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                        Question <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{currentIdx + 1}</span> of {questions.length}
                    </p>
                    <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                        <span className="font-bold" style={{ color: 'var(--success)' }}>{answeredCount}</span> answered
                    </p>
                </div>

                {/* ── Question Card ──────────────────────────────── */}
                <div
                    className="rounded-2xl mb-5 overflow-hidden shadow-sm"
                    style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
                >
                    {/* Card header: subject badge + Q-ID chip */}
                    <div
                        className="px-5 py-3 border-b flex items-center justify-between"
                        style={{ borderColor: 'var(--border)', background: 'var(--bg-surface-2)' }}
                    >
                        <span
                            className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full"
                            style={{
                                background: subjectBg[currentQ.subject] || 'var(--primary-muted)',
                                color: subjectColor[currentQ.subject] || 'var(--primary)',
                            }}
                        >
                            {currentQ.subject}
                        </span>

                        {/* Question ID chip */}
                        <span className="q-id-chip">
                            <Hash size={9} />
                            Q-{currentQ.id}
                        </span>
                    </div>

                    <div className="p-5 md:p-7">
                        {/* Image */}
                        {currentQ.image_path && (
                            <div className="mb-5 flex justify-center">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={currentQ.image_path}
                                    alt="Question reference"
                                    className="max-h-56 object-contain rounded-xl border"
                                    style={{ borderColor: 'var(--border)' }}
                                />
                            </div>
                        )}

                        {/* Question text */}
                        <h2
                            className={clsx(
                                "text-xl md:text-2xl font-semibold leading-relaxed mb-6",
                                isUrdu ? 'font-urdu text-right' : 'text-left'
                            )}
                            dir={isUrdu ? 'rtl' : 'ltr'}
                            style={{ color: 'var(--text-primary)' }}
                        >
                            {currentQ.question_text}
                        </h2>

                        {/* Options */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {currentQ.options.map((opt, i) => {
                                const isSelected = answers[currentQ.id] === i;
                                return (
                                    <button
                                        key={i}
                                        onClick={() => handleAnswer(i)}
                                        dir={isUrdu ? 'rtl' : 'ltr'}
                                        className="relative p-4 rounded-xl border-2 text-left transition-all active:scale-[0.98]"
                                        style={{
                                            background: isSelected ? 'var(--primary-muted)' : 'var(--bg-surface-2)',
                                            borderColor: isSelected ? 'var(--primary)' : 'var(--border)',
                                            boxShadow: isSelected ? `0 0 0 3px color-mix(in srgb, var(--primary) 15%, transparent)` : 'none',
                                        }}
                                    >
                                        <div className={clsx("flex items-center gap-3", isUrdu && "flex-row-reverse")}>
                                            {/* Letter circle */}
                                            <div
                                                className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 border transition-all"
                                                style={{
                                                    background: isSelected ? 'var(--primary)' : 'var(--bg-surface)',
                                                    borderColor: isSelected ? 'var(--primary)' : 'var(--border)',
                                                    color: isSelected ? 'white' : 'var(--text-secondary)',
                                                }}
                                            >
                                                {String.fromCharCode(65 + i)}
                                            </div>
                                            <span
                                                className={clsx(
                                                    "text-base leading-snug flex-1",
                                                    isUrdu && 'font-urdu'
                                                )}
                                                style={{ color: 'var(--text-primary)' }}
                                            >
                                                {opt}
                                            </span>
                                            {isSelected && (
                                                <CheckCircle
                                                    size={18}
                                                    className="shrink-0"
                                                    style={{ color: 'var(--primary)' }}
                                                />
                                            )}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* ── Question Dot Navigator ─────────────────────── */}
                <div className="flex flex-wrap gap-1.5 justify-center mb-5">
                    {questions.map((q, i) => {
                        const isAnswered = answers[q.id] !== undefined;
                        const isCurrent = i === currentIdx;
                        return (
                            <button
                                key={q.id}
                                onClick={() => setCurrentIdx(i)}
                                title={`Q${i + 1}${isAnswered ? ' ✓' : ''}`}
                                className="w-7 h-7 rounded-lg text-xs font-bold transition-all"
                                style={{
                                    background: isCurrent ? 'var(--primary)' : isAnswered ? 'var(--success-bg)' : 'var(--bg-surface-2)',
                                    color: isCurrent ? 'white' : isAnswered ? 'var(--success)' : 'var(--text-muted)',
                                    border: `1.5px solid ${isCurrent ? 'var(--primary)' : isAnswered ? 'var(--success-border)' : 'var(--border)'}`,
                                }}
                            >
                                {i + 1}
                            </button>
                        );
                    })}
                </div>

                {/* ── Navigation Buttons ─────────────────────────── */}
                <div className="flex justify-between items-center">
                    <button
                        onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
                        disabled={currentIdx === 0}
                        className="st-btn-ghost text-sm px-5 py-2.5"
                    >
                        <ChevronLeft size={16} /> Previous
                    </button>

                    {currentIdx < questions.length - 1 ? (
                        <button
                            onClick={() => setCurrentIdx(prev => Math.min(questions.length - 1, prev + 1))}
                            className="st-btn-primary text-sm px-6 py-2.5"
                        >
                            Next <ChevronRight size={16} />
                        </button>
                    ) : (
                        <button
                            onClick={submit}
                            disabled={isSubmitting}
                            className="px-6 py-2.5 rounded-xl font-bold text-sm text-white transition-all"
                            style={{
                                background: isSubmitting ? 'var(--text-muted)' : 'var(--success)',
                                opacity: isSubmitting ? 0.7 : 1,
                            }}
                        >
                            {isSubmitting ? 'Submitting...' : '✓ Finish & Submit'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
