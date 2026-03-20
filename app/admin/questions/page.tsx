import { getDb } from '@/lib/db';
import QuestionForm from '@/components/QuestionForm';
import BulkUploadForm from '@/components/BulkUploadForm';
import QuestionFilters from '@/components/QuestionFilters';
import { Trash2, Pencil, Hash, } from 'lucide-react';
import { deleteQuestion } from '@/lib/actions';
import Image from 'next/image';
import Link from 'next/link';
import clsx from 'clsx';
import ThemeToggle from '@/components/ThemeToggle';

export const dynamic = 'force-dynamic';

export default async function QuestionsPage({
    searchParams
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const params = await searchParams;
    const q = typeof params.q === 'string' ? params.q : '';
    const subject = typeof params.subject === 'string' ? params.subject : '';
    const difficulty = typeof params.difficulty === 'string' ? params.difficulty : '';
    const level = typeof params.level === 'string' ? params.level : '';
    const editId = typeof params.edit === 'string' ? params.edit : '';
    const qid = typeof params.qid === 'string' ? params.qid : '';

    const db = getDb();

    let editQuestion = null;
    if (editId) {
        editQuestion = db.prepare('SELECT * FROM questions WHERE id = ?').get(editId);
    }

    // Build dynamic query
    let query = 'SELECT * FROM questions WHERE 1=1';
    const queryParams: any[] = [];

    // Search by exact ID
    if (qid) {
        query += ' AND id = ?';
        queryParams.push(parseInt(qid));
    } else {
        if (q) {
            query += ' AND question_text LIKE ?';
            queryParams.push(`%${q}%`);
        }
        if (subject) {
            query += ' AND subject = ?';
            queryParams.push(subject);
        }
        if (difficulty) {
            query += ' AND difficulty = ?';
            queryParams.push(difficulty);
        }
        if (level) {
            query += ' AND class_level = ?';
            queryParams.push(level);
        }
    }

    query += ' ORDER BY id DESC';
    const questions = db.prepare(query).all(...queryParams) as any[];

    const subjectColor: Record<string, string> = { English: '#2563eb', Urdu: '#7c3aed', Math: '#059669' };
    const subjectBg: Record<string, string> = { English: '#eff6ff', Urdu: '#f5f3ff', Math: '#ecfdf5' };
    const diffColor: Record<string, string> = { Easy: '#15803d', Medium: '#d97706', Hard: '#dc2626' };
    const diffBg: Record<string, string> = { Easy: '#f0fdf4', Medium: '#fffbeb', Hard: '#fef2f2' };

    return (
        <div className="flex-1 overflow-y-auto space-y-5">
            {/* Premium Header Card */}
            <div className="rounded-2xl overflow-hidden shadow-sm border border-gray-100 shrink-0">
                <div className="p-7 text-white" style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)' }}>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="flex items-center gap-5">
                            <div>
                                <p className="text-blue-200 text-xs font-bold uppercase tracking-wider mb-1">Mardan Youth's Academy</p>
                                <h1 className="text-3xl font-black mb-1">Question Bank</h1>
                                <p className="text-blue-100/80 font-medium text-sm">Create, manage, and filter the repository of test questions</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 bg-white/10 border border-white/20 px-5 py-2.5 rounded-xl backdrop-blur-sm">
                                <span className="text-sm font-bold text-white">
                                    {questions.length} Question{questions.length !== 1 ? 's' : ''}
                                </span>
                            </div>
                            <div className="hidden md:block shrink-0"><ThemeToggle isPremium /></div>
                        </div>
                    </div>
                </div>
            </div>

            <QuestionFilters />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Form */}
                <div className="lg:col-span-1 space-y-5">
                    <QuestionForm key={editQuestion ? editQuestion.id : 'new'} initialData={editQuestion} />
                    <BulkUploadForm />
                </div>

                {/* Right: Question list */}
                <div
                    className="lg:col-span-2 rounded-xl overflow-hidden shadow-sm flex flex-col"
                    style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
                >
                    {/* List header */}
                    <div
                        className="px-5 py-3.5 border-b flex justify-between items-center"
                        style={{ borderColor: 'var(--border)', background: 'var(--bg-surface-2)' }}
                    >
                        <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Questions</p>
                        {questions.length > 0 && (
                            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                Showing {questions.length}
                            </span>
                        )}
                    </div>

                    <div className="overflow-y-auto" style={{ maxHeight: '1200px' }}>
                        {questions.length === 0 ? (
                            <div className="py-16 text-center space-y-2">
                                <Hash size={40} className="mx-auto" style={{ color: 'var(--border)' }} />
                                <p className="font-medium" style={{ color: 'var(--text-secondary)' }}>No questions found</p>
                                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Try adjusting your search or filters.</p>
                            </div>
                        ) : (
                            <ul className="divide-y" style={{ borderColor: 'var(--border)' }}>
                                {questions.map((question) => {
                                    const isEdit = Number(editId) === question.id;
                                    const isUrdu = question.subject === 'Urdu';
                                    const opts = JSON.parse(question.options);

                                    return (
                                        <li
                                            key={question.id}
                                            className="p-4 transition-colors"
                                            style={{
                                                background: isEdit ? 'var(--primary-muted)' : 'transparent',
                                                borderColor: 'var(--border)'
                                            }}
                                        >
                                            <div className="flex justify-between items-start gap-3">
                                                <div className="flex-1 min-w-0">
                                                    {/* Badges row: subject | difficulty | class + Q-ID chip */}
                                                    <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
                                                        {/* Q-ID — prominent */}
                                                        <span
                                                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-black shrink-0"
                                                            style={{ background: 'var(--primary-muted)', color: 'var(--primary)', border: '1px solid var(--primary-light)', fontFamily: 'monospace' }}
                                                        >
                                                            <Hash size={10} />Q-{question.id}
                                                        </span>

                                                        <span
                                                            className="px-2 py-0.5 text-xs rounded-full font-semibold"
                                                            style={{ background: subjectBg[question.subject], color: subjectColor[question.subject] }}
                                                        >
                                                            {question.subject}
                                                        </span>
                                                        <span
                                                            className="px-2 py-0.5 text-xs rounded-full font-semibold"
                                                            style={{ background: diffBg[question.difficulty] || 'var(--bg-surface-2)', color: diffColor[question.difficulty] || 'var(--text-secondary)' }}
                                                        >
                                                            {question.difficulty}
                                                        </span>
                                                        {question.class_level && (
                                                            <span
                                                                className="px-2 py-0.5 text-xs rounded-full font-semibold"
                                                                style={{ background: 'var(--bg-surface-2)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
                                                            >
                                                                {question.class_level}
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Question + image */}
                                                    <div className="flex gap-3">
                                                        {question.image_path && (
                                                            <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border" style={{ borderColor: 'var(--border)', background: 'var(--bg-surface-2)' }}>
                                                                <Image
                                                                    src={question.image_path}
                                                                    alt="Question Image"
                                                                    fill
                                                                    className="object-cover"
                                                                    unoptimized={true}
                                                                />
                                                            </div>
                                                        )}
                                                        <div className="flex-1 min-w-0">
                                                            <p
                                                                className={clsx(
                                                                    'text-sm font-medium leading-relaxed mb-3',
                                                                    isUrdu ? 'font-urdu text-xl text-right' : ''
                                                                )}
                                                                dir={isUrdu ? 'rtl' : 'ltr'}
                                                                style={{ color: 'var(--text-primary)' }}
                                                            >
                                                                {question.question_text}
                                                            </p>

                                                            {/* Options — different layout for Urdu vs English/Math */}
                                                            {isUrdu ? (
                                                                /* Urdu: 2-col RTL grid — letter on LEFT, text on RIGHT (natural RTL) */
                                                                <div className="grid grid-cols-2 gap-x-3 gap-y-1.5" dir="rtl">
                                                                    {opts.map((opt: string, i: number) => {
                                                                        const isCorrect = i === question.correct_option;
                                                                        return (
                                                                            <div
                                                                                key={i}
                                                                                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg"
                                                                                style={{
                                                                                    background: isCorrect ? 'var(--success-bg)' : 'var(--bg-surface-2)',
                                                                                    border: `1px solid ${isCorrect ? 'var(--success-border)' : 'var(--border)'}`,
                                                                                }}
                                                                            >
                                                                                {/* Letter circle on the start (right) side in RTL */}
                                                                                <span
                                                                                    className="w-5 h-5 rounded-full shrink-0 flex items-center justify-center text-xs font-black"
                                                                                    style={{
                                                                                        background: isCorrect ? 'var(--success)' : 'var(--border-strong)',
                                                                                        color: isCorrect ? 'white' : 'var(--bg-surface)',
                                                                                    }}
                                                                                >
                                                                                    {String.fromCharCode(65 + i)}
                                                                                </span>
                                                                                <span
                                                                                    className="font-urdu text-sm leading-loose flex-1 text-right"
                                                                                    style={{ color: isCorrect ? 'var(--success)' : 'var(--text-secondary)', fontWeight: isCorrect ? 700 : 400 }}
                                                                                >
                                                                                    {opt}
                                                                                </span>
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            ) : (
                                                                /* English / Math: clean 2-col LTR grid */
                                                                <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
                                                                    {opts.map((opt: string, i: number) => {
                                                                        const isCorrect = i === question.correct_option;
                                                                        return (
                                                                            <div
                                                                                key={i}
                                                                                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg"
                                                                                style={{
                                                                                    background: isCorrect ? 'var(--success-bg)' : 'var(--bg-surface-2)',
                                                                                    border: `1px solid ${isCorrect ? 'var(--success-border)' : 'var(--border)'}`,
                                                                                }}
                                                                            >
                                                                                <span
                                                                                    className="w-5 h-5 rounded-full shrink-0 flex items-center justify-center text-xs font-black"
                                                                                    style={{
                                                                                        background: isCorrect ? 'var(--success)' : 'var(--border-strong)',
                                                                                        color: isCorrect ? 'white' : 'var(--bg-surface)',
                                                                                    }}
                                                                                >
                                                                                    {String.fromCharCode(65 + i)}
                                                                                </span>
                                                                                <span
                                                                                    className="text-xs truncate"
                                                                                    style={{ color: isCorrect ? 'var(--success)' : 'var(--text-secondary)', fontWeight: isCorrect ? 700 : 400 }}
                                                                                >
                                                                                    {opt}
                                                                                </span>
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            )}

                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Actions */}
                                                <div className="flex flex-col gap-1.5 shrink-0">
                                                    <Link
                                                        href={`?${new URLSearchParams({ ...(params as any), edit: question.id.toString() }).toString()}`}
                                                        className="p-2 rounded-lg transition-colors"
                                                        style={{ color: 'var(--text-muted)', background: 'var(--bg-surface-2)', border: '1px solid var(--border)' }}
                                                        title="Edit Question"
                                                    >
                                                        <Pencil size={15} />
                                                    </Link>
                                                    <form action={deleteQuestion.bind(null, question.id)}>
                                                        <button
                                                            type="submit"
                                                            className="p-2 rounded-lg transition-colors"
                                                            style={{ color: 'var(--danger)', background: 'var(--danger-bg)', border: '1px solid var(--danger-border)' }}
                                                            title="Delete Question"
                                                        >
                                                            <Trash2 size={15} />
                                                        </button>
                                                    </form>
                                                </div>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
