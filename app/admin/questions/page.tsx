import { getDb } from '@/lib/db';
import QuestionForm from '@/components/QuestionForm';
import BulkUploadForm from '@/components/BulkUploadForm';
import QuestionFilters from '@/components/QuestionFilters';
import { Trash2, Image as ImageIcon, Pencil } from 'lucide-react';
import { deleteQuestion } from '@/lib/actions';
import Image from 'next/image';
import Link from 'next/link';

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

    const db = getDb();

    // Fetch question if in edit mode
    let editQuestion = null;
    if (editId) {
        editQuestion = db.prepare('SELECT * FROM questions WHERE id = ?').get(editId);
    }

    // Build dynamic query
    let query = 'SELECT * FROM questions WHERE 1=1';
    const queryParams: any[] = [];

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

    query += ' ORDER BY id DESC';

    const questions = db.prepare(query).all(...queryParams) as any[];

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h2 className="text-3xl font-bold text-gray-800">Question Bank</h2>
                <div className="text-sm bg-blue-50 text-blue-700 px-4 py-2 rounded-full font-medium border border-blue-100">
                    Total Questions: {questions.length}
                </div>
            </div>

            <QuestionFilters />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form Section */}
                <div className="lg:col-span-1 space-y-8">
                    <QuestionForm initialData={editQuestion} />
                    <BulkUploadForm />
                </div>

                {/* List Section */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-md overflow-hidden flex flex-col border border-gray-100">
                    <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-gray-700">Questions</h3>
                        {questions.length > 0 && (
                            <span className="text-xs text-gray-500 font-medium">
                                Showing {questions.length} question{questions.length !== 1 ? 's' : ''}
                            </span>
                        )}
                    </div>
                    <div className="overflow-y-auto max-h-[1200px]">
                        {questions.length === 0 ? (
                            <div className="p-12 text-center text-gray-400">
                                <p className="text-lg mb-2">No questions found matching your filters.</p>
                                <p className="text-sm">Try adjusting your search or filters.</p>
                            </div>
                        ) : (
                            <ul className="divide-y divide-gray-100">
                                {questions.map((q) => (
                                    <li key={q.id} className={`p-4 hover:bg-gray-50 transition-colors ${Number(editId) === q.id ? 'bg-blue-50/50' : ''}`}>
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <div className="flex flex-wrap items-center gap-2 mb-2">
                                                    <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${q.subject === 'Math' ? 'bg-blue-100 text-blue-800' :
                                                        q.subject === 'English' ? 'bg-green-100 text-green-800' :
                                                            'bg-purple-100 text-purple-800'
                                                        }`}>
                                                        {q.subject}
                                                    </span>
                                                    <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${q.difficulty === 'Easy' ? 'bg-gray-100 text-gray-800' :
                                                        q.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                                            'bg-red-100 text-red-800'
                                                        }`}>
                                                        {q.difficulty}
                                                    </span>
                                                    {q.class_level && (
                                                        <span className="px-2 py-0.5 text-xs rounded-full bg-indigo-100 text-indigo-800 font-medium">
                                                            {q.class_level}
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="flex gap-4">
                                                    {q.image_path && (
                                                        <div className="relative w-24 h-24 flex-shrink-0 border rounded-lg overflow-hidden bg-gray-100">
                                                            <Image
                                                                src={q.image_path}
                                                                alt="Question Image"
                                                                fill
                                                                className="object-cover"
                                                                unoptimized={true}
                                                            />
                                                        </div>
                                                    )}
                                                    <div className="flex-1">
                                                        <p className={`text-gray-900 font-medium ${q.subject === 'Urdu' ? 'font-urdu text-2xl text-right direction-rtl' : ''}`}>
                                                            {q.question_text}
                                                        </p>
                                                        <div className={`mt-2 text-sm text-gray-500 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 ${q.subject === 'Urdu' ? 'direction-rtl' : ''}`}>
                                                            {JSON.parse(q.options).map((opt: string, i: number) => (
                                                                <span key={i} className={`
                                                                    ${i === q.correct_option ? 'text-green-600 font-bold flex items-center gap-1' : ''} 
                                                                    ${q.subject === 'Urdu' ? 'font-urdu text-right text-lg' : ''}
                                                                `}>
                                                                    {q.subject === 'Urdu' ? (
                                                                        <>{opt} . {i + 1}</>
                                                                    ) : (
                                                                        <>{i + 1}. {opt}</>
                                                                    )}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-2 ml-4">
                                                <Link
                                                    href={`?${new URLSearchParams({ ...(params as any), edit: q.id.toString() }).toString()}`}
                                                    className="text-gray-400 hover:text-blue-500 p-2 transition-colors bg-white rounded-full shadow-sm hover:shadow-md border border-gray-100"
                                                    title="Edit Question"
                                                >
                                                    <Pencil size={18} />
                                                </Link>
                                                <form action={deleteQuestion.bind(null, q.id)}>
                                                    <button
                                                        className="text-gray-400 hover:text-red-500 p-2 transition-colors bg-white rounded-full shadow-sm hover:shadow-md border border-gray-100"
                                                        title="Delete Question"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </form>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
