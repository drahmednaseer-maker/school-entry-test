import { getDb } from '@/lib/db';
import { CheckCircle, XCircle, Home } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function ResultPage(props: { params: Promise<{ sessionId: string }> }) {
    const { sessionId } = await props.params;
    const db = getDb();

    const session = db.prepare('SELECT * FROM test_sessions WHERE id = ?').get(sessionId) as any;

    if (!session || !session.end_time) {
        // If not finished, redirect back to test
        redirect(`/test/${sessionId}`);
    }

    const student = db.prepare('SELECT * FROM students WHERE id = ?').get(session.student_id) as any;

    const totalQuestions = 30;
    const score = student.score || 0;
    const percentage = Math.round((score / totalQuestions) * 100);

    let grade = 'F';
    if (percentage >= 90) grade = 'A+';
    else if (percentage >= 80) grade = 'A';
    else if (percentage >= 70) grade = 'B';
    else if (percentage >= 60) grade = 'C';
    else if (percentage >= 50) grade = 'D';

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-lg text-center space-y-8">
                <div className="mx-auto bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mb-4 text-green-600">
                    <CheckCircle size={40} />
                </div>

                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Test Completed!</h1>
                    <p className="text-gray-500 mt-2">Thank you, {student.name}. Your results are ready.</p>
                </div>

                <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                    <div className="grid grid-cols-2 gap-4 text-center">
                        <div className="p-4 bg-white rounded-lg shadow-sm">
                            <p className="text-sm text-gray-500 mb-1">Score</p>
                            <p className="text-3xl font-bold text-blue-600">{score} <span className="text-lg text-gray-400 font-normal">/ {totalQuestions}</span></p>
                        </div>
                        <div className="p-4 bg-white rounded-lg shadow-sm">
                            <p className="text-sm text-gray-500 mb-1">Percentage</p>
                            <p className={`text-3xl font-bold ${percentage >= 50 ? 'text-green-600' : 'text-red-500'}`}>{percentage}%</p>
                        </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-100">
                        <p className="text-sm text-gray-400">Grade Achieved</p>
                        <p className={`text-4xl font-extrabold mt-2 ${grade === 'F' ? 'text-red-500' : 'text-green-600'}`}>{grade}</p>
                    </div>
                </div>

                <Link href="/" className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-800 font-medium transition-colors">
                    <Home size={18} />
                    <span>Return to Home</span>
                </Link>
            </div>
        </div>
    );
}
