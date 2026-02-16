import { getDb } from '@/lib/db';
import { Users, FileText, CheckCircle, Clock } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default function AdminDashboard() {
    const db = getDb();

    // Fetch stats
    const studentCount = db.prepare('SELECT COUNT(*) as count FROM students').get() as { count: number };
    const questionCount = db.prepare('SELECT COUNT(*) as count FROM questions').get() as { count: number };
    const completedTests = db.prepare("SELECT COUNT(*) as count FROM students WHERE status = 'completed'").get() as { count: number };
    const activeTests = db.prepare("SELECT COUNT(*) as count FROM students WHERE status = 'started'").get() as { count: number };

    const recentResults = db.prepare(`
    SELECT s.id, s.name, s.father_name, s.class_level, s.score, s.created_at 
    FROM students s 
    WHERE status = 'completed' 
    ORDER BY created_at DESC 
    LIMIT 5
  `).all() as any[];

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-800">Dashboard Overview</h2>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
                    <div className="p-3 bg-blue-100 rounded-full text-blue-600">
                        <Users size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Total Students</p>
                        <p className="text-2xl font-bold text-gray-800">{studentCount.count}</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
                    <div className="p-3 bg-purple-100 rounded-full text-purple-600">
                        <FileText size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Total Questions</p>
                        <p className="text-2xl font-bold text-gray-800">{questionCount.count}</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
                    <div className="p-3 bg-green-100 rounded-full text-green-600">
                        <CheckCircle size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Completed Tests</p>
                        <p className="text-2xl font-bold text-gray-800">{completedTests.count}</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
                    <div className="p-3 bg-orange-100 rounded-full text-orange-600">
                        <Clock size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Active Tests</p>
                        <p className="text-2xl font-bold text-gray-800">{activeTests.count}</p>
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-800">Recent Results</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-gray-50 text-gray-700 font-medium">
                            <tr>
                                <th className="px-6 py-4">Student Name</th>
                                <th className="px-6 py-4">Father's Name</th>
                                <th className="px-6 py-4">Class</th>
                                <th className="px-6 py-4">Score</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {recentResults.length > 0 ? (
                                recentResults.map((student, i) => (
                                    <tr key={i} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900">{student.name}</td>
                                        <td className="px-6 py-4 text-gray-600">{student.father_name}</td>
                                        <td className="px-6 py-4">{student.class_level}</td>
                                        <td className="px-6 py-4 text-green-600 font-bold">{student.score} / 30</td>
                                        <td className="px-6 py-4">{new Date(student.created_at).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 text-right">
                                            <Link
                                                href={`/admin/results/${student.id}`}
                                                className="text-blue-600 hover:text-blue-800 font-medium"
                                            >
                                                View Details
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                                        No tests completed yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
