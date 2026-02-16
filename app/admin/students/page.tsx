import { getDb } from '@/lib/db';
import StudentForm from '@/components/StudentForm';

export const dynamic = 'force-dynamic';

export default function StudentsPage() {
    const db = getDb();
    const students = db.prepare('SELECT * FROM students ORDER BY created_at DESC').all() as any[];

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-gray-800">Students & Access Codes</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form Section */}
                <div className="lg:col-span-1">
                    <StudentForm />
                </div>

                {/* List Section */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-md overflow-hidden">
                    <div className="p-4 border-b bg-gray-50">
                        <h3 className="text-lg font-semibold text-gray-700">Registered Students</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-600">
                            <thead className="bg-gray-50 text-gray-700 font-medium">
                                <tr>
                                    <th className="px-6 py-3">Access Code</th>
                                    <th className="px-6 py-3">Student Name</th>
                                    <th className="px-6 py-3">Father's Name</th>
                                    <th className="px-6 py-3">Class</th>
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3">Score</th>
                                    <th className="px-6 py-3">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {students.map((student) => (
                                    <tr key={student.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 font-mono font-bold text-blue-600">{student.access_code}</td>
                                        <td className="px-6 py-4 font-medium text-gray-900">{student.name}</td>
                                        <td className="px-6 py-4 text-gray-600">{student.father_name}</td>
                                        <td className="px-6 py-4">{student.class_level}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${student.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                student.status === 'started' ? 'bg-orange-100 text-orange-800' :
                                                    'bg-gray-100 text-gray-800'
                                                }`}>
                                                {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-bold">
                                            {student.score !== null ? `${student.score} / 30` : '-'}
                                        </td>
                                        <td className="px-6 py-4">{new Date(student.created_at).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                                {students.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                            No students registered yet.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
