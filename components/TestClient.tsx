'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { submitTest } from '@/lib/actions';
import { Clock, CheckCircle } from 'lucide-react';
import clsx from 'clsx';

type Question = {
    id: number;
    subject: string;
    difficulty: string;
    question_text: string;
    image_path?: string;
    options: string[]; // parsed
    correct_option: number;
};

interface TestClientProps {
    sessionId: number;
    questions: Question[];
    startTime: number;
    schoolName: string;
    studentName: string;
    fatherName: string;
}

export default function TestClient({
    sessionId,
    questions,
    startTime,
    schoolName,
    studentName,
    fatherName
}: TestClientProps) {
    const router = useRouter();
    const [currentIdx, setCurrentIdx] = useState(0);
    const [answers, setAnswers] = useState<Record<number, number>>({});
    const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 minutes in seconds init
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Initialize timer based on start time
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

    const progress = ((currentIdx + 1) / questions.length) * 100;
    const currentQ = questions[currentIdx];

    if (timeLeft === 0 && !isSubmitting) {
        return <div className="text-center p-10 text-xl font-bold">Time's up! Submitting...</div>;
    }

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8">
            {/* Header */}
            <div className="bg-white rounded-xl shadow-sm p-4 mb-6 border-b-4 border-blue-500 flex flex-col md:flex-row justify-between items-center sticky top-4 z-10 gap-4">
                <div className="flex items-center gap-4">
                    <div className="bg-blue-600 text-white p-2 rounded-lg font-bold text-xl h-12 w-12 flex items-center justify-center">
                        ST
                    </div>
                    <div className="flex flex-col items-center md:items-start">
                        <h1 className="text-xl font-bold text-gray-800 line-clamp-1">{schoolName}</h1>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-sm font-semibold text-blue-600">SnapTest • Entry Examination</span>
                            <span className="text-gray-300">|</span>
                            <span className="text-sm text-gray-500 font-medium">
                                Question {currentIdx + 1} of {questions.length}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col items-center md:items-end">
                    <div className="text-lg font-bold text-gray-900">{studentName}</div>
                    <div className="text-xs text-gray-500 uppercase tracking-wider">s/o {fatherName}</div>
                </div>

                <div className={clsx("flex items-center space-x-2 px-4 py-2 rounded-lg font-mono text-xl font-bold",
                    timeLeft < 60 ? "bg-red-100 text-red-600 animate-pulse" : "bg-blue-50 text-blue-600"
                )}>
                    <Clock size={20} />
                    <span>{formatTime(timeLeft)}</span>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
                <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
            </div>

            {/* Question Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6 md:p-10 mb-8 min-h-[400px] flex flex-col justify-center">
                {currentQ.image_path && (
                    <div className="mb-6 flex justify-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={currentQ.image_path}
                            alt="Question Reference"
                            className="max-h-64 object-contain rounded-lg border"
                        />
                    </div>
                )}
                <h2
                    className={clsx("text-2xl font-medium text-gray-800 mb-8 leading-[2.5]",
                        currentQ.subject === 'Urdu' ? 'font-urdu text-right pt-4' : 'text-left'
                    )}
                    dir={currentQ.subject === 'Urdu' ? 'rtl' : 'ltr'}
                >
                    {currentQ.question_text}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentQ.options.map((opt, i) => (
                        <button
                            key={i}
                            onClick={() => handleAnswer(i)}
                            className={clsx(
                                "p-4 rounded-xl border-2 transition-all relative",
                                currentQ.subject === 'Urdu' ? "text-right" : "text-left",
                                answers[currentQ.id] === i
                                    ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                                    : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                            )}
                            dir={currentQ.subject === 'Urdu' ? 'rtl' : 'ltr'}
                        >
                            <div className={clsx(
                                "flex items-center",
                                currentQ.subject === 'Urdu' && "flex-row-reverse"
                            )}>
                                <div className={clsx("w-8 h-8 rounded-full flex items-center justify-center font-bold border shrink-0",
                                    currentQ.subject === 'Urdu' ? "ml-3" : "mr-3",
                                    answers[currentQ.id] === i ? "bg-blue-500 text-white border-blue-500" : "bg-white text-gray-500 border-gray-300"
                                )}>
                                    {String.fromCharCode(65 + i)}
                                </div>
                                <span className={clsx(
                                    "text-lg text-gray-700",
                                    currentQ.subject === 'Urdu' && "font-urdu"
                                )}>{opt}</span>
                            </div>
                            {answers[currentQ.id] === i && (
                                <CheckCircle className={clsx(
                                    "absolute top-4",
                                    currentQ.subject === 'Urdu' ? "left-4" : "right-4",
                                    "text-blue-500"
                                )} size={20} />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center">
                <button
                    onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
                    disabled={currentIdx === 0}
                    className="px-6 py-3 rounded-lg text-gray-600 font-medium hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Previous
                </button>

                {currentIdx < questions.length - 1 ? (
                    <button
                        onClick={() => setCurrentIdx(prev => Math.min(questions.length - 1, prev + 1))}
                        className="px-8 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 shadow-md hover:shadow-lg transition-all"
                    >
                        Next Question
                    </button>
                ) : (
                    <button
                        onClick={submit}
                        disabled={isSubmitting}
                        className="px-8 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 shadow-md hover:shadow-lg transition-all disabled:opacity-70"
                    >
                        {isSubmitting ? 'Submitting...' : 'Finish Test'}
                    </button>
                )}
            </div>
        </div>
    );
}
