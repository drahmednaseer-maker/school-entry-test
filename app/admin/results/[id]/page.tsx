import { getDb } from '@/lib/db';
import { notFound } from 'next/navigation';
import { CheckCircle2, XCircle, User, Calendar, BookOpen, AlertCircle } from 'lucide-react';
import clsx from 'clsx';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function ResultDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const studentId = parseInt(id);
    const db = getDb();

    const student = db.prepare('SELECT * FROM students WHERE id = ?').get(studentId) as any;
    if (!student) notFound();

    const session = db.prepare('SELECT * FROM test_sessions WHERE student_id = ?').get(studentId) as any;
    if (!session) {
        return (
            <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl shadow-sm border border-gray-100">
                <AlertCircle size={48} className="text-gray-300 mb-4" />
                <h2 className="text-xl font-bold text-gray-800">No Session Found</h2>
                <p className="text-gray-500">The student has not started any test session yet.</p>
                <Link href="/admin" className="mt-6 text-blue-600 hover:underline">Back to Dashboard</Link>
            </div>
        );
    }

    const questionIds = JSON.parse(session.question_ids);
    const answers = JSON.parse(session.answers || '{}');

    // Fetch questions in the order they were presented
    const questions = db.prepare(`
        SELECT * FROM questions 
        WHERE id IN (${questionIds.join(',')})
    `).all() as any[];

    // Sort questions to match the presentation order
    const orderedQuestions = questionIds.map((id: number) => questions.find(q => q.id === id));

    // Calculate Subject-wise Summary
    const subjects = ['English', 'Urdu', 'Math'];
    const summary = subjects.map(sub => {
        const subQuestions = orderedQuestions.filter((q: any) => q.subject === sub);
        const total = subQuestions.length;
        const correct = subQuestions.filter((q: any) => answers[q.id] === q.correct_option).length;
        return { subject: sub, total, correct };
    });

    const settings = db.prepare('SELECT school_name FROM settings WHERE id = 1').get() as { school_name: string };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            {/* Header / Summary Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-blue-600 p-8 text-white">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-blue-100 text-sm uppercase tracking-wider font-bold mb-2">Result Details • {settings.school_name}</p>
                            <h1 className="text-4xl font-black mb-1">{student.name}</h1>
                            <p className="text-blue-100/80 text-lg font-medium mb-4">S/O: {student.father_name}</p>
                            <div className="flex items-center space-x-4 text-blue-100">
                                <span className="flex items-center"><User size={16} className="mr-1" /> {student.class_level}</span>
                                <span className="flex items-center"><Calendar size={16} className="mr-1" /> {new Date(student.created_at).toLocaleDateString()}</span>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-blue-100 text-sm uppercase tracking-wider font-semibold">Overall Score</p>
                            <p className="text-5xl font-bold">{student.score} <span className="text-2xl text-blue-200">/ {questionIds.length}</span></p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Subject-wise Summary Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-gray-50">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center">
                        <CheckCircle2 className="mr-2 text-green-600" /> Subject-wise Performance
                    </h2>
                </div>
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {summary.map(s => (
                            <div key={s.subject} className="p-4 rounded-xl border border-gray-100 bg-gray-50 flex flex-col items-center text-center">
                                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">{s.subject}</p>
                                <p className="text-3xl font-bold text-gray-800">
                                    {s.correct} <span className="text-lg text-gray-400">/ {s.total}</span>
                                </p>
                                <div className="w-full bg-gray-200 h-2 rounded-full mt-3 overflow-hidden">
                                    <div
                                        className={clsx(
                                            "h-full rounded-full transition-all duration-500",
                                            s.correct / s.total > 0.7 ? "bg-green-500" : s.correct / s.total > 0.4 ? "bg-orange-400" : "bg-red-500"
                                        )}
                                        style={{ width: `${s.total > 0 ? (s.correct / s.total) * 100 : 0}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Test Content */}
            <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                    <BookOpen className="mr-2 text-blue-600" /> Test Paper Review
                </h2>

                {orderedQuestions.map((q: any, index: number) => {
                    const studentAnswerIdx = answers[q.id];
                    const isCorrect = studentAnswerIdx === q.correct_option;
                    const options = JSON.parse(q.options);

                    return (
                        <div key={q.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
                            <div className={clsx(
                                "flex justify-between items-start",
                                q.subject === 'Urdu' && "flex-row-reverse"
                            )}>
                                <div className={clsx(
                                    "flex items-start flex-1 min-w-0",
                                    q.subject === 'Urdu' ? "flex-row-reverse space-x-reverse" : "space-x-3"
                                )}>
                                    <span className={clsx(
                                        "bg-gray-100 text-gray-500 font-bold rounded-lg w-8 h-8 flex items-center justify-center shrink-0",
                                        q.subject === 'Urdu' ? "ml-3" : "mr-3"
                                    )}>
                                        {index + 1}
                                    </span>
                                    <div className="flex-1">
                                        <p className={clsx(
                                            "text-sm font-semibold text-blue-600 uppercase tracking-wide mb-1",
                                            q.subject === 'Urdu' && "text-right"
                                        )}>
                                            {q.subject}
                                        </p>
                                        <p className={clsx(
                                            "text-xl font-medium text-gray-800",
                                            q.subject === 'Urdu' ? 'font-urdu leading-relaxed direction-rtl text-right' : 'leading-relaxed'
                                        )}>
                                            {q.question_text}
                                        </p>
                                    </div>
                                </div>
                                <div className="shrink-0">
                                    {isCorrect ? (
                                        <div className="flex items-center text-green-600 bg-green-50 px-3 py-1 rounded-full text-sm font-bold border border-green-100">
                                            <CheckCircle2 size={16} className="mr-1" /> Correct
                                        </div>
                                    ) : (
                                        <div className="flex items-center text-red-600 bg-red-50 px-3 py-1 rounded-full text-sm font-bold border border-red-100">
                                            <XCircle size={16} className="mr-1" /> Incorrect
                                        </div>
                                    )}
                                </div>
                            </div>

                            {q.image_path && (
                                <div className="ml-11">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={q.image_path} alt="Question" className="max-h-48 rounded-lg border border-gray-100" />
                                </div>
                            )}

                            <div className={clsx(
                                "grid grid-cols-1 md:grid-cols-2 gap-3",
                                q.subject === 'Urdu' ? "mr-11 ml-0 rtl" : "ml-11 mr-0"
                            )}>
                                {options.map((opt: string, i: number) => {
                                    const isSelected = studentAnswerIdx === i;
                                    const isCorrectOpt = q.correct_option === i;

                                    return (
                                        <div
                                            key={i}
                                            className={clsx(
                                                "p-3 rounded-lg border text-sm flex items-center justify-between",
                                                q.subject === 'Urdu' && "flex-row-reverse text-right",
                                                isSelected && !isCorrectOpt && "bg-red-50 border-red-200 text-red-800",
                                                isCorrectOpt && "bg-green-50 border-green-200 text-green-800 font-semibold",
                                                !isSelected && !isCorrectOpt && "bg-gray-50 border-gray-100 text-gray-600"
                                            )}
                                        >
                                            <div className={clsx(
                                                "flex items-center",
                                                q.subject === 'Urdu' && "flex-row-reverse"
                                            )}>
                                                <span className={clsx(
                                                    "w-6 h-6 rounded-full border border-current flex items-center justify-center shrink-0 text-xs",
                                                    q.subject === 'Urdu' ? "ml-2" : "mr-2"
                                                )}>
                                                    {String.fromCharCode(65 + i)}
                                                </span>
                                                <span className={clsx(q.subject === 'Urdu' && 'font-urdu')}>{opt}</span>
                                            </div>
                                            {isSelected && !isCorrectOpt && <XCircle size={14} className={clsx(q.subject === 'Urdu' ? "mr-2" : "text-red-500")} />}
                                            {isCorrectOpt && <CheckCircle2 size={14} className={clsx(q.subject === 'Urdu' ? "mr-2" : "text-green-500")} />}
                                        </div>
                                    );
                                })}
                            </div>

                            {!isCorrect && studentAnswerIdx !== undefined && (
                                <p className={clsx(
                                    "text-xs text-gray-400",
                                    q.subject === 'Urdu' ? "mr-11 text-right" : "ml-11"
                                )}>
                                    Student selected {String.fromCharCode(65 + studentAnswerIdx)}, but the correct answer is {String.fromCharCode(65 + q.correct_option)}.
                                </p>
                            )}
                            {studentAnswerIdx === undefined && (
                                <p className={clsx(
                                    "text-xs text-orange-400 font-medium italic",
                                    q.subject === 'Urdu' ? "mr-11 text-right" : "ml-11"
                                )}>
                                    Question skipped by the student.
                                </p>
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="flex justify-center pb-12">
                <Link
                    href="/admin"
                    className="bg-gray-800 text-white px-8 py-3 rounded-xl font-bold hover:bg-gray-900 transition-all shadow-md"
                >
                    Back to Dashboard
                </Link>
            </div>
        </div>
    );
}
